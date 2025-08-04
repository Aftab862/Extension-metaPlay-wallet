// src/components/WalletInfo.jsx
import React from "react";
import { Typography, Box } from "@mui/material";

const WalletInfo = ({ wallet }) => (
    <Box mt={3}>
        <Typography variant="subtitle2">Address:</Typography>
        <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
            {wallet?.address}
        </Typography>

        <Typography variant="subtitle2" mt={1}>Private Key:</Typography>
        <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
            {wallet?.privateKey}
        </Typography>
    </Box>
);

export default WalletInfo;
