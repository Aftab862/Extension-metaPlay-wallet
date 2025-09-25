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
} from "@mui/material";
import { isAddress } from "ethers"; // ethers v6

// helper: promise wrapper for background requests
function bgRequest(message) {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage(message, (res) => resolve(res));
    });
}

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
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [successTx, setSuccessTx] = useState("");
    console.log("selected chains :", chain)

    // reset on modal close
    useEffect(() => {
        if (!open) {
            setToAddress("");
            setAmount("");
            setGasFee(null);
            setError("");
            setLoading(false);
            setSuccessTx("");
            setBalance("0");
        }
    }, [open]);

    // fetch fresh balance when opened
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
                console.log("front end resp : ", res)
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

    // estimate fee on inputs change (debounced)
    useEffect(() => {
        if (!open || !fromAddress || !chain?.rpcUrl) return;
        if (!toAddress || !amount) {
            setGasFee(null);
            return;
        }

        let mounted = true;
        const timer = setTimeout(async () => {
            try {
                // ✅ balance check first
                const amtNum = Number(amount);
                const balNum = Number(balance); // balance should already be in ETH string or number

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
                        setError("Amount exceeds available balance");
                    }
                    return;
                }

                // ✅ only estimate if balance is sufficient
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
    }, [toAddress, amount, fromAddress, chain?.rpcUrl, open, balance, setGasFee]);

    const handleSend = useCallback(async () => {
        setError("");
        setSuccessTx("");

        const trimmedTo = toAddress.trim();
        const trimmedAmount = amount.trim();

        if (!trimmedTo || !trimmedAmount) {
            setError("Recipient and amount are required.");
            return;
        }

        // validate address/ENS
        if (!isAddress(trimmedTo) && !trimmedTo.includes(".")) {
            setError("Invalid recipient address (must be 0x or ENS).");
            return;
        }

        // validate amount
        if (Number(trimmedAmount) <= 0) {
            setError("Amount must be greater than 0.");
            return;
        }

        // check funds
        const feeDecimal = gasFee ? Number(gasFee) : 0;
        const balanceDecimal = Number(balance);
        const amountDecimal = Number(trimmedAmount);
        if (balanceDecimal < amountDecimal + feeDecimal) {
            setError("Insufficient balance for amount + fee.");
            return;
        }

        try {
            setLoading(true);

            // 🔑 replace this with decrypted privateKey flow

            const privateKey = CurrentAccount?.account?.chains[0]?.privateKey
            if (!privateKey) {
                throw new Error("Missing private key. Please unlock your wallet.");
            }

            const res = await bgRequest({
                type: "SEND_TX",
                payload: {
                    from: fromAddress.trim(),
                    to: trimmedTo,
                    amount: trimmedAmount,
                    rpcUrl: chain.rpcUrl,
                    privateKey,
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
    }, [toAddress, amount, gasFee, balance, chain, fromAddress]);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Send {chain?.name}</DialogTitle>
            <DialogContent>

                <Box mb={2}>
                    <Card
                        variant="outlined"
                        sx={{

                        }}
                    >
                        <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                            {/* Title */}
                            <Typography
                                variant="overline"
                                sx={{ fontWeight: 600, color: "text.secondary", letterSpacing: 1 }}
                            >
                                From Account
                            </Typography>

                            {/* Account name */}
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.2 }}>
                                {typeof AccountTitile === "string" && AccountTitile.trim() !== ""
                                    ? AccountTitile
                                    : `Account ${AccountTitile + 1}`}
                            </Typography>

                            {/* Address */}
                            <Typography
                                variant="body2"
                                sx={{
                                    fontFamily: "monospace",
                                    bgcolor: "#f3f4f6",
                                    p: 0.8,
                                    borderRadius: 1.5,
                                    wordBreak: "break-all",
                                    color: "text.primary",
                                }}
                            >
                                {`${fromAddress.slice(0, 10)}...${fromAddress.slice(-6)}`}
                            </Typography>

                            {/* Balance */}
                            <Box mt={1.5} display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">
                                    Balance
                                </Typography>
                                <Typography variant="body2" fontWeight={600}>
                                    {Number(balance).toFixed(2)} {chain?.nativeSymbol}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>


                <Divider sx={{ mb: 2 }} />

                <TextField
                    margin="dense"
                    label="Recipient address or ENS"
                    fullWidth
                    value={toAddress}
                    onChange={(e) => setToAddress(e.target.value)}
                    disabled={loading || !!successTx}
                />

                <TextField
                    margin="dense"
                    label={`Amount (${chain?.nativeSymbol})`}
                    fullWidth
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={loading || !!successTx}
                />
                {console.log("gasFee gasFee gasFee gasFee :", gasFee)}
                {gasFee && (
                    <Typography mt={1} variant="body2" color="text.secondary">
                        Estimated Gas Fee: {gasFee?.estimatedFee} {chain?.nativeSymbol}
                    </Typography>
                )}

                {error && (
                    <Typography mt={1} color="error" variant="body2">
                        {error}
                    </Typography>
                )}

                {successTx && (
                    <Typography mt={1} color="primary" variant="body2">
                        ✅ Transaction sent! <br />
                        <a
                            href={`${chain?.explorerUrl}/tx/${successTx}`}
                            target="_blank"
                            rel="noreferrer"
                        >
                            View on Explorer
                        </a>
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
                        disabled={loading}
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
