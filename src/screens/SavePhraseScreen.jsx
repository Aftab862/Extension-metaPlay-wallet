import React, { useState } from "react";
import {
    Button,
    Typography,
    Container,
    Box,
    IconButton,
    Tooltip,
    Grid,
} from "@mui/material";
import Logo from "../../public/icons/Logo.svg";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const SavePhraseScreen = ({ mnemonic, onContinue }) => {
    const words = mnemonic.split(" ");
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
                height: "100%",
            }}
        >
            {/* Logo */}
            <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
                <img src={Logo} alt="logo" style={{ width: "90px" }} />
            </Box>

            {/* Title */}
            <Typography variant="h5" gutterBottom align="center">
                Save Your Secret Phrase
            </Typography>

            {/* Words in grid */}

            <Box sx={{ width: "100%", mb: 2 }}>
                <Typography sx={{ float: "right", display: "flex", alignItems: "center" }}>
                    <Tooltip title={copied ? "Copied!" : "Copy all"} >
                        {copied ? "Copied!" : "Copy"}
                        <IconButton
                            onClick={handleCopy}
                        >
                            <ContentCopyIcon color={copied ? "success" : "action"} />
                        </IconButton>

                    </Tooltip>
                </Typography>
            </Box>


            <Grid container spacing={1.3}>
                {words.map((word, idx) => (
                    <Grid item xs={4} key={idx}>
                        <Box
                            sx={{
                                border: "1px solid #ddd",
                                borderRadius: 1.5,
                                p: 1,
                                textAlign: "center",
                                fontWeight: 500,
                                backgroundColor: "white",
                            }}
                        >
                            {word}
                        </Box>
                    </Grid>
                ))}
            </Grid>

            {/* Copy button at bottom right */}


            {/* Continue button */}
            <Button
                variant="contained"
                sx={{ textTransform: "none", maxWidth: 500, marginTop: "16px" }}
                fullWidth

                onClick={onContinue}
                disabled={!copied}
            >
                I’ve saved it
            </Button>
        </Container>
    );
};

export default SavePhraseScreen;
