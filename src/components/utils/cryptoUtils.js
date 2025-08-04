// src/utils/cryptoUtils.js
import CryptoJS from "crypto-js";

const STORAGE_KEY = "metaplay-encrypted-mnemonic";

export function encryptMnemonic(mnemonic, password) {
    const ciphertext = CryptoJS.AES.encrypt(mnemonic, password).toString();
    localStorage.setItem(STORAGE_KEY, ciphertext);
}

export function decryptMnemonic(password) {
    const ciphertext = localStorage.getItem(STORAGE_KEY);
    if (!ciphertext) return null;

    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, password);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        return decrypted || null;
    } catch (err) {
        return null;
    }
}

export function isMnemonicStored() {
    return !!localStorage.getItem(STORAGE_KEY);
}
