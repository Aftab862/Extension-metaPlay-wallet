// src/app/App.jsx
import React, { useEffect, useState, lazy, Suspense } from "react";
import { Container } from "@mui/material";
import { Wallet } from "ethers";
import { encryptMnemonic, decryptMnemonic, isMnemonicStored } from "./utils/cryptoUtils";
import { generateWalletFromMnemonic } from "./utils/walletUtils";
import Loader from "../components/Loader";

// Lazy-loaded screens
const PasswordScreen = lazy(() => import("./screens/Password"));
const SavePhraseScreen = lazy(() => import("./screens/SavePhraseScreen"));
const WalletDashboard = lazy(() => import("./screens/WalletDashboard"));

const App = () => {
    const [step, setStep] = useState("checking");
    const [mnemonic, setMnemonic] = useState("");
    const [password, setPassword] = useState("");
    const [wallets, setWallets] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // First-time vs returning logic
    useEffect(() => {
        const stored = isMnemonicStored();

        if (stored) {
            setStep("enter-password");
        } else {
            const newMnemonic = Wallet.createRandom().mnemonic?.phrase;
            if (!newMnemonic) {
                console.error("Failed to generate mnemonic");
                return;
            }

            setMnemonic(newMnemonic);
            setStep("set-password");
        }
    }, []);

    const handlePasswordSubmit = (inputPassword) => {
        if (!inputPassword.trim()) {
            setError("Password is required.");
            return;
        }

        const encrypted = localStorage.getItem("encrypted-mnemonic");

        if (encrypted) {
            // Returning user
            const decrypted = decryptMnemonic(inputPassword);
            if (decrypted) {
                setPassword(inputPassword);
                setMnemonic(decrypted);
                const firstWallet = generateWalletFromMnemonic(decrypted, 0);
                setWallets([firstWallet]);
                setStep("main");
            } else {
                setError("Invalid password.");
            }
        } else {
            // New user
            setPassword(inputPassword);
            encryptMnemonic(mnemonic, inputPassword);
            setStep("save-phrase");
        }
    };

    const handleSavePhraseContinue = () => {
        const firstWallet = generateWalletFromMnemonic(mnemonic, 0);
        setWallets([firstWallet]);
        setStep("main");
    };

    const handleAddAccount = () => {
        setLoading(true);
        setTimeout(() => {
            const newIndex = wallets.length;
            const newWallet = generateWalletFromMnemonic(mnemonic, newIndex);
            setWallets((prev) => [...prev, newWallet]);
            setSelectedIndex(newIndex);
            setLoading(false);
        }, 300);
    };

    const handleReEncrypt = () => {
        if (mnemonic && password) encryptMnemonic(mnemonic, password);
    };

    return (
        <Container sx={{ my: 2, width: 360 }}>
            <Suspense fallback={<Loader />}>
                {step === "checking" ? (
                    <Loader message="Initializing..." />
                ) : step === "set-password" || step === "enter-password" ? (
                    <PasswordScreen
                        mode={step === "set-password" ? "create" : "enter"}
                        onPasswordSubmit={handlePasswordSubmit}
                        error={error}
                    />
                ) : step === "save-phrase" ? (
                    <SavePhraseScreen mnemonic={mnemonic} onContinue={handleSavePhraseContinue} />
                ) : step === "main" ? (
                    <WalletDashboard
                        wallets={wallets}
                        selectedIndex={selectedIndex}
                        onSelect={setSelectedIndex}
                        onAddAccount={handleAddAccount}
                        loading={loading}
                        onReEncrypt={handleReEncrypt}
                    />
                ) : null}
            </Suspense>
        </Container>
    );
};

export default App;







// import React, { useState } from 'react'
// import { Box, Button, Typography, Container, CssBaseline } from "@mui/material";
// import { Wallet, Mnemonic } from "ethers";

// const App = () => {


//     const [mnemonic, setMnemonic] = useState("");
//     const [privateKey, setPrivateKey] = useState("");
//     const [address, setAddress] = useState("");

//     const handleGenerate = async () => {
//         // Generate random wallet with mnemonic
//         const wallet = Wallet.createRandom();
//         console.log("wallet", wallet)
//         setMnemonic(wallet.mnemonic?.phrase);
//         setPrivateKey(wallet.privateKey);
//         setAddress(wallet.address);
//     };

//     return (
//         <Container sx={{ mt: 2, p: 3, width: "330px" }}>
//             <Typography variant="h6" align="center" gutterBottom>
//                 Welcome to <strong>MetaPlay Wallet</strong>
//             </Typography>

//             <Typography variant="body2" align="center" color="text.secondary" gutterBottom>
//                 Keep your crypto in MetaPlay Wallet
//             </Typography>

//             <Box textAlign="center" mt={2}>
//                 <Button variant="contained" color="secondary" onClick={handleGenerate}>
//                     Generate Wallet
//                 </Button>
//             </Box>

//             {mnemonic && (
//                 <Box mt={3}>
//                     <Typography variant="subtitle2">Mnemonic:</Typography>
//                     <Typography variant="body2" sx={{ wordBreak: "break-word" }}>{mnemonic}</Typography>

//                     <Typography variant="subtitle2" mt={1}>Private Key:</Typography>
//                     <Typography variant="body2" sx={{ wordBreak: "break-word" }}>{privateKey}</Typography>

//                     <Typography variant="subtitle2" mt={1}>Address:</Typography>
//                     <Typography variant="body2" sx={{ wordBreak: "break-word" }}>{address}</Typography>
//                 </Box>
//             )}
//         </Container>
//     );
// };



// export default App
