// src/screens/WalletDashboard.jsx
import React from "react";
import {
    Box,
    Typography,
    Button,
    MenuItem,
    Select,
    Grid,
    Paper,
    Avatar,
} from "@mui/material";
import Loader from "../components/Loader";
import AddIcon from "@mui/icons-material/Add";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

const chainLogos = {
    ethereum: { symbol: "ETH", label: "Ethereum", color: "#3c3c3d" },
    solana: { symbol: "SOL", label: "Solana", color: "#8247e5" },
};

const WalletDashboard = ({
    wallets,
    selectedIndex,
    onSelect,
    onAddAccount,
    loading,
}) => {
    if (loading) return <Loader message="Adding account..." />;

    const selectedWallet = wallets[selectedIndex];
    const chains = selectedWallet?.chains || [];
    console.log("selectedWallet", selectedWallet)
    console.log("chains", chains)



    const actionItems = [
        { label: "Send", icon: <ArrowUpwardIcon /> },
        { label: "Receive", icon: <ArrowUpwardIcon /> },
        { label: "Buy", icon: <ShoppingCartIcon /> },
        { label: "Swap", icon: <SwapHorizIcon /> },
    ];

    function mapColors(symbol) {

        console.log("symbol :", symbol)
        switch (symbol) {
            case "EVM": // EVM
                return '#3C3C3D'; // blue
            case "SOL": // Solana
                return '#00FFA3';
            case 3: // Bitcoin
                return '#f7931a'; // orange
            default:
                return '#9e9e9e'; // grey (fallback)
        }
    }

    function capitalizeFirstLetter(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }


    return (
        <Box >
            {/* Header */}
            <Box display="flex" p={3} bgcolor="#1976d2" flexDirection="column" justifyContent="space-between" alignItems="center" mb={3}>
                <Box mb={2}>
                    <Select
                        value={selectedIndex}
                        onChange={(e) => onSelect(Number(e.target.value))}
                        sx={{
                            backgroundColor: "white",
                            color: "black",
                            borderRadius: "8px",
                            minWidth: 160,
                            fontWeight: "normal",
                        }}
                    >
                        {wallets.map((wallet, idx) => {
                            const evm = wallet.chains.find(c => c.type === "evm");
                            const shortAddr = evm?.address
                                ? `${evm.address.slice(0, 6)}...${evm.address.slice(-4)}`
                                : `Account ${idx + 1}`;
                            return (
                                <MenuItem key={idx} value={idx}>
                                    Account {idx + 1} ({shortAddr})
                                </MenuItem>
                            );
                        })}
                        <MenuItem disabled divider />
                        <MenuItem onClick={onAddAccount}>
                            <AddIcon sx={{ mr: 1 }} /> Add Account
                        </MenuItem>
                    </Select>
                </Box>
                <Box>
                    {/* <Typography variant="h6" fontWeight="bold">Wallets</Typography> */}
                    <Typography textAlign="center" variant="h5" color="lightgray" fontWeight="bold">$0.00</Typography>
                    <Typography textAlign="center" variant="subtitle2" color="lightgray">Total Balance</Typography>
                </Box>
            </Box>

            {/* Action Buttons */}

            <Grid p={1} container spacing={2} textAlign="center">
                {actionItems.map((item, index) => (
                    <Grid
                        key={index}
                        item
                        xs={3}
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                    >
                        <Avatar sx={{ bgcolor: "#1976d2" }}>{item.icon}</Avatar>
                        <Typography>{item.label}</Typography>
                    </Grid>
                ))}
            </Grid>
            {/* Assets Section */}
            <Box p={3}>
                <Typography variant="subtitle1" gutterBottom>
                    Assets
                </Typography>
                {chains.map((chain, idx) => {
                    const info = chainLogos[chain.type.toLowerCase()] || {
                        symbol: chain.type.slice(0, 3).toUpperCase(),
                        label: capitalizeFirstLetter(chain?.type),

                    };
                    return (
                        <Paper
                            key={idx}
                            sx={{
                                p: 2,
                                mb: 1,
                                display: "flex",
                                alignItems: "center",
                                backgroundColor: "lightgray",
                                borderRadius: 3,

                            }}
                        >
                            <Avatar sx={{ bgcolor: mapColors(info.symbol), mr: 2, fontSize: "10px" }}>
                                {info.symbol}
                            </Avatar>

                            <Box flexGrow={1}>
                                <Typography fontWeight="bold">{info.label}</Typography>
                                <Typography fontSize="0.8rem" color="gray">
                                    {chain.address.slice(0, 6)}...{chain.address.slice(-4)}
                                </Typography>
                            </Box>
                            <Box textAlign="right">
                                <Typography fontWeight="bold">$0.00</Typography>
                                <Typography fontSize="0.8rem" color="gray">0.0000 {info.symbol}</Typography>
                            </Box>
                        </Paper>
                    );
                })}
            </Box>
        </Box>
    );
};

export default WalletDashboard;
