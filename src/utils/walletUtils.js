import { Wallet, HDNodeWallet, Mnemonic } from "ethers";
import * as bip39 from "bip39";
import * as ed25519 from "ed25519-hd-key";
import { Keypair } from "@solana/web3.js";
import { Buffer } from "buffer";
import { loadFromLocalStorage, saveToLocalStorage } from "./storage";

window.Buffer = Buffer;

const WALLET_DATA_KEY = "wallet-data";

/* ========================= Existing (kept) ========================= */

export const generateMnemonic = () => {
    const wallet = Wallet.createRandom();
    if (!wallet.mnemonic?.phrase) throw new Error("Mnemonic generation failed.");
    return wallet.mnemonic.phrase;
};

export async function generateWalletFromMnemonic(mnemonicPhrase, index = 0) {
    const mnemonic = Mnemonic.fromPhrase(mnemonicPhrase);

    // EVM
    const evmPath = `m/44'/60'/0'/0/${index}`;
    const evmWallet = HDNodeWallet.fromMnemonic(mnemonic, evmPath);

    // Solana
    const solanaPath = `m/44'/501'/${index}'/0'`;
    const seed = await bip39.mnemonicToSeed(mnemonicPhrase);
    const { key } = ed25519.derivePath(solanaPath, seed.toString("hex"));
    const solanaKeypair = Keypair.fromSeed(key.slice(0, 32));

    return {
        evm: {
            address: evmWallet.address,
            privateKey: evmWallet.privateKey,
        },
        solana: {
            address: solanaKeypair.publicKey.toBase58(),
            privateKey: Buffer.from(solanaKeypair.secretKey).toString("hex"),
        },
    };
}

export function normalizeWalletObject(walletObj, index) {
    return {
        accountIndex: index,
        chains: Object.entries(walletObj).map(([type, data]) => ({
            type,
            address: data.address,
            privateKey: data.privateKey,
        })),
    };
}

// export function normalizeWalletObject(wallet, index) {
//     return {
//         accountIndex: index,
//         chains: [
//             {
//                 type: "evm",
//                 address: wallet.address,
//                 privateKey: wallet.privateKey,
//             },
//         ],
//     };
// }



/* ========================= New Helpers ========================= */

// Legacy flat shape?
// { wallets: [ { accountIndex, chains: [...] }, ... ], selectedIndex, accountCount }
export const isLegacyShape = (data) =>
    !!data &&
    Array.isArray(data.wallets) &&
    data.wallets.length > 0 &&
    typeof data.wallets[0]?.accountIndex === "number" &&
    Array.isArray(data.wallets[0]?.chains);

// Normalize any stored shape to the new nested layout:
// { wallets: [ { accounts: [...] } ], selectedWalletIndex, selectedAccountIndex }
export const ensureNestedShape = (raw) => {
    if (!raw) return null;

    if (isLegacyShape(raw)) {
        const selectedAccountIndex = Number(raw.selectedIndex || 0) || 0;
        return {
            wallets: [{ accounts: raw.wallets }],
            selectedWalletIndex: 0,
            selectedAccountIndex,
        };
    }

    return {
        wallets: Array.isArray(raw.wallets) ? raw.wallets : [{ accounts: [] }],
        selectedWalletIndex: Number(raw.selectedWalletIndex || 0) || 0,
        selectedAccountIndex: Number(raw.selectedAccountIndex || 0) || 0,
    };
};

export const persistWalletState = (wallets, selectedWalletIndex, selectedAccountIndex) => {
    saveToLocalStorage(WALLET_DATA_KEY, { wallets, selectedWalletIndex, selectedAccountIndex });
};

export const loadWalletState = () => {
    const raw = loadFromLocalStorage(WALLET_DATA_KEY);
    return raw ? ensureNestedShape(raw) : null;
};

// Create first account under current mnemonic
export const createInitialNestedState = async (mnemonicPhrase) => {
    const first = await generateWalletFromMnemonic(mnemonicPhrase, 0);
    const normalized = normalizeWalletObject(first, 0);
    return {
        wallets: [{ accounts: [normalized] }],
        selectedWalletIndex: 0,
        selectedAccountIndex: 0,
    };
};



