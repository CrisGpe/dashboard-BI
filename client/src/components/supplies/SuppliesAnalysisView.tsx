import React, { useState, useEffect } from "react";
import {
  FlaskConical,
  RefreshCw,
  Info,
  Calendar,
  Users,
  Tag,
  FileSpreadsheet,
  AlertCircle,
  TrendingUp,
  Sparkles
} from "lucide-react";
import { SuppliesDashboardResponse } from "../../types";
import { SuppliesKpis } from "./SuppliesKpis";
import { SuppliesYearlyTrend } from "./SuppliesYearlyTrend";
import { SuppliesStylistRanking } from "./SuppliesStylistRanking";
import { SuppliesBrandDistribution } from "./SuppliesBrandDistribution";
import { SuppliesAuditTable } from "./SuppliesAuditTable";

export const SuppliesAnalysisView: React.FC = () => {
  const [data, setData] = useState<SuppliesDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"trends" | "stylists" | "brands" | "audit">("trends");

  const fetchSupplies = async (forceRefresh = false) => {
    if (forceRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const url = `http://localhost:3001/api/supplies${forceRefresh ? "?refresh=true" : ""}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Error en el servidor: HTTP ${res.status}`);
      }
      const json: SuppliesDashboardResponse = await res.json();
      setData(json);
    } catch (err: any) {
      console.error("[SuppliesAnalysisView] Error al cargar:", err);
      setError(err.message || "Error al conectar con el servidor de insumos");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSupplies();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin"></div>
          <FlaskConical className="w-6 h-6 text-violet-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="text-center">
          <h3 className="text-sm font-bold text-slate-800">Cargando Insumos & Laboratorio...</h3>
          <p className="text-xs text-slate-500 mt-1">
            Procesando y agregando ~100,000 despachos históricos de Google Sheets
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-xl mx-auto my-12 space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h3 className="text-base font-bold text-red-900">Error al cargar datos de Insumos</h3>
        <p className="text-xs text-red-700">{error || "No se recibieron datos del servidor"}</p>
        <button
          onClick={() => fetchSupplies(true)}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-all shadow-md"
        >
          Reintentar Carga
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Banner & Decoupled Notice */}
      <div className="bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        {/* Background glow element */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-violet-500/30 text-violet-200 border border-violet-400/30 backdrop-blur-md">
                <FlaskConical className="w-3.5 h-3.5" />
                Módulo Desacoplado de Auditoría
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Google Sheets Directo
              </span>
              <span className="text-xs text-violet-300/80 font-mono">
                {data.metadata.totalFilas.toLocaleString("es-PE")} filas analizadas
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Control de Insumos & Laboratorio Técnico
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Módulo especializado para la auditoría de consumos técnicos en peluquería, dispensación de tintes, peróxidos y tratamientos. Opera de forma completamente desacoplada para salvaguardar la exactitud del P&L principal (S/ 3.98M) y garantizar tiempos de carga sub-segundo.
            </p>
          </div>

          {/* Actions & Refresh */}
          <div className="flex sm:flex-col items-end justify-between gap-3 shrink-0">
            <button
              onClick={() => fetchSupplies(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-md transition-all disabled:opacity-50"
              title="Recargar los datos de Google Sheets"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-violet-300" : ""}`} />
              <span>{refreshing ? "Sincronizando..." : "Actualizar Fuente"}</span>
            </button>
            <span className="text-[11px] text-violet-300/70 font-mono">
              Actualizado: {new Date(data.metadata.generatedAt).toLocaleTimeString("es-PE")}
            </span>
          </div>
        </div>

        {/* Informative Alert / Context Banner */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-start gap-3 text-xs text-slate-300">
          <Info className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-white">Contexto de la fuente de datos: </span>
            <span>
              Contiene registros desde el año 2022 hasta el 2026. Los costos monetarios en la Columna K están valorizados en el 43.9% de los registros históricos (S/ 475,997.76), mientras que en 2026 destaca un fuerte avance en trazabilidad digital con 8,876 despachos formalmente enlazados a órdenes OATC.
            </span>
          </div>
        </div>
      </div>

      {/* 2. Executive KPIs */}
      <SuppliesKpis data={data} />

      {/* 3. Section Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab("trends")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeSubTab === "trends"
              ? "bg-violet-600 text-white shadow-md shadow-violet-200"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Tendencias & Evolución Anual
        </button>

        <button
          onClick={() => setActiveSubTab("stylists")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeSubTab === "stylists"
              ? "bg-violet-600 text-white shadow-md shadow-violet-200"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Users className="w-4 h-4" />
          Consumo por Colaborador ({data.stylistRankings.length})
        </button>

        <button
          onClick={() => setActiveSubTab("brands")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeSubTab === "brands"
              ? "bg-violet-600 text-white shadow-md shadow-violet-200"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Tag className="w-4 h-4" />
          Marcas & Catálogo Técnico
        </button>

        <button
          onClick={() => setActiveSubTab("audit")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeSubTab === "audit"
              ? "bg-violet-600 text-white shadow-md shadow-violet-200"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          Explorador de Despachos ({data.recentDispatches.length.toLocaleString("es-PE")})
        </button>
      </div>

      {/* 4. Active Sub-view Rendering */}
      {activeSubTab === "trends" && (
        <SuppliesYearlyTrend
          yearlyTrends={data.yearlyTrends}
          monthlyTrends={data.monthlyTrends}
        />
      )}

      {activeSubTab === "stylists" && (
        <SuppliesStylistRanking stylistRankings={data.stylistRankings} />
      )}

      {activeSubTab === "brands" && (
        <SuppliesBrandDistribution
          brandRankings={data.brandRankings}
          typeRankings={data.typeRankings}
        />
      )}

      {activeSubTab === "audit" && (
        <SuppliesAuditTable dispatches={data.recentDispatches} />
      )}
    </div>
  );
};
