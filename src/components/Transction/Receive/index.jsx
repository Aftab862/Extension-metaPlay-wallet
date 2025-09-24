import React, { useMemo } from "react";
import { Dialog, DialogTitle, DialogContent, IconButton, Box, Typography, Tooltip, Button } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CloseIcon from "@mui/icons-material/Close";
import { QRCodeCanvas } from "qrcode.react";
import ImgIcon from "../../../../public/icons/icon1.png";
import { findAccountNameOrIndex } from "../../../utils/helper";

const ReceiveModal = ({ open, onClose, address, wallet }) => {
    const [copied, setCopied] = React.useState(false);
    const AccountName = useMemo(
        () => findAccountNameOrIndex(wallet, address),
        [wallet, address]
    );


    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Copy failed", err);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                Receive
                <IconButton size="small" onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ textAlign: "center", pb: 4 }}>
                {/* QR Code */}
                <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                    <QRCodeCanvas value={address} size={180} bgColor="#ffffff" fgColor="#333"
                        imageSettings={{
                            src: ImgIcon,
                            x: undefined,
                            y: undefined,
                            height: 30,
                            width: 30,
                            opacity: 1,
                            excavate: true,
                        }}
                    />
                </Box>
                <Typography
                    variant="h6"
                    sx={{
                        wordBreak: "break-all",
                        fontWeight: 500,
                        mb: 2,
                        px: 1,
                    }}
                >
                    {typeof AccountName === "string" && AccountName.trim() !== ""
                        ? AccountName
                        : `Account ${AccountName + 1}`}

                </Typography>

                {/* Address text */}
                <Typography
                    variant="body2"
                    sx={{
                        wordBreak: "break-all",
                        fontWeight: 500,
                        mb: 2,
                        px: 1,
                    }}
                >
                    {address}
                </Typography>

                {/* Copy button */}
                <Tooltip title={copied ? "Copied!" : "Copy address"}>
                    <Button
                        variant="contained"
                        onClick={handleCopy}
                        startIcon={<ContentCopyIcon />}
                        sx={{
                            textTransform: "none",
                            borderRadius: "30px",
                            backgroundColor: "#1976d2",
                            "&:hover": { backgroundColor: "#155fa0" },
                        }}
                    >
                        {copied ? "Copied" : "Copy Address"}
                    </Button>
                </Tooltip>
            </DialogContent>
        </Dialog>
    );
};

export default ReceiveModal;
