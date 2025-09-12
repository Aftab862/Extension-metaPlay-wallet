import { EVM_CHAINS } from "../config/chain";
import { CHAIN_LIST } from "./keys";

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
    const existing = localStorage.getItem(CHAIN_LIST);
    if (!existing) {
        localStorage.setItem(CHAIN_LIST, JSON.stringify(EVM_CHAINS));
        return EVM_CHAINS || [];
    }
    return existing ? JSON.parse(existing) : null
};



export const AddChainHandler = (data) => {
    const existing = loadFromLocalStorage(CHAIN_LIST) || [];

    const response = [...existing, data];

    localStorage.setItem(CHAIN_LIST, JSON.stringify(response));
    return true;
}
