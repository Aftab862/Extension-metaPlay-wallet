// content.js
console.log("MetaPlay content script loaded");

// Inject into the webpage
const script = document.createElement("script");
script.src = chrome.runtime.getURL("injected.js");
(document.head || document.documentElement).appendChild(script);
script.onload = () => {
    console.log("✅ MetaPlay injected.js successfully added");
    script.remove();
};

// Listen for messages coming from injected.js (page context)
window.addEventListener("message", async (event) => {
    if (event.source !== window) return;
    if (event.data.type !== "CONNECT_WALLET_REQUEST") return;

    console.log("📩 Content script got CONNECT_WALLET_REQUEST");

    try {
        // Ask background script to connect wallet
        const response = await chrome.runtime.sendMessage({ type: "CONNECT_WALLET" });
        window.postMessage({ type: "CONNECT_WALLET_RESPONSE", payload: response }, "*");
    } catch (err) {
        console.error("❌ Content → background error:", err);
        window.postMessage({
            type: "CONNECT_WALLET_RESPONSE",
            payload: { success: false, error: err.message },
        }, "*");
    }
});
