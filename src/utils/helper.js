// src/utils/helper.js
export function mapColors(symbol) {
    if (!symbol) return "#9e9e9e";
    const s = String(symbol).toUpperCase();
    switch (s) {
        case "ETH":
        case "EVM":
            return "#627eea";
        case "MATIC":
            return "#8247e5";
        case "BNB":
            return "#f3ba2f";
        case "SOL":
            return "#8247e5";
        case "USDT":
            return "#26a17b";
        case "USDC":
            return "#2775ca";
        default:
            return "#9e9e9e";
    }
}

export function capitalizeFirstLetter(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
}


export function findAccountDetails(wallets, targetAccount) {
    for (const wallet of wallets) {
        for (const account of wallet.accounts) {
            for (const chain of account.chains) {
                if (
                    chain?.address?.toLowerCase() === targetAccount?.chains[0]?.address?.toLowerCase()
                ) {
                    return { wallet, account, chain };
                }
            }
        }
    }
    return null;
}

export function findAccountByAddress(wallets, targetAddress) {
    if (!targetAddress) return null;

    const lowerTarget = targetAddress.toLowerCase();

    for (const wallet of wallets) {
        for (const account of wallet.accounts) {
            for (const chain of account.chains) {
                if (chain?.address?.toLowerCase() === lowerTarget) {
                    return { wallet, account, chain };
                }
            }
        }
    }

    return null;
}


export function findAccountNameOrIndex(wallets, targetAddress) {
    if (!Array.isArray(wallets) || !targetAddress) return null;
    const target = String(targetAddress).toLowerCase();

    for (const wallet of wallets) {
        if (!wallet || !Array.isArray(wallet.accounts)) continue;

        for (const acct of wallet.accounts) {
            if (!acct || !Array.isArray(acct.chains)) continue;

            const found = acct.chains.some(chain => {
                const addr = chain?.address;
                return typeof addr === 'string' && addr.toLowerCase() === target;
            });

            if (found) {
                // prefer a readable name when present, otherwise accountIndex
                const name = (acct.accountName || "").trim();
                return name !== "" ? name : acct.accountIndex;
            }
        }
    }

    return null;
}


export function bgRequest(message) {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage(message, (res) => resolve(res));
    });
}
