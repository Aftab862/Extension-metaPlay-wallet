// FILE: src/screens/ImportWalletScreen.jsx
import React, { useState } from "react";
import {
    TextField,
    Button,
    Typography,
    Container,
    Box,
    Avatar,
} from "@mui/material";
import ImportExportIcon from "@mui/icons-material/ImportExport";

const ImportWalletScreen = ({ onImport }) => {
    const [mnemonic, setMnemonic] = useState("");

    const handleSubmit = () => {
        onImport(mnemonic);
    };

    return (
        <Container
            sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "93vh",
            }}
        >
            <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
                <Avatar sx={{ bgcolor: "#1976d2", width: 56, height: 56 }}>
                    <ImportExportIcon fontSize="large" />
                </Avatar>
                <Typography variant="h6" mt={1}>
                    Import Wallet Using Phrase
                </Typography>
            </Box>

            <TextField
                label="Recovery Phrase"
                placeholder="Enter 12-word phrase"
                multiline
                rows={3}
                fullWidth
                value={mnemonic}
                onChange={(e) => setMnemonic(e.target.value)}
                sx={{ mb: 2 }}
            />

            <Button
                variant="contained"
                fullWidth
                disabled={mnemonic.trim().split(" ").length < 12}
                onClick={handleSubmit}
                sx={{ textTransform: "none" }}
            >
                Import Wallet
            </Button>
        </Container>
    );
};

export default ImportWalletScreen;
