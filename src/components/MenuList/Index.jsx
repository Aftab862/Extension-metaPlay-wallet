import React from "react";
import {
    Dialog,
    DialogContent,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
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

const MenuListModal = ({ open, onClose }) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            disableScrollLock
            PaperProps={{
                sx: {
                    bgcolor: "#fff",
                    color: "black",
                    borderRadius: "12px",
                    minWidth: 280,
                },
            }}
        >
            <DialogContent sx={{ p: 0 }}>
                <List>
                    <ListItemButton>
                        <ListItemIcon>
                            <AccountCircleIcon sx={{ color: "#1976d2" }} />
                        </ListItemIcon>
                        <ListItemText primary="Account details" />
                    </ListItemButton>

                    <ListItemButton>
                        <ListItemIcon>
                            <OpenInNewIcon sx={{ color: "#1976d2" }} />
                        </ListItemIcon>
                        <ListItemText primary="View on explorer" />
                    </ListItemButton>

                    <Divider sx={{ bgcolor: "rgba(255,255,255,0.1)" }} />

                    <ListItemButton>
                        <ListItemIcon>
                            <SecurityIcon sx={{ color: "#1976d2" }} />
                        </ListItemIcon>
                        <ListItemText primary="All permissions" />
                    </ListItemButton>

                    <ListItemButton>
                        <ListItemIcon>
                            <OpenInFullIcon sx={{ color: "#1976d2" }} />
                        </ListItemIcon>
                        <ListItemText primary="Expand view" />
                    </ListItemButton>

                    <ListItemButton>
                        <ListItemIcon>
                            <LanIcon sx={{ color: "#1976d2" }} />
                        </ListItemIcon>
                        <ListItemText primary="Networks" />
                    </ListItemButton>

                    <ListItemButton>
                        <ListItemIcon>
                            <ExtensionIcon sx={{ color: "#1976d2" }} />
                        </ListItemIcon>
                        <ListItemText primary="Snaps" />
                    </ListItemButton>

                    <ListItemButton>
                        <ListItemIcon>
                            <HelpOutlineIcon sx={{ color: "#1976d2" }} />
                        </ListItemIcon>
                        <ListItemText primary="Support" />
                    </ListItemButton>

                    <ListItemButton>
                        <ListItemIcon>
                            <SettingsIcon sx={{ color: "#1976d2" }} />
                        </ListItemIcon>
                        <ListItemText primary="Settings" />
                    </ListItemButton>

                    <ListItemButton>
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
