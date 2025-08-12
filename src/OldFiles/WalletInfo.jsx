// src/components/WalletInfo.jsx
import React from "react";
import { Typography, Box } from "@mui/material";

const WalletInfo = ({ wallet }) => {
    if (!wallet) return null;

    return (
        <Box mt={3}>
            {wallet.chains.map((chain) => (
                <Box key={chain.type} mb={2}>
                    <Typography variant="h6" textTransform="capitalize">
                        {chain.type} Wallet
                    </Typography>

                    <Typography variant="subtitle2">Address:</Typography>
                    <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                        {chain.address || "N/A"}
                    </Typography>

                    <Typography variant="subtitle2" mt={1}>
                        Private Key:
                    </Typography>
                    <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                        {chain.privateKey || "N/A"}
                    </Typography>
                </Box>
            ))}
        </Box>
    );
};

export default WalletInfo;
