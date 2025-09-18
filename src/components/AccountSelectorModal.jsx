import React, { useState } from "react";
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
    ListSubheader,
    Typography,
    Menu,
    MenuItem,
    Tooltip,
    ListItemButton,
    DialogActions
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import WalletIcon from "@mui/icons-material/AccountBalanceWallet";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Close } from "@mui/icons-material";

export default function AccountSelectorModal({
    open,
    onClose,
    wallet,
    selectedWalletIndex = 0,
    selectedAccountIndex = 0,
    onSelectAccount,
    onAddAccount,
    setImportModalOpen
}) {
    const totalUSD = 0; // placeholder
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [menuAccount, setMenuAccount] = useState(null);

    const handleCopyAddress = (address) => {
        navigator.clipboard.writeText(address);
    };

    const currentWallet = wallet[selectedWalletIndex];
    const isAllow = currentWallet.walletType === "seed" || currentWallet.walletType === "imported_seed";


    const handleMenuOpen = (event, account, wId) => {
        setMenuAnchor(event.currentTarget);
        setMenuAccount({ ...account, wId });
    };

    const handleMenuClose = () => {
        setMenuAnchor(null);
        setMenuAccount(null);
    };

    const handleEditAccount = (selectedAccount) => {

        console.log("wallet account :", wallet)
        console.log("Edit Account index :", selectedAccount?.accountIndex)
        console.log("Edit Wallet index :", selectedAccount?.wId)
        const actualWallet = wallet[selectedAccount?.wId]
        const actualAccount = actualWallet?.accounts[selectedAccount?.accountIndex];
        console.log("Actuall editable Wallet", actualWallet)
        console.log("Actuall editable Account", actualAccount)
    }



    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            scroll="paper"
            disableScrollLock
        >
            <DialogTitle
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                    padding: "18px 18px 12px  18px"
                }}
            >
                <Typography variant="h6" >
                    {wallet ? `Wallets` : "Accounts"}
                </Typography>
                <Close onClick={() => onClose()} />
            </DialogTitle>

            <DialogContent sx={{ p: 0.5 }}>

                {wallet && wallet.length > 0 ? (
                    <List>
                        {wallet.map((w, wIdx) => (
                            <React.Fragment key={wIdx}>
                                <Divider sx={{ marginBottom: "15px" }} />
                                <ListSubheader sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                                    <Typography sx={{ fontSize: "14px" }}>  {`Wallet ${wIdx + 1}`}</Typography>
                                    <Typography sx={{ fontSize: "14px" }}>  {w?.walletType}  </Typography>
                                </ListSubheader>
                                {w.accounts.map((account, aIdx) => {
                                    const address = account.chains?.[0]?.address || "No address";
                                    return (
                                        <ListItem
                                            key={aIdx}
                                            disablePadding
                                            sx={{ mb: 0.5 }}
                                        >
                                            <ListItemButton
                                                selected={wIdx === selectedWalletIndex && aIdx === selectedAccountIndex}
                                                sx={{
                                                    borderRadius: 2,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    "&.Mui-selected": {
                                                        margin: "0 10px",
                                                        backgroundColor: "primary.main",
                                                        color: "white",
                                                        "& .MuiListItemText-primary": {
                                                            fontWeight: "bold",
                                                            color: "white",
                                                        },
                                                        "& .MuiListItemText-secondary": {
                                                            color: "white",
                                                        },
                                                        "& .MuiSvgIcon-root": {
                                                            color: "white",
                                                        },
                                                        "&:hover": {
                                                            backgroundColor: "primary.main",
                                                        }
                                                    },
                                                    "&:hover": {
                                                        backgroundColor: "action.hover",
                                                    }
                                                }}
                                            >
                                                <ListItemAvatar>
                                                    <Avatar>
                                                        <WalletIcon />
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={account?.accountName ? account?.accountName : `Account ${aIdx + 1}`}
                                                    secondary={`${address.slice(0, 6)}...${address.slice(-4)}`}
                                                    onClick={() => {
                                                        onSelectAccount(wIdx, aIdx);
                                                        onClose();
                                                    }}
                                                />

                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => handleMenuOpen(e, account, wIdx)}
                                                >
                                                    <MoreVertIcon />
                                                </IconButton>
                                            </ListItemButton>
                                        </ListItem>

                                    );
                                })}
                            </React.Fragment>
                        ))}


                    </List>
                ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                        No accounts found. Add one to get started.
                    </Typography>
                )}

                <Divider sx={{ my: 2, mx: 3 }} />


                {/* 
                <Button variant="outlined" sx={{ textTransform: "none", mx: 3 }}>
                    Manage wallets
                </Button> */}
            </DialogContent>


            <DialogActions>

                <Box display="flex" justifyContent="space-between" gap={2} paddingY={1}>
                    <Button

                        variant="outlined"
                        disabled={!isAllow}
                        startIcon={<AddIcon />}
                        sx={{ cursor: isAllow ? "pointer" : "not-allowed", textTransform: "none" }}
                        onClick={isAllow ? onAddAccount : null}
                    >
                        Add Account
                    </Button>

                    <Button

                        variant="contained"
                        sx={{ textTransform: "none", }}
                        onClick={() => {
                            setImportModalOpen(true);
                            onClose();
                        }}
                    >
                        Import Wallet
                    </Button>
                </Box>
            </DialogActions>

            {/* Account Menu */}
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={handleMenuClose}
            >
                <MenuItem
                    onClick={() => {
                        handleCopyAddress(menuAccount?.chains?.[0]?.address || "");
                        handleMenuClose();
                    }}
                >
                    Copy Address
                </MenuItem>
                <MenuItem
                    onClick={() => {

                        handleEditAccount(menuAccount)
                    }}
                >
                    Edit Account
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        console.log("Remove account", menuAccount);
                        handleMenuClose();
                    }}
                >
                    Remove Account
                </MenuItem>
            </Menu>
        </Dialog>
    );
}


