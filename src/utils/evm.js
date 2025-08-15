// src/utils/evm.js
import { ethers } from "ethers";

// Get native balance as a number string (in ETH/MATIC/BNB units)
export async function getNativeBalance(rpcUrl, address) {
    if (!rpcUrl || !address) return "0";
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance); // returns string
}

// Get ERC-20 token balance using minimal ABI, returns formatted string
export async function getTokenBalance(rpcUrl, tokenAddress, userAddress, decimals = 18) {
    if (!rpcUrl || !tokenAddress || !userAddress) return "0";
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const abi = ["function balanceOf(address) view returns (uint256)"];
    const contract = new ethers.Contract(tokenAddress, abi, provider);
    const raw = await contract.balanceOf(userAddress);
    return ethers.formatUnits(raw, decimals); // returns string
}
