import { Wallet, HDNodeWallet, Mnemonic, keccak256 } from "ethers";
import * as bip39 from "bip39";
import { Keypair } from "@solana/web3.js";
import { derivePath } from "ed25519-hd-key";

import { Buffer } from "buffer";
import { loadFromLocalStorage, saveToLocalStorage } from "./storage";
import * as crypto from "crypto"
import bs58 from "bs58"

window.Buffer = Buffer;

const WALLET_DATA_KEY = "wallet-data";

/* ========================= Existing (kept) ========================= */

async function generateEvmWallet(mnemonicPhrase, index = 0) {
    const mnemonic = Mnemonic.fromPhrase(mnemonicPhrase)
    const path = `m/44'/60'/0'/0/${index}`
    const wallet = HDNodeWallet.fromMnemonic(mnemonic, path)

    return {
        chainType: "EVM",
        address: wallet.address,
        privateKey: wallet.privateKey,
        publicKey: wallet.publicKey,
        derivationPath: path,
    }
}

/**
 * Generate a Solana wallet from a mnemonic phrase.
 */
async function generateSolanaWallet(mnemonicPhrase, index = 0) {
    const path = `m/44'/501'/${index}'/0'`
    const seed = await bip39.mnemonicToSeed(mnemonicPhrase)
    const { key } = derivePath(path, seed.toString("hex"))
    const keypair = Keypair.fromSeed(key.slice(0, 32))

    return {
        chainType: "Solana",
        address: keypair.publicKey.toBase58(),
        privateKey: Buffer.from(keypair.secretKey).toString("hex"),
        publicKey: keypair.publicKey.toBase58(),
        derivationPath: path,
    }
}

/**
 * Generate a TRON wallet from a mnemonic phrase.
 */
async function generateTronWallet(mnemonicPhrase, index = 0) {
    const mnemonic = Mnemonic.fromPhrase(mnemonicPhrase)
    // TRON uses coin type 195 in BIP44 path
    const path = `m/44'/195'/0'/0/${index}`
    const wallet = HDNodeWallet.fromMnemonic(mnemonic, path)

    // TRON address generation from public key
    const publicKeyBytes = Buffer.from(wallet.publicKey.slice(2), "hex")
    const addressBytes = Buffer.from(keccak256(publicKeyBytes).slice(2), "hex")
    const addressHex = "41" + addressBytes.slice(-20).toString("hex")

    // Base58Check encoding for TRON address
    const hash1 = crypto.createHash("sha256").update(Buffer.from(addressHex, "hex")).digest()
    const hash2 = crypto.createHash("sha256").update(hash1).digest()
    const checksum = hash2.slice(0, 4)
    const addressWithChecksum = Buffer.concat([Buffer.from(addressHex, "hex"), checksum])

    // Use proper Base58 encoding
    const address = bs58.encode(addressWithChecksum)

    return {
        chainType: "TRON",
        address: address,
        privateKey: wallet.privateKey,
        publicKey: wallet.publicKey,
        derivationPath: path,
    }
}

/**
 * Generate a Bitcoin wallet from a mnemonic phrase.
 */
async function generateBitcoinWallet(mnemonicPhrase, index = 0) {
    const mnemonic = Mnemonic.fromPhrase(mnemonicPhrase)
    // Bitcoin uses coin type 0 in BIP44 path
    const path = `m/44'/0'/0'/0/${index}`
    const wallet = HDNodeWallet.fromMnemonic(mnemonic, path)

    // Bitcoin address generation (P2PKH format)
    const publicKeyBytes = Buffer.from(wallet.publicKey.slice(2), "hex")

    // SHA256 then RIPEMD160 hash of public key
    const sha256Hash = crypto.createHash("sha256").update(publicKeyBytes).digest()
    const ripemd160Hash = crypto.createHash("ripemd160").update(sha256Hash).digest()

    // Add version byte (0x00 for mainnet P2PKH)
    const versionedHash = Buffer.concat([Buffer.from([0x00]), ripemd160Hash])

    // Double SHA256 for checksum
    const checksum1 = crypto.createHash("sha256").update(versionedHash).digest()
    const checksum2 = crypto.createHash("sha256").update(checksum1).digest()
    const checksum = checksum2.slice(0, 4)

    // Final address with checksum
    const addressBytes = Buffer.concat([versionedHash, checksum])
    const address = bs58.encode(addressBytes)

    return {
        chainType: "Bitcoin",
        address: address,
        privateKey: wallet.privateKey,
        publicKey: wallet.publicKey,
        derivationPath: path,
    }
}

/**
 * Generate EVM, Solana, TRON, and Bitcoin wallets for a given mnemonic and index.
 */
export async function generateWalletFromMnemonic(mnemonicPhrase, index = 0) {
    const [evm, solana, tron, bitcoin] = await Promise.all([
        generateEvmWallet(mnemonicPhrase, index),
        generateSolanaWallet(mnemonicPhrase, index),
        generateTronWallet(mnemonicPhrase, index),
        generateBitcoinWallet(mnemonicPhrase, index),
    ])
    console.log("evm solana tron bitcoin: ", evm, solana, tron, bitcoin)

    return { evm, solana, tron, bitcoin }
}


/**
 * Normalize wallet object into a standard structure.
 */
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

/**
 * Create the initial nested state with one wallet and one account.
 */
export const createInitialNestedState = async (mnemonicPhrase) => {
    const firstWallet = await generateWalletFromMnemonic(mnemonicPhrase, 0);
    const normalized = normalizeWalletObject(firstWallet, 0);

    return {
        wallets: [{ accounts: [normalized] }],
        selectedWalletIndex: 0,
        selectedAccountIndex: 0,
    };
};

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






export const generateMnemonic = () => {
    const wallet = Wallet.createRandom();
    if (!wallet.mnemonic?.phrase) throw new Error("Mnemonic generation failed.");
    return wallet.mnemonic.phrase;
};