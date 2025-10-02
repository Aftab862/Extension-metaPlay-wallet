// src/utils/cryptoUtils.js
import CryptoJS from "crypto-js";
import { WALLET_DATA_KEY } from "./keys";

export function encryptMnemonic(mnemonic, password) {
    const ciphertext = CryptoJS.AES.encrypt(mnemonic, password).toString();
    return ciphertext;
}

export function decryptMnemonic(encrypted, password) {

    try {
        const bytes = CryptoJS.AES.decrypt(encrypted, password);
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