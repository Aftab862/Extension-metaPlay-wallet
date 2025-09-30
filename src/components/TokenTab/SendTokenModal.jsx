import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    CircularProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ethers } from "ethers";

// Utility: send message to background.js
function bgRequest(type, payload) {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage({ type, payload }, (res) => resolve(res));
    });
}

const SendTokenModal = ({ open, onClose, token, rpcUrl, userWallet, chainId, Account }) => {
    const [toAddress, setToAddress] = useState("");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);

    const [gasInfo, setGasInfo] = useState(null);
    const [customGasPrice, setCustomGasPrice] = useState("");
    const [customGasLimit, setCustomGasLimit] = useState("");
    const [finalFee, setFinalFee] = useState(null);

    const [error, setError] = useState(null);

    // 🟢 Estimate fee for ERC20 transfer
    useEffect(() => {
        if (!toAddress || !amount) {
            setGasInfo(null);
            setFinalFee(null);
            return;
        }

        // 🚫 Skip gas estimation if balance is insufficient
        if (Number(amount) > Number(token?.balance || 0)) {
            setGasInfo(null);
            setFinalFee(null);
            setLoading(false)
            setError("Insufficient token balance.");
            return;
        }

        const fetchFee = async () => {
            setError(null);
            try {
                const res = await bgRequest("ESTIMATE_FEE_TOKEN", {
                    from: userWallet,
                    to: toAddress,
                    amount,
                    rpcUrl,
                    chainId,
                    tokenAddress: token.address,
                    decimals: token.decimals,
                });

                if (res?.success) {
                    setGasInfo(res);
                    setCustomGasPrice(res.gasPrice);
                    setCustomGasLimit(res.gasLimit);
                } else {
                    setError(res?.error || "Failed to estimate gas fee.");
                }
            } catch (err) {
                setError(err.message || "Unexpected error during gas estimation.");
            }
        };

        fetchFee();
    }, [toAddress, amount, token, rpcUrl, userWallet, chainId]);

    // 🟢 Recalculate final fee if custom values change
    useEffect(() => {
        if (!gasInfo) return;

        try {
            const gasPrice = customGasPrice || gasInfo.gasPrice; // Gwei
            const gasLimit = customGasLimit || gasInfo.gasLimit;

            const gasPriceWei = ethers.parseUnits(gasPrice.toString(), "gwei");
            const feeWei = gasPriceWei * BigInt(gasLimit);
            const feeEth = ethers.formatUnits(feeWei, "ether");

            setFinalFee(feeEth);
        } catch (err) {
            setFinalFee(gasInfo.estimatedFee);
        }
    }, [gasInfo, customGasPrice, customGasLimit]);

    // 🟢 Handle send (ERC20 only)
    const handleSend = async () => {
        setError(null);

        if (!ethers.isAddress(toAddress)) {
            setError("Invalid recipient address.");
            return;
        }
        if (Number(amount) <= 0) {
            setError("Amount must be greater than 0.");
            return;
        }
        if (Number(amount) > Number(token?.balance)) {
            setError("Insufficient token balance.");
            return;
        }

        try {
            setLoading(true);

            const res = await bgRequest("SEND_TOKEN_TX", {
                to: toAddress,
                amount,
                rpcUrl,
                privateKey: Account?.account?.chains[0]?.privateKey,
                chainId,
                tokenAddress: token.address,
                decimals: token.decimals,
                gasPrice: customGasPrice,
                gasLimit: customGasLimit,
            });

            if (res?.success) {
                console.log("✅ Token sent:", res.txHash);
                onClose();
            } else {
                setError(res?.error || "Transaction failed.");
            }
        } catch (err) {
            setError(err.message || "Unexpected error during transaction.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>Send {token?.symbol}</DialogTitle>
            <DialogContent>
                <TextField
                    label="Recipient Address"
                    fullWidth
                    margin="dense"
                    value={toAddress}
                    onChange={(e) => setToAddress(e.target.value)}
                />
                <TextField
                    label="Amount"
                    type="number"
                    fullWidth
                    margin="dense"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />

                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Balance: {token?.balance} {token?.symbol}
                </Typography>

                {gasInfo ? (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Estimated Gas Fee: {finalFee} ETH
                    </Typography>
                ) : (
                    amount &&
                    toAddress && (
                        <CircularProgress size={20} sx={{ mt: 1, display: "block" }} />
                    )
                )}

                {gasInfo && (
                    <Accordion sx={{ mt: 2 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Advanced (Custom Gas)
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <TextField
                                label="Gas Price (Gwei)"
                                type="number"
                                fullWidth
                                margin="dense"
                                value={customGasPrice}
                                onChange={(e) => setCustomGasPrice(e.target.value)}
                            />
                            <TextField
                                label="Gas Limit"
                                type="number"
                                fullWidth
                                margin="dense"
                                value={customGasLimit}
                                onChange={(e) => setCustomGasLimit(e.target.value)}
                            />
                        </AccordionDetails>
                    </Accordion>
                )}

                {/* 🟢 Error message */}
                {error && (
                    <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                        {error}
                    </Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    disabled={loading || !toAddress || !amount}
                    onClick={handleSend}
                    variant="contained"
                >
                    {loading ? "Sending..." : "Send"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SendTokenModal;
