// src/utils/cryptoUtils.js
import CryptoJS from "crypto-js";
import { PASS_KEY, WALLET_DATA_KEY } from "./keys";


export function encryptMnemonic(mnemonic) {


    const ciphertext = CryptoJS.AES.encrypt(mnemonic, PASS_KEY).toString();
    return ciphertext;
}

export function decryptMnemonic(encrypted) {

    try {
        const bytes = CryptoJS.AES.decrypt(encrypted, PASS_KEY);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        return decrypted || null;
    } catch {
        return null;
    }
}

export function isWalletAvalailable() {
    return !!localStorage.getItem(WALLET_DATA_KEY);
}

export function encryptPk(privateKey, secretKey) {
    const ciphertext = CryptoJS.AES.encrypt(privateKey, secretKey).toString();
    return ciphertext;
}

export function decryptPk(encrypted, key) {

    try {
        const bytes = CryptoJS.AES.decrypt(encrypted, key);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        return decrypted || null;
    } catch {
        return null;
    }
}