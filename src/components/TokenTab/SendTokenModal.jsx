import React, { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography
} from "@mui/material";
import { ethers } from "ethers";

const SendTokenModal = ({ open, onClose, token, rpcUrl, userWallet }) => {
    const [toAddress, setToAddress] = useState("");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!toAddress || !amount) return;

        try {
            setLoading(true);

            // Setup provider + signer (using stored private key)
            const provider = new ethers.JsonRpcProvider(rpcUrl);

            // 🔑 Replace with your decrypted private key from storage
            const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

            if (token.isNative) {
                // Send native coin (ETH, BNB, MATIC, etc.)
                const tx = await wallet.sendTransaction({
                    to: toAddress,
                    value: ethers.parseUnits(amount, token.decimals || 18),
                });
                await tx.wait();
            } else {
                // Send ERC20 token
                const contract = new ethers.Contract(
                    token.address,
                    ["function transfer(address to, uint256 value) returns (bool)"],
                    wallet
                );

                const tx = await contract.transfer(
                    toAddress,
                    ethers.parseUnits(amount, token.decimals)
                );
                await tx.wait();
            }

            onClose();
        } catch (err) {
            console.error("❌ Send failed:", err);
        } finally {
            setLoading(false);
        }
    };


    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>Send {token?.symbol}</DialogTitle>
            <DialogContent>
                <TextField
                    label="Recipient Address"
                    fullWidth
                    margin="dense"
                    value={toAddress}
                    onChange={(e) => setToAddress(e.target.value)}
                />
                <TextField
                    label="Amount"
                    type="number"
                    fullWidth
                    margin="dense"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
                <Typography variant="body2" color="text.secondary">
                    Balance: {token?.balance} {token?.symbol}
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button disabled={loading} onClick={handleSend} variant="contained">
                    {loading ? "Sending..." : "Send"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SendTokenModal;
