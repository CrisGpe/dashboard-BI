import { Dashboard360Response, SheetIdsConfig } from "../types";

export async function fetchDashboardData(forceRefresh = false): Promise<Dashboard360Response> {
  const url = forceRefresh ? "/api/dashboard?refresh=true" : "/api/dashboard";
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Error en el servidor: HTTP ${res.status}`);
  }
  return res.json();
}

export async function refreshDashboardData(): Promise<Dashboard360Response> {
  const res = await fetch("/api/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });
  if (!res.ok) {
    throw new Error(`Error al forzar actualización: HTTP ${res.status}`);
  }
  const result = await res.json();
  return result.data;
}

export async function getSheetSettings(): Promise<SheetIdsConfig> {
  const res = await fetch("/api/settings");
  if (!res.ok) {
    throw new Error(`Error al obtener configuración: HTTP ${res.status}`);
  }
  const result = await res.json();
  return result.sheetIds;
}

export async function updateSheetSettings(config: Partial<SheetIdsConfig>): Promise<Dashboard360Response> {
  const res = await fetch("/api/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config)
  });
  if (!res.ok) {
    throw new Error(`Error al actualizar configuración: HTTP ${res.status}`);
  }
  const result = await res.json();
  return result.data;
}
