// src/screens/PasswordScreen.jsx
import React, { useState } from "react";
import { Button, TextField, Typography, Container, Box, Avatar } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";

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


            <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
                <Avatar sx={{ bgcolor: "#1976d2", width: 56, height: 56 }}>
                    <LockIcon fontSize="large" />
                </Avatar>
                <Typography variant="h6" mt={1}>
                    {mode === "create" ? "Create Password" : "Unlock Your Wallet"}
                </Typography>
            </Box>

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
                sx={{ textTransform: "none" }}
            >
                {mode === "create" ? "Create Wallet" : "Unlock Wallet"}
            </Button>
        </Container>
    );
};

export default PasswordScreen;
