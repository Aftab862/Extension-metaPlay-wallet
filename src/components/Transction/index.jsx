import React, { useEffect, useState, useCallback } from "react";
import { Avatar, Box, Grid, Typography, CircularProgress } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ReceiveModal from "./Receive";
import SendModal from "./Send";
import {
    bgRequest,
    findAccountByAddress,
    findAccountNameOrIndex,
} from "../../utils/helper";

const Transaction = ({ userWalletAddress, wallet, selectedChain, userBalance, setBalance }) => {
    const [loading, setLoading] = useState(false);
    const [openReceive, setOpenReceive] = useState(false);
    const [openSend, setOpenSend] = useState(false);
    const [error, setError] = useState(null);

    const AccountTitle = findAccountNameOrIndex(wallet, userWalletAddress);
    const Account = findAccountByAddress(wallet, userWalletAddress);

    const fetchBalance = useCallback(async () => {
        if (!userWalletAddress || !selectedChain?.rpcUrl) return;

        setLoading(true);
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
            setLoading(false);
        }
    }, [userWalletAddress, selectedChain?.rpcUrl]);

    useEffect(() => {
        fetchBalance();
    }, [fetchBalance]);

    const actionItems = [
        { label: "Send", icon: <ArrowUpwardIcon />, onClick: () => setOpenSend(true) },
        { label: "Receive", icon: <ArrowDownwardIcon />, onClick: () => setOpenReceive(true) },
    ];



    return (
        <>
            <Box display="flex" flexDirection="column" alignItems="center" my={2}>

                <Box display="flex" alignItems="center" justifyContent="center" minHeight={40}>
                    {loading ? (
                        <CircularProgress size={20} thickness={5} />
                    ) : (
                        <Typography variant="h5" color="text.secondary">
                            {userBalance ?? "$0.00"}
                        </Typography>
                    )}
                </Box>

                <Typography variant="subtitle2" color="text.secondary">
                    Total Balance
                </Typography>
                {error && (
                    <Typography variant="caption" color="error">
                        {error}
                    </Typography>
                )}
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
