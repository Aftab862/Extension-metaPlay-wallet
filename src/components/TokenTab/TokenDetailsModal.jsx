import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box
} from "@mui/material";

const TokenDetailsModal = ({ open, onClose, token, onSend, onReceive }) => {
    if (!token) return null;

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>
                {token.name} ({token.symbol})
            </DialogTitle>
            <DialogContent>
                <Typography variant="h6" align="center" gutterBottom>
                    Balance: {token.balance} {token.symbol}
                </Typography>

                {/* Token Address */}
                {token.address && (
                    <Typography variant="body2" color="text.secondary" align="center">
                        {token.address.slice(0, 6)}...{token.address.slice(-4)}
                    </Typography>
                )}
            </DialogContent>
            <DialogActions sx={{ justifyContent: "space-around", pb: 2 }}>
                <Button variant="contained" color="primary" onClick={onSend}>
                    Send
                </Button>
                <Button variant="outlined" onClick={onReceive}>
                    Receive
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default TokenDetailsModal;
