import {
    Avatar,
    Box,
    Typography,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    CircularProgress,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DoneIcon from "@mui/icons-material/Done";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import ErrorIcon from "@mui/icons-material/Error";
import React, { useEffect } from "react";
import { mapColors } from "../../utils/helper";
import { useTransactionHistory } from "../Hooks/useTransactionHistory";
import { loadFromLocalStorage } from "../../utils/storage";
import { CHAIN_ID } from "../../utils/keys";
import TxDetailsModal from "./TxDetailsModal";

// --- GROUPING + META HELPERS ---

const groupByDate = (history = []) => {
    const grouped = history.reduce((groups, tx) => {
        const date = new Date(tx.timestamp).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
        if (!groups[date]) groups[date] = [];
        groups[date].push(tx);
        return groups;
    }, {});

    Object.keys(grouped).forEach((date) => {
        grouped[date].sort((a, b) => b.timestamp - a.timestamp);
    });

    return grouped;
};

const getTxMeta = (tx, nativeSymbol, userWallet) => {
    const symbol = tx.type === "token" ? "Token" : nativeSymbol;

    if (tx.from?.toLowerCase() === userWallet?.toLowerCase()) {
        return {
            icon: <ArrowUpwardIcon color="primary" />,
            label: "Sent",
            amount: `-${tx.amount} ${symbol}`,
        };
    } else if (tx.to?.toLowerCase() === userWallet?.toLowerCase()) {
        return {
            icon: <ArrowDownwardIcon color="success" />,
            label: "Received",
            amount: `+${tx.amount} ${symbol}`,
        };
    } else if (tx.type === "approve") {
        return {
            icon: <ArrowUpwardIcon color="secondary" />,
            label: "Approve",
            amount: `${tx.amount} ${symbol}`,
        };
    }
    return {
        icon: <ArrowUpwardIcon color="disabled" />,
        label: "Contract",
        amount: `${tx.amount} ${symbol}`,
    };
};

const getStatusMeta = (status) => {
    switch (status) {
        case "confirmed":
            return {
                text: "Confirmed",
                color: "success.main",
                icon: <DoneIcon fontSize="small" />,
            };
        case "pending":
            return {
                text: "Pending",
                color: "warning.main",
                icon: <HourglassEmptyIcon fontSize="small" />,
            };
        case "failed":
            return {
                text: "Failed",
                color: "error.main",
                icon: <ErrorIcon fontSize="small" />,
            };
        default:
            return { text: status, color: "text.secondary", icon: null };
    }
};

// --- MAIN COMPONENT ---
const Activity = ({ selectedChain, userWalletAddress }) => {
    const chainId = loadFromLocalStorage(CHAIN_ID);
    const [open, setOpen] = React.useState(false);
    const [transactionDetails, setTransactionDetails] = React.useState(null);
    useEffect(() => {

        return () => {
            setTransactionDetails(null);
        }
    }, []);
    // pull from local DB via hook
    const { history, loading, error, refresh } = useTransactionHistory(
        false,
        10000,
        chainId,
        userWalletAddress
    );
    console.log("Transaction Details:", transactionDetails);

    const grouped = groupByDate(history || []);

    return (
        <>
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
                                bgcolor: mapColors(selectedChain?.nativeCurrency?.symbol),
                                mr: 1,
                            }}
                        >
                            {selectedChain?.nativeCurrency?.symbol}
                        </Avatar>
                        <Typography fontWeight="bold">
                            {selectedChain?.name.split(" ")[0]}
                        </Typography>
                    </Box>

                    <IconButton onClick={refresh}>
                        <RefreshIcon />
                    </IconButton>
                </Box>

                {/* Loading / Error */}
                {loading && <CircularProgress size={24} />}
                {error && <Typography color="error">{error}</Typography>}

                {/* Empty */}
                {history.length === 0 && !loading ? (
                    <Typography variant="body2" color="text.secondary">
                        No transactions yet.
                    </Typography>
                ) : (
                    <List
                        sx={{
                            maxHeight: "30vh",
                            overflowY: "auto",
                            "&::-webkit-scrollbar": { display: "none" },
                            scrollbarWidth: "none",
                            msOverflowStyle: "none",
                        }}
                    >
                        {Object.keys(grouped).map((date) => (
                            <Box key={date} mb={2}>
                                <Typography
                                    variant="subtitle2"
                                    color="text.secondary"
                                    sx={{ mb: 1 }}
                                >
                                    {date}
                                </Typography>
                                {grouped[date].map((tx) => {
                                    const meta = getTxMeta(
                                        tx,
                                        selectedChain?.nativeCurrency?.symbol,
                                        userWalletAddress
                                    );
                                    const status = getStatusMeta(tx.status);

                                    return (
                                        <ListItem
                                            key={tx.txHash}
                                            onClick={() => {
                                                setOpen(true);
                                                setTransactionDetails(tx)
                                            }}
                                            sx={{
                                                borderRadius: 2,
                                                bgcolor: "background.paper",
                                                boxShadow: 1,
                                                mb: 1,
                                                p: 1.5,
                                            }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: "grey.100" }}>{meta.icon}</Avatar>
                                            </ListItemAvatar>

                                            <ListItemText
                                                primary={
                                                    <Box display="flex" justifyContent="space-between">
                                                        <Typography fontWeight="bold">{meta.label}</Typography>
                                                        <Typography fontWeight="bold">{meta.amount}</Typography>
                                                    </Box>
                                                }
                                                secondary={
                                                    <Box display="flex" alignItems="center" gap={0.5}>
                                                        {status.icon}
                                                        <Typography
                                                            variant="body2"
                                                            sx={{ color: status.color }}
                                                        >
                                                            {status.text}
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                    );
                                })}
                            </Box>
                        ))}
                    </List>
                )}
            </Box>

            {open && transactionDetails && <TxDetailsModal
                open={open}
                onClose={() => setOpen(false)}
                tx={transactionDetails}
                chainSymbol="DXB"
            />}
        </>

    );
};

export default Activity;

