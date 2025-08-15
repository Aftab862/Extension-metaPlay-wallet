// src/components/ChainSelectorModal.jsx
import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    List,
    ListItem,
    ListItemAvatar,
    Avatar,
    ListItemText,
} from "@mui/material";
import { mapColors } from "../utils/helper";

export default function ChainSelectorModal({ open, onClose, chains = [], selectedChain, onSelect }) {
    return (
        <Dialog open={!!open} onClose={onClose} maxWidth="xs" fullWidth scroll="paper" disableScrollLock>
            <DialogTitle>Select network</DialogTitle>
            <DialogContent sx={{ px: 0 }}>
                <List>
                    {chains.map((chain) => (
                        <ListItem
                            dense
                            key={chain.chainId || chain.name}
                            button
                            selected={selectedChain && selectedChain.name === chain.name}
                            onClick={() => {
                                onSelect && onSelect(chain);
                                onClose && onClose();
                            }}
                        >
                            <ListItemAvatar>
                                <Avatar sx={{ bgcolor: mapColors(chain.nativeSymbol), width: 36, height: 36, fontSize: "12px" }}>
                                    {chain.nativeSymbol.slice(0, 3)}
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText primary={chain.name} secondary={chain.nativeSymbol} />
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
        </Dialog>
    );
}
