import {
    Avatar,
    Box,
    Typography,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Chip,
    CircularProgress,
    Tooltip,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DoneIcon from "@mui/icons-material/Done";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import ErrorIcon from "@mui/icons-material/Error";
import React, { useState } from "react";
import { mapColors } from "../utils/helper";
import { useTransactionHistory } from "./Hooks/useTransactionHistory";

const Activity = ({ selectedChain }) => {
    const { history, loading, error, refresh } = useTransactionHistory(true, 10000);
    const [copiedHash, setCopiedHash] = useState(null);

    const truncate = (str) =>
        str ? `${str.slice(0, 6)}...${str.slice(-4)}` : "";

    const handleCopy = (hash) => {
        navigator.clipboard.writeText(hash);
        setCopiedHash(hash);
        setTimeout(() => setCopiedHash(null), 2000);
    };

    const statusChip = (status) => {
        switch (status) {
            case "confirmed":
                return <Chip icon={<DoneIcon />} label="Confirmed" color="success" size="small" />;
            case "pending":
                return <Chip icon={<HourglassEmptyIcon />} label="Pending" color="warning" size="small" />;
            case "failed":
                return <Chip icon={<ErrorIcon />} label="Failed" color="error" size="small" />;
            default:
                return <Chip label={status} size="small" />;
        }
    };

    return (
        <Box p={2}>
            {/* Header */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                }}
            >
                <Box display="flex" alignItems="center">
                    <Avatar
                        sx={{
                            fontSize: "10px",
                            bgcolor: mapColors(selectedChain?.nativeSymbol),
                            mr: 1,
                        }}
                    >
                        {selectedChain?.nativeSymbol}
                    </Avatar>
                    <Typography fontWeight="bold">{selectedChain?.name.split(" ")[0]}</Typography>
                </Box>

                <IconButton onClick={refresh}>
                    <RefreshIcon />
                </IconButton>
            </Box>

            {/* Loading / Error */}
            {loading && <CircularProgress size={24} />}
            {error && <Typography color="error">{error}</Typography>}

            {/* Transaction List */}
            {history.length === 0 && !loading ? (
                <Typography variant="body2" color="text.secondary">
                    No transactions yet.
                </Typography>
            ) : (
                <List sx={{ height: "30vh", overflowY: "auto" }}>
                    {history.map((tx) => (
                        <ListItem
                            key={tx.txHash}
                            sx={{
                                mb: 1,
                                borderRadius: 2,
                                bgcolor: "background.paper",
                                boxShadow: 1,
                                p: 1.5,
                            }}
                        >
                            {/* <ListItemAvatar>
                                <Avatar
                                    sx={{
                                        bgcolor: tx.status === "failed" ? "error.main" : "primary.main",
                                    }}
                                >
                                    {tx.amount[0]}
                                </Avatar>
                            </ListItemAvatar> */}

                            <ListItemText
                                primary={
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Typography fontWeight="bold">
                                            {tx.amount} {selectedChain?.nativeSymbol}
                                        </Typography>
                                        {statusChip(tx.status)}
                                    </Box>
                                }
                                secondary={
                                    <Box display="flex" flexDirection="column" gap={0.5}>
                                        <Typography variant="body2" color="text.secondary">
                                            To: {truncate(tx.to)}
                                        </Typography>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Tooltip
                                                title={copiedHash === tx.txHash ? "Copied!" : "Copy Hash"}
                                            >
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleCopy(tx.txHash)}
                                                >
                                                    <ContentCopyIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Typography
                                                variant="caption"
                                                color="text.disabled"
                                                sx={{ wordBreak: "break-all" }}
                                            >
                                                {truncate(tx.txHash)}
                                            </Typography>
                                        </Box>
                                        <Typography variant="caption" color="text.disabled">
                                            {new Date(tx.timestamp).toLocaleString()}
                                        </Typography>
                                    </Box>
                                }
                            />
                        </ListItem>
                    ))}
                </List>
            )}
        </Box>
    );
};

export default Activity;
