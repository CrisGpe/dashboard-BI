import React from "react";
import { RefreshCw, Settings, Layers, Wifi, WifiOff } from "lucide-react";
import { Dashboard360Response } from "../../types";

interface HeaderProps {
  data: Dashboard360Response | null;
  refreshing: boolean;
  onRefresh: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ data, refreshing, onRefresh, onOpenSettings }) => {
  const isLive = data?.metadata.source === "google_sheets_live";
  const lastSyncTime = data?.metadata.generatedAt
    ? new Date(data.metadata.generatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "-";

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs no-print">
      <div className="dashboard-fluid">
        <div className="flex items-center justify-between h-16">
          {/* Brand info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 tracking-tight">
                  Dashboard Ejecutivo 360°
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  Multi-Fuente
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Cruce Integral: Admin • Recepción • ERP VentaRD
              </p>
            </div>
          </div>

          {/* Status & Actions */}
          <div className="flex items-center gap-3">
            {/* Live status badge */}
            <div
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border ${
                isLive
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200/70"
                  : "bg-amber-50 text-amber-700 border-amber-200/70"
              }`}
            >
              {isLive ? <Wifi className="w-3.5 h-3.5 text-emerald-600" /> : <WifiOff className="w-3.5 h-3.5 text-amber-600" />}
              <span>{isLive ? "Google Sheets En Vivo" : "Modo Respaldo"}</span>
              <span className="text-[10px] opacity-70 border-l border-current pl-2">
                Sinc: {lastSyncTime}
              </span>
            </div>

            {/* Refresh button */}
            <button
              onClick={onRefresh}
              disabled={refreshing}
              title="Sincronizar datos en vivo de Google Sheets"
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all active:scale-95 disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-indigo-600" : ""}`} />
              <span className="hidden md:inline">{refreshing ? "Sincronizando..." : "Sincronizar"}</span>
            </button>

            {/* Settings button */}
            <button
              onClick={onOpenSettings}
              title="Configurar URLs de Google Sheets"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
