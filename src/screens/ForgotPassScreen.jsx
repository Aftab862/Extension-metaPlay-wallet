import React, { useState } from "react";
import {
    Box,
    Button,
    TextField,
    Typography,
    CircularProgress,
    Alert,
    IconButton,
    Grid,
    Avatar,
    Paper,
} from "@mui/material";
import {
    ArrowBack,
    LockOutlined,
    Visibility,
    VisibilityOff,
} from "@mui/icons-material";

const PRIMARY_COLOR = "#1976d2";

export default function ForgotPassword({ onResetComplete, onCancel }) {
    const [step, setStep] = useState("start");
    const [mnemonicWords, setMnemonicWords] = useState(Array(12).fill(""));
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleMnemonicChange = (index, value) => {
        const updated = [...mnemonicWords];
        updated[index] = value.trim();
        setMnemonicWords(updated);
    };

    const validateMnemonic = () => {
        // pretend this checks your phrase properly
        return mnemonicWords.every((w) => w.length > 0);
    };

    const handleContinueFromPhrase = () => {
        setError("");
        if (!validateMnemonic()) {
            setError("Please enter all 12 words before continuing.");
            return;
        }
        setStep("password");
    };

    const handleReset = async () => {
        setError("");
        setSuccess("");

        // basic empty check
        if (!newPassword || !confirmPassword) {
            setError("Both password fields are required.");
            return;
        }

        // password match check
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        // password strength checks
        const lengthCheck = newPassword.length >= 8;
        const upperCheck = /[A-Z]/.test(newPassword);
        const numberCheck = /\d/.test(newPassword);

        if (!lengthCheck) {
            setError("Password must be at least 8 characters long.");
            return;
        }
        if (!upperCheck) {
            setError("Password must contain at least one uppercase letter.");
            return;
        }
        if (!numberCheck) {
            setError("Password must contain at least one number.");
            return;
        }

        try {
            setLoading(true);
            // simulate async request
            await new Promise((res) => setTimeout(res, 1000));

            setSuccess("Password reset successfully!");
            setLoading(false);
            setTimeout(() => onResetComplete?.(), 1000);
        } catch (err) {
            console.error(err);
            setError("Something went wrong. Try again.");
            setLoading(false);
        }
    };


    const handleBack = () => {
        if (step === "phrase") setStep("start");
        else if (step === "password") setStep("phrase");
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",

                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                px: 2,
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    width: "100%",
                    maxWidth: 420,
                    p: .05,

                }}
            >
                {/* Top Section with Logo and Back */}
                <Box display="flex" alignItems="center" justifyContent="space-between">

                    <IconButton onClick={handleBack}>
                        <ArrowBack />
                    </IconButton>

                    <Avatar
                        sx={{

                            width: 60,
                            height: 60,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                    >
                        <LockOutlined sx={{ fontSize: 30, color: PRIMARY_COLOR }} />
                    </Avatar>

                    <Box>

                    </Box>

                </Box>

                {/* Content */}
                <Box sx={{ mt: 3 }}>
                    {step === "start" && (
                        <>
                            <Typography
                                variant="h6"
                                align="center"
                                sx={{ fontWeight: 600, color: PRIMARY_COLOR, mb: 1 }}
                            >
                                Forgot your password?
                            </Typography>
                            <Typography
                                align="center"
                                sx={{ color: "#555", mb: 3, fontSize: "0.9rem" }}
                            >
                                MetaPlay can’t recover your password for you.
                                Use your Secret Recovery Phrase to reset your wallet.
                            </Typography>

                            <Button
                                fullWidth
                                variant="contained"
                                sx={{
                                    backgroundColor: "#d32f2f",
                                    "&:hover": { backgroundColor: "#b71c1c" },
                                    textTransform: "none",
                                    fontWeight: 600,
                                    borderRadius: 2,
                                    py: 1.2,
                                }}
                                onClick={() => setStep("phrase")}
                            >
                                Reset Wallet
                            </Button>
                        </>
                    )}

                    {step === "phrase" && (
                        <>
                            <Typography
                                variant="h6"
                                align="center"
                                sx={{ mb: 2, color: PRIMARY_COLOR, fontWeight: 600 }}
                            >
                                Enter Your Recovery Phrase
                            </Typography>
                            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                            <Grid container spacing={1.5} sx={{ mb: 3 }}>
                                {mnemonicWords.map((word, i) => (
                                    <Grid item xs={4} key={i}>
                                        <TextField
                                            id={`phrase-${i}`}
                                            value={word}
                                            onChange={(e) =>
                                                handleMnemonicChange(i, e.target.value)
                                            }
                                            size="small"
                                            fullWidth
                                            placeholder={`${i + 1}`}
                                        />
                                    </Grid>
                                ))}
                            </Grid>

                            <Button
                                fullWidth
                                variant="contained"
                                sx={{
                                    backgroundColor: PRIMARY_COLOR,
                                    "&:hover": { backgroundColor: "#125a9c" },
                                    textTransform: "none",
                                    fontWeight: 600,
                                }}
                                onClick={handleContinueFromPhrase}
                            >
                                Continue
                            </Button>
                        </>
                    )}

                    {step === "password" && (
                        <>
                            <Typography
                                variant="h6"
                                align="center"
                                sx={{ mb: 2, color: PRIMARY_COLOR, fontWeight: 600 }}
                            >
                                Create New Password
                            </Typography>
                            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                            <TextField
                                label="New Password"
                                type={showNew ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                fullWidth
                                sx={{ mb: 2 }}
                                InputProps={{
                                    endAdornment: (
                                        <IconButton onClick={() => setShowNew(!showNew)}>
                                            {showNew ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    ),
                                }}
                            />

                            <TextField
                                label="Confirm Password"
                                type={showConfirm ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                fullWidth
                                sx={{ mb: 3 }}
                                InputProps={{
                                    endAdornment: (
                                        <IconButton onClick={() => setShowConfirm(!showConfirm)}>
                                            {showConfirm ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    ),
                                }}
                            />

                            <Button
                                fullWidth
                                variant="contained"
                                disabled={loading}
                                sx={{
                                    backgroundColor: PRIMARY_COLOR,
                                    "&:hover": { backgroundColor: "#125a9c" },
                                    textTransform: "none",
                                    fontWeight: 600,
                                }}
                                onClick={handleReset}
                            >
                                {loading ? (
                                    <CircularProgress size={22} sx={{ color: "#fff" }} />
                                ) : (
                                    "Reset Password"
                                )}
                            </Button>
                        </>
                    )}
                </Box>
            </Paper>
        </Box>
    );
}
