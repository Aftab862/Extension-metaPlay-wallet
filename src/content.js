// content.js
console.log("✅ MetaPlay content script loaded");

// Inject the provider into the page context
const s = document.createElement("script");
s.src = chrome.runtime.getURL("injected.js");
(document.head || document.documentElement).appendChild(s);
s.onload = () => s.remove();

// Register DApp and immediately ask for current address
chrome.runtime.sendMessage({ type: "REGISTER_DAPP" }, (res) => {
    if (res?.ok) {
        console.log("🌐 DApp registered with background. currentAddress:", res.address);
        // If background returned an address immediately, forward to page
        if (res.address) {
            window.postMessage({ type: "WALLET_UPDATED", address: res.address }, "*");
        }
    }
});

// Listen for background pushes and forward to page
chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.type === "WALLET_UPDATED") {
        console.log("✅ Content: Received WALLET_UPDATED", msg.address);
        window.postMessage({ type: "WALLET_UPDATED", address: msg.address }, "*");
    }
});

// Page -> Extension bridge
window.addEventListener("message", (event) => {
    if (event.source !== window) return;
    const msg = event.data;

    if (msg?.type === "CONNECT_WALLET_REQUEST") {
        // ask background to connect (may open popup)
        chrome.runtime.sendMessage({ type: "CONNECT_WALLET" }, (res) => {
            window.postMessage({ type: "CONNECT_WALLET_RESPONSE", payload: res }, "*");
        });
    }

    if (msg?.type === "GET_CURRENT_ADDRESS_REQUEST") {
        chrome.runtime.sendMessage({ type: "GET_CURRENT_ADDRESS" }, (res) => {
            window.postMessage({ type: "GET_CURRENT_ADDRESS_RESPONSE", payload: res }, "*");
        });
    }
});
