// src/screens/WalletDashboard.jsx
import React from "react";
import { Typography, Button } from "@mui/material";
import AccountSwitcher from "../AccountSwitcher";
import WalletInfo from "../WalletInfo";
import Loader from "../Loader";

const WalletDashboard = ({
    wallets,
    selectedIndex,
    onSelect,
    onAddAccount,
    loading,
    onReEncrypt,
}) => {
    if (loading) return <Loader message="Adding account..." />;

    return (
        <>
            <Typography variant="h6" align="center" gutterBottom>
                MetaPlay Wallet
            </Typography>

            <Typography variant="body2" align="center" color="text.secondary" gutterBottom>
                Manage Multiple Accounts Securely
            </Typography>

            <AccountSwitcher accounts={wallets} selectedIndex={selectedIndex} onSelect={onSelect} />
            <WalletInfo wallet={wallets[selectedIndex]} />

            <Button variant="contained" fullWidth sx={{ mt: 2, textTransform: "none" }} onClick={onAddAccount}>
                Add New Account
            </Button>

            {/* <Button variant="outlined" fullWidth sx={{ mt: 1 }} onClick={onReEncrypt}>
                Save Encrypted Mnemonic
            </Button> */}
        </>
    );
};

export default WalletDashboard;
