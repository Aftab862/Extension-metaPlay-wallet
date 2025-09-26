import { useEffect, useState, useCallback } from "react";
import { getTransactionHistory } from "../../utils/helper";

export function useTransactionHistory(autoRefresh = true, refreshInterval = 5000) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchHistory = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const txs = await getTransactionHistory();
            setHistory(txs);
        } catch (err) {
            setError(err.message || "Failed to load history");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHistory();

        let intervalId;
        if (autoRefresh) {
            intervalId = setInterval(fetchHistory, refreshInterval);
        }
        return () => clearInterval(intervalId);
    }, [autoRefresh, refreshInterval, fetchHistory]);

    return { history, loading, error, refresh: fetchHistory };
}
