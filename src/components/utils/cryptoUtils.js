// src/utils/cryptoUtils.js
import CryptoJS from "crypto-js";

const STORAGE_KEY = "encrypted-mnemonic"; // ✅ Unique and secure

export function encryptMnemonic(mnemonic, password) {
    const ciphertext = CryptoJS.AES.encrypt(mnemonic, password).toString();
    localStorage.setItem(STORAGE_KEY, ciphertext);
}

export function decryptMnemonic(password) {
    const encrypted = localStorage.getItem(STORAGE_KEY);
    if (!encrypted) return null;

    try {
        const bytes = CryptoJS.AES.decrypt(encrypted, password);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        return decrypted || null;
    } catch {
        return null;
    }
}

export function isMnemonicStored() {
    return !!localStorage.getItem(STORAGE_KEY);
}
