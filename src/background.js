// background.js
import Dexie from "dexie";
import { ethers } from "ethers";

// ----------------------
// ✅ Setup IndexedDB with Dexie
// ----------------------
const db = new Dexie("MetaPlayWalletDB");
db.version(1).stores({
    transactions: "&txHash, chainId, from, to, status, timestamp, type, tokenAddress"
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

async function getTxHistoryFromExplorer(explorerApiUrl, address, chainId) {
    // 1. Clean the URL and set up the base for the Etherscan-compatible API
    const baseUrl = explorerApiUrl.replace(/\/+$/, '');

    // 2. Construct the standard API endpoint for account transaction list (txlist)
    // NOTE: We are intentionally omitting the '&apikey=...' parameter here as requested.
    const apiUrl = `${baseUrl}/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            // Check for non-200 HTTP response codes
            throw new Error(`Explorer HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        // Block explorers use different status fields; Etherscan-style uses 'status: 1'
        if (data.status === '1' && Array.isArray(data.result)) {
            // Map the explorer data to your application's transaction format
            return data.result.map(tx => ({
                hash: tx.hash,
                from: tx.from,
                to: tx.to,
                value: tx.value,             // Usually in Wei/smallest unit
                timestamp: tx.timeStamp,     // Must be present for sorting/display
                blockNumber: tx.blockNumber,
                chainId: chainId,
                // Add any other necessary fields (gasUsed, contractAddress, etc.)
            }));
        } else if (data.message === 'No transactions found' || (Array.isArray(data.result) && data.result.length === 0)) {
            // Successfully retrieved, but the list is empty
            return [];
        } else {
            // Handle specific API errors reported in the JSON body (e.g., rate limits)
            const errorMessage = data.message || data.error?.message || "Unknown error from explorer API";
            throw new Error(`Explorer API Error: ${errorMessage}`);
        }
    } catch (err) {
        console.warn(`⚠️ External fetch failed (will use local DB if available): ${err.message}`);
        // Re-throw the error so it can be caught by the main try/catch block
        throw err;
    }
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
                    type: "native",
                    tokenAddress: null,
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
    // --- Function to fetch transactions from the Block Explorer API ---


    // --- Modified Request Handler ---
    if (request.type === "GET_TX_HISTORY") {
        (async () => {
            // Destructure the new explorerApiUrl
            const { chainId, address, rpcUrl, explorerApiUrl } = request.payload || {};

            let txHistory = [];

            try {
                // 1. PRIORITIZE EXTERNAL FETCH if the URL and address are provided
                if (explorerApiUrl && address && chainId) {
                    console.log(`Fetching history for ${address} on chain ${chainId} from ${explorerApiUrl}`);

                    // Attempt to fetch from the external explorer
                    txHistory = await getTxHistoryFromExplorer(explorerApiUrl, address, chainId);

                } else {
                    // 2. FALLBACK to existing local database logic
                    console.log("Falling back to local database query (Missing explorerApiUrl, address, or chainId).");

                    let all = await db.transactions.toArray();
                    console.log("all database tranactions :", all)

                    // Existing filtering logic
                    txHistory = all.filter((t) => {
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
                }

                // Send the final result
                sendResponse({ success: true, tx: txHistory });

            } catch (err) {
                // This catch block handles both external fetch failures AND local DB errors
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


