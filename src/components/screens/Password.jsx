// src/screens/PasswordScreen.jsx
import React, { useState } from "react";
import { Button, TextField, Typography, Container } from "@mui/material";

const PasswordScreen = ({ onPasswordSubmit, error, mode = "enter" }) => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSubmit = () => {
        if (mode === "create" && password !== confirmPassword) return;
        onPasswordSubmit(password);
    };

    return (
        <Container sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "93vh",
        }}>
            <Typography variant="h6" align="center" gutterBottom>
                {mode === "create" ? "Create Password" : "Enter Your Password"}
            </Typography>

            <TextField
                fullWidth
                type="password"
                label="Password"
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 2 }}
            />

            {mode === "create" && (
                <TextField
                    fullWidth
                    type="password"
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
                />
            )}

            {error && (
                <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                    {error}
                </Typography>
            )}

            <Button
                variant="contained"
                fullWidth
                disabled={
                    password.trim() === "" ||
                    (mode === "create" && password !== confirmPassword)
                }
                onClick={handleSubmit}
            >
                {mode === "create" ? "Create Wallet" : "Unlock Wallet"}
            </Button>
        </Container>
    );
};

export default PasswordScreen;
