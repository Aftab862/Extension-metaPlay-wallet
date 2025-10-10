import React, { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Box,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    IconButton,
    Link,
} from "@mui/material";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import GitHubIcon from "@mui/icons-material/GitHub";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import TelegramIcon from "@mui/icons-material/Telegram";
import { Close } from "@mui/icons-material";
// import DiscordIcon from "@mui/icons-material/Discord";

export default function SettingsDialog({ open, onClose, setPasswordDialogOpen, handleSecretePhrases }) {

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs"
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
                    padding: "16px 16px 16px 16px",
                }}
            >

                <Typography variant="h6">Settings</Typography>
                <IconButton onClick={onClose} size="small">
                    <Close sx={{ fontSize: 20 }} />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <List disablePadding>
                    {/* Secret Recovery Phrase */}
                    <ListItem
                        button
                        onClick={() => handleSecretePhrases("phrase")}
                        sx={{
                            borderRadius: 1,
                            mb: 1,
                            "&:hover": { backgroundColor: "action.hover" },
                        }}
                    >
                        <ListItemText
                            primary="Secret Recovery Phrase"

                        />
                        <ListItemIcon sx={{ minWidth: "auto" }}>
                            <KeyboardArrowRightIcon color="action" />
                        </ListItemIcon>
                    </ListItem>

                    <Divider />

                    {/* Change Password */}
                    <ListItem
                        button
                        onClick={() => { onClose(); setPasswordDialogOpen(true) }}
                        sx={{
                            borderRadius: 1,
                            my: 1,
                            "&:hover": { backgroundColor: "action.hover" },
                        }}
                    >
                        <ListItemText
                            primary="Change Password"

                        />
                        <ListItemIcon sx={{ minWidth: "auto" }}>
                            <KeyboardArrowRightIcon color="action" />
                        </ListItemIcon>
                    </ListItem>

                    <Divider />

                    {/* About Section */}
                    <Box mt={2}>
                        <Typography
                            variant="subtitle1"
                            fontWeight={600}
                            sx={{ mb: 1, textAlign: "center" }}
                        >
                            About
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            textAlign="center"
                            sx={{ mb: 2 }}
                        >
                            A secure, lightweight crypto wallet built for fast transactions and effortless key management.
                            <br />

                        </Typography>

                        {/* Social Icons */}
                        <Box display="flex" justifyContent="center" gap={2} mb={2}>

                            <IconButton
                                component="a"
                                href="https://twitter.com/yourhandle"
                                target="_blank"
                                rel="noopener"
                                size="small"
                                sx={{ mx: 0.5, color: "text.secondary" }}
                            >
                                <TwitterIcon fontSize="small" />
                            </IconButton>
                            {/* <IconButton
                                component="a"
                                href="https://discord.gg/yourserver"
                                target="_blank"
                                rel="noopener"
                                size="small"
                                sx={{ mx: 0.5, color: "text.secondary" }}
                            >
  <DiscordIcon fontSize="small" />  
                            </IconButton> */}
                            <IconButton
                                component="a"
                                href="https://instagram.com/yourhandle"
                                target="_blank"
                                rel="noopener"
                                size="small"
                                sx={{ mx: 0.5, color: "text.secondary" }}
                            >
                                <InstagramIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                                component="a"
                                href="https://t.me/yourhandle"
                                target="_blank"
                                rel="noopener"
                                size="small"
                                sx={{ mx: 0.5, color: "text.secondary" }}
                            >
                                <TelegramIcon fontSize="small" />
                            </IconButton>
                        </Box>


                        {/* Legal Links */}
                        <Box textAlign="center">
                            <Link
                                href="https://yourwebsite.com/privacy"
                                underline="hover"
                                target="_blank"
                                rel="noopener"
                                sx={{ mx: 1, fontSize: 13 }}
                            >
                                Privacy Policy
                            </Link>
                            |
                            <Link
                                href="https://yourwebsite.com/terms"
                                underline="hover"
                                target="_blank"
                                rel="noopener"
                                sx={{ mx: 1, fontSize: 13 }}
                            >
                                Terms of Service
                            </Link>
                        </Box>
                    </Box>
                </List>
            </DialogContent>

            <DialogActions sx={{ justifyContent: "center" }}>
                <Typography variant="caption" color="text.secondary">
                    © {new Date().getFullYear()} MetaPlay Wallet
                </Typography>
            </DialogActions>
        </Dialog >
    );
}
