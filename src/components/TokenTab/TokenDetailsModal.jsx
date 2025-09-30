import React, { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Button,
    IconButton,
    Tooltip,
    Box,
    Divider,
    List,
    ListItem,
    ListItemText,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import SendIcon from "@mui/icons-material/Send";
import CallReceivedIcon from "@mui/icons-material/CallReceived";

import SendTokenModal from "./SendTokenModal";
import ReceiveTokenModal from "./ReceiveTokenModal";

const TokenDetailsModal = ({ open, onClose, token, activity = [], onSend, onReceive }) => {
    const [copied, setCopied] = useState(false);

    if (!token) return null;

    const formattedBalance = Number(token.balance || 0).toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 6,
    });

    const handleCopy = () => {
        navigator.clipboard.writeText(token.address || "");
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <>
            {/* Main Token Details Modal */}
            <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
                {/* Header with Close */}
                <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
                    <Typography variant="h6" fontWeight="600">
                        {token.name} ({token.symbol})
                    </Typography>
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <Divider />

                <DialogContent sx={{ textAlign: "center", pt: 3 }}>
                    {/* Balance Section */}
                    <Typography variant="h4" fontWeight="700">
                        {formattedBalance} {token.symbol}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
                        Your Balance
                    </Typography>

                    {/* Token Address */}
                    {token.address && (
                        <Box display="flex" justifyContent="center" alignItems="center" gap={1} mb={2}>
                            <Typography variant="body2" color="text.secondary">
                                {token.address.slice(0, 6)}...{token.address.slice(-4)}
                            </Typography>
                            <Tooltip title={copied ? "Copied!" : "Copy"}>
                                <IconButton size="small" onClick={handleCopy}>
                                    <ContentCopyIcon fontSize="small" color={copied ? "success" : "action"} />
                                </IconButton>
                            </Tooltip>

                        </Box>
                    )}

                    {/* Action Buttons */}
                    <Box display="flex" justifyContent="center" gap={2} mb={3}>
                        <Button
                            variant="contained"
                            startIcon={<SendIcon />}
                            onClick={onSend}
                            sx={{ px: 4, borderRadius: 2 }}
                        >
                            Send
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<CallReceivedIcon />}
                            onClick={onReceive}
                            sx={{ px: 4, borderRadius: 2 }}
                        >
                            Receive
                        </Button>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    {/* Activity Section */}
                    <Typography variant="h6" fontWeight="600" gutterBottom>
                        Recent Activity
                    </Typography>
                    {activity.length === 0 ? (
                        <Typography color="text.secondary">No recent transactions</Typography>
                    ) : (
                        <List dense>
                            {activity.map((tx, idx) => (
                                <ListItem key={idx} divider>
                                    <ListItemText
                                        primary={`${tx.type} ${tx.amount} ${token.symbol}`}
                                        secondary={`${tx.date} • ${tx.txHash.slice(0, 8)}...`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </DialogContent>
            </Dialog>

        </>
    );
};

export default TokenDetailsModal;
