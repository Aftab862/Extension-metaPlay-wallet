// background.js (MV3 service worker)
// Bundle ethers with your extension instead of CDN
import { ethers } from "ethers";

// Background ready
chrome.runtime.onInstalled.addListener(() => {
    console.log("✅ Background worker installed");
    console.log("Ethers version:", ethers.version);
});

// Message listener
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
                    gasPrice: ethers.formatUnits(feeData.gasPrice),
                    gasLimit: gasLimit.toString(),
                    estimatedFee,
                });

                sendResponse({
                    success: true,
                    gasPrice: ethers.formatUnits(feeData.gasPrice),
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
                const { to, amount, rpcUrl, privateKey } = request.payload;

                const provider = new ethers.JsonRpcProvider(rpcUrl);
                const wallet = new ethers.Wallet(privateKey, provider);

                const tx = {
                    to,
                    value: ethers.parseEther(amount),
                };

                const txResponse = await wallet.sendTransaction(tx);

                console.log("🚀 Transaction sent:", txResponse.hash);

                // ✅ Show Chrome notification
                chrome.notifications.create({
                    type: "basic",
                    iconUrl: "icons/icon1.png", // make sure you have this in your extension
                    title: "Transaction Sent",
                    message: `You sent ${amount} DXB to ${to}\nTx Hash: ${txResponse.hash}`,
                    priority: 2,
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


    return false; // no handler matched
});




/**
 * Message API:
 * - { type: "GET_BALANCE", payload: { address, rpcUrl } }
 * - { type: "ESTIMATE_FEE", payload: { from, to, amount, rpcUrl } }
 * - { type: "SEND_TX", payload: { from, to, amount, rpcUrl, privateKey } }
 */

// async function makeProvider(rpcUrl) {
//     if (!rpcUrl) throw new Error("rpcUrl required");
//     return new ethers.JsonRpcProvider(rpcUrl);
// }

// async function resolveIfENS(provider, input) {
//     // If input looks like ENS (contains a dot) try to resolve; otherwise return input
//     if (!input) return null;
//     const trimmed = String(input).trim();
//     if (isAddress(trimmed)) return trimmed;
//     if (trimmed.includes(".")) {
//         const resolved = await provider.resolveName(trimmed);
//         if (!resolved) throw new Error("ENS name did not resolve to an address");
//         return resolved;
//     }
//     throw new Error("Invalid address format");
// }

// async function handleGetBalance(payload) {
//     const { address, rpcUrl } = payload || {};
//     if (!address || !rpcUrl) throw new Error("address and rpcUrl are required");
//     const provider = await makeProvider(rpcUrl);
//     const resolved = isAddress(address) ? address : await provider.resolveName(address);
//     if (!resolved) throw new Error("Address invalid or ENS unresolved");
//     const balBN = await provider.getBalance(resolved);
//     return { ok: true, balance: ethers.formatEther(balBN) }; // string decimal
// }

// async function handleEstimateFee(payload) {
//     const { from, to, amount, rpcUrl } = payload || {};
//     if (!from || !to || amount == null || !rpcUrl) throw new Error("from,to,amount,rpcUrl required");
//     const provider = await makeProvider(rpcUrl);

//     // Resolve recipient (allow ENS)
//     const resolvedTo = await resolveIfENS(provider, to);
//     const resolvedFrom = await resolveIfENS(provider, from);

//     // parse value
//     const value = ethers.parseEther(String(amount || "0"));

//     // estimate gas limit (wrap in try/catch)
//     let gasLimit;
//     try {
//         gasLimit = await provider.estimateGas({ from: resolvedFrom, to: resolvedTo, value });
//     } catch (err) {
//         // fallback to sane default for simple transfers
//         gasLimit = 21000n;
//     }

//     // get fee data
//     const feeData = await provider.getFeeData();
//     // EIP-1559 check: feeData.maxFeePerGas may be undefined on legacy chains
//     let feeBN;
//     if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
//         // Use maxFeePerGas * gasLimit as conservative estimate
//         feeBN = feeData.maxFeePerGas * gasLimit;
//     } else {
//         // legacy: gasPrice * gasLimit
//         const gasPrice = feeData.gasPrice ?? ethers.parseUnits("10", "gwei");
//         feeBN = gasPrice * gasLimit;
//     }

//     const fee = ethers.formatEther(feeBN); // string decimal
//     return {
//         ok: true,
//         fee, // string
//         gasLimit: String(gasLimit), // return string to avoid BigInt serialization issues
//         feeBN: String(feeBN)
//     };
// }

// async function handleSendTx(payload) {
//     const { from, to, amount, rpcUrl, privateKey } = payload || {};
//     if (!from || !to || amount == null || !rpcUrl || !privateKey) {
//         throw new Error("from,to,amount,rpcUrl,privateKey required");
//     }
//     const provider = await makeProvider(rpcUrl);

//     // Resolve addresses
//     const resolvedTo = await resolveIfENS(provider, to);
//     const wallet = new ethers.Wallet(privateKey, provider);
//     if (wallet.address.toLowerCase() !== from.toLowerCase()) {
//         throw new Error("Private key does not match sender address");
//     }

//     // parse value
//     const value = ethers.parseEther(String(amount));

//     // estimate gas limit
//     let gasLimit;
//     try {
//         gasLimit = await provider.estimateGas({ from: wallet.address, to: resolvedTo, value });
//     } catch (err) {
//         gasLimit = 21000n;
//     }

//     // fee data
//     const feeData = await provider.getFeeData();
//     if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
//         // eip-1559 tx
//         const tx = {
//             to: resolvedTo,
//             value,
//             gasLimit,
//             type: 2,
//             maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
//             maxFeePerGas: feeData.maxFeePerGas,
//         };

//         // ensure sufficient balance including fee
//         const balance = await provider.getBalance(wallet.address);
//         const feeBN = feeData.maxFeePerGas * gasLimit;
//         if (balance < value + feeBN) {
//             throw new Error("Insufficient balance to cover value + fee");
//         }

//         const txResp = await wallet.sendTransaction(tx);
//         return { ok: true, hash: txResp.hash };
//     } else {
//         // legacy tx
//         const gasPrice = feeData.gasPrice ?? ethers.parseUnits("10", "gwei");
//         const feeBN = gasPrice * gasLimit;
//         const balance = await provider.getBalance(wallet.address);
//         if (balance < value + feeBN) {
//             throw new Error("Insufficient balance to cover value + fee");
//         }

//         const tx = {
//             to: resolvedTo,
//             value,
//             gasLimit,
//             gasPrice,
//         };
//         const txResp = await wallet.sendTransaction(tx);
//         return { ok: true, hash: txResp.hash };
//     }
// }

// /**************
//  * Message listener
//  **************/
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//     (async () => {
//         try {
//             const { type, payload } = message || {};
//             if (type === "GET_BALANCE") {
//                 const res = await handleGetBalance(payload);
//                 sendResponse(res);
//                 return;
//             }
//             if (type === "ESTIMATE_FEE") {
//                 const res = await handleEstimateFee(payload);
//                 sendResponse(res);
//                 return;
//             }
//             if (type === "SEND_TX") {
//                 const res = await handleSendTx(payload);
//                 sendResponse(res);
//                 return;
//             }
//             sendResponse({ ok: false, error: "Unknown message type" });
//         } catch (err) {
//             sendResponse({ ok: false, error: err.message || "Background error" });
//         }
//     })();
//     return true; // keep sendResponse async
// });
