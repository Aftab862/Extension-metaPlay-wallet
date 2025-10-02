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
import { mapColors } from "../utils/helper";
import { useTransactionHistory } from "./Hooks/useTransactionHistory";
import { loadFromLocalStorage } from "../utils/storage";
import { CHAIN_ID } from "../utils/keys";

// ⚠️ IMPORTANT: You must import a library for safe Big Number handling (e.g., ethers.js)
// If you are using ethers.js:
// import { utils } from 'ethers'; 
// If your environment is set up otherwise, adjust this import.

// --- START: DATA NORMALIZATION AND GROUPING HELPERS ---

// Helper function to safely format the raw transaction value (Wei) to the base unit (e.g., DXB)
const formatUnits = (value, decimals) => {
    // ⚠️ Placeholder implementation: Replace this with a safe library like ethers.js or web3.js
    // to avoid precision issues with very large numbers (like 5000000000000000000).
    try {
        // If 'ethers' utils is available (uncomment the import above)
        // return utils.formatUnits(value, decimals);
    } catch (e) {
        // Fallback (UNSAFE for large numbers, use only for testing/small amounts)
        console.warn("Using unsafe JS number conversion for transaction value.");
        return (Number(value) / Math.pow(10, decimals)).toFixed(4);
    }

    // Defaulting to the unsafe fallback if the try block fails
    return (Number(value) / Math.pow(10, decimals)).toFixed(4);
};

// Function to map raw explorer data to the format the component expects
const normalizeTxHistory = (rawHistory = [], nativeCurrencyDecimals = 18) => {
    return rawHistory.map(tx => {
        const valueInBaseUnit = formatUnits(tx.value || '0', nativeCurrencyDecimals);

        return {
            ...tx,
            // 1. Convert 'timestamp' from seconds (string) to milliseconds (number)
            timestamp: Number(tx.timestamp) * 1000,

            // 2. Rename 'value' to 'amount' and convert to readable base unit string
            amount: valueInBaseUnit,

            // 3. Ensure a status is present (infer confirmed if block number exists)
            status: tx.isError === '1' ? 'failed' : (tx.blockNumber ? 'confirmed' : 'pending'),

            // Ensure txHash exists for the ListItem key (using 'hash' from the explorer)
            txHash: tx.hash,
        };
    });
};


// ✅ Helper to group transactions by date
const groupByDate = (history = []) => {
    const grouped = history.reduce((groups, tx) => {
        // tx.timestamp is now a JavaScript timestamp (ms) after normalization
        const date = new Date(tx.timestamp).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
        });

        if (!groups[date]) groups[date] = [];
        groups[date].push(tx);
        return groups;
    }, {});

    // ✅ Sort each group by timestamp (latest first)
    Object.keys(grouped).forEach(date => {
        grouped[date].sort((a, b) => b.timestamp - a.timestamp);
    });

    return grouped;
}

const getTxMeta = (tx, symbol, userWallet) => {
    if (tx.from?.toLowerCase() === userWallet?.toLowerCase()) {
        return {
            icon: <ArrowUpwardIcon color="primary" />,
            label: "Sent",
            amount: `-${tx.amount} ${symbol}`, // tx.amount is now the formatted string
        };
    } else if (tx.to?.toLowerCase() === userWallet?.toLowerCase()) {
        return {
            icon: <ArrowDownwardIcon color="success" />,
            label: "Deposit",
            amount: `+${tx.amount} ${symbol}`, // tx.amount is now the formatted string
        };
    } else if (tx.type === "approve") { // Assuming tx.type can be set for internal/token methods
        return {
            icon: <ArrowUpwardIcon color="secondary" />,
            label: "Approve",
            amount: `${tx.amount} ${symbol}`,
        };
    } else {
        return {
            icon: <ArrowUpwardIcon color="disabled" />,
            label: "Contract",
            amount: `${tx.amount} ${symbol}`,
        };
    }
};

const getStatusMeta = (status) => {
    switch (status) {
        case "confirmed":
            return { text: "Confirmed", color: "success.main", icon: <DoneIcon fontSize="small" /> };
        case "pending":
            return { text: "Pending", color: "warning.main", icon: <HourglassEmptyIcon fontSize="small" /> };
        case "failed":
            return { text: "Failed", color: "error.main", icon: <ErrorIcon fontSize="small" /> };
        default:
            return { text: status, color: "text.secondary", icon: null };
    }
};
// --- END: DATA NORMALIZATION AND GROUPING HELPERS ---


const Activity = ({ selectedChain, userWalletAddress }) => {
    const chainId = loadFromLocalStorage(CHAIN_ID);

    // Extract the explorer URL from selectedChain, which will be passed to the hook
    // (Assuming explorerUrl in selectedChain maps to explorerApiUrl in the hook's payload)
    const explorerApiUrl = selectedChain?.explorerUrl;
    const rpcUrl = selectedChain?.rpcUrl; // Still passed but ignored by the backend for history

    // useTransactionHistory returns the raw transaction array from the explorer
    const { history, loading, error, refresh } = useTransactionHistory(
        false,
        10000,
        chainId,
        userWalletAddress,
        explorerApiUrl, // Now correctly passing the explorer URL
        rpcUrl
    );

    // Get native currency decimals, defaulting to 18 for EVM chains
    const decimals = selectedChain?.nativeCurrency?.decimals || 18;

    // 1. Normalize the raw history data (convert Wei, timestamp, and set amount/status fields)
    const normalizedHistory = normalizeTxHistory(history || [], decimals);

    // 2. Group the normalized data by date
    const grouped = groupByDate(normalizedHistory);

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
            {normalizedHistory.length === 0 && !loading ? (
                <Typography variant="body2" color="text.secondary">
                    No transactions yet.
                </Typography>
            ) : (
                <List sx={{
                    maxHeight: "30vh",
                    overflowY: "auto",
                    "&::-webkit-scrollbar": {
                        display: "none",
                    },
                    scrollbarWidth: "none", // Firefox
                    msOverflowStyle: "none", // IE/Edge
                }}>
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
                                const meta = getTxMeta(tx, selectedChain?.nativeCurrency?.symbol, userWalletAddress);
                                const status = getStatusMeta(tx.status);
                                return (
                                    <ListItem
                                        // Using tx.hash which is mapped to txHash in normalization
                                        key={tx.hash}
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
    );
};

export default Activity;
