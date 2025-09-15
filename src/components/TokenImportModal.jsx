import React, { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    CircularProgress,
    Typography,
    Paper,
} from "@mui/material";
import { ethers } from "ethers";
import { CHAIN_ID, CHAIN_LIST, WALLET_DATA_KEY } from "../utils/keys";
import { loadWalletState } from "../utils/walletUtils";
import { loadFromLocalStorage, saveToLocalStorage } from "../utils/storage";

const ERC20_ABI = [
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function name() view returns (string)",
    "function balanceOf(address) view returns (uint256)",
];

const ImportTokenDialog = ({ open, onClose, rpcUrl, userWalletAddress, setAllChains }) => {
    const [tokenAddress, setTokenAddress] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [importedToken, setImportedToken] = useState(null);

    const fetchTokenData = async () => {
        try {
            setLoading(true);
            setError("");
            setImportedToken(null);

            if (!ethers.isAddress(tokenAddress)) {
                setError("Invalid Ethereum address.");
                return;
            }

            const provider = new ethers.JsonRpcProvider(rpcUrl);
            const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);

            const [symbol, decimals, name, rawBalance] = await Promise.all([
                contract.symbol(),
                contract.decimals(),
                contract.name(),
                userWalletAddress ? contract.balanceOf(userWalletAddress) : 0,
            ]);

            const balance = userWalletAddress
                ? ethers.formatUnits(rawBalance, decimals)
                : "0";

            setImportedToken({
                address: tokenAddress,
                symbol,
                decimals: decimals.toString(),
                name,
                balance,
            });
        } catch (err) {
            console.error("Detailed error:", err);
            setError("Failed to fetch token data. Make sure it's a real ERC20.");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setTokenAddress("");
        setError("");
        setImportedToken(null);
        setLoading(false);
        onClose();
    };

    const handleSaveToken = () => {
        setLoading(true);
        setError("");
        const chains = loadFromLocalStorage(CHAIN_LIST);
        const cId = Number(loadFromLocalStorage(CHAIN_ID));
        const newToken = { ...importedToken };

        let tokenAlreadyExists = false;

        const updatedChains = chains.map(chain => {
            if (chain.chainId === cId) {
                const exists = chain.tokens.some(
                    t => t.address.toLowerCase() === newToken.address.toLowerCase()
                );

                if (exists) {
                    tokenAlreadyExists = true;
                    return chain; // no change
                }

                return {
                    ...chain,
                    tokens: [...chain.tokens, newToken],
                };
            }
            return chain;
        });

        if (tokenAlreadyExists) {
            setError("Token already exists!");
            setLoading(false);
            return;
        }

        console.log("updated chains is:", updatedChains);
        saveToLocalStorage(CHAIN_LIST, updatedChains)
        setAllChains(updatedChains);
        handleClose()
    };





    return (
        <Dialog open={open} onClose={handleClose} fullWidth>
            <DialogTitle>Import Token</DialogTitle>
            <DialogContent>
                <TextField
                    label="Token Address"
                    fullWidth
                    margin="normal"
                    value={tokenAddress}
                    onChange={(e) => setTokenAddress(e.target.value)}
                    placeholder="0x..."
                />
                {loading && <CircularProgress size={24} />}
                {error && (
                    <Typography color="error" variant="body2" mt={1}>
                        {error}
                    </Typography>
                )}
                {importedToken && (
                    <Paper
                        elevation={2}
                        sx={{ p: 2, mt: 2, borderRadius: "12px", bgcolor: "#f9f9f9" }}
                    >
                        <Typography variant="h6">{importedToken.name}</Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            symbol:  {importedToken.symbol}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            Address: {importedToken.address.slice(0, 6)}...
                            {importedToken.address.slice(-4)}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            Decimals: {importedToken.decimals}
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 1 }}>
                            Balance: {importedToken.balance}
                        </Typography>
                    </Paper>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                {importedToken ?
                    <Button onClick={handleSaveToken} disabled={loading}>
                        Save
                    </Button>
                    :
                    <Button onClick={fetchTokenData} disabled={loading}>
                        Import
                    </Button>
                }

            </DialogActions>
        </Dialog>
    );
};

export default ImportTokenDialog;
