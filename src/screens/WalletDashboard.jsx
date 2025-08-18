import React, { useState, useMemo } from "react";
import {
    Box,
    Typography,
    Grid,
    Avatar,
    IconButton
} from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import MenuIcon from "@mui/icons-material/Menu";

import { EVM_CHAINS } from "../config/chain";
import ChainSelectorModal from "../components/ChainSelectorModal";
import AccountSelectorModal from "../components/AccountSelectorModal";
import { mapColors } from "../utils/helper";
import Loader from "../components/Loader";
import ImportWalletModal from "../components/ImportWalletModal";
import ImportWalletScreen from "./ImportWallet";
import { generateWalletFromMnemonic, normalizeWalletObject, persistWalletState } from "../utils/walletUtils";
import { ethers } from "ethers";

const fmt = (value, decimals = 4) => {
    const num = Number(value);
    return isFinite(num) ? num.toFixed(decimals) : "0.0000";
};

const actionItems = [
    { label: "Send", icon: <ArrowUpwardIcon /> },
    { label: "Receive", icon: <ArrowDownwardIcon /> },
    { label: "Buy", icon: <ShoppingCartIcon /> },
    { label: "Swap", icon: <SwapHorizIcon /> },
];

const WalletDashboard = ({
    wallets = [],
    selectedWalletIndex = 0,
    selectedAccountIndex = 0,
    onSelectAccount,
    onAddAccount,
    setSelectedWalletIndex,
    setSelectedAccountIndex,
    setWallets,
    loading = false
}) => {
    const [chainModalOpen, setChainModalOpen] = useState(false);
    const [accountModalOpen, setAccountModalOpen] = useState(false);
    const [selectedChain, setSelectedChain] = useState(EVM_CHAINS?.[0] || { name: "", nativeSymbol: "" });
    const [importModalOpen, setImportModalOpen] = React.useState(false);
    const [step, setStep] = React.useState(false);

    const [chainBalances, setChainBalances] = useState({
        native: "0",
        tokens: [],
        loading: false
    });

    // Get the current wallet & account
    const selectedWallet = wallets[selectedWalletIndex] || null;
    const selectedAccount = selectedWallet?.accounts?.[selectedAccountIndex] || null;

    const evmAddress = useMemo(
        () => selectedAccount?.chains?.find(c => c.type === "evm")?.address || null,
        [selectedAccount]
    );

    if (loading) return <Loader message="Adding account..." />;
    if (!selectedWallet || !selectedAccount) {
        console.warn(`WalletDashboard: No account found for wallet ${selectedWalletIndex}, account ${selectedAccountIndex}`);
        return <Loader message="Loading wallet..." />;
    }


    const handleImportTypeSelect = (type) => {
        if (type === "mnemonic") {
            setStep("importMnemonic");
        } else {
            setStep("importPrivateKey");
        }
    };

    const handleImportMnemonic = async (mnemonicFromUser) => {
        try {
            const currentWallets = [...wallets];

            // derive first account
            const firstAccount = await generateWalletFromMnemonic(mnemonicFromUser, 0);
            const newAddress = firstAccount.evm.address;

            // check duplicates
            // check duplicates (normalize for case-insensitive match)
            // check duplicates by mnemonic
            const alreadyExists = currentWallets.some(
                (w) => w.mnemonic && w.mnemonic.trim().toLowerCase() === mnemonicFromUser.trim().toLowerCase()
            );

            if (alreadyExists) {
                alert("This recovery phrase is already imported.");
                setImportModalOpen(false);
                setStep("main");
                return;
            }

            // add new wallet with mnemonic stored
            const normalized = normalizeWalletObject(firstAccount, 0);
            const newWalletIndex = currentWallets.length;
            const updatedWallets = [
                ...currentWallets,
                { mnemonic: mnemonicFromUser.trim(), accounts: [normalized] }
            ];


            setWallets(updatedWallets);
            setSelectedWalletIndex(newWalletIndex);
            setSelectedAccountIndex(0);

            persistWalletState(updatedWallets, newWalletIndex, 0);
            setImportModalOpen(false);
            setStep("main");
        } catch (err) {
            console.error("Invalid mnemonic:", err);
            alert("Invalid recovery phrase. Please try again.");
        }
    };


    const handleImportPrivateKey = async (privateKey) => {
        try {
            const currentWallets = [...wallets];

            // Ensure "0x" prefix
            const normalizedKey = privateKey.startsWith("0x")
                ? privateKey
                : "0x" + privateKey;

            // Create wallet with ethers
            const wallet = new ethers.Wallet(normalizedKey);

            const newAddress = wallet.address.toLowerCase();

            // ✅ check duplicates across all wallets
            const alreadyExists = currentWallets.some((w) =>
                w.accounts.some((acc) =>
                    acc.chains.some((c) => c.address.toLowerCase() === newAddress)
                )
            );
            if (alreadyExists) {
                alert("This wallet is already imported.");
                setImportModalOpen(false);
                setStep("main");
                return;
            }

            // ✅ build the object in the same structure that normalizeWalletObject expects
            const walletObj = {
                evm: {
                    address: wallet.address,
                    privateKey: normalizedKey,
                },
            };

            const normalized = normalizeWalletObject(walletObj, 0);

            const newWalletIndex = currentWallets.length;
            const updatedWallets = [
                ...currentWallets,
                { accounts: [normalized] }
            ];

            setWallets(updatedWallets);
            setSelectedWalletIndex(newWalletIndex);
            setSelectedAccountIndex(0);

            persistWalletState(updatedWallets, newWalletIndex, 0);
            setImportModalOpen(false);
            setStep("main");
        } catch (err) {
            console.error("Invalid private key:", err);
            alert("Invalid private key. Please try again.");
        }
    };





    return (
        <Box>
            {/* Header */}
            <Box display="flex" alignItems="center" justifyContent="space-between" p={1} bgcolor="#1976d2">
                <Box
                    p={1}
                    display="flex"
                    alignItems="flex-start"
                    sx={{ cursor: "pointer" }}
                    onClick={() => setAccountModalOpen(true)}
                >
                    <Box>
                        <Typography variant="body2" color="white">
                            Wallet {selectedWalletIndex + 1}
                        </Typography>
                        <Typography variant="caption" color="white">
                            Account {selectedAccountIndex + 1}
                        </Typography>
                    </Box>
                    <Avatar sx={{ width: 28, height: 18, ml: 0.4, background: "#1976d2" }}>
                        {accountModalOpen ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
                    </Avatar>
                </Box>

                <Box display="flex" gap={1}>
                    <IconButton sx={{ color: "white" }} onClick={() => setChainModalOpen(true)}>
                        <LanguageIcon />
                    </IconButton>
                    <IconButton sx={{ color: "white" }}>
                        <MenuIcon />
                    </IconButton>
                </Box>
            </Box>

            {/* Balances */}

            {step === "importMnemonic" ? (
                <ImportWalletScreen
                    method="mnemonic"
                    onImport={handleImportMnemonic}
                    height="87vh"
                />
            ) : step === "importPrivateKey" ? (
                <ImportWalletScreen
                    method="privateKey"
                    onImport={handleImportPrivateKey}
                    height="63vh"
                />
            ) : (
                <>

                    <Box display="flex" flexDirection="column" alignItems="center" my={2}>
                        <Typography variant="h5" color="text.secondary">$0.00</Typography>
                        <Typography variant="subtitle2" color="text.secondary">Total Balance</Typography>
                    </Box>

                    {/* Actions */}
                    <Grid p={1} container spacing={2} textAlign="center">
                        {actionItems.map((item, index) => (
                            <Grid key={index} item xs={3}
                                display="flex"
                                flexDirection="column"
                                alignItems="center"
                            >
                                <Avatar sx={{ bgcolor: "#1976d2" }}>{item.icon}</Avatar>
                                <Typography>{item.label}</Typography>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Assets */}
                    <Box p={1}>
                        <Box display="flex" p={1} alignItems="center" sx={{ mt: 5 }}>
                            <Avatar sx={{ fontSize: "10px", bgcolor: mapColors(selectedChain.nativeSymbol), mr: 2 }}>
                                {selectedChain.nativeSymbol}
                            </Avatar>
                            <Box flexGrow={1}>
                                <Typography fontWeight="bold">{selectedChain.name}</Typography>
                                <Typography fontSize="0.8rem" color="gray">
                                    {evmAddress ? `${evmAddress.slice(0, 6)}...${evmAddress.slice(-4)}` : "No address"}
                                </Typography>
                            </Box>
                            <Box textAlign="right">
                                <Typography fontWeight="bold">
                                    {fmt(chainBalances.native)} {selectedChain.nativeSymbol}
                                </Typography>
                                <Typography fontSize="0.8rem" color="gray">Native</Typography>
                            </Box>
                        </Box>

                        <Box mt={0.5} p={2}>
                            {chainBalances.loading ? (
                                <Loader message="Loading tokens..." />
                            ) : chainBalances.tokens.length > 0 ? (
                                chainBalances.tokens.map((t) => (
                                    <Box
                                        key={t.address}
                                        display="flex"
                                        justifyContent="space-between"
                                        alignItems="center"
                                        py={1}
                                        borderBottom="1px solid #eee"
                                    >
                                        <Box>
                                            <Typography fontWeight="bold">{t.symbol}</Typography>
                                            <Typography fontSize="0.8rem" color="gray">
                                                {t.address.slice(0, 6)}...{t.address.slice(-4)}
                                            </Typography>
                                        </Box>
                                        <Box textAlign="right">
                                            <Typography>{fmt(t.balance)}</Typography>
                                        </Box>
                                    </Box>
                                ))
                            ) : (
                                <Typography color="text.secondary">No tokens found</Typography>
                            )}
                        </Box>
                    </Box>

                </>
            )}

            {/* Modals */}
            {chainModalOpen && (
                <ChainSelectorModal
                    open={chainModalOpen}
                    onClose={() => setChainModalOpen(false)}
                    chains={EVM_CHAINS || []}
                    selectedChain={selectedChain}
                    onSelect={setSelectedChain}
                />
            )}
            {accountModalOpen && selectedWallet && (
                <AccountSelectorModal
                    open={accountModalOpen}
                    onClose={() => setAccountModalOpen(false)}
                    wallet={wallets}
                    selectedWalletIndex={selectedWalletIndex}
                    selectedAccountIndex={selectedAccountIndex}
                    onSelectAccount={onSelectAccount}
                    onAddAccount={onAddAccount}
                    setImportModalOpen={setImportModalOpen}

                />
            )}

            {importModalOpen &&

                <ImportWalletModal
                    open={importModalOpen}
                    onClose={() => setImportModalOpen(false)}
                    onImportTypeSelect={handleImportTypeSelect}
                />
            }






        </Box>
    );
};


export default WalletDashboard;



