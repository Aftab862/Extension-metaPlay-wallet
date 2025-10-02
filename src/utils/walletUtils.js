import { Wallet, HDNodeWallet, Mnemonic } from "ethers";
import * as bip39 from "bip39";
import { Keypair } from "@solana/web3.js";
import { derivePath } from "ed25519-hd-key";
import { Buffer } from "buffer";
import { loadFromLocalStorage, saveToLocalStorage } from "./storage";
import { BIP32Factory } from 'bip32'
import * as bitcoin from 'bitcoinjs-lib'
import * as ecc from '@bitcoinerlab/secp256k1'
import { TronWeb } from "tronweb";
import { encryptMnemonic, encryptPk } from "./cryptoUtils";
window.Buffer = Buffer
const bip32 = BIP32Factory(ecc)
const tronWeb = new TronWeb({ fullHost: 'https://api.trongrid.io' })
const WALLET_DATA_KEY = "wallet-data";

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

async function generateSolanaWallet(mnemonicPhrase, index = 0) {
    const path = `m/44'/501'/${index}'`;
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

async function generateTronWallet(mnemonicPhrase, index = 0) {

    const seed = await bip39.mnemonicToSeed(mnemonicPhrase)
    const root = bip32.fromSeed(seed)


    const path = `m/44'/195'/0'/0/${index}`;
    const child = root.derivePath(path);


    const privateKey = Buffer.from(child.privateKey).toString('hex')
    const publicKey = Buffer.from(child.publicKey).toString('hex')


    const address = tronWeb.address.fromPrivateKey(privateKey)

    return {
        chainType: 'tron',
        address,
        privateKey,
        publicKey,
        derivationPath: path
    }
}

async function generateBitcoinWallet(mnemonicPhrase, index = 0) {
    // 1. Convert mnemonic → seed
    const seed = await bip39.mnemonicToSeed(mnemonicPhrase)
    const root = bip32.fromSeed(seed)

    // 2. Use the dynamic index
    const path = `m/84'/0'/0'/0/${index}`
    const child = root.derivePath(path)

    // 3. Keys
    const privateKey = Buffer.from(child.privateKey).toString('hex')
    const publicKey = Buffer.from(child.publicKey).toString('hex')

    // 4. Address
    const { address } = bitcoin.payments.p2wpkh({
        pubkey: Buffer.from(child.publicKey)
    })

    return {
        chainType: 'bitcoin',
        address,
        privateKey,
        publicKey,
        derivationPath: path
    }
}

export async function generateWalletFromMnemonic(mnemonicPhrase, index = 0) {
    // const [evm, solana, tron, bitcoin] = await Promise.all([
    //     generateEvmWallet(mnemonicPhrase, index),
    //     generateSolanaWallet(mnemonicPhrase, index),
    //     generateTronWallet(mnemonicPhrase, index),
    //     generateBitcoinWallet(mnemonicPhrase, index),
    // ])
    // return { evm, solana, tron, bitcoin }
    const evm = await generateEvmWallet(mnemonicPhrase, index);
    return { evm };

}

export function normalizeWalletObject(walletObj, index) {
    return {
        accountIndex: index,
        accountName: "",
        chains: Object.entries(walletObj).map(([type, data]) => ({
            type,
            address: data.address,
            privateKey: encryptPk(data.privateKey, "1122"),
        })),
    };
}

export const createInitialNestedState = async (mnemonicPhrase, inputPassword) => {
    const firstWallet = await generateWalletFromMnemonic(mnemonicPhrase, 0);
    const normalized = normalizeWalletObject(firstWallet, 0);
    const mnemonicFromUser = await encryptMnemonic(mnemonicPhrase, inputPassword);

    return {
        wallets: [{ mnemonic: mnemonicFromUser, walletType: "seed", accounts: [normalized] }],
        selectedWalletIndex: 0,
        selectedAccountIndex: 0,
    };
};

export const isLegacyShape = (data) =>
    !!data &&
    Array.isArray(data.wallets) &&
    data.wallets.length > 0 &&
    typeof data.wallets[0]?.accountIndex === "number" &&
    Array.isArray(data.wallets[0]?.chains);

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