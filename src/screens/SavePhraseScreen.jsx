import React, { useState } from "react";
import {
    Button,
    Typography,
    Container,
    Box,
    IconButton,
    Tooltip,
} from "@mui/material";
import Logo from "../../public/icons/Logo.svg";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const SavePhraseScreen = ({ mnemonic, onContinue }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(mnemonic);
            setCopied(true);
        } catch (err) {
            console.error("Failed to copy phrase:", err);
        }
    };

    return (
        <Container
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "93vh",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <img src={Logo} alt="centered logo" style={{ width: "100px" }} />
            </Box>

            <Typography variant="h6" gutterBottom align="center" mt={2}>
                Save Your Secret Phrase
            </Typography>

            <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2 }}
                align="center"
            >
                Please write down this 12-word phrase somewhere safe. It is used to
                recover your wallet.
            </Typography>

            <Box
                sx={{
                    position: "relative",
                    border: "1px dashed gray",
                    paddingY: 4,
                    paddingX: 2,
                    borderRadius: 2,
                    backgroundColor: "#f9f9f9",
                    textAlign: "center",
                    fontWeight: "bold",
                    wordBreak: "break-word",
                    mb: 3,
                    width: "100%",
                }}
            >
                {mnemonic}
                <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
                    <IconButton
                        onClick={handleCopy}
                        sx={{ position: "absolute", top: 0, right: 0 }}
                    >
                        <ContentCopyIcon color={copied ? "success" : "action"} />
                    </IconButton>
                </Tooltip>
            </Box>

            <Button
                variant="contained"
                sx={{ textTransform: "none" }}
                fullWidth
                disabled={!copied}
                onClick={onContinue}
            >
                I’ve saved it
            </Button>
        </Container>
    );
};

export default SavePhraseScreen;
