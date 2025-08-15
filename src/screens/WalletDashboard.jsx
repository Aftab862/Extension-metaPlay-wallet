import React, { useState, useMemo } from "react";
import {
    Box,
    Typography,
    Grid,
    Avatar,
    IconButton
} from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import MenuIcon from "@mui/icons-material/Menu";

import { EVM_CHAINS } from "../config/chain";
import ChainSelectorModal from "../components/ChainSelectorModal";
import AccountSelectorModal from "../components/AccountSelectorModal";
import { mapColors } from "../utils/helper";
import Loader from "../components/Loader";

const fmt = (value, decimals = 4) => {
    const num = Number(value);
    return isFinite(num) ? num.toFixed(decimals) : "0.0000";
};

const actionItems = [
    { label: "Send", icon: <ArrowUpwardIcon /> },
    { label: "Receive", icon: <ArrowDownwardIcon /> },
    { label: "Buy", icon: <ShoppingCartIcon /> },
    { label: "Swap", icon: <SwapHorizIcon /> },
];

const WalletDashboard = ({
    wallets = [],
    selectedIndex = 0,
    onSelect,
    onAddAccount,
    loading = false
}) => {
    const [chainModalOpen, setChainModalOpen] = useState(false);
    const [accountModalOpen, setAccountModalOpen] = useState(false);
    const [selectedChain, setSelectedChain] = useState(EVM_CHAINS[0]);
    const [chainBalances, setChainBalances] = useState({
        native: "0",
        tokens: [],
        loading: false
    });

    const selectedWallet = useMemo(
        () => wallets[selectedIndex] || null,
        [wallets, selectedIndex]
    );

    const evmAddress = useMemo(
        () => selectedWallet?.chains?.find(c => c.type === "evm")?.address || null,
        [selectedWallet]
    );

    // Loader states
    if (loading) return <Loader message="Adding account..." />;
    if (!selectedWallet) {
        console.warn("WalletDashboard: No wallet found for index", selectedIndex);
        return <Loader message="Loading wallet..." />;
    }

    return (
        <Box>
            {/* Header */}
            <Box display="flex" alignItems="center" justifyContent="space-between" p={1} bgcolor="#1976d2">
                {/* Account Info */}
                <Box
                    p={1}
                    display="flex"
                    alignItems="flex-start"
                    sx={{ cursor: "pointer" }}
                    onClick={() => setAccountModalOpen(true)}
                >
                    <Box>
                        <Typography variant="body2" color="white">
                            Mnemonic {selectedIndex + 1}
                        </Typography>
                        <Typography variant="caption" color="white">
                            {evmAddress ? `Account ${selectedIndex + 1}` : "No account"}
                        </Typography>
                    </Box>
                    <Avatar sx={{ width: 28, height: 18, ml: 0.4, background: "#1976d2" }}>
                        {accountModalOpen ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
                    </Avatar>
                </Box>

                {/* Menu */}
                <Box display="flex" gap={1}>
                    <IconButton sx={{ color: "white" }} onClick={() => setChainModalOpen(true)}>
                        <LanguageIcon />
                    </IconButton>
                    <IconButton sx={{ color: "white" }}>
                        <MenuIcon />
                    </IconButton>
                </Box>
            </Box>

            {/* Balances */}
            <Box display="flex" flexDirection="column" alignItems="center" my={2}>
                <Typography variant="h5" color="text.secondary">$0.00</Typography>
                <Typography variant="subtitle2" color="text.secondary">Total Balance</Typography>
            </Box>

            {/* Actions */}
            <Grid p={1} container spacing={2} textAlign="center">
                {actionItems.map((item, index) => (
                    <Grid key={index} item xs={3}
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                    >
                        <Avatar sx={{ bgcolor: "#1976d2" }}>{item.icon}</Avatar>
                        <Typography>{item.label}</Typography>
                    </Grid>
                ))}
            </Grid>

            {/* Assets */}
            <Box p={1}>
                <Box display="flex" p={1} alignItems="center" sx={{ mt: 5 }}>
                    <Avatar sx={{ fontSize: "10px", bgcolor: mapColors(selectedChain.nativeSymbol), mr: 2 }}>
                        {selectedChain.nativeSymbol}
                    </Avatar>
                    <Box flexGrow={1}>
                        <Typography fontWeight="bold">{selectedChain.name}</Typography>
                        <Typography fontSize="0.8rem" color="gray">
                            {evmAddress ? `${evmAddress.slice(0, 6)}...${evmAddress.slice(-4)}` : "No address"}
                        </Typography>
                    </Box>
                    <Box textAlign="right">
                        <Typography fontWeight="bold">
                            {fmt(chainBalances.native)} {selectedChain.nativeSymbol}
                        </Typography>
                        <Typography fontSize="0.8rem" color="gray">Native</Typography>
                    </Box>
                </Box>

                <Box mt={0.5} p={2}>
                    {chainBalances.loading ? (
                        <Loader message="Loading tokens..." />
                    ) : chainBalances.tokens.length > 0 ? (
                        chainBalances.tokens.map((t) => (
                            <Box
                                key={t.address}
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                py={1}
                                borderBottom="1px solid #eee"
                            >
                                <Box>
                                    <Typography fontWeight="bold">{t.symbol}</Typography>
                                    <Typography fontSize="0.8rem" color="gray">
                                        {t.address.slice(0, 6)}...{t.address.slice(-4)}
                                    </Typography>
                                </Box>
                                <Box textAlign="right">
                                    <Typography>{fmt(t.balance)}</Typography>
                                </Box>
                            </Box>
                        ))
                    ) : (
                        <Typography color="text.secondary">No tokens found</Typography>
                    )}
                </Box>
            </Box>

            {/* Modals */}
            <ChainSelectorModal
                open={chainModalOpen}
                onClose={() => setChainModalOpen(false)}
                chains={EVM_CHAINS}
                selectedChain={selectedChain}
                onSelect={setSelectedChain}
            />
            <AccountSelectorModal
                open={accountModalOpen}
                onClose={() => setAccountModalOpen(false)}
                wallets={wallets}
                selectedIndex={selectedIndex}
                onSelect={onSelect}
                onAddAccount={onAddAccount}
            />
        </Box>
    );
};

export default WalletDashboard;
