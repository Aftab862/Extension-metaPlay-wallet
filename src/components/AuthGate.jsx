// src/components/AuthGate.jsx
import React, { useState } from "react";
import { Button, TextField, Typography, Box } from "@mui/material";
import {
    decryptMnemonic,
    encryptMnemonic,
    isMnemonicStored,
} from "../utils/cryptoUtils";
import { Mnemonic } from "ethers";

const AuthGate = ({ onAuthenticated }) => {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleUnlock = () => {
        const decrypted = decryptMnemonic(password);
        if (decrypted) {
            onAuthenticated(decrypted, password);
        } else {
            setError("Invalid password");
        }
    };

    const handleSetup = () => {
        const mnemonic = Mnemonic.entropyToMnemonic(Mnemonic.randomEntropy());
        encryptMnemonic(mnemonic.phrase, password);
        onAuthenticated(mnemonic.phrase, password);
    };

    const stored = isMnemonicStored();

    return (
        <Box textAlign="center">
            <Typography variant="h6" gutterBottom>
                {stored ? "Unlock Wallet" : "Create New Wallet"}
            </Typography>

            <TextField
                type="password"
                label="Enter Password"
                variant="outlined"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mt: 2 }}
            />

            {error && (
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                    {error}
                </Typography>
            )}

            <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 3 }}
                onClick={stored ? handleUnlock : handleSetup}
                disabled={!password}
            >
                {stored ? "Unlock" : "Setup Wallet"}
            </Button>
        </Box>
    );
};

export default AuthGate;
