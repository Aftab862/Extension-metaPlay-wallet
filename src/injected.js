// injected.js (in-page)
console.log("✅ MetaPlay injected script running");

window.metaplay = {
    connect: () =>
        new Promise((resolve, reject) => {
            window.postMessage({ type: "CONNECT_WALLET_REQUEST" }, "*");

            const handler = (event) => {
                if (event.source !== window) return;
                if (event.data?.type === "CONNECT_WALLET_RESPONSE") {
                    window.removeEventListener("message", handler);
                    const payload = event.data.payload || {};
                    if (payload?.success && payload.account) resolve(payload.account);
                    else reject(new Error(payload?.error || "connect_failed"));
                }
            };

            window.addEventListener("message", handler);
        }),

    getCurrentAccount: () =>
        new Promise((resolve) => {
            window.postMessage({ type: "GET_CURRENT_ADDRESS_REQUEST" }, "*");

            const handler = (event) => {
                if (event.source !== window) return;
                if (event.data?.type === "GET_CURRENT_ADDRESS_RESPONSE") {
                    window.removeEventListener("message", handler);
                    resolve(event.data.payload?.account || null);
                }
            };

            window.addEventListener("message", handler);
        })
};

let lastAddress = null;
window.addEventListener("message", (event) => {
    if (event.source !== window) return;
    const d = event.data;
    if (d?.type === "WALLET_UPDATED") {
        const addr = d.address || null;
        if (addr === lastAddress) return; // dedupe
        lastAddress = addr;
        console.log("✅ Injected: Received WALLET_UPDATED:", addr);
        // use custom event so React can listen without needing to inspect window messages
        window.dispatchEvent(new CustomEvent("walletChanged", { detail: addr }));
    }
});
