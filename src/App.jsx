import React, { useEffect, useState, lazy, Suspense, useMemo, useCallback } from "react";
import { Container } from "@mui/material";
import { Wallet } from "ethers";
import { encryptMnemonic, decryptMnemonic, isWalletAvalailable } from "./utils/cryptoUtils";
import { isSessionValid, saveLoginTime } from "./utils/sessionUtils";
import {
    generateWalletFromMnemonic,
    normalizeWalletObject,
    loadWalletState,
    persistWalletState,
    createInitialNestedState,
    ensureNestedShape,
} from "./utils/walletUtils";

import Loader from "./components/Loader";
import ImportWalletScreen from "./screens/ImportWallet";
import { initChains, loadFromLocalStorage, saveToLocalStorage } from "./utils/storage";
import { CHAIN_ID, SESSION_PASSWORD_KEY, WALLET_DATA_KEY } from "./utils/keys";
import VerifyPhraseScreen from "./screens/VerifyPhrases";
const PasswordScreen = lazy(() => import("./screens/Password"));
const SavePhraseScreen = lazy(() => import("./screens/SavePhraseScreen"));
const WalletDashboard = React.memo(lazy(() => import("./screens/WalletDashboard")));
const WelcomeScreen = lazy(() => import("./screens/Welcome"));


const App = () => {
    const [step, setStep] = useState("checking");
    const [mnemonic, setMnemonic] = useState("");
    const [password, setPassword] = useState("");

    // Nested state
    // wallets: [{ accounts: [ { accountIndex, chains: [...] }, ... ] }]
    const [wallets, setWallets] = useState([]);
    const [selectedWalletIndex, setSelectedWalletIndex] = useState(0);
    const [selectedAccountIndex, setSelectedAccountIndex] = useState(0);
    const [referesh, setReferesh] = useState(false);
    const [allChains, setAllChains] = useState([])
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedChain, setSelectedChain] = useState();


    const GetChains = () => {
        const response = initChains();
        if (response) return response;
        return null;
    }


    useEffect(() => {
        setLoading(true);
        const cId = loadFromLocalStorage(CHAIN_ID)
        const result = GetChains();
        const hasSelectedChain = result.find((res) => res.chainId === cId);
        setAllChains(result);
        console.log("result", hasSelectedChain, result)
        setSelectedChain(hasSelectedChain ? hasSelectedChain : result[0]);
        setLoading(false);

    }, [referesh])

    useEffect(() => {
        if (!allChains?.length) return;
        const cId = loadFromLocalStorage(CHAIN_ID);
        const hasSelectedChain = allChains.find((res) => res.chainId === cId);
        setSelectedChain(hasSelectedChain ? hasSelectedChain : allChains[0]);
    }, [allChains]);






    /* Init on mount (with legacy migration) */
    useEffect(() => {
        const init = () => {
            const stored = isWalletAvalailable();
            const saved = loadWalletState();

            if (stored && isSessionValid() && saved) {
                const sessionPassword = localStorage.getItem(SESSION_PASSWORD_KEY);
                if (sessionPassword) {
                    const decoded = atob(sessionPassword);
                    let userMenemonics = saved?.wallets[0].mnemonic;

                    const decrypted = decryptMnemonic(userMenemonics, decoded);

                    if (decrypted) {
                        setPassword(decoded);
                        setMnemonic(decrypted);

                        setWallets(saved.wallets || []);
                        setSelectedWalletIndex(saved.selectedWalletIndex || 0);
                        setSelectedAccountIndex(saved.selectedAccountIndex || 0);
                        // persist back in case we migrated
                        persistWalletState(saved.wallets, saved.selectedWalletIndex, saved.selectedAccountIndex);

                        setStep("main");
                        return;
                    }
                }
            }

            setStep(stored ? "enter-password" : "welcome");
        };

        init();
    }, []);


    /* Password submit */
    const handlePasswordSubmit = async (inputPassword) => {
        if (!inputPassword.trim()) {
            setError("Password is required.");
            return;
        }
        const saved = loadWalletState();
        let userMenemonics = saved?.wallets[0].mnemonic;

        if (saved) {

            // existing user
            const decrypted = decryptMnemonic(userMenemonics, inputPassword);
            if (!decrypted) {
                setError("Invalid password.");
                return;
            }


            localStorage.setItem(SESSION_PASSWORD_KEY, btoa(inputPassword));
            saveLoginTime();
            setPassword(inputPassword);
            setMnemonic(decrypted);
            setWallets(saved.wallets);
            setSelectedWalletIndex(saved.selectedWalletIndex);
            setSelectedAccountIndex(saved.selectedAccountIndex);
            persistWalletState(saved.wallets, saved.selectedWalletIndex, saved.selectedAccountIndex);

            setStep("main");
        } else {
            // first-time create
            localStorage.setItem(SESSION_PASSWORD_KEY, btoa(inputPassword));
            saveLoginTime();
            setPassword(inputPassword);
            encryptMnemonic(mnemonic, inputPassword);

            const initial = await createInitialNestedState(mnemonic, inputPassword);
            setWallets(initial.wallets);
            setSelectedWalletIndex(0);
            setSelectedAccountIndex(0);
            persistWalletState(initial.wallets, 0, 0);
            setStep("save-phrase");
        }
    };

    const handleSavePhraseContinue = () => setStep("verify");
    const handleVerifyContinue = () => setStep("main");
    const handleImportMnemonic = (mnemonicFromUser) => {
        setMnemonic(mnemonicFromUser);
        setStep("set-password");
    };

    /* Add new account under the same mnemonic */
    const handleAddAccount = async () => {
        setLoading(true);

        const currentWallet = wallets[selectedWalletIndex];
        const newIndex = currentWallet.accounts.length;

        const sessionPassword = localStorage.getItem(SESSION_PASSWORD_KEY);
        const decoded = atob(sessionPassword);
        const decrypted = decryptMnemonic(currentWallet?.mnemonic, decoded);

        const newAccount = await generateWalletFromMnemonic(decrypted, newIndex);
        const normalized = normalizeWalletObject(newAccount, newIndex);

        const updatedWallets = wallets.map((w, i) =>
            i === selectedWalletIndex
                ? { ...w, accounts: [...w.accounts, normalized] }
                : w
        );

        setWallets(updatedWallets);
        setSelectedAccountIndex(newIndex);

        persistWalletState(updatedWallets, selectedWalletIndex, newIndex);

        setLoading(false);
    };


    /* Select account (wallet + account) */
    const handleSelectAccount = useCallback((walletIdx, accountIdx) => {
        const w = Number(walletIdx || 0) || 0;
        const a = Number(accountIdx || 0) || 0;
        setSelectedWalletIndex(w);
        setSelectedAccountIndex(a);
        persistWalletState(wallets, w, a);
    }, [wallets]);



    // Memoized for fewer re-renders
    const memoWallets = useMemo(() => wallets, [wallets]);
    const memoSelW = useMemo(() => selectedWalletIndex, [selectedWalletIndex]);
    const memoSelA = useMemo(() => selectedAccountIndex, [selectedAccountIndex]);

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
                    <SavePhraseScreen mnemonic={mnemonic} onContinue={handleSavePhraseContinue} />
                )}
                {step === "verify" && (
                    <VerifyPhraseScreen mnemonic={mnemonic} onContinue={handleVerifyContinue} />
                )}

                {step === "main" && (
                    <WalletDashboard
                        wallets={memoWallets}
                        // ✅ new nested selection
                        selectedWalletIndex={memoSelW}
                        selectedAccountIndex={memoSelA}
                        onSelectAccount={handleSelectAccount}   // (walletIndex, accountIndex)
                        onAddAccount={handleAddAccount}
                        loading={loading}
                        setWallets={setWallets}
                        setSelectedAccountIndex={setSelectedAccountIndex}
                        setSelectedWalletIndex={setSelectedWalletIndex}
                        // Optional: keep this for backward-compat if your Dashboard still expects it
                        selectedIndex={memoSelA}
                        allChains={allChains}
                        setAllChains={setAllChains}
                        referesh={referesh}
                        setReferesh={setReferesh}
                        selectedChain={selectedChain}
                        setSelectedChain={setSelectedChain}
                    />
                )}
            </Suspense>
        </Container>
    );
};

export default App;
