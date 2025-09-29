import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Typography,
    Box
} from "@mui/material";
import { QRCodeCanvas } from "qrcode.react";

const ReceiveTokenModal = ({ open, onClose, userWallet }) => {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>Receive Tokens</DialogTitle>
            <DialogContent>
                <Typography align="center" gutterBottom>
                    {userWallet}
                </Typography>
                <Box display="flex" justifyContent="center" mt={2}>
                    <QRCodeCanvas value={userWallet} size={160} />
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default ReceiveTokenModal;
