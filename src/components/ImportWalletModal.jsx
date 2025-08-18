import React from "react";
import { Button, Dialog, DialogContent, DialogTitle } from "@mui/material";

const ImportWalletModal = ({ open, onClose, onImportTypeSelect }) => {
    const handleSelect = (type) => {
        onImportTypeSelect(type);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Import Wallet</DialogTitle>
            <DialogContent>
                <Button
                    variant="outlined"
                    fullWidth
                    sx={{ mb: 1, textTransform: "none" }}
                    onClick={() => handleSelect("mnemonic")}
                >
                    Secret Recovery Phrase
                </Button>
                <Button
                    variant="outlined"
                    fullWidth
                    sx={{ mb: 1, textTransform: "none" }}
                    onClick={() => handleSelect("privateKey")}
                >
                    Secret Private Key
                </Button>
            </DialogContent>
        </Dialog>
    );
};

export default ImportWalletModal;
