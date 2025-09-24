// src/components/RevealSecretModal.jsx
import React, { useEffect, useRef, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Typography,
    Box,
    TextField,
    Button,
    LinearProgress,
    Tooltip,
    Alert,
    CircularProgress,
} from "@mui/material";
import { Close, ContentCopy } from "@mui/icons-material";
import { SESSION_PASSWORD_KEY } from "../../utils/keys";
import { findAccountDetails } from "../../utils/helper";
import { decryptMnemonic } from "../../utils/cryptoUtils";
import Logo from '../../../public/icons/Logo.svg';





export default function RevealSecretModal({
    open,
    onClose,
    secretType,
    holdDuration = 2000,
    currentAccount,
    wallet
}) {
    const [step, setStep] = useState("password");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [verifyError, setVerifyError] = useState("");
    const [revealError, setRevealError] = useState("");
    const [secret, setSecret] = useState("");
    const [holdProgress, setHoldProgress] = useState(0);
    const holdIntervalRef = useRef(null);
    const holdStartRef = useRef(null);



    useEffect(() => {
        if (!open) {
            setStep("password");
            setPassword("");
            setLoading(false);
            setVerifyError("");
            setRevealError("");
            setSecret("");
            setHoldProgress(0);
            clearHoldInterval();
        }
    }, [open]);

    useEffect(() => {
        return () => clearHoldInterval();
    }, []);

    function clearHoldInterval() {
        if (holdIntervalRef.current) {
            clearInterval(holdIntervalRef.current);
            holdIntervalRef.current = null;
        }
    }

    const verifyPassword = async (inputPassword) => {
        const sessionPassword = localStorage.getItem(SESSION_PASSWORD_KEY);
        if (!sessionPassword) return false;
        const decodedPassword = atob(sessionPassword);
        return inputPassword === decodedPassword

    }

    const getPrivateKey = () => {
        return currentAccount?.chains?.[0]?.privateKey ?? null;
    };

    const getSecretPhrases = (password) => {
        const account = findAccountDetails(wallet, currentAccount);
        if (!account) return null;

        const encryptedMnemonic = account.wallet?.mnemonic ?? null;
        if (!encryptedMnemonic) return null;

        const decrypted = decryptMnemonic(encryptedMnemonic, password);
        return decrypted ?? null;
    };

    async function handleVerifyPassword(e) {
        e?.preventDefault?.();
        setVerifyError("");
        setRevealError("");

        if (!password) {
            setVerifyError("Please enter your password.");
            return;
        }

        try {
            setLoading(true);
            const ok = await verifyPassword(password);
            setLoading(false);

            if (!ok) {
                setVerifyError("Incorrect password.");
                return;
            }

            // password ok -> fetch secret based on type
            let s = null;
            setLoading(true);

            if (secretType === "phrase") {
                s = await getSecretPhrases(password);
            } else if (secretType === "privateKey") {
                s = await getPrivateKey();
            }

            setLoading(false);

            if (!s) {
                setVerifyError("Recovery phrase not available.");
                return;
            }

            setSecret(s);
            setStep("hold");
            setHoldProgress(0);

        } catch (err) {
            setLoading(false);
            setVerifyError(err?.message || "Verification failed.");
        }
    }

    function startHoldReveal() {
        setRevealError("");
        if (!secret) {
            setRevealError("Secret not loaded.");
            return;
        }
        clearHoldInterval();
        holdStartRef.current = Date.now();
        const tick = 20; // ms
        holdIntervalRef.current = setInterval(() => {
            const elapsed = Date.now() - holdStartRef.current;
            const progress = Math.min(100, (elapsed / holdDuration) * 100);
            setHoldProgress(progress);
            if (progress >= 100) {
                // done
                clearHoldInterval();
                setStep("revealed");
            }
        }, tick);
    }

    function cancelHoldReveal() {
        clearHoldInterval();
        setHoldProgress(0);
    }

    function handleCopySecret() {
        if (!secret) return;
        navigator.clipboard?.writeText(secret).catch(() => {
            setRevealError("Failed to copy to clipboard.");
        });
    }

    function onKeyDownReveal(e) {
        if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            if (step === "hold") startHoldReveal();
        }
    }

    function onKeyUpReveal(e) {
        if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            if (step === "hold") cancelHoldReveal();
        }
    }

    return (
        <Dialog open={open} onClose={onClose} fullScreen>
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography fontWeight="bold" variant="subtitle1">
                    Reveal {secretType === "phrase" ? "Secret Recovery Phrase" : "Private Key"}
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <Close sx={{ fontSize: 20 }} />
                </IconButton>
            </DialogTitle>

            <DialogContent
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    textAlign: "center",
                    height: "100%",
                    gap: 1,
                    p: 4,
                }}
            >

                <Box >
                    {step !== "hold" && <img
                        src={Logo}
                        alt="centered logo"
                        style={{ width: "100px" }}
                    />}
                </Box>

                {step === "password" && (
                    <Box
                        component="form"
                        onSubmit={handleVerifyPassword}
                        sx={{ display: "grid", gap: 2, width: "100%", maxWidth: 400 }}
                    >
                        <Alert severity="warning">
                            This is sensitive information. Keep it private. Do not share it.
                        </Alert>

                        <Typography variant="body2" color="text.secondary">
                            Enter your password to continue. This action will allow revealing
                            sensitive data.
                        </Typography>

                        {verifyError && <Alert severity="error">{verifyError}</Alert>}

                        <TextField
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            fullWidth
                            disabled={loading}
                            autoFocus
                        />

                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                            <Button variant="text" sx={{ textTransform: "none" }} onClick={onClose}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={loading}
                                sx={{ textTransform: "none" }}
                                startIcon={loading && <CircularProgress size={16} />}
                            >
                                {loading ? "Checking..." : "Confirm"}
                            </Button>
                        </Box>
                    </Box>
                )}

                {step === "hold" && (
                    <Box sx={{ display: "grid", gap: 2, width: "100%", maxWidth: 400 }}>
                        <Alert severity="warning">
                            This is sensitive information. Keep it private. Do not share it.
                        </Alert>

                        <Typography variant="body2" color="text.secondary">
                            Press and hold the Reveal button for{" "}
                            {Math.round((holdDuration / 1000) * 10) / 10}s to show the secret.
                        </Typography>

                        {revealError && <Alert severity="error">{revealError}</Alert>}

                        <Box
                            sx={{
                                p: 2,
                                borderRadius: 2,
                                border: "1px solid",
                                borderColor: "divider",
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                                alignItems: "center",
                            }}
                        >
                            <Typography variant="caption" color="text.secondary">
                                Hidden {secretType === "phrase" ? "Recovery Phrase" : "Private Key"}
                            </Typography>

                            <Box
                                sx={{
                                    flex: 1,
                                    p: 1,
                                    bgcolor: "background.paper",
                                    borderRadius: 1,
                                    color: "text.primary",
                                    wordBreak: "break-all",
                                    fontFamily: "monospace",
                                    width: "100%",
                                    textAlign: "center",
                                }}
                            >
                                ••••••••••••••••••••••••••••••
                            </Box>

                            <Tooltip title="Press and hold to reveal">
                                <Button
                                    onMouseDown={startHoldReveal}
                                    onMouseUp={cancelHoldReveal}
                                    onMouseLeave={cancelHoldReveal}
                                    onTouchStart={startHoldReveal}
                                    onTouchEnd={cancelHoldReveal}
                                    sx={{
                                        textTransform: "none",
                                        position: "relative",
                                        overflow: "hidden",
                                        borderRadius: "50px",
                                        minWidth: 220,
                                        height: 56,
                                        fontWeight: 500,
                                        color: "white",
                                        backgroundColor: "#555", // idle background
                                        zIndex: 1,
                                        // remove MUI default hover/active ripple bg
                                        "&:hover": {
                                            backgroundColor: "#555",
                                        },
                                        "&:active": {
                                            backgroundColor: "#555",
                                        },
                                        "&:focusVisible": {
                                            backgroundColor: "#555",
                                        },
                                        "& .MuiTouchRipple-root": {
                                            display: "none",
                                        },
                                        // fill effect
                                        "&::before": {
                                            content: '""',
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            width: `${holdProgress}%`,
                                            height: "100%",
                                            backgroundColor: "#1976d2",
                                            borderRadius: "50px",
                                            transition: "width 0.1s linear",
                                            zIndex: -1,
                                        },
                                    }}
                                >
                                    Hold to Reveal
                                </Button>


                            </Tooltip>




                        </Box>

                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                            <Button
                                sx={{ textTransform: "none" }}
                                variant="text"
                                onClick={() => {
                                    setStep("password");
                                    setPassword("");
                                }}
                            >
                                Back
                            </Button>
                            <Button variant="outlined" sx={{ textTransform: "none" }} onClick={onClose}>
                                Close
                            </Button>
                        </Box>
                    </Box>
                )}

                {step === "revealed" && (
                    <Box sx={{ display: "grid", gap: 2, width: "100%", maxWidth: 500 }}>
                        <Alert severity="warning">
                            This is sensitive information. Keep it private. Do not share it.
                        </Alert>

                        <Box
                            sx={{
                                p: 3,
                                borderRadius: 2,
                                bgcolor: "#1976d2",
                                fontFamily: "monospace",
                                color: "#fff",
                                wordBreak: "break-all",
                            }}
                        >
                            <Typography variant="body2">{secret}</Typography>
                        </Box>

                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                            <Button
                                startIcon={<ContentCopy />}
                                variant="outlined"
                                onClick={handleCopySecret}
                                sx={{ textTransform: "none" }}
                            >
                                Copy
                            </Button>
                            <Button variant="contained" sx={{ textTransform: "none" }} color="primary" onClick={onClose}>
                                Done
                            </Button>
                        </Box>
                    </Box>
                )}
            </DialogContent>


            <DialogActions sx={{ px: 2, py: 1 }}>

            </DialogActions>
        </Dialog>
    );
}


