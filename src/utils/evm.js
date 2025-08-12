import { ethers } from "ethers";

// Fetch native balance (ETH, BNB, MATIC, etc)
export async function getNativeBalance(rpcUrl, address) {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const balance = await provider.getBalance(address);
    return Number(ethers.formatEther(balance));
}

// Fetch ERC20 token balance by contract
export async function getTokenBalance(rpcUrl, tokenAddress, userAddress, decimals) {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    // ERC20 minimal ABI for balanceOf()
    const abi = ["function balanceOf(address owner) view returns (uint256)"];
    const contract = new ethers.Contract(tokenAddress, abi, provider);

    try {
        const rawBalance = await contract.balanceOf(userAddress);
        return Number(ethers.formatUnits(rawBalance, decimals));
    } catch {
        return 0;
    }
}
