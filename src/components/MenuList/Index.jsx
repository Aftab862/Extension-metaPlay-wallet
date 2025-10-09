import React, { useEffect } from "react";
import {
    Dialog,
    DialogContent,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
    DialogTitle,
    Typography,
    IconButton,
} from "@mui/material";

import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import SecurityIcon from "@mui/icons-material/Security";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import LanIcon from "@mui/icons-material/Lan";
import ExtensionIcon from "@mui/icons-material/Extension";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import SettingsIcon from "@mui/icons-material/Settings";
import LockIcon from "@mui/icons-material/Lock";
import { Close } from "@mui/icons-material";

const MenuListModal = ({ open, onClose, onMenuClick, setCurrentAccount, wallet, selectedAccountIndex, selectedWalletIndex }) => {
    useEffect(() => {


        let currentWallet = wallet[selectedWalletIndex];
        let currentAccount = currentWallet?.accounts[selectedAccountIndex];
        let modifieddata = { ...currentAccount, wId: selectedWalletIndex }
        setCurrentAccount(modifieddata)


    }, [])

    const handleClick = (action) => {
        if (onMenuClick) onMenuClick(action);
        onClose(); // optional: close modal after click
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            disableScrollLock
            fullWidth maxWidth="xs"
            PaperProps={{
                sx: {
                    bgcolor: "#fff",
                    color: "black",
                    borderRadius: "12px",
                    // minWidth: 280,
                },
            }}
        >
            <DialogTitle
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px 16px 0 16px",
                }}
            >
                <Typography variant="h6">Menu</Typography>
                <IconButton onClick={onClose} size="small">
                    <Close sx={{ fontSize: 20 }} />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 0 }}>
                <List>
                    <ListItemButton onClick={() => handleClick("account-details")}>
                        <ListItemIcon>
                            <AccountCircleIcon sx={{ color: "#1976d2" }} />
                        </ListItemIcon>
                        <ListItemText primary="Account details" />
                    </ListItemButton>

                    <ListItemButton onClick={() => handleClick("explorer")}>
                        <ListItemIcon>
                            <OpenInNewIcon sx={{ color: "#1976d2" }} />
                        </ListItemIcon>
                        <ListItemText primary="View on explorer" />
                    </ListItemButton>

                    <Divider sx={{ bgcolor: "rgba(255,255,255,0.1)" }} />

                    <ListItemButton onClick={() => handleClick("expand")}>
                        <ListItemIcon>
                            <OpenInFullIcon sx={{ color: "#1976d2" }} />
                        </ListItemIcon>
                        <ListItemText primary="Expand view" />
                    </ListItemButton>

                    <ListItemButton onClick={() => handleClick("networks")}>
                        <ListItemIcon>
                            <LanIcon sx={{ color: "#1976d2" }} />
                        </ListItemIcon>
                        <ListItemText primary="Networks" />
                    </ListItemButton>

                    {/* External link stays as is */}
                    <ListItemButton
                        component="a"
                        href="https://metaplaywallet.org/support"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <ListItemIcon>
                            <HelpOutlineIcon sx={{ color: "#1976d2" }} />
                        </ListItemIcon>
                        <ListItemText primary="Support" />
                    </ListItemButton>

                    <ListItemButton onClick={() => handleClick("settings")}>
                        <ListItemIcon>
                            <SettingsIcon sx={{ color: "#1976d2" }} />
                        </ListItemIcon>
                        <ListItemText primary="Settings" />
                    </ListItemButton>

                    <ListItemButton onClick={() => handleClick("lock")}>
                        <ListItemIcon sx={{ width: "40px" }}>
                            <LockIcon sx={{ color: "#1976d2" }} />
                        </ListItemIcon>
                        <ListItemText primary="Lock MetaPlay" />
                    </ListItemButton>
                </List>
            </DialogContent>
        </Dialog>
    );
};

export default MenuListModal;
