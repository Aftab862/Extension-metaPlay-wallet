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
} from "@mui/material";
import { mapColors } from "../utils/helper";
import { AddChainHandler } from "../utils/storage";

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
    const [newChain, setNewChain] = useState({
        chainId: "",
        name: "",
        rpcUrl: "",
        nativeSymbol: "",
    });



    const handleAddChain = () => {
        if (
            !newChain.chainId.trim() ||
            !newChain.name.trim() ||
            !newChain.rpcUrl.trim() ||
            !newChain.nativeSymbol.trim()
        ) {
            alert("Please fill in all fields");
            return;
        }

        const formatted = {
            ...newChain,
            chainId: parseInt(newChain.chainId, 10),
        };

        console.log("formatted chain ", formatted)

        AddChainHandler(formatted);
        setReferesh(!referesh);
        setNewChain({ chainId: "", name: "", rpcUrl: "", nativeSymbol: "" });
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
        >
            <DialogTitle>Select network</DialogTitle>
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
                                label="Chain ID"
                                value={newChain.chainId}
                                onChange={(e) =>
                                    setNewChain({ ...newChain, chainId: e.target.value })
                                }
                                fullWidth
                                size="small"
                            />
                            <TextField
                                label="Name"
                                value={newChain.name}
                                onChange={(e) =>
                                    setNewChain({ ...newChain, name: e.target.value })
                                }
                                fullWidth
                                size="small"
                            />
                            <TextField
                                label="RPC URL"
                                value={newChain.rpcUrl}
                                onChange={(e) =>
                                    setNewChain({ ...newChain, rpcUrl: e.target.value })
                                }
                                fullWidth
                                size="small"
                            />
                            <TextField
                                label="Native Symbol"
                                value={newChain.nativeSymbol}
                                onChange={(e) =>
                                    setNewChain({ ...newChain, nativeSymbol: e.target.value })
                                }
                                fullWidth
                                size="small"
                            />

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
