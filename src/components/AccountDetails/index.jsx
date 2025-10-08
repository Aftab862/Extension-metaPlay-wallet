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
    Divider,
    Avatar,
} from "@mui/material";
import { Close, ArrowForwardIos } from "@mui/icons-material";
import { findAccountDetails } from "../../utils/helper";

export default function AccountDetailsModal({
    wallet,
    open,
    onClose,
    currentAccount,
    handleSecretePhrases,
}) {
    const [data, setData] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (wallet && currentAccount) {
            const match = findAccountDetails(wallet, currentAccount);
            match ? setData(match) : setError("Account not found in wallets");
        }
    }, [wallet, currentAccount]);

    const accountName =
        data?.account?.accountName ||
        `Account ${(data?.account?.accountIndex ?? 0) + 1}`;
    const address =
        data?.chain?.address &&
        `${data.chain.address.slice(0, 6)}...${data.chain.address.slice(-4)}`;
    const walletLabel = `Wallet ${(currentAccount?.wId ?? 0) + 1}`;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    bgcolor: "#fafafa",
                    color: "#222",
                    borderRadius: 3,
                    boxShadow: "0px 4px 20px rgba(0,0,0,0.1)",
                },
            }}
        >
            <DialogTitle
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: 3,
                    pt: 2,
                    pb: 1,
                }}
            >
                <Typography variant="h6" fontWeight="bold">
                    Account Details
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <Close sx={{ color: "#444" }} />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ px: 0, pt: 1 }}>
                <Box display="flex" justifyContent="center" mb={2} mt={1}>
                    <Avatar
                        sx={{
                            width: 64,
                            height: 64,
                            bgcolor: "#1976d2",
                            fontSize: 22,
                            fontWeight: "bold",
                        }}
                    >
                        {accountName?.[0]?.toUpperCase() || "A"}
                    </Avatar>
                </Box>

                <List disablePadding>
                    <ListItemButton sx={{ px: 3, py: 1 }}>
                        <ListItemText
                            primary="Account Name"
                            secondary={accountName}
                            primaryTypographyProps={{ fontSize: 13, color: "#555" }}
                            secondaryTypographyProps={{
                                fontWeight: "bold",
                                fontSize: 14,
                                color: "#111",
                            }}
                        />
                    </ListItemButton>

                    <Divider />

                    <ListItemButton sx={{ px: 3, py: 1 }}>
                        <ListItemText
                            primary="Address"
                            secondary={address}
                            primaryTypographyProps={{ fontSize: 13, color: "#555" }}
                            secondaryTypographyProps={{
                                fontWeight: "bold",
                                fontSize: 14,
                                color: "#111",
                            }}
                        />
                    </ListItemButton>

                    <Divider />

                    <ListItemButton sx={{ px: 3, py: 1 }}>
                        <ListItemText
                            primary="Wallet"
                            secondary={walletLabel}
                            primaryTypographyProps={{ fontSize: 13, color: "#555" }}
                            secondaryTypographyProps={{
                                fontWeight: "bold",
                                fontSize: 14,
                                color: "#111",
                            }}
                        />
                        {/* <ArrowForwardIos sx={{ color: "#999", fontSize: 16 }} /> */}
                    </ListItemButton>
                </List>

                <Divider sx={{ my: 1.5 }} />

                <List disablePadding>
                    <ListItemButton
                        onClick={() => handleSecretePhrases("phrase")}
                        sx={{ px: 3, py: 1 }}
                    >
                        <ListItemText
                            primary="Secret Recovery Phrase"
                            primaryTypographyProps={{
                                fontWeight: "bold",
                                fontSize: 14,
                                color: "#111",
                            }}
                        />
                        <ArrowForwardIos sx={{ color: "#999", fontSize: 16 }} />
                    </ListItemButton>

                    <Divider />

                    <ListItemButton
                        onClick={() => handleSecretePhrases("privateKey")}
                        sx={{ px: 3, py: 1 }}
                    >
                        <ListItemText
                            primary="Private Key"
                            primaryTypographyProps={{
                                fontWeight: "bold",
                                fontSize: 14,
                                color: "#111",
                            }}
                        />
                        <ArrowForwardIos sx={{ color: "#999", fontSize: 16 }} />
                    </ListItemButton>
                </List>

                {error && (
                    <Typography
                        color="error"
                        variant="body2"
                        textAlign="center"
                        mt={2}
                        px={2}
                    >
                        {error}
                    </Typography>
                )}
            </DialogContent>
        </Dialog>
    );
}
