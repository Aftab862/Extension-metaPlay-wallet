// FILE: src/screens/WelcomeScreen.jsx
import React from "react";
import { Button, Typography, Stack, Container } from "@mui/material";

const WelcomeScreen = ({ onCreateWallet, onImportWallet }) => {
    return (
        <Container
            sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: 550

            }}
        >
            <Typography variant="h5" gutterBottom>
                Welcome to MetaPlay Wallet
            </Typography>

            <Typography variant="body2" color="text.secondary" mb={3}>
                Get started by creating or importing your wallet
            </Typography>

            <Stack spacing={2} width="100%">
                <Button variant="contained" fullWidth sx={{ textTransform: "none" }} onClick={onCreateWallet}>
                    Create a New Wallet
                </Button>
                <Button variant="outlined" fullWidth sx={{ textTransform: "none" }} onClick={onImportWallet}>
                    Import Using Recovery Phrase
                </Button>
            </Stack>
        </Container>
    );
};

export default WelcomeScreen;
