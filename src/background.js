// background.js
import Dexie from "dexie";
import { ethers } from "ethers";

// ----------------------
// ✅ Setup IndexedDB with Dexie
// ----------------------
const db = new Dexie("MetaPlayWalletDB");
db.version(1).stores({
    transactions: "&txHash, chainId, from, to, status, timestamp"
});



// Utility: Save transaction
async function saveTransaction(tx) {
    await db.transactions.put(tx);
}

// Utility: Update transaction status
async function updateTransactionStatus(txHash, status) {
    await db.transactions.update(txHash, { status });
}

// ----------------------
// ✅ Chrome Listener
// ----------------------
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("📩 Message received:", request.type, request.payload);

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

                console.log("💰 Balance:", balance, "ETH");
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

                console.log("⛽ Gas estimated:", {
                    gasPrice: ethers.formatUnits(feeData.gasPrice, "gwei"),
                    gasLimit: gasLimit.toString(),
                    estimatedFee,
                });

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
    if (request.type === "SEND_TX") {
        (async () => {
            try {
                const { to, amount, rpcUrl, privateKey, chainId } = request.payload;

                const provider = new ethers.JsonRpcProvider(rpcUrl);
                const wallet = new ethers.Wallet(privateKey, provider);

                const tx = {
                    to,
                    value: ethers.parseEther(amount),
                };

                const txResponse = await wallet.sendTransaction(tx);
                console.log("🚀 Transaction sent:", txResponse.hash);

                // ✅ Create a notification ID to reuse
                const notificationId = `tx-${txResponse.hash}`;



                // Save pending tx in DB
                await saveTransaction({
                    txHash: txResponse.hash,
                    from: wallet.address,
                    to,
                    amount,
                    status: "pending",
                    chainId,
                    timestamp: Date.now(),
                });

                // Wait for confirmation
                provider.waitForTransaction(txResponse.hash).then(async (receipt) => {
                    const finalStatus = receipt.status === 1 ? "confirmed" : "failed";

                    await updateTransactionStatus(txResponse.hash, finalStatus);

                    chrome.notifications.create(`tx-${txResponse.hash}`, {
                        type: "basic",
                        iconUrl: "icons/icon1.png",
                        title: `Transaction ${finalStatus === "confirmed" ? "Confirmed ✅" : "Failed ❌"}`,
                        message: `Sent ${amount} DXB to ${to}\nTx: ${txResponse.hash}`,
                        priority: 2,
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
    if (request.type === "GET_TX_HISTORY") {
        (async () => {
            const { chainId, address } = request.payload || {};
            try {
                let all = await db.transactions.toArray();

                const filtered = all.filter((t) => {
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
                sendResponse({ success: true, tx: filtered });
            } catch (err) {
                console.error("❌ GET_TX_HISTORY error:", err);
                sendResponse({ success: false, error: err.message });
            }
        })();
        return true;
    }

    return false; // no handler matched
});


