// src/components/ChainSelectorModal.jsx
import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    List,
    ListItem,
    ListItemAvatar,
    Avatar,
    ListItemText,
    Button,
    TextField,
    Collapse,
    Box,
    DialogActions,
    ListItemButton,
    Typography,
} from "@mui/material";
import { mapColors } from "../utils/helper";
import { AddChainHandler } from "../utils/storage";
import { Close } from "@mui/icons-material";

export default function ChainSelectorModal({
    open,
    onClose,
    chains = [],
    selectedChain,
    onSelect,
    setReferesh,
    referesh
}) {
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState(null);
    const [newChain, setNewChain] = useState({
        chainId: "",
        name: "",
        rpcUrl: "",
        nativeSymbol: "",
        explorerUrl: ""

    });



    const handleAddChain = () => {
        if (
            !newChain.chainId.trim() ||
            !newChain.name.trim() ||
            !newChain.rpcUrl.trim() ||
            !newChain.nativeSymbol.trim() ||
            !newChain.explorerUrl.trim()

        ) {
            setError("Please fill in all fields");
            return;
        }

        const formatted = {
            ...newChain,
            chainId: parseInt(newChain.chainId, 10),
            tokens: [],
        };

        console.log("formatted chain ", formatted)

        AddChainHandler(formatted);
        setReferesh(!referesh);
        setNewChain({ chainId: "", name: "", rpcUrl: "", nativeSymbol: "", explorerUrl: "" });
        setShowForm(false);
    };

    return (
        <Dialog
            open={!!open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            scroll="paper"
            disableScrollLock
            PaperProps={{
                sx: {
                    bgcolor: "#fff",
                    color: "black",
                    borderRadius: 2,
                },
            }}
        >
            <DialogTitle sx={{
                pb: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",

            }}>
                <Typography variant="h6" >
                    {showForm ? "Add custom chain" : "Select network"}
                </Typography>


                <Close onClick={() => onClose()} />
            </DialogTitle>
            <DialogContent sx={{ px: 0 }}>
                <List>
                    {!showForm ? <>
                        {chains.map((chain) => (
                            <ListItem
                                dense
                                key={chain.chainId || chain.name}
                                button
                                onClick={() => {
                                    onSelect && onSelect(chain);
                                    onClose && onClose();
                                }}
                            >

                                <ListItemButton
                                    selected={selectedChain && selectedChain.name === chain.name}

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
                                            }
                                        },
                                        "&:hover": {
                                            backgroundColor: "action.hover",
                                        }
                                    }}

                                >
                                    <ListItemAvatar>
                                        <Avatar
                                            sx={{
                                                bgcolor: mapColors(chain.nativeSymbol),
                                                width: 36,
                                                height: 36,
                                                fontSize: "12px",
                                            }}
                                        >
                                            {chain.nativeSymbol.slice(0, 3)}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText primary={chain.name} secondary={chain.nativeSymbol} />
                                </ListItemButton>
                            </ListItem>
                        ))}



                    </>
                        :
                        <Box p={2} display="flex" flexDirection="column" gap={2}>
                            <TextField
                                label="Network Name"
                                value={newChain.name}
                                onChange={(e) => {
                                    setNewChain({ ...newChain, name: e.target.value })
                                    setError("");
                                }}
                                fullWidth
                                size="small"
                            />
                            <TextField
                                label="Default RPC URL"
                                value={newChain.rpcUrl}
                                onChange={(e) => {
                                    setNewChain({ ...newChain, rpcUrl: e.target.value })
                                    setError("");
                                }}
                                fullWidth
                                size="small"
                            />
                            <TextField
                                label="Chain ID"
                                value={newChain.chainId}
                                onChange={(e) => {
                                    setNewChain({ ...newChain, chainId: e.target.value })
                                    setError("");
                                }}
                                fullWidth
                                size="small"
                            />
                            <TextField
                                label="Currency symbol"
                                value={newChain.nativeSymbol}
                                onChange={(e) => {
                                    setNewChain({ ...newChain, nativeSymbol: e.target.value })
                                    setError("");
                                }}
                                fullWidth
                                size="small"
                            />

                            <TextField
                                label="Block explorer URL"
                                value={newChain.explorerUrl}
                                onChange={(e) => {
                                    setNewChain({ ...newChain, explorerUrl: e.target.value })
                                    setError("");
                                }}
                                fullWidth
                                size="small"
                            />
                            {error && <Typography textAlign="center" px={1} color="red">{error}</Typography>}
                            <Button variant="contained" onClick={handleAddChain}>
                                Save Chain
                            </Button>
                        </Box>
                    }
                </List>
            </DialogContent>
            <DialogActions>
                <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => setShowForm(true)}
                    sx={{ textTransform: "none" }}
                >
                    + Add Custom Chain
                </Button>
            </DialogActions>
        </Dialog>
    );
}
