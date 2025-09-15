// // src/config/evmChains.js
const API_KEY = "G1bAPRusuEnETMRFgNDU6Eg-ntLJwT43"

export const EVM_CHAINS = [
    {
        name: "Ethereum",
        chainId: 1,
        nativeSymbol: "ETH",
        rpcUrl: `https://eth-mainnet.g.alchemy.com/v2/${API_KEY}`,
        tokens: [
            { symbol: "USDT", name: "Tether USD", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6, balance: "0" },
            { symbol: "USDC", name: "USD Coin", address: "0xA0b86991C6218b36c1D19D4a2e9Eb0cE3606eB48", decimals: 6, balance: "0" },
        ],
    },
    {
        name: "DXB chain",
        chainId: 1999,
        nativeSymbol: "DXB",
        rpcUrl: `https://rpc-testnet-1.vrcchain.com`,
        tokens: [],
    },
    {
        name: "Binance Smart Chain",
        chainId: 56,
        nativeSymbol: "BNB",
        rpcUrl: "https://bsc-dataseed.binance.org/",
        tokens: [
            { symbol: "BUSD", name: "Binance USD", address: "0xe9e7cea3dedca5984780bafc599bd69add087d56", decimals: 18, balance: "0" },
            { symbol: "USDT", name: "Tether USD", address: "0x55d398326f99059ff775485246999027b3197955", decimals: 18, balance: "0" },
        ],
    },
    {
        name: "Polygon",
        chainId: 137,
        nativeSymbol: "MATIC",
        rpcUrl: "https://polygon-rpc.com",
        tokens: [
            { symbol: "USDT", name: "Tether USD", address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", decimals: 6, balance: "0" },
            { symbol: "USDC", name: "USD Coin", address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", decimals: 6, balance: "0" },
        ],
    },
];


// const API_KEY = "G1bAPRusuEnETMRFgNDU6Eg-ntLJwT43";

// export const EVM_CHAINS = [
//     {
//         id: "ethereum",
//         name: "Ethereum",
//         type: "evm",
//         chainId: 1,
//         nativeCurrency: {
//             name: "Ether",
//             symbol: "ETH",
//             decimals: 18,
//         },
//         rpcUrls: [
//             `https://eth-mainnet.g.alchemy.com/v2/${API_KEY}`,
//             "https://rpc.ankr.com/eth", // fallback
//         ],
//         explorers: [
//             {
//                 name: "Etherscan",
//                 url: "https://etherscan.io",
//             },
//         ],
//         tokens: [
//             {
//                 symbol: "USDT",
//                 address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
//                 decimals: 6,
//                 logoURI:
//                     "https://cryptologos.cc/logos/tether-usdt-logo.png",
//             },
//             {
//                 symbol: "USDC",
//                 address: "0xA0b86991C6218b36c1D19D4a2e9Eb0cE3606eB48",
//                 decimals: 6,
//                 logoURI:
//                     "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
//             },
//         ],
//     },
//     {
//         id: "dxb-chain",
//         name: "DXB Chain custom",
//         type: "evm",
//         chainId: 1999,
//         nativeCurrency: {
//             name: "DXB",
//             symbol: "DXB",
//             decimals: 18,
//         },
//         rpcUrls: ["https://rpc-testnet-1.vrcchain.com"],
//         explorers: [
//             {
//                 name: "DXB Explorer",
//                 url: "https://explorer.vrcchain.com",
//             },
//         ],
//         tokens: [
//             {
//                 symbol: "MPT",
//                 address: "0x4EdcE81D8c1635A57d0F2Dd3DD0D0B25f173D145",
//                 decimals: 6,
//                 logoURI: "https://metaplay-wallet.vercel.app/vite.png", // Add logo URL
//             },
//         ],
//     },
//     {
//         id: "bsc",
//         name: "Binance Smart Chain",
//         type: "evm",
//         chainId: 56,
//         nativeCurrency: {
//             name: "Binance Coin",
//             symbol: "BNB",
//             decimals: 18,
//         },
//         rpcUrls: ["https://bsc-dataseed.binance.org/"],
//         explorers: [
//             {
//                 name: "BscScan",
//                 url: "https://bscscan.com",
//             },
//         ],
//         tokens: [
//             {
//                 symbol: "BUSD",
//                 address: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
//                 decimals: 18,
//                 logoURI:
//                     "https://cryptologos.cc/logos/binance-usd-busd-logo.png",
//             },
//             {
//                 symbol: "USDT",
//                 address: "0x55d398326f99059ff775485246999027b3197955",
//                 decimals: 18,
//                 logoURI:
//                     "https://cryptologos.cc/logos/tether-usdt-logo.png",
//             },
//         ],
//     },
//     {
//         id: "polygon",
//         name: "Polygon",
//         type: "evm",
//         chainId: 137,
//         nativeCurrency: {
//             name: "Polygon",
//             symbol: "MATIC",
//             decimals: 18,
//         },
//         rpcUrls: ["https://polygon-rpc.com"],
//         explorers: [
//             {
//                 name: "Polygonscan",
//                 url: "https://polygonscan.com",
//             },
//         ],
//         tokens: [
//             {
//                 symbol: "USDT",
//                 address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
//                 decimals: 6,
//                 logoURI:
//                     "https://cryptologos.cc/logos/tether-usdt-logo.png",
//             },
//             {
//                 symbol: "USDC",
//                 address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
//                 decimals: 6,
//                 logoURI:
//                     "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
//             },
//         ],
//     },
//     // 🚀 Future non-EVM example (Solana)
//     {
//         id: "solana",
//         name: "Solana",
//         type: "solana",
//         rpcUrls: ["https://api.mainnet-beta.solana.com"],
//         explorers: [
//             {
//                 name: "Solscan",
//                 url: "https://solscan.io",
//             },
//         ],
//         nativeCurrency: {
//             name: "Solana",
//             symbol: "SOL",
//             decimals: 9,
//         },
//         tokens: [],
//     },
// ];
