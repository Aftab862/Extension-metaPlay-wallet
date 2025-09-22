// src/screens/PasswordScreen.jsx
import React, { useState } from "react";
import {
    Button,
    TextField,
    Typography,
    Container,
    Box,
    Avatar,
    InputAdornment,
    IconButton,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Logo from '../../public/icons/Logo.svg'


const PasswordScreen = ({ onPasswordSubmit, error, mode = "enter" }) => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [validationError, setValidationError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // strict: must include lowercase, uppercase, number, min 8 chars
    const validatePassword = (pwd) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!regex.test(pwd)) {
            return "Password must be at least 8 characters long and include uppercase, lowercase, and a number.";
        }
        return "";
    };

    const handlePasswordChange = (value) => {
        setPassword(value);
        if (mode === "create") {
            setValidationError(validatePassword(value));
        } else {
            setValidationError("");
        }
    };

    const handleSubmit = () => {
        if (mode === "create") {
            const pwdError = validatePassword(password);
            if (pwdError) {
                setValidationError(pwdError);
                return;
            }
            if (password !== confirmPassword) return;
        }
        setValidationError("");
        onPasswordSubmit(password);
    };

    return (
        <Container
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "93vh",
            }}
        >
            <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",

                    }}
                >
                    <img
                        src={Logo}
                        alt="centered logo"
                        style={{ width: "100px" }}
                    />
                </Box>

                <Typography variant="h6" mt={1}>
                    {mode === "create" ? "Create Password" : "Welcome back"}
                </Typography>
            </Box>

            {/* Password Input */}
            <TextField
                fullWidth
                type={showPassword ? "text" : "password"}
                label="Password"
                variant="outlined"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                sx={{ mb: 2 }}
                error={mode === "create" && Boolean(validationError)}
                helperText={mode === "create" ? validationError : ""}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                onClick={() => setShowPassword((prev) => !prev)}
                                edge="end"
                            >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />

            {/* Confirm Password (only on create) */}
            {mode === "create" && (
                <TextField
                    fullWidth
                    type={showConfirmPassword ? "text" : "password"}
                    label="Confirm Password"
                    variant="outlined"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    sx={{ mb: 2 }}
                    error={confirmPassword && confirmPassword !== password}
                    helperText={
                        confirmPassword && confirmPassword !== password
                            ? "Passwords do not match"
                            : ""
                    }
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                                    edge="end"
                                >
                                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
            )}

            {/* External Error (e.g. wrong password on unlock) */}
            {error && (
                <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                    {error}
                </Typography>
            )}

            {/* Action Button */}
            <Button
                variant="contained"
                fullWidth
                disabled={
                    password.trim() === "" ||
                    (mode === "create" &&
                        (password !== confirmPassword || Boolean(validationError)))
                }
                onClick={handleSubmit}
                sx={{ textTransform: "none" }}
            >
                {mode === "create" ? "Create Wallet" : "Unlock Wallet"}
            </Button>

            <Typography variant="body1" mt={3} color="#1976d2" >
                Forgot password?
            </Typography>

            <Typography variant="body1" mt={2}>
                Need help? Contact
                <a target="_blank" href="https://metaplaywallet.org/support" style={{ textDecoration: "none", color: "#1976d2" }}>
                    &nbsp; Metaplay Support
                </a>
            </Typography>


        </Container>
    );
};

export default PasswordScreen;
