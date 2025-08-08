import { Wallet, HDNodeWallet, Mnemonic } from "ethers";
import * as bip39 from "bip39";
import * as ed25519 from "ed25519-hd-key";
import { Keypair } from "@solana/web3.js";
import { Buffer } from 'buffer'; // <- Fix for Buffer
window.Buffer = Buffer; // <- Globalize Buffer for browser

export const generateMnemonic = () => {
    const wallet = Wallet.createRandom();
    if (!wallet.mnemonic?.phrase) {
        throw new Error("Mnemonic generation failed.");
    }
    return wallet.mnemonic.phrase;
};

export async function generateWalletFromMnemonic(mnemonicPhrase, index = 0) {
    const mnemonic = Mnemonic.fromPhrase(mnemonicPhrase);

    // ✅ EVM Wallet
    const evmPath = `m/44'/60'/0'/0/${index}`;
    const evmWallet = HDNodeWallet.fromMnemonic(mnemonic, evmPath);

    // ✅ Solana Wallet
    const solanaPath = `m/44'/501'/${index}'/0'`;
    const seed = await bip39.mnemonicToSeed(mnemonicPhrase);
    const { key } = ed25519.derivePath(solanaPath, seed.toString("hex"));
    console.log("key : ", key)

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
