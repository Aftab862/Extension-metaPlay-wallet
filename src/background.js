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


const API_KEY = "6RW4_bP3AEOZffLygkqmRTM58lp01gz9"

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
                let txs = [];

                if (address && chainId) {
                    // Example for Ethereum Mainnet with Alchemy

                    const url = `https://eth-mainnet.g.alchemy.com/v2/${API_KEY}`;

                    const body = {
                        jsonrpc: "2.0",
                        id: 1,
                        method: "alchemy_getAssetTransfers",
                        params: [
                            {
                                fromBlock: "0x0",
                                toBlock: "latest",
                                category: ["external", "internal", "erc20", "erc721"],
                                withMetadata: true,
                                toAddress: address,
                                fromAddress: address,
                                maxCount: "0x28", // 40 in hex
                            },
                        ],
                    };

                    const res = await fetch(url, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(body),
                    });

                    const data = await res.json();
                    txs = data.result?.transfers || [];
                }

                // Optional: Save into IndexedDB for offline use
                await db.transactions.bulkPut(txs);

                sendResponse({ success: true, tx: txs });
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

                console.log("⛽ ERC20 Gas estimated:", {
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
                const { to, amount, rpcUrl, privateKey, chainId, tokenAddress, decimals, gasPrice, gasLimit } = request.payload;

                const provider = new ethers.JsonRpcProvider(rpcUrl);
                const wallet = new ethers.Wallet(privateKey, provider);

                const abi = ["function transfer(address to, uint256 value) returns (bool)"];
                const contract = new ethers.Contract(tokenAddress, abi, wallet);

                // Build tx
                const txOverrides = {};
                if (gasPrice) txOverrides.gasPrice = ethers.parseUnits(gasPrice, "gwei");
                if (gasLimit) txOverrides.gasLimit = BigInt(gasLimit);

                const txResponse = await contract.transfer(
                    to,
                    ethers.parseUnits(amount, decimals),
                    txOverrides
                );

                console.log("🚀 ERC20 Transaction sent:", txResponse.hash);

                // Save pending tx in DB
                await saveTransaction({
                    txHash: txResponse.hash,
                    from: wallet.address,
                    to,
                    amount,
                    tokenAddress,
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
                        title: `Token Transfer ${finalStatus === "confirmed" ? "Confirmed ✅" : "Failed ❌"}`,
                        message: `Sent ${amount} tokens to ${to}\nTx: ${txResponse.hash}`,
                        priority: 2,
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


    return false; // no handler matched
});


