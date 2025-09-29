import React, { useState, useMemo, useEffect, Suspense, lazy } from "react";
import {
    Box,
    Typography,
    Grid,
    Avatar,
    IconButton
} from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import MenuIcon from "@mui/icons-material/Menu";

// Lazy loaded components
const ChainSelectorModal = lazy(() => import("../components/ChainSelectorModal"));
const AccountSelectorModal = lazy(() => import("../components/AccountSelectorModal"));
const Loader = lazy(() => import("../components/Loader"));
const ImportWalletModal = lazy(() => import("../components/ImportWalletModal"));
const ImportWalletScreen = lazy(() => import("./ImportWallet"));
const DashboardTabs = lazy(() => import("../components/DashboardTabs"));
const MenuListModal = lazy(() => import("../components/MenuList/Index"));
const AccountDetailsModal = lazy(() => import("../components/AccountDetails"));
const RevealSecretModal = lazy(() => import("../components/AccountDetails/RevealSecreteModal"));
const Transction = lazy(() => import("../components/Transction"));

// utils (keep these as normal imports because they’re small & used immediately)
import { mapColors } from "../utils/helper";
import { generateWalletFromMnemonic, normalizeWalletObject, persistWalletState } from "../utils/walletUtils";
import { ethers } from "ethers";
import { CHAIN_ID, SESSION_PASSWORD_KEY, WALLET_DATA_KEY } from "../utils/keys";
import { encryptMnemonic } from "../utils/cryptoUtils";
import { saveToLocalStorage } from "../utils/storage";


const WalletDashboard = ({
    wallets = [],
    selectedWalletIndex = 0,
    selectedAccountIndex = 0,
    onSelectAccount,
    onAddAccount,
    setSelectedWalletIndex,
    setSelectedAccountIndex,
    setWallets,
    loading,
    allChains,
    referesh,
    setReferesh,
    setSelectedChain,
    selectedChain,
    setAllChains
}) => {
    const [chainModalOpen, setChainModalOpen] = useState(false);
    const [accountModalOpen, setAccountModalOpen] = useState(false);
    const [menulist, setMenuList] = useState(false);
    const [importModalOpen, setImportModalOpen] = React.useState(false);
    const [step, setStep] = React.useState(false);
    const [userWalletAddress, setUserWalletAddress] = useState(null);
    const [accountDetailModal, setAccountdetailModal] = useState(false);
    const [currentAccount, setCurrentAccount] = useState(null);
    const [revelSecreteModal, setRevelSecreteModal] = useState(false);
    const [userBalance, setBalance] = useState(null);

    // Get the current wallet & account
    const selectedWallet = wallets[selectedWalletIndex] || null;
    const selectedAccount = selectedWallet?.accounts?.[selectedAccountIndex] || null;
    const [revealSecretType, setRevealSccretType] = useState(null);

    useEffect(() => {
        const address = selectedAccount?.chains?.find(c => c.type === "evm")?.address
        setUserWalletAddress(address);
    }, [selectedAccount]);


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

            const sessionPassword = localStorage.getItem(SESSION_PASSWORD_KEY);
            const decoded = atob(sessionPassword);
            const encryptedMenmonic = encryptMnemonic(mnemonicFromUser, decoded);

            // add new wallet with mnemonic stored
            const normalized = normalizeWalletObject(firstAccount, 0);
            const newWalletIndex = currentWallets.length;
            const updatedWallets = [
                ...currentWallets,
                {
                    walletType: "imported_seed",
                    mnemonic: encryptedMenmonic,
                    accounts: [normalized],
                }
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
                { mnemonic: null, walletType: "imported_pk", accounts: [normalized] }
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

    const handleChainSwitch = (userSelectedChain) => {
        saveToLocalStorage(CHAIN_ID, userSelectedChain?.chainId)
        setSelectedChain(userSelectedChain);
    }

    const onUpdateAccountName = (wId, aId, newName) => {
        console.log("wId,aId,newName", wId, aId, newName);

        setWallets((prevWallets) => {
            // clone current wallets
            const updatedWallets = [...prevWallets];

            // clone the specific wallet
            const targetWallet = { ...updatedWallets[wId] };

            // clone accounts array
            const updatedAccounts = [...targetWallet.accounts];

            // clone and update specific account
            const updatedAccount = {
                ...updatedAccounts[aId],
                accountName: newName,
            };

            updatedAccounts[aId] = updatedAccount;
            targetWallet.accounts = updatedAccounts;
            updatedWallets[wId] = targetWallet;


            // ✅ Save to localStorage with the same structure
            const dataToPersist = {
                wallets: updatedWallets,
                selectedWalletIndex: wId,
                selectedAccountIndex: aId,
            };
            localStorage.setItem(WALLET_DATA_KEY, JSON.stringify(dataToPersist));

            console.log("updated wallets :", dataToPersist)

            return updatedWallets;
        });
    };

    const handleAccountDetails = (currentAccount) => {
        setAccountdetailModal(true);
        setAccountModalOpen(false)
        setCurrentAccount(currentAccount);
    }

    const handleSecretePhrases = (data) => {
        setRevealSccretType(data);
        setRevelSecreteModal(true);
        setAccountdetailModal(false);

    }

    const handleMenuClick = (action) => {
        switch (action) {
            case "account-details":
                setAccountdetailModal(true)
                break;
            case "explorer":
                window.open("https://etherscan.io", "_blank");
                break;
            case "expand":
                console.log("Expand view triggered");
                break;
            case "networks":
                console.log("Open networks modal");
                break;
            case "settings":
                console.log("Navigate to settings");
                break;
            case "lock":
                console.log("Lock wallet");
                break;
            default:
                break;
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
                    <IconButton sx={{ color: "white" }} onClick={() => setMenuList(true)} >
                        <MenuIcon />
                    </IconButton>
                </Box>
            </Box>

            {/* Balances */}

            {step === "importMnemonic" ? (
                <ImportWalletScreen
                    method="mnemonic"
                    onImport={handleImportMnemonic}
                    height="85vh"
                    setStep={setStep}
                />
            ) : step === "importPrivateKey" ? (
                <ImportWalletScreen
                    method="privateKey"
                    onImport={handleImportPrivateKey}
                    height="63vh"
                    setStep={setStep}
                />
            ) : (
                <>

                    {/* Transction */}

                    <Transction
                        userWalletAddress={userWalletAddress}
                        wallet={wallets}
                        selectedChain={selectedChain}
                        userBalance={userBalance}
                        setBalance={setBalance}
                    />

                    {/* Assets */}
                    <DashboardTabs
                        setSelectedChain={setSelectedChain}
                        selectedChain={selectedChain}
                        setAllChains={setAllChains}
                        referesh={referesh}
                        setReferesh={setReferesh}
                        userWalletAddress={userWalletAddress}
                        userBalance={userBalance}
                        setBalance={setBalance}
                    />
                </>
            )}

            {/* Modals */}
            {chainModalOpen && (
                <ChainSelectorModal
                    open={chainModalOpen}
                    onClose={() => setChainModalOpen(false)}
                    chains={allChains || []}
                    selectedChain={selectedChain}
                    onSelect={handleChainSwitch}
                    setReferesh={setReferesh}
                    referesh={referesh}

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
                    onUpdateAccountName={onUpdateAccountName}
                    handleAccountDetails={handleAccountDetails}

                />
            )}

            {importModalOpen &&

                <ImportWalletModal
                    open={importModalOpen}
                    onClose={() => setImportModalOpen(false)}
                    onImportTypeSelect={handleImportTypeSelect}
                />
            }

            {menulist &&
                <MenuListModal
                    open={menulist}
                    onClose={() => setMenuList(false)}
                    onMenuClick={handleMenuClick}
                    setCurrentAccount={setCurrentAccount}
                    selectedWalletIndex={selectedWalletIndex}
                    selectedAccountIndex={selectedAccountIndex}
                    wallet={wallets}
                />
            }

            {accountDetailModal && currentAccount &&

                <AccountDetailsModal
                    open={accountDetailModal}
                    onClose={() => setAccountdetailModal(false)}
                    currentAccount={currentAccount}
                    wallet={wallets}
                    handleSecretePhrases={handleSecretePhrases}

                />
            }

            {revelSecreteModal &&

                <RevealSecretModal
                    open={revelSecreteModal}
                    onClose={() => setRevelSecreteModal(false)}
                    currentAccount={currentAccount}
                    wallet={wallets}
                    secretType={revealSecretType}
                />
            }






        </Box>
    );
};


export default WalletDashboard;



