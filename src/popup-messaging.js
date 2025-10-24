
import { GetAddress } from "./utils/helper";
console.log("MetaPlay popup messaging script loaded");

// Listen for background requests
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "INTERNAL_GET_ADDRESS") {
        try {
            const address = GetAddress();
            sendResponse({ address: address || null });
        } catch (err) {
            sendResponse({ address: null, error: err?.message || String(err) });
        }
        return true;
    }
});

// Send current address when popup loads
window.addEventListener("load", () => {
    try {
        const address = GetAddress();
        chrome.runtime.sendMessage({
            type: "POPUP_CURRENT_ADDRESS",
            address: address || null,
        });
    } catch {
        chrome.runtime.sendMessage({
            type: "POPUP_CURRENT_ADDRESS",
            address: null,
        });
    }
});

// Called whenever user switches account
export function notifyAccountChanged(newAddress) {
    console.log("🔔 Popup notifying new address:", newAddress);
    chrome.runtime.sendMessage({
        type: "POPUP_CURRENT_ADDRESS",
        address: newAddress,
    });
}
