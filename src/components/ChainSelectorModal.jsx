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
import { chainIcons } from "../Assets/chainIconsUrls";

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
            name: newChain.name.trim(),
            chainId: parseInt(newChain.chainId, 10),
            rpcUrl: newChain.rpcUrl.trim(),
            explorerUrl: newChain.explorerUrl.trim(),
            nativeCurrency: {
                symbol: newChain.nativeSymbol.trim(),
                name: newChain.name.trim(),
                balance: "0.0000",
            },
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
                                        {/* <Avatar
                                            sx={{
                                                bgcolor: mapColors(chain.nativeCurrency.name),
                                                width: 36,
                                                height: 36,
                                                fontSize: "12px",
                                            }}
                                        >
                                            {chain.nativeCurrency.name.slice(0, 1)}
                                        </Avatar> */}
                                        {console.log("chain icon:", chainIcons(chain.nativeCurrency.symbol))}
                                        <Avatar
                                            src={chainIcons(chain.nativeCurrency.symbol)}
                                            alt={chain.nativeCurrency?.name || chain.name}
                                            imgProps={{ loading: "lazy" }}
                                            variant="rounded"
                                        // sx={{
                                        //     width: 36,
                                        //     height: 36,
                                        //     bgcolor: chainIcons[chain.name]
                                        //         ? "transparent"
                                        //         : mapColors(chain.nativeCurrency?.name || chain.name),
                                        //     fontSize: "12px",
                                        // }}
                                        >
                                            {/* {!chainIcons[chain.name] &&
                                                (chain.nativeCurrency?.symbol?.slice(0, 1) || "?")} */}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText primary={chain.name} secondary={chain.nativeCurrency.name} />
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
