// src/App.jsx
import React, { lazy, Suspense, useEffect, useState } from "react";
import { Container, Button, Typography } from "@mui/material";
import { getOrCreateMnemonic, generateWalletFromMnemonic } from "./utils/walletUtils";

const AccountSwitcher = lazy(() => import("./AccountSwitcher"));
const WalletInfo = lazy(() => import("./WalletInfo"));
const Loader = lazy(() => import("./Loader"));

const App = () => {
    const [wallets, setWallets] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [mnemonic, setMnemonic] = useState("");
    const [loading, setloading] = useState(false);

    useEffect(() => {
        setloading(true);
        setTimeout(() => {
            const savedMnemonic = getOrCreateMnemonic();
            console.log("savedMnemonic", savedMnemonic);
            setMnemonic(savedMnemonic);

            const initialWallet = generateWalletFromMnemonic(savedMnemonic, 0);
            console.log("initialWallet", initialWallet);

            setWallets([initialWallet]);
            setloading(false);
        }, 800);
    }, []);

    const handleAddAccount = () => {
        setloading(true);
        setTimeout(() => {
            const newIndex = wallets.length;
            const newWallet = generateWalletFromMnemonic(mnemonic, newIndex);
            setWallets((prev) => [...prev, newWallet]);
            setSelectedIndex(newIndex);
            setloading(false);
        }, 600);
    };


    return (
        <Container sx={{ my: 4, width: 360 }}>


            <Suspense fallback={<p>Loading...</p>}>
                {loading ?
                    <Loader />
                    :

                    <>
                        <Typography variant="h6" align="center" gutterBottom>
                            MetaPlay Wallet
                        </Typography>

                        <Typography variant="body2" align="center" color="text.secondary" gutterBottom>
                            Manage Multiple Accounts Using One Mnemonic
                        </Typography>

                        <AccountSwitcher
                            accounts={wallets}
                            selectedIndex={selectedIndex}
                            onSelect={setSelectedIndex}
                        />

                        <WalletInfo wallet={wallets[selectedIndex]} />

                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            sx={{ mt: 2 }}
                            onClick={handleAddAccount}
                        >
                            Add New Account
                        </Button>
                    </>
                }
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
