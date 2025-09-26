import { useEffect, useState } from "react";

export const useTransactionHistory = (autoRefresh = false, interval = 10000, chainId, address) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const result = await chrome.runtime.sendMessage({
                type: "GET_TX_HISTORY",
                payload: { chainId, address },
            });
            console.log("tranactions received   :", result)
            setHistory(result?.tx || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!chainId || !address) return;

        // fetch immediately on mount / deps change
        fetchHistory();

        if (autoRefresh) {
            const id = setInterval(fetchHistory, interval);
            return () => clearInterval(id);
        }
    }, [chainId, address, interval]);


    return { history, loading, error, refresh: fetchHistory };
};
