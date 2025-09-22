import {
    Avatar,
    Box,
    Menu,
    MenuItem,
    Typography,
    CircularProgress
} from "@mui/material";
import React, { useEffect, useState } from "react";
import FilterListIcon from "@mui/icons-material/FilterList";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { mapColors } from "../utils/helper";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import ImportTokenDialog from "./TokenImportModal";
import { ethers } from "ethers";
import { saveToLocalStorage } from "../utils/storage";
import { CHAIN_LIST } from "../utils/keys";

const TokensTab = ({ selectedChain, userWalletAddress, setAllChains, referesh, setReferesh }) => {
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [importOpen, setImportOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleMenuOpen = (event) => setMenuAnchor(event.currentTarget);
    const handleMenuClose = () => setMenuAnchor(null);

    const handleImportClick = () => {
        setImportOpen(true);
        handleMenuClose();
    };



    useEffect(() => {
        const fetchBalances = async () => {
            if (!userWalletAddress || !selectedChain?.tokens?.length) return;

            setLoading(true);
            const provider = new ethers.JsonRpcProvider(selectedChain.rpcUrl);

            try {
                const updatedTokens = await Promise.all(
                    selectedChain.tokens.map(async (t) => {
                        try {
                            if (t.isNative) {
                                // native coin balance
                                const rawBalance = await provider.getBalance(userWalletAddress);
                                const formatted = ethers.formatUnits(rawBalance, t.decimals);

                                return {
                                    ...t,
                                    balance: parseFloat(formatted).toFixed(4),
                                };
                            } else {
                                // ERC-20 balance
                                const contract = new ethers.Contract(
                                    t.address,
                                    ["function balanceOf(address owner) view returns (uint256)"],
                                    provider
                                );
                                const rawBalance = await contract.balanceOf(userWalletAddress);
                                const formatted = ethers.formatUnits(rawBalance, t.decimals);

                                return {
                                    ...t,
                                    balance: parseFloat(formatted).toFixed(4),
                                };
                            }
                        } catch (err) {
                            console.error(`❌ Failed fetching balance for ${t.symbol}:`, err);
                            return { ...t, balance: "0" };
                        }
                    })
                );

                setAllChains((prev) =>
                    prev.map((chain) =>
                        chain.chainId === selectedChain.chainId
                            ? { ...chain, tokens: updatedTokens }
                            : chain
                    )
                );
            } catch (err) {
                console.error("❌ Error in fetchBalances:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchBalances();
    }, [userWalletAddress, setAllChains]);


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

                <Box px={2} sx={{ height: "32vh", overflowY: "auto" }}>
                    {loading ? (
                        <Box display="flex" justifyContent="center" py={3}>
                            <CircularProgress size={24} />
                        </Box>
                    ) : selectedChain?.tokens.length > 0 ? (
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
                                            {t.isNative
                                                ? "Native"
                                                : `${t.address.slice(0, 6)}...${t.address.slice(-4)}`}
                                        </Typography>
                                    )}
                                </Box>

                                <Box textAlign="right">
                                    <Typography>{t.balance}</Typography>
                                    <Typography>{t.symbol}</Typography>
                                </Box>
                            </Box>
                        ))
                    ) : (
                        <Typography color="text.secondary">No tokens found</Typography>
                    )}
                </Box>
            </Box>

            {/* Menu */}
            <Menu disableScrollLock anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
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
                referesh={referesh}
                setReferesh={setReferesh}
            />
        </div>
    );
};

export default TokensTab;
