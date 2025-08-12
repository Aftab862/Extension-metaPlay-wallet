// src/config/evmChains.js
const API_KEY = "G1bAPRusuEnETMRFgNDU6Eg-ntLJwT43"

export const EVM_CHAINS = [
    {
        name: "Ethereum",
        chainId: 1,
        nativeSymbol: "ETH",
        rpcUrl: `https://eth-mainnet.g.alchemy.com/v2/${API_KEY}`,
        tokens: [
            { symbol: "USDT", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6 },
            { symbol: "USDC", address: "0xA0b86991C6218b36c1D19D4a2e9Eb0cE3606eB48", decimals: 6 },
        ],
    },
    {
        name: "Binance Smart Chain",
        chainId: 56,
        nativeSymbol: "BNB",
        rpcUrl: "https://bsc-dataseed.binance.org/",
        tokens: [
            { symbol: "BUSD", address: "0xe9e7cea3dedca5984780bafc599bd69add087d56", decimals: 18 },
            { symbol: "USDT", address: "0x55d398326f99059ff775485246999027b3197955", decimals: 18 },
        ],
    },
    {
        name: "Polygon",
        chainId: 137,
        nativeSymbol: "MATIC",
        rpcUrl: "https://polygon-rpc.com",
        tokens: [
            { symbol: "USDT", address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", decimals: 6 },
            { symbol: "USDC", address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", decimals: 6 },
        ],
    },
];
