// SendModal.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Typography,
    Box,
    CircularProgress,
    Divider,
    Card,
    CardContent,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from "@mui/material";
import { formatUnits, isAddress, parseUnits } from "ethers"; // ethers v6
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { loadFromLocalStorage } from "../../../utils/storage";
import { CHAIN_ID, PK_PUBLICKEY } from "../../../utils/keys";
import { bgRequest } from "../../../utils/helper";
import { decryptPk } from "../../../utils/cryptoUtils";


// helper: promise wrapper for background requests

const SendModal = ({
    open,
    onClose,
    chain,
    address: fromAddress,
    AccountTitile,
    CurrentAccount
}) => {
    const [toAddress, setToAddress] = useState("0xD1f23d4B13d27d6fA842A5B2CA64FAe4CA89f035");
    const [amount, setAmount] = useState("");
    const [balance, setBalance] = useState("0");
    const [gasFee, setGasFee] = useState(null);
    const [customGasPrice, setCustomGasPrice] = useState(""); // ✅ for override
    const [customGasLimit, setCustomGasLimit] = useState(); // ✅ for override
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [successTx, setSuccessTx] = useState("");
    const [finalFee, setFinalFee] = useState(null); // fee displayed to user


    const handleCustomGasChange = (field, value) => {
        let num = Number(value);

        if (isNaN(num) || num < 0) num = 0;

        if (field === "gasLimit" && num < 21000) {
            num = 21000; // minimum safe
        }

        if (field === "gasPrice" && num === 0) {
            num = 1; // set a minimal non-zero value
        }

        if (field === "gasPrice") setCustomGasPrice(num);
        if (field === "gasLimit") setCustomGasLimit(num);
    };

    useEffect(() => {
        if (!gasFee) return;

        const gasPrice = customGasPrice || gasFee.gasPrice; // Gwei
        const gasLimit = customGasLimit || gasFee.gasLimit;

        if (Number(gasPrice) > 0 && Number(gasLimit) >= 21000) {
            const gasPriceWei = parseUnits(gasPrice.toString(), "gwei");
            const feeWei = gasPriceWei * BigInt(gasLimit);
            const feeEth = formatUnits(feeWei, "ether");
            setFinalFee(feeEth);
        } else {
            setFinalFee(gasFee.estimatedFee);
        }
    }, [gasFee, customGasPrice, customGasLimit]);

    // reset state when closing
    useEffect(() => {
        if (!open) {
            setToAddress("");
            setAmount("");
            setGasFee(null);
            setCustomGasPrice("");
            setCustomGasLimit("");
            setError("");
            setLoading(false);
            setSuccessTx("");
            setBalance("0");
        }
    }, [open]);

    // fetch balance
    useEffect(() => {
        if (!open || !fromAddress || !chain?.rpcUrl) return;
        let mounted = true;

        (async () => {
            try {
                const res = await bgRequest({
                    type: "GET_BALANCE",
                    payload: { address: fromAddress.trim(), rpcUrl: chain.rpcUrl },
                });
                if (!mounted) return;
                if (res.success) setBalance(res.balance);
                else setError(res.error || "Failed to fetch balance");
            } catch (err) {
                if (mounted) setError(err.message || "Balance check failed");
            }
        })();

        return () => {
            mounted = false;
        };
    }, [open, fromAddress, chain?.rpcUrl]);

    // estimate fee with debounce
    useEffect(() => {
        if (!open || !fromAddress || !chain?.rpcUrl) return;
        if (!toAddress || !amount) {
            setGasFee(null);
            return;
        }

        let mounted = true;
        const timer = setTimeout(async () => {
            try {
                const amtNum = Number(amount);
                const balNum = Number(balance);

                if (isNaN(amtNum) || amtNum <= 0) {
                    if (mounted) {
                        setGasFee(null);
                        setError("Invalid amount");
                    }
                    return;
                }

                if (amtNum > balNum) {
                    if (mounted) {
                        setGasFee(null);
                        setError("Amount exceeds balance");
                    }
                    return;
                }

                const res = await bgRequest({
                    type: "ESTIMATE_FEE",
                    payload: {
                        from: fromAddress.trim(),
                        to: toAddress.trim(),
                        amount: amount.trim(),
                        rpcUrl: chain.rpcUrl,
                    },
                });

                if (!mounted) return;
                if (res?.success) {
                    setGasFee(res);
                    setCustomGasLimit(res?.gasLimit);
                    setCustomGasPrice(res?.gasPrice)
                    setError("");
                } else {
                    setGasFee(null);
                    setError(res?.error || "Failed to estimate fee");
                }
            } catch (err) {
                if (mounted) {
                    setGasFee(null);
                    setError(err.message || "Fee estimation failed");
                }
            }
        }, 400);

        return () => {
            mounted = false;
            clearTimeout(timer);
        };
    }, [toAddress, amount, fromAddress, chain?.rpcUrl, open, balance]);

    // handle send
    const handleSend = useCallback(async () => {
        setError("");
        setSuccessTx("");

        const trimmedTo = toAddress.trim();
        const trimmedAmount = amount.trim();

        if (!trimmedTo || !trimmedAmount) {
            setError("Recipient and amount are required.");
            return;
        }

        if (!isAddress(trimmedTo) && !trimmedTo.includes(".")) {
            setError("Invalid recipient address (must be 0x or ENS).");
            return;
        }

        if (Number(trimmedAmount) <= 0) {
            setError("Amount must be greater than 0.");
            return;
        }

        const feeDecimal = gasFee ? Number(gasFee.estimatedFee) : 0;
        const balanceDecimal = Number(balance);
        const amountDecimal = Number(trimmedAmount);

        if (balanceDecimal < amountDecimal + feeDecimal) {
            setError("Insufficient balance for amount + fee.");
            return;
        }

        try {
            setLoading(true);

            const privateKey = CurrentAccount?.account?.chains[0]?.privateKey;
            if (!privateKey) throw new Error("Missing private key.");
            const pk = CurrentAccount?.account?.chains[0]?.privateKey ?? null;
            const decrypted = decryptPk(pk, PK_PUBLICKEY);
            const chainId = loadFromLocalStorage(CHAIN_ID)
            const res = await bgRequest({
                type: "SEND_TX",
                payload: {
                    from: fromAddress.trim(),
                    to: trimmedTo,
                    amount: trimmedAmount,
                    rpcUrl: chain.rpcUrl,
                    explorer: chain.explorerUrl,
                    chainId,
                    privateKey: decrypted,
                    gasPrice: customGasPrice || undefined, // ✅ pass override
                    gasLimit: customGasLimit || undefined, // ✅ pass override
                    symbol: chain?.nativeCurrency?.symbol,
                    name: chain?.nativeCurrency?.name
                },
            });

            setLoading(false);

            if (res?.success) {
                setSuccessTx(res.txHash);
            } else {
                setError(res?.error || "Transaction failed");
            }
        } catch (err) {
            setLoading(false);
            setError(err.message || "Unexpected error");
        }
    }, [toAddress, amount, gasFee, balance, chain, fromAddress, customGasPrice, customGasLimit]);


    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Send {chain?.name}</DialogTitle>
            <DialogContent>
                <Box mb={2}>
                    <Card variant="outlined">
                        <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                From
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.2 }}>
                                {typeof AccountTitile === "string" && AccountTitile.trim() !== ""
                                    ? AccountTitile
                                    : `Account ${AccountTitile + 1}`}
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    fontFamily: "monospace",
                                    bgcolor: "#f3f4f6",
                                    p: 0.8,
                                    borderRadius: 1.5,
                                    wordBreak: "break-all",
                                }}
                            >
                                {/* {console.log("slice issue from address : ")} */}
                                {`${fromAddress?.slice(0, 10)}...${fromAddress?.slice(-6)}`}
                            </Typography>
                            <Box mt={1.5} display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">
                                    Balance
                                </Typography>
                                <Typography variant="body2" fontWeight={600}>
                                    {Number(balance).toFixed(4)} {chain?.nativeCurrency?.symbol}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <TextField
                    margin="dense"
                    label="Recipient address"
                    fullWidth
                    value={toAddress}
                    size="small"
                    onChange={(e) => setToAddress(e.target.value)}
                    disabled={loading || !!successTx}
                />

                <TextField
                    margin="dense"
                    label={`Amount (${chain?.nativeCurrency?.symbol})`}
                    fullWidth
                    type="number"
                    size="small"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={loading || !!successTx}
                />

                {finalFee && (
                    <Typography mt={1} variant="body2" color="text.secondary">
                        Estimated Gas Fee: {finalFee} {chain?.nativeCurrency?.symbol}
                    </Typography>
                )}

                {gasFee && (
                    <Accordion sx={{ mt: 2 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Advanced (Custom Gas)
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <TextField
                                margin="dense"
                                label="Gas Price (Gwei)"
                                type="number"
                                size="small"
                                value={customGasPrice}
                                onChange={(e) => handleCustomGasChange("gasPrice", e.target.value)}
                                inputProps={{ min: 1 }}
                                fullWidth
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                margin="dense"
                                label="Gas Limit"
                                type="number"
                                size="small"
                                value={customGasLimit}
                                onChange={(e) => handleCustomGasChange("gasLimit", e.target.value)}
                                inputProps={{ min: 21000 }}
                                fullWidth
                            />
                        </AccordionDetails>
                    </Accordion>
                )}

                {error && (
                    <Typography mt={1} color="error" variant="body2">
                        {error}
                    </Typography>
                )}



            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    Close
                </Button>
                {!successTx && (
                    <Button
                        variant="contained"
                        onClick={handleSend}
                        disabled={!gasFee || loading || !amount || !toAddress}
                        startIcon={loading ? <CircularProgress size={16} /> : null}
                    >
                        {loading ? "Sending..." : "Send"}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default SendModal;
