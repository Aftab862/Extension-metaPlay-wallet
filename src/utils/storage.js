import { EVM_CHAINS } from "../config/chain";

// src/utils/storage
const CHAINS_KEY = "chains-list";

export const saveToLocalStorage = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
};

export const loadFromLocalStorage = (key) => {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
};

export const removeFromLocalStorage = (key) => {
    localStorage.removeItem(key);
};


export const initChains = () => {
    const existing = localStorage.getItem(CHAINS_KEY);
    if (!existing) {
        localStorage.setItem(CHAINS_KEY, JSON.stringify(EVM_CHAINS));
        return EVM_CHAINS || [];
    }
    return existing ? JSON.parse(existing) : null
};



export const AddChainHandler = (data) => {
    const existing = loadFromLocalStorage(CHAINS_KEY) || [];

    const response = [...existing, data];

    localStorage.setItem(CHAINS_KEY, JSON.stringify(response));
    return true;
}
