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
import Logo from "../../public/icons/Logo.svg";

import {
    ArrowBack,
    LockOutlined,
    Visibility,
    VisibilityOff,
} from "@mui/icons-material";
import { createInitialNestedState, persistWalletState } from "../utils/walletUtils";
import { SESSION_KEY, SESSION_PASSWORD_KEY } from "../utils/keys";

const PRIMARY_COLOR = "#1976d2";

export default function ForgotPassword({ setPhase }) {
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
        setError("");
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
            console.log("[Reset Step 0] Starting reset process...");
            setLoading(true);

            // step 1: clear localStorage and indexedDB
            console.log("[Reset Step 1] Clearing localStorage and sessionStorage...");
            localStorage.clear();
            sessionStorage.clear();

            console.log("[Reset Step 1.1] Fetching list of IndexedDB databases...");
            const dbs = await indexedDB.databases();

            console.log("[Reset Step 1.2] Deleting IndexedDB databases...");
            for (const db of dbs) {
                if (db.name) {
                    console.log(`   → Deleting DB: ${db.name}`);
                    indexedDB.deleteDatabase(db.name);
                }
            }

            // step 2: simulate async reset delay
            console.log("[Reset Step 2] Simulating delay...");
            await new Promise((res) => setTimeout(res, 1000));

            const mnemonicString = mnemonicWords.join(" ").trim();
            console.log("[Debug] Mnemonic to send:", mnemonicString);

            const initial = await createInitialNestedState(mnemonicString);

            // step 3: create fresh wallet from mnemonic
            console.log("[Reset Step 3] Creating fresh wallet from mnemonic...");

            console.log("[Reset Step 3.1] Persisting new wallet state...");
            persistWalletState(initial.wallets, 0, 0);
            localStorage.setItem(SESSION_PASSWORD_KEY, btoa(newPassword))

            // step 4: notify user
            console.log("[Reset Step 4] Update success message...");
            setSuccess("Password reset and new wallet created successfully!");
            setLoading(false);
            setPhase("enter-password")



            console.log("[Reset Step ✅] Process finished successfully.");
        } catch (err) {
            console.error("[Reset Step ❌] Error occurred:", err);
            setError("Something went wrong. Try again.");
            setLoading(false);
        }

    };



    const handleBack = () => {
        if (step === "start") setPhase("enter-password");
        if (step === "phrase") setStep("start");
        else if (step === "password") setStep("phrase");
    };

    return (
        <Box
            sx={{

                px: 2,
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    width: "100%",
                    maxWidth: 420,
                    minHeight: "80vh",
                    padding: "2rem 0.5rem",
                    display: "flex",
                    justifyContent: "space-between",

                    flexDirection: "column",

                }}
            >
                {/* Top Section with Logo and Back */}
                <Box display="flex" alignItems="center" justifyContent="space-between">

                    <IconButton onClick={handleBack}>
                        <ArrowBack />
                    </IconButton>


                </Box>
                <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                    <img src={Logo} alt="centered logo" style={{ width: "100px" }} />
                </Box>


                {/* Content */}
                <Box >
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
                                disabled={!validateMnemonic()}
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
