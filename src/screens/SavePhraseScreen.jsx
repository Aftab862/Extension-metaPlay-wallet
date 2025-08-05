import React from "react";
import { Button, Typography, Container, Box } from "@mui/material";

const SavePhraseScreen = ({ mnemonic, onContinue }) => {
    return (
        <Container sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "93vh",
        }}>
            <Typography variant="h6" gutterBottom align="center">
                Save Your Secret Phrase
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }} align="center">
                Please write down this 12-word phrase somewhere safe. It is used to recover your wallet.
            </Typography>

            <Box
                sx={{
                    border: "1px dashed gray",
                    padding: 2,
                    borderRadius: 2,
                    backgroundColor: "#f9f9f9",
                    textAlign: "center",
                    fontWeight: "bold",
                    wordBreak: "break-word",
                    mb: 3,
                }}
            >
                {mnemonic}
            </Box>

            <Button variant="contained" fullWidth onClick={onContinue}>
                I’ve saved it
            </Button>
        </Container >
    );
};

export default SavePhraseScreen;
