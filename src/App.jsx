
// import { Container } from '@mui/material';
// import React, { useEffect } from 'react'
// import { generateWalletFromMnemonic } from './utils/walletUtils';
// const mnemonic = "lunar innocent smart rare long sell cash hobby various render nest swap"
// const App = () => {

//     useEffect(() => {
//         (async () => {
//             const wallets = await generateWalletFromMnemonic(mnemonic);
//             console.log("wallets:", wallets);
//         })();
//     }, []);


//     return (
//         <Container sx={{ my: 2, width: 360, py: 5 }}>
//             <span>Testing</span>
//         </Container>
//     )
// }

// export default App;



import React, { useEffect, useState, lazy, Suspense, useMemo, useCallback } from "react";
import { Container } from "@mui/material";
import { Wallet } from "ethers";
import {
    encryptMnemonic,
    decryptMnemonic,
    isMnemonicStored,
} from "./utils/cryptoUtils";
import {
    generateWalletFromMnemonic,
    normalizeWalletObject,
} from "./utils/walletUtils";
import Loader from "./components/Loader";
import {
    isSessionValid,
    saveLoginTime,
} from "./utils/sessionUtils";
import {
    loadFromLocalStorage,
    saveToLocalStorage,
} from "./utils/storage";

import ImportWalletScreen from "./screens/ImportWallet";
const PasswordScreen = lazy(() => import("./screens/Password"));
const SavePhraseScreen = lazy(() => import("./screens/SavePhraseScreen"));
const WalletDashboard = React.memo(lazy(() => import("./screens/WalletDashboard"))); // ✅ memoized
const WelcomeScreen = lazy(() => import("./screens/Welcome"));

const SESSION_PASSWORD_KEY = "session-password";
const WALLET_DATA_KEY = "wallet-data";

const App = () => {
    const [step, setStep] = useState("checking");
    const [mnemonic, setMnemonic] = useState("");
    const [password, setPassword] = useState("");
    const [wallets, setWallets] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isSessionValid()) {
            localStorage.removeItem(SESSION_PASSWORD_KEY);
        }
    }, []);

    useEffect(() => {
        const init = () => {
            const stored = isMnemonicStored();
            const walletData = loadFromLocalStorage(WALLET_DATA_KEY);
            if (stored && isSessionValid() && walletData) {
                const sessionPassword = localStorage.getItem(SESSION_PASSWORD_KEY);
                if (sessionPassword) {
                    const decodedPassword = atob(sessionPassword);
                    const decrypted = decryptMnemonic(decodedPassword);
                    if (decrypted) {
                        setPassword(decodedPassword);
                        setMnemonic(decrypted);
                        setWallets(walletData?.wallets || []);
                        setSelectedIndex(walletData?.selectedIndex || 0);
                        setStep("main");
                        return;
                    }
                }
            }
            if (stored) setStep("enter-password");
            else setStep("welcome");
        };
        init();
    }, []);

    const handlePasswordSubmit = async (inputPassword) => {
        if (!inputPassword.trim()) {
            setError("Password is required.");
            return;
        }
        const encrypted = localStorage.getItem("encrypted-mnemonic");
        if (encrypted) {
            const decrypted = decryptMnemonic(inputPassword);
            if (decrypted) {
                localStorage.setItem(SESSION_PASSWORD_KEY, btoa(inputPassword));
                saveLoginTime();
                setPassword(inputPassword);
                setMnemonic(decrypted);
                const walletData = loadFromLocalStorage(WALLET_DATA_KEY);
                if (walletData?.wallets?.length) {
                    setWallets(walletData.wallets);
                    setSelectedIndex(walletData?.selectedIndex || 0);
                    setStep("main");
                } else {
                    const firstWallet = await generateWalletFromMnemonic(decrypted, 0);
                    const normalized = normalizeWalletObject(firstWallet, 0);
                    const initialWallets = [normalized];
                    setWallets(initialWallets);
                    setSelectedIndex(0);
                    saveToLocalStorage(WALLET_DATA_KEY, {
                        wallets: initialWallets,
                        selectedIndex: 0,
                        accountCount: 1,
                    });
                    setStep("main");
                }
            } else {
                setError("Invalid password.");
            }
        } else {
            localStorage.setItem(SESSION_PASSWORD_KEY, btoa(inputPassword));
            saveLoginTime();
            setPassword(inputPassword);
            encryptMnemonic(mnemonic, inputPassword);
            const firstWallet = await generateWalletFromMnemonic(mnemonic, 0);
            const normalized = normalizeWalletObject(firstWallet, 0);
            const initialWallets = [normalized];
            setWallets(initialWallets);
            setSelectedIndex(0);
            saveToLocalStorage(WALLET_DATA_KEY, {
                wallets: initialWallets,
                selectedIndex: 0,
                accountCount: 1,
            });
            setStep("save-phrase");
        }
    };
    const handleSavePhraseContinue = () => {
        setStep("main");
    };

    const handleImportMnemonic = (mnemonicFromUser) => {
        setMnemonic(mnemonicFromUser);
        setStep("set-password");
    };
    const handleAddAccount = async () => {
        setLoading(true);
        const newIndex = wallets.length;
        const newWallet = await generateWalletFromMnemonic(mnemonic, newIndex);
        const normalized = normalizeWalletObject(newWallet, newIndex);
        const updatedWallets = [...wallets, normalized];
        setWallets(updatedWallets);
        setSelectedIndex(newIndex);

        saveToLocalStorage(WALLET_DATA_KEY, {
            wallets: updatedWallets,
            selectedIndex: newIndex,
            accountCount: updatedWallets.length,
        });

        setLoading(false);
    };

    const handleSelectAccount = useCallback((index) => {
        setSelectedIndex(index);
        const walletData = loadFromLocalStorage(WALLET_DATA_KEY) || {};
        saveToLocalStorage(WALLET_DATA_KEY, {
            ...walletData,
            selectedIndex: index,
        });
    }, []);

    // ✅ Memoized props to avoid re-renders
    const memoizedWallets = useMemo(() => wallets, [wallets]);
    const memoizedSelectedIndex = useMemo(() => selectedIndex, [selectedIndex]);

    return (
        <Container sx={{ m: 0, p: 0, width: 360, height: 550 }}>
            <Suspense fallback={<Loader />}>
                {step === "checking" && <Loader message="Initializing..." />}
                {step === "welcome" && (
                    <WelcomeScreen
                        onCreateWallet={() => {
                            const newMnemonic = Wallet.createRandom().mnemonic?.phrase;
                            if (!newMnemonic) return;
                            setMnemonic(newMnemonic);
                            setStep("set-password");
                        }}
                        onImportWallet={() => setStep("import-wallet")}
                    />
                )}
                {step === "import-wallet" && (
                    <ImportWalletScreen onImport={handleImportMnemonic} />
                )}
                {(step === "set-password" || step === "enter-password") && (
                    <PasswordScreen
                        mode={step === "set-password" ? "create" : "enter"}
                        onPasswordSubmit={handlePasswordSubmit}
                        error={error}
                    />
                )}
                {step === "save-phrase" && (
                    <SavePhraseScreen
                        mnemonic={mnemonic}
                        onContinue={handleSavePhraseContinue}
                    />
                )}
                {step === "main" && (
                    <WalletDashboard
                        wallets={memoizedWallets}
                        selectedIndex={memoizedSelectedIndex}
                        onSelect={handleSelectAccount}
                        onAddAccount={handleAddAccount}
                        loading={loading}
                    />
                )}
            </Suspense>
        </Container>
    );
};

export default App;

