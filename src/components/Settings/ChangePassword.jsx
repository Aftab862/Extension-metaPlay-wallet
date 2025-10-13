import React, { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    CircularProgress,
    Alert,
    Box,
    IconButton,
    InputAdornment,
} from "@mui/material";
import { Close, Visibility, VisibilityOff } from "@mui/icons-material";
import { SESSION_PASSWORD_KEY } from "../../utils/keys";
import { saveLoginTime } from "../../utils/sessionUtils";

export default function ChangePasswordDialog({ open, onClose, }) {
    const [form, setForm] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [show, setShow] = useState({
        old: false,
        new: false,
        confirm: false,
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (field) => (e) => {
        setForm({ ...form, [field]: e.target.value });
        setError("");
    };

    const handleToggleVisibility = (field) => {
        setShow({ ...show, [field]: !show[field] });
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit();
        }
    };

    const validatePassword = (password) => {
        // Example rules: 8+ chars, one uppercase, one number
        const strongRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        return strongRegex.test(password);
    };



    const handleSubmit = async () => {
        const { oldPassword, newPassword, confirmPassword } = form;

        if (!oldPassword || !newPassword || !confirmPassword) {
            setError("All fields are required.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("New password and confirmation do not match.");
            return;
        }

        if (!validatePassword(newPassword)) {
            setError(
                "Password must be at least 8 characters, include one uppercase letter and one number."
            );
            return;
        }

        setSuccess(false);
        setError("");
        setLoading(true);

        try {
            // Simulate async password change request
            await new Promise((resolve) => setTimeout(resolve, 1500));

            const sessionPassword = localStorage.getItem(SESSION_PASSWORD_KEY);
            if (!sessionPassword) {
                throw new Error("Something went wrong.");
            }
            const decoded = atob(sessionPassword);

            // Pretend to verify old password
            if (oldPassword !== decoded) {
                throw new Error("Incorrect old password.");
            }

            localStorage.setItem(SESSION_PASSWORD_KEY, btoa(newPassword));
            saveLoginTime();

            setSuccess(true);
            setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });

            // === Show system notification ===
            if (typeof chrome !== "undefined" && chrome.notifications) {
                chrome.notifications.create({
                    type: "basic",
                    iconUrl: "icon.png", // path inside your extension
                    title: "Password Updated",
                    message: "Your password has been changed successfully."
                });
            } else if ("Notification" in window) {
                // fallback for contexts without chrome.notifications
                if (Notification.permission === "granted") {
                    new Notification("Password Updated", {
                        body: "Your password has been changed successfully."
                    });
                } else if (Notification.permission !== "denied") {
                    Notification.requestPermission().then((perm) => {
                        if (perm === "granted") {
                            new Notification("Password Updated", {
                                body: "Your password has been changed successfully."
                            });
                        }
                    });
                }
            }

            // Auto-close after short delay
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 1500);
        } catch (err) {
            setError(err.message || "Failed to change password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px",
                }}
            >
                <Typography variant="h6">Change Password</Typography>
                <IconButton onClick={onClose} size="small">
                    <Close sx={{ fontSize: 20 }} />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers onKeyDown={handleKeyPress}>
                <Typography variant="body2" color="text.secondary" mb={2}>
                    Enter your current password and choose a new one that meets the security requirements.
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        Password changed successfully!
                    </Alert>
                )}

                <Box display="flex" flexDirection="column" gap={2}>
                    <TextField
                        label="Old Password"
                        type={show.old ? "text" : "password"}
                        value={form.oldPassword}
                        onChange={handleChange("oldPassword")}
                        disabled={loading}
                        size="small"
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => handleToggleVisibility("old")}
                                        edge="end"
                                        size="small"
                                    >
                                        {show.old ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <TextField
                        label="New Password"
                        type={show.new ? "text" : "password"}
                        value={form.newPassword}
                        onChange={handleChange("newPassword")}
                        disabled={loading}
                        size="small"
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => handleToggleVisibility("new")}
                                        edge="end"
                                        size="small"
                                    >
                                        {show.new ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <TextField
                        label="Confirm Password"
                        type={show.confirm ? "text" : "password"}
                        value={form.confirmPassword}
                        onChange={handleChange("confirmPassword")}
                        disabled={loading}
                        size="small"
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => handleToggleVisibility("confirm")}
                                        edge="end"
                                        size="small"
                                    >
                                        {show.confirm ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} color="inherit" disabled={loading}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="primary"
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={20} color="inherit" /> : "Save"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
