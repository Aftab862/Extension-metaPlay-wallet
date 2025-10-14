// FILE: src/screens/ImportWalletScreen.jsx
import React, { useState } from "react";
import {
    TextField,
    Button,
    Typography,
    Container,
    Box,
    Avatar,
    Grid,
} from "@mui/material";
import Logo from "../../public/icons/Logo.svg";
import ImportExportIcon from "@mui/icons-material/ImportExport";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import { ArrowBack } from "@mui/icons-material";

const ImportWalletScreen = ({ setStep, method = "mnemonic", onImport, height = "93vh" }) => {
    const isMnemonic = method === "mnemonic";

    // for mnemonic: 12 fields, for privateKey: single string
    const [mnemonicWords, setMnemonicWords] = useState(Array(12).fill(""));
    const [privateKey, setPrivateKey] = useState("");

    const handleWordChange = (index, value) => {
        const updated = [...mnemonicWords];
        updated[index] = value.trim().toLowerCase();
        setMnemonicWords(updated);
    };

    const handleSubmit = () => {
        if (isMnemonic) {
            const phrase = mnemonicWords.join(" ").trim();
            onImport(phrase);
        } else {
            onImport(privateKey.trim());
        }
    };

    // Validation rules
    const isDisabled = isMnemonic
        ? mnemonicWords.some((w) => !w) || mnemonicWords.length < 12
        : privateKey.trim().length === 0;

    return (
        <Container sx={{
            height: height,
            pt: height === "93vh" ? "1rem" : "3px",
        }}>
            <Box
                onClick={() => setStep(height === "93vh" ? "welcome" : "main")}
                sx={{ margin: "8px 8px 0 0 ", width: "100%", display: "flex ", alignItems: "center", justifyContent: "flex-start" }}>
                <ArrowBack sx={{
                    mr: 1,
                    border: "2px solid #1976d2",
                    borderRadius: "33px",
                    background: "#1976d2",
                    color: "white"
                }} /> Back
            </Box>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 0 }}>
                <img src={Logo} alt="centered logo" style={{ width: height === "93vh" ? "100px" : "80px" }} />
            </Box>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",

                }}
            >
                {/* Header */}

                <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
                    {/* <Avatar sx={{ bgcolor: "#1976d2", width: 56, height: 56 }}>
                    {isMnemonic ? (
                        <ImportExportIcon fontSize="large" />
                    ) : (
                        <VpnKeyIcon fontSize="large" />
                    )}
                </Avatar> */}
                    <Typography variant="h6" mt={1}>
                        {isMnemonic
                            ? "Secret Recovery Phrase"
                            : "Secret Private Key"}
                    </Typography>
                </Box>

                {/* Mnemonic Inputs */}
                {isMnemonic ? (
                    <Grid container spacing={2} mb={2}>
                        {mnemonicWords.map((word, idx) => (
                            <Grid item xs={4} key={idx}>
                                <TextField
                                    label={`Word ${idx + 1}`}
                                    value={word}
                                    onChange={(e) => handleWordChange(idx, e.target.value)}
                                    fullWidth
                                    size="small"
                                />
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <TextField
                        label="Private Key"
                        placeholder="Enter your private key"
                        fullWidth
                        value={privateKey}
                        onChange={(e) => setPrivateKey(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                )}

                {/* Submit */}
                <Button
                    variant="contained"
                    fullWidth
                    disabled={isDisabled}
                    onClick={handleSubmit}
                    sx={{ textTransform: "none" }}
                >
                    Import Wallet
                </Button>
            </Box>
        </Container>
    );
};

export default ImportWalletScreen;
