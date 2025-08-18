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
    ListItemButton
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import WalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import MoreVertIcon from "@mui/icons-material/MoreVert";

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

    const handleMenuOpen = (event, account) => {
        setMenuAnchor(event.currentTarget);
        setMenuAccount(account);
    };

    const handleMenuClose = () => {
        setMenuAnchor(null);
        setMenuAccount(null);
    };

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
                    gap: 1
                }}
            >
                <Typography variant="h6">
                    {wallet ? `Wallets` : "Accounts"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    ${totalUSD.toFixed(2)}
                </Typography>
            </DialogTitle>

            <DialogContent sx={{ p: 0.5 }}>
                {wallet && wallet.length > 0 ? (
                    <List>
                        {wallet.map((w, wIdx) => (
                            <React.Fragment key={wIdx}>
                                <ListSubheader>{`Wallet ${wIdx + 1}`}</ListSubheader>
                                {w.accounts.map((account, aIdx) => {
                                    const address = account.chains?.[0]?.address || "No address";
                                    {
                                        console.log(
                                            "check:",
                                            "wIdx=", wIdx,
                                            "aIdx=", aIdx,
                                            "selectedWalletIndex=", selectedWalletIndex,
                                            "selectedAccountIndex=", selectedAccountIndex
                                        )
                                    }

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
                                                    primary={`Account ${aIdx + 1}`}
                                                    secondary={`${address.slice(0, 6)}...${address.slice(-4)}`}
                                                    onClick={() => {
                                                        onSelectAccount(wIdx, aIdx);
                                                        onClose();
                                                    }}
                                                />
                                                <Tooltip title="Copy address">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleCopyAddress(address)}
                                                    >
                                                        <ContentCopyIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => handleMenuOpen(e, account)}
                                                >
                                                    <MoreVertIcon />
                                                </IconButton>
                                            </ListItemButton>
                                        </ListItem>

                                    );
                                })}
                            </React.Fragment>
                        ))}

                        <Button

                            variant="outlined"
                            startIcon={<AddIcon />}
                            sx={{ mt: 1, textTransform: "none", mx: 3 }}
                            onClick={onAddAccount}
                        >
                            Add Account
                        </Button>
                    </List>
                ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                        No accounts found. Add one to get started.
                    </Typography>
                )}

                <Divider sx={{ my: 2, mx: 3 }} />

                <Button

                    variant="contained"
                    sx={{ mb: 1, textTransform: "none", mx: 3 }}
                    onClick={() => {
                        setImportModalOpen(true);
                        onClose();
                    }}
                >
                    Import Wallet
                </Button>

                <Button variant="outlined" sx={{ textTransform: "none", mx: 3 }}>
                    Manage wallets
                </Button>
            </DialogContent>

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
                        console.log("View details of", menuAccount);
                        handleMenuClose();
                    }}
                >
                    View Details
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
