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
import { mapColors } from "../../utils/helper";
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

    console.log("selected account , ", Account, AccountTitle)
    console.log("selected chain , ", selectedChain)



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
                                bgcolor: mapColors(selectedChain?.nativeCurrency?.symbol),
                                mr: 1,
                            }}
                        >
                            {selectedChain?.nativeCurrency?.symbol}
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
                    ) : (
                        <>
                            {/* Chain header */}
                            <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                py={1.5}
                            >
                                <Box>
                                    <Typography fontWeight="bold">
                                        {selectedChain?.nativeCurrency?.name}
                                    </Typography>
                                    <Typography fontSize="0.85rem" color="text.secondary">
                                        Native
                                    </Typography>
                                </Box>
                                <Box textAlign="right">
                                    <Typography fontWeight="bold">
                                        {userBalance ?? "$0.00"}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Token list */}
                            {selectedChain?.tokens?.length > 0 ? (
                                selectedChain.tokens.map((t) => (
                                    <Box
                                        key={t.address || t.symbol}
                                        display="flex"
                                        justifyContent="space-between"
                                        alignItems="center"
                                        py={1.2}
                                        borderBottom="1px solid #f4f4f4"
                                        onClick={() => { setSelectedToken(t); setTokenModal(true) }}
                                        sx={{ cursor: "pointer", "&:hover": { bgcolor: "#fafafa" } }}
                                    >
                                        <Box>
                                            <Typography fontWeight="500">{t.name}</Typography>
                                            {t?.address && (
                                                <Typography fontSize="0.75rem" color="text.secondary">
                                                    {t.address.slice(0, 6)}...{t.address.slice(-4)}
                                                </Typography>
                                            )}
                                        </Box>
                                        <Box textAlign="right">
                                            <Typography fontWeight="500">{t.balance}</Typography>
                                            <Typography fontSize="0.8rem" color="text.secondary">
                                                {t.symbol}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))
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
                chainId={selectedChain?.chainId}
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
