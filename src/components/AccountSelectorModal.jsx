import React from "react";
import {
    Avatar,
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Typography
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import WalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

export default function AccountSelectorModal({
    open,
    onClose,
    wallets = [],
    selectedIndex = 0,
    onSelect,
    onAddAccount
}) {
    const selectedWallet = wallets[selectedIndex];
    const totalUSD = 0; // Can calculate from chainBalances if needed




    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            scroll="paper" // Prevents weird jumps
            disableScrollLock // Stops body shift when scrollbar disappears
        >
            <DialogTitle
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1
                }}
            >
                <Typography variant="h6">
                    {selectedWallet ? `Mnemonic ${selectedIndex + 1}` : "Accounts"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    ${totalUSD.toFixed(2)}
                </Typography>
                {/* <IconButton onClick={onClose}>
                    <CloseIcon />
                </IconButton> */}
            </DialogTitle>

            <DialogContent p={0}>
                {wallets.length > 0 ? (
                    <List>
                        {wallets.map((wallet, idx) => {
                            const evm = wallet.chains?.find((c) => c.type === "evm");
                            const shortAddr = evm?.address
                                ? `${evm.address.slice(0, 6)}...${evm.address.slice(-4)}`
                                : `Account ${idx + 1}`;
                            { console.log("wallet : ", idx, wallet) }
                            return (
                                <ListItem
                                    key={wallet.accountIndex}
                                    button
                                    selected={idx === selectedIndex}
                                    onClick={() => {
                                        onSelect(idx);
                                        onClose();
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Avatar>
                                            <AccountCircleIcon />

                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={`Account ${idx + 1}`}
                                        secondary={shortAddr}
                                    />
                                </ListItem>
                            );
                        })}

                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<AddIcon />}
                            sx={{ mt: 1, textTransform: "none" }}
                            onClick={onAddAccount}

                        >
                            Add Account
                        </Button>
                    </List>
                ) : (
                    <Typography variant="body2" color="text.secondary">
                        No accounts found. Add one to get started.
                    </Typography>
                )}

                <Divider sx={{ my: 2 }} />

                <Button fullWidth variant="contained" sx={{ mb: 1, textTransform: "none" }}>
                    Add new wallet
                </Button>
                <Button fullWidth variant="outlined" sx={{ textTransform: "none" }}>
                    Manage wallets
                </Button>
            </DialogContent>
        </Dialog>
    );
}
