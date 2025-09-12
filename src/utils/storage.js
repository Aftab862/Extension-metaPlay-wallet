import { EVM_CHAINS } from "../config/chain";
import { chainsList } from "./keys";

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
    const existing = localStorage.getItem(chainsList);
    if (!existing) {
        localStorage.setItem(chainsList, JSON.stringify(EVM_CHAINS));
        return EVM_CHAINS || [];
    }
    return existing ? JSON.parse(existing) : null
};



export const AddChainHandler = (data) => {
    const existing = loadFromLocalStorage(chainsList) || [];

    const response = [...existing, data];

    localStorage.setItem(chainsList, JSON.stringify(response));
    return true;
}
