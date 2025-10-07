import React, { useEffect, useState, useCallback } from "react";
import { Avatar, Box, Grid, Typography, CircularProgress, alpha, Tooltip, IconButton } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import RefreshIcon from "@mui/icons-material/Refresh";
import ReceiveModal from "./Receive";
import SendModal from "./Send";
import {
    bgRequest,
    findAccountByAddress,
    findAccountNameOrIndex,
} from "../../utils/helper";

const Transaction = ({ userWalletAddress, wallet, selectedChain, userBalance, setBalance, AccountTitle, Account }) => {

    const [openReceive, setOpenReceive] = useState(false);
    const [openSend, setOpenSend] = useState(false);
    const [error, setError] = useState(null);
    const [spinning, setSpinning] = useState(false);

    const fetchBalance = useCallback(async () => {
        if (!userWalletAddress || !selectedChain?.rpcUrl) return;
        setError(null);
        try {
            const res = await bgRequest({
                type: "GET_BALANCE",
                payload: {
                    address: userWalletAddress.trim(),
                    rpcUrl: selectedChain.rpcUrl,
                },
            });

            if (res.success) {
                setBalance(Number(res.balance).toFixed(4));
            } else {
                setError(res.error || "Failed to fetch balance");
            }
        } catch (err) {
            setError(err.message || "Balance check failed");
        } finally {

        }
    }, [userWalletAddress, selectedChain?.rpcUrl]);

    useEffect(() => {
        if (userWalletAddress && selectedChain?.rpcUrl) {
            handleRefresh();
        }
    }, [userWalletAddress, selectedChain?.rpcUrl]);


    const handleRefresh = async () => {
        if (spinning) return;
        setSpinning(true);
        try {
            await fetchBalance();
        } finally {
            setTimeout(() => setSpinning(false), 700);
        }
    };

    const actionItems = [
        { label: "Send", icon: <ArrowUpwardIcon />, onClick: () => setOpenSend(true) },
        { label: "Receive", icon: <ArrowDownwardIcon />, onClick: () => setOpenReceive(true) },
    ];

    return (
        <>
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                my={1}
                sx={{
                    transition: "background 0.3s ease",
                }}
            >
                {/* Balance value and refresh */}
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    gap={1}
                    minHeight={50}
                >

                    <Typography variant="h5" color="text.primary" fontWeight={600}>
                        {userBalance ? `${userBalance} ${selectedChain?.nativeCurrency.symbol}` : "$0.00"}
                    </Typography>

                    <Tooltip title="Refresh balance">
                        <IconButton
                            onClick={handleRefresh}
                            size="small"
                            sx={{
                                color: "text.secondary",
                                "&:hover": { color: "primary.main" },
                                transition: "transform 0.3s ease",
                                "&.spin": {
                                    animation: "spin 0.7s linear",
                                },
                            }}
                            className={spinning ? "spin" : ""}
                        >
                            <RefreshIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>


                </Box>

                <Typography variant="subtitle2" color="text.secondary">
                    Total Balance
                </Typography>

                {error && (
                    <Typography variant="caption" color="error" mt={0.5}>
                        {error}
                    </Typography>
                )}

                {/* Local keyframes */}
                <style>
                    {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
                </style>
            </Box>

            <Grid
                p={1}
                container
                spacing={2}
                textAlign="center"
                justifyContent="space-evenly"
            >
                {actionItems.map(({ label, icon, onClick }) => (
                    <Grid
                        key={label}
                        item
                        xs={3}
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="space-evenly"
                        onClick={onClick}
                        sx={{ cursor: "pointer" }}
                    >
                        <Avatar sx={{ bgcolor: "#1976d2" }}>{icon}</Avatar>
                        <Typography>{label}</Typography>
                    </Grid>
                ))}
            </Grid>

            {/* Receive Modal */}
            <ReceiveModal
                open={openReceive}
                onClose={() => setOpenReceive(false)}
                address={userWalletAddress}
                wallet={wallet}
                AccountTitile={AccountTitle}
            />

            {/* Send Modal */}
            <SendModal
                open={openSend}
                onClose={() => setOpenSend(false)}
                address={userWalletAddress}
                AccountTitile={AccountTitle}
                chain={selectedChain}
                CurrentAccount={Account}
            />
        </>
    );
};

export default Transaction;
