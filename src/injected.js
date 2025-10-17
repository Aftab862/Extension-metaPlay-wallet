console.log("✅ MetaPlay injected script running");

window.metaplay = {
    connect: () => {
        return new Promise((resolve, reject) => {
            console.log("🔗 MetaPlay: connect() called from webpage");
            window.postMessage({ type: "CONNECT_WALLET_REQUEST" }, "*");

            const listener = (event) => {
                if (event.data.type === "CONNECT_WALLET_RESPONSE") {
                    window.removeEventListener("message", listener);
                    const res = event.data.payload;
                    res?.success ? resolve(res.account) : reject(new Error(res.error));
                }
            };

            window.addEventListener("message", listener);
        });
    },
};
