import {
    Avatar,
    Box,
    Menu,
    MenuItem,
    Typography,
} from "@mui/material";
import React, { useState } from "react";
import FilterListIcon from "@mui/icons-material/FilterList";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { mapColors } from "../utils/helper";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import ImportTokenDialog from "./TokenImportModal";

const TokensTab = ({ selectedChain, userWalletAddress, setAllChains }) => {
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [importOpen, setImportOpen] = useState(false);

    const handleMenuOpen = (event) => setMenuAnchor(event.currentTarget);
    const handleMenuClose = () => setMenuAnchor(null);

    const handleImportClick = () => {
        setImportOpen(true);
        handleMenuClose();
    };

    return (
        <div>
            <Box p={1}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Box display="flex" p={1} alignItems="center">
                        <Avatar
                            sx={{
                                fontSize: "10px",
                                bgcolor: mapColors(selectedChain?.nativeSymbol),
                                mr: 1,
                            }}
                        >
                            {selectedChain?.nativeSymbol}
                        </Avatar>
                        <Typography fontWeight="bold">
                            {selectedChain?.name.split(" ")[0]}
                        </Typography>
                    </Box>
                    <Box display="flex" gap={1}>
                        <FilterListIcon />
                        <MoreVertIcon onClick={handleMenuOpen} />
                    </Box>
                </Box>

                <Box px={2}>
                    {selectedChain?.tokens.length > 0 ? (
                        selectedChain?.tokens.map((t) => (
                            <Box
                                key={t.address}
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                py={1}
                                borderBottom="1px solid #eee"
                            >
                                <Box>
                                    <Typography fontWeight="bold">{t.name}</Typography>
                                    {t?.address && (
                                        <Typography fontSize="0.8rem" color="gray">
                                            {t?.address?.slice(0, 6)}...{t?.address?.slice(-4)}
                                        </Typography>
                                    )}
                                </Box>
                                <Box textAlign="right">
                                    <Typography>{t.balance}</Typography>
                                </Box>
                            </Box>
                        ))
                    ) : (
                        <Typography color="text.secondary">No tokens found</Typography>
                    )}
                </Box>
            </Box>

            {/* Menu */}
            <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
                <MenuItem onClick={handleImportClick}>
                    <AddIcon sx={{ mr: 1 }} /> Import tokens
                </MenuItem>
                <MenuItem>
                    <RefreshIcon sx={{ mr: 1 }} /> Refresh list
                </MenuItem>
            </Menu>

            {/* Import Token Modal */}
            <ImportTokenDialog
                open={importOpen}
                onClose={() => setImportOpen(false)}
                rpcUrl={selectedChain?.rpcUrl}
                userWalletAddress={userWalletAddress}
                setAllChains={setAllChains}
            />
        </div>
    );
};

export default TokensTab;
