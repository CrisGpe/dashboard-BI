import { useState, useEffect, useCallback } from "react";
import { Dashboard360Response } from "../types";
import { fetchDashboardData, refreshDashboardData } from "../services/api";

export function useDashboardData() {
  const [data, setData] = useState<Dashboard360Response | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const res = isRefresh ? await refreshDashboardData() : await fetchDashboardData();
      setData(res);
    } catch (err: any) {
      console.error("Error loading dashboard data:", err);
      setError(err.message || "Error al conectar con el servidor analítico");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData(false);
  }, [loadData]);

  const handleRefresh = () => {
    loadData(true);
  };

  return {
    data,
    loading,
    refreshing,
    error,
    refresh: handleRefresh,
    setData
  };
}
