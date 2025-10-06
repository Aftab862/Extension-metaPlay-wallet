import React from "react";
import {
    Box,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    Avatar,
    IconButton,
    Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
const TxDetailsDialog = ({ open, onClose, tx }) => {
    if (!tx) return null;

    const statusColor =
        tx.status === "confirmed"
            ? "success.main"
            : tx.status === "failed"
                ? "error.main"
                : "warning.main";

    const handleCopy = () => {
        navigator.clipboard.writeText(tx.txHash || "");
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                sx: {
                    bgcolor: "#fff",
                    color: "#333",
                    borderRadius: 2,
                    p: 1,
                },
            }}
        >
            {/* Header */}
            <DialogTitle
                sx={{
                    p: 1,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <Typography variant="h6" fontWeight="bold">
                    Withdraw Reward
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                {/* Status */}
                <Box my={2}>
                    <Box display="flex" justifyContent="space-between">
                        <Typography color="grey.600" variant="body2">
                            status
                        </Typography>

                        <Box
                            onClick={() =>
                                window.open(`https://explorer.io/tx/${tx.txHash}`, "_blank")
                            }
                            sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
                        >

                            <Typography variant="caption" sx={{ color: "#1976d2" }}>
                                View on Explorer
                            </Typography>
                        </Box>
                    </Box>

                    {/* Links under status */}
                    <Box display="flex" justifyContent="space-between">

                        <Typography sx={{ color: statusColor }} variant="body2">
                            {tx.status}
                        </Typography>
                        <Box
                            onClick={handleCopy}
                            sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
                        >

                            <Typography variant="caption" sx={{ color: "#1976d2" }}>
                                Copy transaction ID
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* From / To */}
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                >
                    <Box display="flex" alignItems="center">
                        <Avatar sx={{ p: 1.5, mr: 1, fontSize: "1rem", width: 28, height: 28 }}>
                            {tx.from?.slice(2, 4).toUpperCase()}
                        </Avatar>
                        <Typography variant="body2">
                            {tx.from?.slice(0, 4)}...{tx.from?.slice(-3)}
                        </Typography>
                    </Box>
                    <Typography>→</Typography>
                    <Box display="flex" alignItems="center">
                        <Avatar sx={{ p: 1.5, mr: 1, fontSize: "1rem", width: 28, height: 28 }}>
                            {tx.to?.slice(2, 4).toUpperCase()}
                        </Avatar  >
                        <Typography variant="body2">
                            {tx.to?.slice(0, 4)}...{tx.to?.slice(-3)}
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Tx details */}
                <DetailRow label="Nonce" value={tx.nonce} />
                <DetailRow label="Amount" value={`${tx.amount} ${tx?.symbol}`} />
                <DetailRow label="Gas Limit" value={tx.gasLimit} />
                <DetailRow label="Gas Used" value={tx.gasUsed} />
                <DetailRow label="Gas Price" value={tx.gasPrice} />
                <DetailRow
                    label="Total"
                    value={`${Number(tx.amount) +
                        (Number(tx.gasUsed) * Number(tx.gasPrice) || 0)
                        } ${tx.symbol}`}
                />
            </DialogContent>
        </Dialog>
    );
};

const DetailRow = ({ label, value }) => (
    <Box display="flex" justifyContent="space-between" mb={1}>
        <Typography color="grey.600" variant="body2">
            {label}
        </Typography>
        <Typography fontWeight="bold" variant="body2">
            {value}
        </Typography>
    </Box>
);

export default TxDetailsDialog;
