





// // src/popup.jsx
// // src/popup.jsx
// import React, { useEffect, useState } from "react";
// import ReactDOM from "react-dom/client";
// import { Box, Button, Typography, Container } from "@mui/material";
// import * as bip39 from "bip39";
// import hdkey from "hdkey";
// import { Buffer } from "buffer";
// import { privateToPublic, publicToAddress } from 'ethereumjs-util';
// window.Buffer = Buffer;



// const Popup = () => {
//     const [mnemonic, setMnemonic] = useState("");
//     const [privateKey, setPrivateKey] = useState("");

//     useEffect(() => {
//         console.log("🟢 Popup component mounted");
//         console.log("ℹ️ Is hdkey available?", typeof hdkey.fromMasterSeed === "function");
//     }, []);

//     const handleGenerate = async () => {
//         try {
//             const generatedMnemonic = bip39.generateMnemonic();
//             console.log("🔐 Generated Mnemonic:", generatedMnemonic);

//             const seed = await bip39.mnemonicToSeed(generatedMnemonic); // Buffer of bytes <Buffer 6c d7 43 9e 1d 8e 99 0e 31 1a ... >
//             const root = hdkey.fromMasterSeed(seed); //  allows us to derive (generate) many different keys and addresses from one seed.

//             const child = root.derive("m/44'/60'/0'/0/0");

//             setMnemonic(generatedMnemonic);
//             setPrivateKey(child.privateKey.toString("hex"));




//         } catch (error) {
//             console.error("❌ Error generating wallet:", error);
//         }
//     };

//     return (
//         <Container sx={{ mt: 2, p: 3, width: "330px" }}>
//             <Box>
//                 <Typography variant="h6" align="center" gutterBottom>
//                     Welcome to <strong>MetaPlay Wallet</strong>
//                 </Typography>
//                 <Typography variant="body2" align="center" color="text.secondary" gutterBottom>
//                     Keep your crypto in MetaPlay Wallet
//                 </Typography>

//                 <Box textAlign="center" mt={2}>
//                     <Button variant="contained" color="primary" onClick={handleGenerate}>
//                         Generate Wallet
//                     </Button>
//                 </Box>

//                 {mnemonic && (
//                     <Box mt={3}>
//                         <Typography variant="subtitle2">Mnemonic:</Typography>
//                         <Typography variant="body2" sx={{ wordBreak: "break-word" }}>{mnemonic}</Typography>
//                         <Typography variant="subtitle2" mt={1}>Private Key:</Typography>
//                         <Typography variant="body2" sx={{ wordBreak: "break-word" }}>{privateKey}</Typography>
//                     </Box>
//                 )}
//             </Box>
//         </Container>
//     );
// };

// ReactDOM.createRoot(document.getElementById("root")).render(<Popup />);



// import React from "react";
// import ReactDOM from "react-dom/client";
// import { Box, Button, Typography, Container, Paper } from "@mui/material";




// const Popup = () => (
//     <Container sx={{ mt: 2, p: 3, width: "330px" }}>
//         <Box >
//             <Typography variant="h6" align="center" gutterBottom>
//                 Welcome to <strong>MetaPlay Wallet</strong>
//             </Typography>
//             <Typography variant="body2" align="center" color="text.secondary" gutterBottom>
//                 Keep your crypto in metaplay wallet
//             </Typography>
//             <Box textAlign="center" mt={2}>
//                 <Button variant="contained" color="primary" onClick={() => console.log("Clicked!")}>
//                     Get Started
//                 </Button>
//             </Box>
//         </Box>
//     </Container>
// );

// ReactDOM.createRoot(document.getElementById("root")).render(<Popup />);




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
