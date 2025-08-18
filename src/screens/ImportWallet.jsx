// // FILE: src/screens/ImportWalletScreen.jsx
// import React, { useState } from "react";
// import {
//     TextField,
//     Button,
//     Typography,
//     Container,
//     Box,
//     Avatar,
// } from "@mui/material";
// import ImportExportIcon from "@mui/icons-material/ImportExport";
// import VpnKeyIcon from "@mui/icons-material/VpnKey";

// const ImportWalletScreen = ({ method = "mnemonic", onImport, height = "93vh" }) => {
//     const [inputValue, setInputValue] = useState("");

//     const handleSubmit = () => {
//         onImport(inputValue.trim());
//     };

//     const isMnemonic = method === "mnemonic";

//     // Validation rules
//     const isDisabled = isMnemonic
//         ? inputValue.trim().split(/\s+/).length < 12
//         : inputValue.trim().length === 0;

//     return (
//         <Container
//             sx={{
//                 display: "flex",
//                 flexDirection: "column",
//                 justifyContent: "center",
//                 alignItems: "center",
//                 height: "93vh",
//             }}
//         >
//             <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
//                 <Avatar sx={{ bgcolor: "#1976d2", width: 56, height: 56 }}>
//                     {isMnemonic ? (
//                         <ImportExportIcon fontSize="large" />
//                     ) : (
//                         <VpnKeyIcon fontSize="large" />
//                     )}
//                 </Avatar>
//                 <Typography variant="h6" mt={1}>
//                     {isMnemonic
//                         ? "Import Wallet Using Recovery Phrase"
//                         : "Import Wallet Using Private Key"}
//                 </Typography>
//             </Box>

//             <TextField
//                 label={isMnemonic ? "Recovery Phrase" : "Private Key"}
//                 placeholder={
//                     isMnemonic
//                         ? "Enter 12 or 24-word phrase"
//                         : "Enter your private key"
//                 }
//                 multiline={isMnemonic}
//                 rows={isMnemonic ? 3 : 1}
//                 fullWidth
//                 value={inputValue}
//                 onChange={(e) => setInputValue(e.target.value)}
//                 sx={{ mb: 2 }}
//             />

//             <Button
//                 variant="contained"
//                 fullWidth
//                 disabled={isDisabled}
//                 onClick={handleSubmit}
//                 sx={{ textTransform: "none" }}
//             >
//                 Import Wallet
//             </Button>
//         </Container>
//     );
// };

// export default ImportWalletScreen;




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
import ImportExportIcon from "@mui/icons-material/ImportExport";
import VpnKeyIcon from "@mui/icons-material/VpnKey";

const ImportWalletScreen = ({ method = "mnemonic", onImport, height = "93vh" }) => {
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
        <Container
            sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: height,
            }}
        >
            {/* Header */}
            <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
                <Avatar sx={{ bgcolor: "#1976d2", width: 56, height: 56 }}>
                    {isMnemonic ? (
                        <ImportExportIcon fontSize="large" />
                    ) : (
                        <VpnKeyIcon fontSize="large" />
                    )}
                </Avatar>
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
                        <Grid item xs={6} key={idx}>
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
        </Container>
    );
};

export default ImportWalletScreen;
