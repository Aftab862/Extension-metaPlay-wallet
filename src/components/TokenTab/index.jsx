import {
    Avatar,
    Box,
    Menu,
    MenuItem,
    Typography,
    CircularProgress,
    useTheme,
    alpha,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import FilterListIcon from "@mui/icons-material/FilterList";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { getTokenIconUrl, mapColors } from "../../utils/helper";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import ImportTokenDialog from "../TokenImportModal";
import { ethers } from "ethers";
import { saveToLocalStorage } from "../../utils/storage";
import { CHAIN_LIST } from "../../utils/keys";
import TokenDetailsModal from "./TokenDetailsModal";
import SendTokenModal from "./SendTokenModal";
import ReceiveTokenModal from "./ReceiveTokenModal";
import ReceiveModal from "../Transction/Receive";
import TokenAvatar from "./TokenAvatar";
import { chainIcons } from "../../Assets/chainIconsUrls.js";


const TokensTab = ({ selectedChain, userWalletAddress, setAllChains, referesh,
    AccountTitle,
    Account,
    setReferesh, userBalance }) => {
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [importOpen, setImportOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedToken, setSelectedToken] = useState(null);
    const [tokenModal, setTokenModal] = useState(false);

    const [sendOpen, setSendOpen] = useState(false);
    const [receiveOpen, setReceiveOpen] = useState(false);

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
                            {

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
    }, [userWalletAddress, setAllChains, userBalance]);
    const theme = useTheme();


    return (
        <div>
            <Box
                p={2}
                sx={{
                    bgcolor: "background.paper",
                    borderRadius: 3,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,

                        pb: 1,
                    }}
                >
                    <Typography fontWeight="bold" fontSize="1.05rem" pl={1}>
                        {selectedChain?.name}
                    </Typography>

                    <Box display="flex" gap={1}>
                        <FilterListIcon
                            sx={{
                                color: "text.secondary",
                                cursor: "pointer",
                                "&:hover": { color: theme.palette.primary.main },
                            }}
                        />
                        <MoreVertIcon
                            onClick={handleMenuOpen}
                            sx={{
                                color: "text.secondary",
                                cursor: "pointer",
                                "&:hover": { color: theme.palette.primary.main },
                            }}
                        />
                    </Box>
                </Box>

                {/* Token list area */}
                <Box
                    sx={{
                        height: "34vh",
                        overflowY: "auto",
                        pr: 1,
                        "&::-webkit-scrollbar": {
                            width: "6px",
                        },
                        "&::-webkit-scrollbar-thumb": {
                            backgroundColor: alpha(theme.palette.primary.main, 0.3),
                            borderRadius: "8px",
                        },
                        "&::-webkit-scrollbar-thumb:hover": {
                            backgroundColor: alpha(theme.palette.primary.main, 0.5),
                        },
                    }}
                >
                    {loading ? (
                        <Box display="flex" justifyContent="center" py={3}>
                            <CircularProgress size={24} />
                        </Box>
                    ) : (
                        <>
                            {/* Native chain header */}
                            <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                p={1.5}
                                mb={1}
                                borderRadius={2}
                                sx={{
                                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                                    transition: "background 0.2s ease",
                                    "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.08) },
                                }}
                            >
                                <Box display="flex" alignItems="center" gap={1.5}>
                                    <Avatar
                                        src={chainIcons(selectedChain.nativeCurrency?.symbol)}
                                        sx={{ width: 38, height: 38 }}
                                    />
                                    <Box>
                                        <Typography fontWeight="bold">
                                            {selectedChain?.nativeCurrency?.name}
                                        </Typography>
                                        <Typography fontSize="0.8rem" color="text.secondary">
                                            Native
                                        </Typography>
                                    </Box>
                                </Box>

                                <Typography fontWeight="bold">
                                    {userBalance ?? "$0.00"}
                                </Typography>
                            </Box>

                            {/* Token List */}
                            {selectedChain?.tokens?.length > 0 ? (
                                selectedChain.tokens.map((t) => {
                                    const tokenIconUrl = getTokenIconUrl(
                                        selectedChain?.chainId,
                                        t.address
                                    );

                                    return (
                                        <Box
                                            key={t.address || t.symbol}
                                            display="flex"
                                            justifyContent="space-between"
                                            alignItems="center"
                                            px={1.5}
                                            py={1.2}
                                            borderRadius={2}
                                            mb={0.5}
                                            onClick={() => {
                                                setSelectedToken(t);
                                                setTokenModal(true);
                                            }}
                                            sx={{
                                                cursor: "pointer",
                                                transition: "background 0.2s ease, transform 0.1s ease",
                                                "&:hover": {
                                                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                                                    transform: "scale(1.01)",
                                                },
                                            }}
                                        >
                                            <Box display="flex" alignItems="center" gap={1.5}>
                                                <TokenAvatar
                                                    iconUrl={tokenIconUrl}
                                                    symbol={t.symbol}
                                                    size={32}
                                                />
                                                <Box>
                                                    <Typography fontWeight="500">{t.name}</Typography>
                                                    {t?.address && (
                                                        <Typography
                                                            fontSize="0.75rem"
                                                            color="text.secondary"
                                                        >
                                                            {t.address.slice(0, 6)}...{t.address.slice(-4)}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Box>

                                            <Box textAlign="right">
                                                <Typography fontWeight="500">{t.balance}</Typography>
                                                <Typography fontSize="0.8rem" color="text.secondary">
                                                    {t.symbol}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    );
                                })
                            ) : (
                                <Typography color="text.secondary" py={2} textAlign="center">
                                    No tokens found
                                </Typography>
                            )}
                        </>
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
            {importOpen && <ImportTokenDialog
                open={importOpen}
                onClose={() => setImportOpen(false)}
                rpcUrl={selectedChain?.rpcUrl}
                userWalletAddress={userWalletAddress}
                setAllChains={setAllChains}
                referesh={referesh}
                setReferesh={setReferesh}
            />
            }


            <TokenDetailsModal
                open={tokenModal}
                token={selectedToken}
                onClose={() => setTokenModal(false)}
                onSend={() => { setSendOpen(true); setTokenModal(false) }}
                onReceive={() => { setReceiveOpen(true); }}
            />

            {sendOpen && <SendTokenModal
                open={sendOpen}
                onClose={() => setSendOpen(false)}
                token={selectedToken}
                userWallet={userWalletAddress}
                rpcUrl={selectedChain?.rpcUrl}
                explorer={selectedChain?.explorerUrl}
                chainId={selectedChain?.chainId}
                chainName={selectedChain?.nativeCurrency?.name}
                AccountTitle={AccountTitle}
                Account={Account}
            />}

            {receiveOpen && <ReceiveModal
                open={receiveOpen}
                onClose={() => setReceiveOpen(false)}
                address={selectedToken?.address || ""}
                AccountTitile={selectedToken?.name || ""}
            />}

        </div>
    );
};

export default TokensTab;
