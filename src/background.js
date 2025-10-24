// background.js
import Dexie from "dexie";
import { ethers } from "ethers";

// ----------------------
// ✅ Setup IndexedDB with Dexie
// ----------------------
const db = new Dexie("MetaPlayWalletDB");

// 🚨 Bump version number when changing schema
db.version(2).stores({
    transactions: `
        &txHash, 
        chainId, 
        from, 
        to, 
        status, 
        timestamp, 
        type, 
        tokenAddress,
        nonce,
        symbol,
        explorer,
        name,
        gasLimit,
        gasPrice,
        gasUsed,
        effectiveGasPrice
    `
});



const API_KEY = "6RW4_bP3AEOZffLygkqmRTM58lp01gz9"

// Utility: Save transaction
async function saveTransaction(tx) {
    await db.transactions.put(tx);
}


async function updateTransactionStatus(txHash, status, extra = {}) {
    return db.transactions.update(txHash, {
        status,
        ...extra,  // merge extra fields like gasUsed, actualFee
    });
}

// background.js
const activeDappTabs = [];
let currentAddress = null;

/* Helper: send message to extension listeners (popup) */
function sendMessageToExtension(message) {
    return new Promise((resolve) => {
        try {
            chrome.runtime.sendMessage(message, (response) => {
                if (chrome.runtime.lastError) {
                    resolve({ ok: false, error: chrome.runtime.lastError.message });
                } else {
                    resolve({ ok: true, response });
                }
            });
        } catch (err) {
            resolve({ ok: false, error: err?.message || String(err) });
        }
    });
}

/* Helper: wait for popup to send POPUP_CURRENT_ADDRESS */
function waitForPopupAddress(timeoutMs = 15000) {
    return new Promise((resolve) => {
        const listener = (msg) => {
            if (msg?.type === "POPUP_CURRENT_ADDRESS") {
                chrome.runtime.onMessage.removeListener(listener);
                resolve({ success: true, address: msg.address || null });
            }
        };
        chrome.runtime.onMessage.addListener(listener);

        setTimeout(() => {
            chrome.runtime.onMessage.removeListener(listener);
            resolve({ success: false, error: "timeout" });
        }, timeoutMs);
    });
}



/* Main message handler */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // 1) DApp registers
    if (request.type === "REGISTER_DAPP" && sender.tab?.id) {

        if (!activeDappTabs.includes(sender.tab.id)) activeDappTabs.push(sender.tab.id);
        console.log("🌐 DApp registered:", sender.tab.id);
        // Immediately send current address if known (so DApp doesn't miss it)
        sendResponse({ ok: true, address: currentAddress || null });
        return true;
    }

    // 3) Popup notifies background of current address
    if (request.type === "POPUP_CURRENT_ADDRESS") {
        console.log("📬 Background received address:", request.address);
        currentAddress = request.address || null;
        console.log("Active DApp tabs to notify:", activeDappTabs);
        if (activeDappTabs.length > 0) {
            for (const tabId of activeDappTabs) {
                console.log("➡️ Forwarding WALLET_UPDATED to DApp tab:", tabId, "with address:", currentAddress);
                chrome.tabs.sendMessage(tabId, { type: "WALLET_UPDATED", address: currentAddress }, () => {
                    if (chrome.runtime.lastError) {
                        console.warn(`⚠️ Could not reach DApp tab ${tabId}:`, chrome.runtime.lastError.message);
                        // activeDappTabs.delete(tabId);
                    }
                });
            }
        } else {
            console.log("ℹ️ No registered DApp tabs to forward to (address saved).");
        }

        sendResponse({ ok: true });
        return true;
    }

    // 4) Simple getter for DApp
    if (request.type === "GET_CURRENT_ADDRESS") {
        sendResponse({ success: true, account: currentAddress || null });
        return true;
    }

    // 5) Internal quick check for CONNECT flow (popup can respond)
    if (request.type === "INTERNAL_GET_ADDRESS") {
        sendResponse({ address: currentAddress || null });
        return true;
    }

    // 6) CONNECT_WALLET flow (called by content when page asks to connect)
    if (request.type === "CONNECT_WALLET") {
        (async () => {
            console.log("🔗 CONNECT_WALLET received from content");
            try {
                // a) If we already have an address, return it
                if (currentAddress) {
                    console.log("✅ CONNECT_WALLET: returning stored address:", currentAddress);
                    sendResponse({ success: true, account: currentAddress });
                    return;
                }

                // b) Try to ask popup/internal listeners silently
                const quick = await sendMessageToExtension({ type: "INTERNAL_GET_ADDRESS" });
                if (quick.ok && quick.response?.address) {
                    currentAddress = quick.response.address;
                    console.log("✅ CONNECT_WALLET: INTERNAL_GET_ADDRESS returned:", currentAddress);

                    // forward to registered dapps
                    for (const tabId of Array.from(activeDappTabs)) {
                        chrome.tabs.sendMessage(tabId, { type: "WALLET_UPDATED", address: currentAddress }, () => {
                            if (chrome.runtime.lastError) {
                                console.warn("⚠️ Forward failed:", chrome.runtime.lastError.message);
                                // activeDappTabs.delete(tabId);
                            }
                        });
                    }

                    sendResponse({ success: true, account: currentAddress });
                    return;
                }

                // c) Open popup UI for user approval
                console.log("ℹ️ CONNECT_WALLET: opening popup UI for user approval");
                chrome.windows.create({
                    url: chrome.runtime.getURL("popup.html"),
                    type: "popup",
                    width: 370,
                    height: 630,
                    top: 80,
                    left: 1000
                });

                // d) Wait for popup to send address
                const got = await waitForPopupAddress(15000);
                if (got.success && got.address) {
                    currentAddress = got.address;
                    console.log("✅ CONNECT_WALLET: popup returned address:", currentAddress);

                    for (const tabId of Array.from(activeDappTabs)) {
                        chrome.tabs.sendMessage(tabId, { type: "WALLET_UPDATED", address: currentAddress }, () => {
                            if (chrome.runtime.lastError) {
                                console.warn("⚠️ Forward after popup failed:", chrome.runtime.lastError.message);
                                // activeDappTabs.delete(tabId);
                            }
                        });
                    }

                    sendResponse({ success: true, account: currentAddress });
                    return;
                }

                // e) Timeout or no address
                console.warn("⛔ CONNECT_WALLET: popup timed out or returned no address");
                sendResponse({ success: false, error: "timeout_or_no_address" });
            } catch (err) {
                console.error("💥 CONNECT_WALLET error:", err);
                sendResponse({ success: false, error: err?.message || String(err) });
            }
        })();

        return true; // keep channel open
    }


    // ------------------------
    // GET BALANCE
    // ------------------------
    if (request.type === "GET_BALANCE") {
        (async () => {
            try {
                const { address, rpcUrl } = request.payload;
                const provider = new ethers.JsonRpcProvider(rpcUrl);

                const balanceBN = await provider.getBalance(address);
                const balance = ethers.formatEther(balanceBN);

                // console.log("💰 Balance:", balance, "ETH");
                sendResponse({ success: true, balance });
            } catch (err) {
                console.error("❌ GET_BALANCE error:", err);
                sendResponse({ success: false, error: err.message });
            }
        })();
        return true; // keep channel open
    }

    // ------------------------
    // ESTIMATE GAS
    // ------------------------
    if (request.type === "ESTIMATE_FEE") {
        (async () => {
            try {
                const { from, to, amount, rpcUrl } = request.payload;
                const provider = new ethers.JsonRpcProvider(rpcUrl);

                const feeData = await provider.getFeeData();
                if (!feeData.gasPrice) throw new Error("No gas price available from RPC");

                const gasLimit = await provider.estimateGas({
                    from,
                    to,
                    value: ethers.parseEther(amount),
                });

                const feeBN = feeData.gasPrice * gasLimit;
                const estimatedFee = ethers.formatEther(feeBN);

                // console.log("⛽ Gas estimated:", {
                //     gasPrice: ethers.formatUnits(feeData.gasPrice, "gwei"),
                //     gasLimit: gasLimit.toString(),
                //     estimatedFee,
                // });

                sendResponse({
                    success: true,
                    gasPrice: ethers.formatUnits(feeData.gasPrice, "gwei"),
                    gasLimit: gasLimit.toString(),
                    estimatedFee,
                });
            } catch (err) {
                console.error("❌ ESTIMATE_GAS error:", err);
                sendResponse({ success: false, error: err.message });
            }
        })();
        return true;
    }

    // ------------------------
    // SEND TX
    // ------------------------
    // ------------------------
    if (request.type === "SEND_TX") {
        (async () => {
            try {
                const { to, amount, rpcUrl, privateKey, chainId, name, symbol, explorer } = request.payload;

                const provider = new ethers.JsonRpcProvider(rpcUrl);
                const wallet = new ethers.Wallet(privateKey, provider);

                const tx = {
                    to,
                    value: ethers.parseEther(amount),
                };

                const txResponse = await wallet.sendTransaction(tx);
                // console.log("🚀 Transaction sent:", txResponse.hash);

                // Save *pending* tx in DB
                await saveTransaction({
                    txHash: txResponse.hash,
                    from: wallet.address,
                    to,
                    amount,
                    type: "native",
                    tokenAddress: null,
                    status: "pending",
                    chainId,
                    timestamp: Date.now(),
                    name,
                    symbol,
                    explorer,

                    // extra fields
                    nonce: txResponse.nonce,
                    gasLimit: txResponse.gasLimit?.toString(),
                    gasPrice: txResponse.gasPrice
                        ? ethers.formatUnits(txResponse.gasPrice, "gwei") // ✅ convert before saving
                        : null,
                    total: ethers.formatEther(
                        txResponse.value + (txResponse.gasLimit * (txResponse.gasPrice || 0n))
                    ),
                });

                // Wait for confirmation
                provider.waitForTransaction(txResponse.hash).then(async (receipt) => {
                    const finalStatus = receipt.status === 1 ? "confirmed" : "failed";

                    await updateTransactionStatus(txResponse.hash, finalStatus, {
                        gasUsed: receipt.gasUsed?.toString(),
                        effectiveGasPrice: receipt.effectiveGasPrice
                            ? ethers.formatUnits(receipt.effectiveGasPrice, "gwei") // ✅
                            : null,
                        // you can also calculate actual fee here
                        actualFee: (receipt.gasUsed && receipt.effectiveGasPrice)
                            ? ethers.formatUnits(receipt.gasUsed * receipt.effectiveGasPrice, "ether")
                            : null,
                    });

                    const notificationId = `tx-${txResponse.hash}`;
                    chrome.notifications.create(notificationId, {
                        type: "basic",
                        iconUrl: "icons/icon1.png",
                        title: `Transaction ${finalStatus === "confirmed" ? "Confirmed ✅" : "Failed ❌"}`,
                        message: `Sent ${amount} ${symbol} to ${to}\nClick to view on explorer.`,
                        priority: 2,
                    });

                    // 👇 Add this block
                    chrome.notifications.onClicked.addListener((clickedId) => {
                        if (clickedId === notificationId && explorer) {
                            chrome.tabs.create({ url: `${explorer}/tx/${txResponse.hash}` });
                        }
                    });

                });

                sendResponse({ success: true, txHash: txResponse.hash });
            } catch (err) {
                console.error("❌ SEND_TX error:", err);

                chrome.notifications.create({
                    type: "basic",
                    iconUrl: "icons/icon1.png",
                    title: "Transaction Failed",
                    message: err.message || "Something went wrong",
                    priority: 2,
                });

                sendResponse({ success: false, error: err.message });
            }
        })();
        return true;
    }


    // ------------------------
    // GET TX HISTORY
    // ------------------------
    // --- Function to fetch transactions from the Block Explorer API ---


    // --- Modified Request Handler ---
    if (request.type === "GET_TX_HISTORY") {
        (async () => {
            const { chainId, address } = request.payload || {};
            try {
                const all = await db.transactions.toArray();
                // console.log("all database transactions:", all);

                // filter only what matters
                const txHistory = all.filter((t) => {
                    if (chainId && t.chainId !== chainId) return false;
                    if (address) {
                        const addr = address.toLowerCase();
                        return (
                            (t.from && t.from.toLowerCase() === addr) ||
                            (t.to && t.to.toLowerCase() === addr)
                        );
                    }
                    return true;
                });

                sendResponse({ success: true, tx: txHistory });
            } catch (err) {
                console.error("❌ GET_TX_HISTORY error:", err);
                sendResponse({ success: false, error: err.message });
            }
        })();
        return true;
    }


    // ------------------------
    // ESTIMATE GAS for ERC20
    // ------------------------
    if (request.type === "ESTIMATE_FEE_TOKEN") {
        (async () => {
            try {
                const { from, to, amount, rpcUrl, tokenAddress, decimals } = request.payload;

                const provider = new ethers.JsonRpcProvider(rpcUrl);

                const feeData = await provider.getFeeData();
                if (!feeData.gasPrice) throw new Error("No gas price available from RPC");

                // ERC20 ABI (minimal)
                const abi = ["function transfer(address to, uint256 value) returns (bool)"];
                const contract = new ethers.Contract(tokenAddress, abi, provider);

                // Build tx data
                const value = ethers.parseUnits(amount, decimals);
                const txData = await contract.transfer.populateTransaction(to, value);

                // Estimate gas
                const gasLimit = await provider.estimateGas({
                    from,
                    to: tokenAddress,
                    data: txData.data,
                });

                const feeBN = feeData.gasPrice * gasLimit;
                const estimatedFee = ethers.formatEther(feeBN);

                // console.log("⛽ ERC20 Gas estimated:", {
                //     gasPrice: ethers.formatUnits(feeData.gasPrice, "gwei"),
                //     gasLimit: gasLimit.toString(),
                //     estimatedFee,
                // });

                sendResponse({
                    success: true,
                    gasPrice: ethers.formatUnits(feeData.gasPrice, "gwei"),
                    gasLimit: gasLimit.toString(),
                    estimatedFee,
                });
            } catch (err) {
                console.error("❌ ESTIMATE_FEE_TOKEN error:", err);
                sendResponse({ success: false, error: err.message });
            }
        })();
        return true;
    }

    // ------------------------
    // SEND ERC20 TX
    // ------------------------
    if (request.type === "SEND_TOKEN_TX") {
        (async () => {
            try {
                const { to, amount, rpcUrl, privateKey, chainId, tokenAddress, decimals, gasPrice, gasLimit, explorer, tokenName, tokenSymbol } = request.payload;

                const provider = new ethers.JsonRpcProvider(rpcUrl);
                const wallet = new ethers.Wallet(privateKey, provider);

                const abi = ["function transfer(address to, uint256 value) returns (bool)"];
                const contract = new ethers.Contract(tokenAddress, abi, wallet);

                // Build tx overrides
                const txOverrides = {};
                if (gasPrice) txOverrides.gasPrice = ethers.parseUnits(gasPrice, "gwei");
                if (gasLimit) txOverrides.gasLimit = BigInt(gasLimit);

                // Send ERC20 transfer
                const txResponse = await contract.transfer(
                    to,
                    ethers.parseUnits(amount, decimals),
                    txOverrides
                );

                // console.log("🚀 ERC20 Transaction sent:", txResponse);


                // ✅ Save pending token tx in DB
                await saveTransaction({
                    txHash: txResponse.hash,
                    from: wallet.address,
                    to,
                    amount,
                    type: "erc20",
                    tokenAddress,
                    status: "pending",
                    chainId,
                    timestamp: Date.now(),
                    name: tokenName,
                    symbol: tokenSymbol,
                    explorer,

                    // Extra fields for modal
                    nonce: txResponse.nonce,
                    gasLimit: txResponse.gasLimit?.toString(),
                    gasPrice: txResponse.gasPrice
                        ? ethers.formatUnits(txResponse.gasPrice, "gwei") // ✅ convert before saving
                        : null,
                });

                // Wait for confirmation
                provider.waitForTransaction(txResponse.hash).then(async (receipt) => {
                    const finalStatus = receipt.status === 1 ? "confirmed" : "failed";

                    await updateTransactionStatus(txResponse.hash, finalStatus, {
                        gasUsed: receipt.gasUsed?.toString(),
                        effectiveGasPrice: receipt.effectiveGasPrice
                            ? ethers.formatUnits(receipt.effectiveGasPrice, "gwei") // ✅
                            : null,
                        // you can also calculate actual fee here
                        actualFee: (receipt.gasUsed && receipt.effectiveGasPrice)
                            ? ethers.formatUnits(receipt.gasUsed * receipt.effectiveGasPrice, "ether")
                            : null,
                    });

                    const notificationId = `tx-${txResponse.hash}`;
                    chrome.notifications.create(notificationId, {
                        type: "basic",
                        iconUrl: "icons/icon1.png",
                        title: `Token Transfer ${finalStatus === "confirmed" ? "Confirmed ✅" : "Failed ❌"}`,
                        message: `Sent ${amount} ${tokenSymbol} to ${to}\nClick to view on explorer.`,
                        priority: 2,
                    });

                    // 👇 Add this block
                    chrome.notifications.onClicked.addListener((clickedId) => {
                        if (clickedId === notificationId && explorer) {
                            chrome.tabs.create({ url: `${explorer}/tx/${txResponse.hash}` });
                        }
                    });

                });

                sendResponse({ success: true, txHash: txResponse.hash });
            } catch (err) {
                console.error("❌ SEND_TOKEN_TX error:", err);

                chrome.notifications.create({
                    type: "basic",
                    iconUrl: "icons/icon1.png",
                    title: "Token Transfer Failed",
                    message: err.message || "Something went wrong",
                    priority: 2,
                });

                sendResponse({ success: false, error: err.message });
            }
        })();
        return true;
    }



    return true; // no handler matched
});

chrome.tabs.onRemoved.addListener((tabId) => {
    const i = activeDappTabs.indexOf(tabId);
    if (i !== -1) activeDappTabs.splice(i, 1);
});


