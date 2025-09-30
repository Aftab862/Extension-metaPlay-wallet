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
    IconButton,
    Box,
    Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloseIcon from "@mui/icons-material/Close";
import { ethers } from "ethers";
import { bgRequest } from "../../utils/helper";


const SendTokenModal = ({ open, onClose, token, rpcUrl, userWallet, chainId, Account }) => {
    const [toAddress, setToAddress] = useState("");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);

    const [gasInfo, setGasInfo] = useState(null);
    const [customGasPrice, setCustomGasPrice] = useState("");
    const [customGasLimit, setCustomGasLimit] = useState("");
    const [finalFee, setFinalFee] = useState(null);

    const [error, setError] = useState(null);

    // 🟢 Fetch gas estimation
    useEffect(() => {
        if (!toAddress || !amount) {
            setGasInfo(null);
            setFinalFee(null);
            setError(null);
            setLoading(false);
            return;
        }

        if (Number(amount) > Number(token?.balance || 0)) {
            setGasInfo(null);
            setFinalFee(null);
            setLoading(false);
            setError("Insufficient token balance.");
            return;
        }

        const fetchFee = async () => {
            setLoading(true);
            setError(null);

            try {


                const res = await bgRequest({
                    type: "ESTIMATE_FEE_TOKEN",
                    payload: {
                        from: userWallet,
                        to: toAddress,
                        amount,
                        rpcUrl,
                        chainId,
                        tokenAddress: token.address,
                        decimals: token.decimals,
                    },
                });

                if (res?.success) {
                    setGasInfo(res);
                    setCustomGasPrice(res.gasPrice);
                    setCustomGasLimit(res.gasLimit);
                } else {
                    setError(res?.error || "Failed to estimate gas fee.");
                    setGasInfo(null);
                }
            } catch (err) {
                setError(err.message || "Unexpected error during gas estimation.");
                setGasInfo(null);
            } finally {
                setLoading(false);
            }
        };

        fetchFee();
    }, [toAddress, amount, token?.balance, rpcUrl, userWallet, chainId]);

    // 🟢 Recalculate fee if custom gas values change
    useEffect(() => {
        if (!gasInfo) return;

        try {
            const gasPrice = customGasPrice || gasInfo.gasPrice;
            const gasLimit = customGasLimit || gasInfo.gasLimit;

            const gasPriceWei = ethers.parseUnits(gasPrice.toString(), "gwei");
            const feeWei = gasPriceWei * BigInt(gasLimit);
            const feeEth = ethers.formatUnits(feeWei, "ether");

            setFinalFee(feeEth);
        } catch {
            setFinalFee(gasInfo.estimatedFee);
        }
    }, [gasInfo, customGasPrice, customGasLimit]);

    // 🟢 Handle send
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




            const res = await bgRequest({
                type: "SEND_TOKEN_TX",
                payload: {
                    to: toAddress,
                    amount,
                    rpcUrl,
                    privateKey: Account?.account?.chains[0]?.privateKey,
                    chainId,
                    tokenAddress: token.address,
                    decimals: token.decimals,
                    gasPrice: customGasPrice,
                    gasLimit: customGasLimit,
                },
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
            {/* Header with Close Button */}
            <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                Send {token?.symbol}
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                {/* Balance Section */}
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Balance: {token?.balance} {token?.symbol}
                </Typography>

                {/* Input Fields */}
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

                {/* Gas Fee Display */}
                {loading && toAddress && amount ? (
                    <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                        <CircularProgress size={18} sx={{ mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                            Estimating fee...
                        </Typography>
                    </Box>
                ) : gasInfo && finalFee ? (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Estimated Gas Fee: <b>{finalFee} ETH</b>
                    </Typography>
                ) : null}

                {/* Advanced Gas Controls */}
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

                {/* Error Message */}
                {error && (
                    <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                        {error}
                    </Typography>
                )}
            </DialogContent>

            <Divider />

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSend}
                    disabled={loading || !toAddress || !amount}
                >
                    {loading ? "Sending..." : `Send ${token?.symbol}`}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SendTokenModal;
