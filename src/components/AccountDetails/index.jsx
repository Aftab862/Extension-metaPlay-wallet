// src/components/AccountDetailsModal.jsx
import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Typography,
    Box,
    List,
    ListItemButton,
    ListItemText,
    Avatar,
    Divider,
    Switch,
} from "@mui/material";
import { Close, Edit, ArrowForwardIos } from "@mui/icons-material";
import { findAccountDetails } from "../../utils/helper";
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';

export default function AccountDetailsModal({ wallet, open, onClose, currentAccount }) {
    // console.log("currentAccount Details : ", currentAccount, wallet);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [data, setData] = useState(null);






    useEffect(() => {
        if (wallet && currentAccount) {
            const match = findAccountDetails(wallet, currentAccount);
            if (match) {
                console.log("data matched : ", match)
                setData(match);

            } else {
                setError("Account not found in wallets");
            }
        }
    }, []);



    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    bgcolor: "#fff",
                    color: "#333",
                    borderRadius: 2,
                },
            }}
        >
            <DialogTitle
                sx={{
                    pb: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <Typography variant="subtitle1" fontWeight="bold">
                    {data?.account?.accountName ? data?.account?.accountName : `Account ${(data?.account?.accountIndex) + 1}`}
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <Close sx={{ color: "#333" }} />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ px: 0, pt: 2 }}>
                {/* Avatar */}
                <Box display="flex" justifyContent="center" mb={2}>
                    {/* <Avatar
                        sx={{
                            width: 60,
                            height: 60,
                            bgcolor: "purple",
                            fontSize: 20,
                        }}
                    >
                        A
                    </Avatar> */}

                    <InsertEmoticonIcon sx={{
                        width: 60,
                        height: 60,
                    }} />
                </Box>

                {/* Account Name */}
                <List disablePadding>
                    <ListItemButton sx={{ px: 2 }}>
                        <ListItemText
                            primary="Account name"
                            secondary={data?.account?.accountName ? data?.account?.accountName : `Account ${(data?.account?.accountIndex) + 1}`}
                            primaryTypographyProps={{ color: "#333", fontSize: 13 }}
                            secondaryTypographyProps={{ color: "#333", fontWeight: "bold" }}
                        />
                        <Edit fontSize="small" sx={{ color: "#333" }} />
                    </ListItemButton>

                    <Divider sx={{ bgcolor: "rgba(255,255,255,0.1)" }} />

                    {/* Address */}
                    <ListItemButton sx={{ px: 2 }}>
                        <ListItemText
                            primary="Address"
                            secondary={data?.chain?.address ? `${data?.chain?.address.slice(0, 6)}...${data?.chain?.address.slice(-4)}` : ""}
                            primaryTypographyProps={{ color: "#333", fontSize: 13 }}
                            secondaryTypographyProps={{ color: "#333", fontWeight: "bold" }}
                        />
                        <ArrowForwardIos sx={{ color: "#333", fontSize: 16 }} />
                    </ListItemButton>

                    <Divider sx={{ bgcolor: "rgba(255,255,255,0.1)" }} />

                    {/* Wallet */}
                    <ListItemButton sx={{ px: 2 }}>
                        <ListItemText
                            primary="Wallet"
                            secondary={`Wallet ${(currentAccount?.wId) + 1}`}
                            primaryTypographyProps={{ color: "#333", fontSize: 13 }}
                            secondaryTypographyProps={{ color: "#333", fontWeight: "bold" }}
                        />
                        <ArrowForwardIos sx={{ color: "#333", fontSize: 16 }} />
                    </ListItemButton>
                </List>

                <Divider sx={{ bgcolor: "rgba(255,255,255,0.2)", my: 2 }} />

                {/* Secret Recovery Phrase */}
                <List disablePadding>
                    <ListItemButton sx={{ px: 2 }}>
                        <ListItemText
                            primary="Secret Recovery Phrase"
                            primaryTypographyProps={{ color: "#333", fontWeight: "bold" }}
                        />
                        <ArrowForwardIos sx={{ color: "#333", fontSize: 16 }} />
                    </ListItemButton>

                    <Divider sx={{ bgcolor: "rgba(255,255,255,0.1)" }} />

                    {/* Private Key */}
                    <ListItemButton sx={{ px: 2 }}>
                        <ListItemText
                            primary="Private key"
                            primaryTypographyProps={{ color: "#333", fontWeight: "bold" }}
                        />
                        <ArrowForwardIos sx={{ color: "#333", fontSize: 16 }} />
                    </ListItemButton>
                </List>
                {/* 
                <Divider sx={{ bgcolor: "rgba(255,255,255,0.2)", my: 2 }} />

              
                <Box px={2} mb={1}>
                    <Typography fontWeight="bold" mb={0.5}>
                        Enable smart contract account
                    </Typography>
                    <Typography
                        variant="body2"
                        color="rgba(255,255,255,0.6)"
                        fontSize={12}
                        mb={1}
                    >
                        You can enable smart account features on supported networks.{" "}
                        <span style={{ color: "#4c82fb", cursor: "pointer" }}>Learn more</span>
                    </Typography>

                
                    <Box display="flex" justifyContent="space-between" alignItems="center" py={0.5}>
                        <Typography>Ethereum Mainnet</Typography>
                        <Switch />
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" py={0.5}>
                        <Typography>Polygon Mainnet</Typography>
                        <Switch />
                    </Box>
                </Box> */}

            </DialogContent>
        </Dialog>
    );
}
