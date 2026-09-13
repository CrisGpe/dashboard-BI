import React from "react";
import {
  GitCompare,
  Sparkles,
  CheckCircle2,
  Calendar,
  Filter,
  Percent,
  Calculator,
  UserCheck,
  Hash,
  Info
} from "lucide-react";
import { DemandNormalizationMode, BenchmarkTimeWindow, MultiBranchBenchmark } from "../../../types";

export interface BenchmarkHeaderProps {
  timeWindow: BenchmarkTimeWindow;
  setTimeWindow: (win: BenchmarkTimeWindow) => void;
  normalizationMode: DemandNormalizationMode;
  setNormalizationMode: (mode: DemandNormalizationMode) => void;
  activeBranches: MultiBranchBenchmark["branches"];
}

export const BenchmarkHeader: React.FC<BenchmarkHeaderProps> = ({
  timeWindow,
  setTimeWindow,
  normalizationMode,
  setNormalizationMode,
  activeBranches
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-xl border border-indigo-500/20">
      <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <GitCompare className="w-3.5 h-3.5" /> Benchmark Quad-Sede Normalizado
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Inferencia Bayesiana & Multi-Muestra
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> 6,676 Check-ins Luxury
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-pink-500/20 border border-pink-400/30 text-pink-300 text-xs font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> 6,636 Check-ins Gloss
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white">
            Benchmark Quad-Sede: Salón RD vs Luxury RD vs Gonzales AM vs Gloss Salon
          </h1>
          <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
            Comparativa objetiva y sin sesgos de escala. Ajuste por <strong>% relativo</strong>, <strong>promedio diario</strong> y{" "}
            <strong>dotación de estilistas</strong> para comparar sedes con diferente tamaño muestral y plantilla.
          </p>
        </div>

        {/* Controls: Temporal Window & Normalization Selector */}
        <div className="flex flex-col sm:flex-row xl:flex-col gap-3 shrink-0">
          {/* Window Selector */}
          <div className="bg-slate-800/90 p-1.5 rounded-xl border border-slate-700/80 flex items-center gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-indigo-400" /> Ventana:
            </span>
            <button
              onClick={() => setTimeWindow("year_2026")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                timeWindow === "year_2026"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Compara exactamente los mismos días de operación del 2026 (02 Ene - 10 Sep 2026)"
            >
              <span>Año 2026 Homogéneo</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-indigo-500/40 rounded text-indigo-200">Recomendado</span>
            </button>
            <button
              onClick={() => setTimeWindow("all_history")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeWindow === "all_history"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Histórico acumulado completo desde 2025"
            >
              Todo el Histórico
            </button>
          </div>

          {/* Normalization Mode Selector */}
          <div className="bg-slate-800/90 p-1.5 rounded-xl border border-slate-700/80 flex flex-wrap items-center gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 flex items-center gap-1">
              <Filter className="w-3 h-3 text-amber-400" /> Normalización:
            </span>
            <button
              onClick={() => setNormalizationMode("relative_pct")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                normalizationMode === "relative_pct"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Distribución porcentual de la demanda. Suma 100%. Elimina por completo el sesgo del tamaño de muestra."
            >
              <Percent className="w-3 h-3" /> % Relativo (Sin Sesgo)
            </button>
            <button
              onClick={() => setNormalizationMode("daily_avg")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                normalizationMode === "daily_avg"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Promedio de atenciones por día operativo típico (divide entre los días reales trabajados)."
            >
              <Calculator className="w-3 h-3" /> Promedio / Día
            </button>
            <button
              onClick={() => setNormalizationMode("per_stylist")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                normalizationMode === "per_stylist"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Intensidad por estilista activo: RD 65, Luxury 28, Gonzales 21, Gloss 16."
            >
              <UserCheck className="w-3 h-3" /> Por Estilista
            </button>
            <button
              onClick={() => setNormalizationMode("absolute")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                normalizationMode === "absolute"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Atenciones brutas acumuladas (sujeto a sesgo por cantidad de días y personal)."
            >
              <Hash className="w-3 h-3" /> Absoluto
            </button>
          </div>
        </div>
      </div>

      {/* Methodological Context Alert */}
      <div className="mt-4 pt-4 border-t border-slate-700/60 flex items-start gap-2.5 text-xs text-slate-300">
        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <p>
          {normalizationMode === "relative_pct" && (
            <span>
              <strong>Modo Activo: % Distribución Relativa (Sin Sesgo).</strong> Al normalizar cada sede al 100%, se
              elimina el efecto del tamaño de plantilla (RD: 65, Luxury: 28, Gonzales AM: 21, Gloss: 16 estilistas). Se compara la{" "}
              <em>forma pura</em> de la demanda a lo largo del día y la semana.
            </span>
          )}
          {normalizationMode === "daily_avg" && (
            <span>
              <strong>Modo Activo: Promedio por Día Típico.</strong> Divide el volumen entre los días activos de cada
              unidad (Gonzales AM: {activeBranches.GONZALES_AM?.diasOperativos} días; Luxury RD:{" "}
              {activeBranches.LUXURY_RD?.diasOperativos} días; Salón RD: {activeBranches.RD?.diasOperativos} días
              {activeBranches.GLOSS_SALON ? `; Gloss Salon: ${activeBranches.GLOSS_SALON.diasOperativos} días` : ""}),
              mostrando la velocidad de atención diaria esperada.
            </span>
          )}
          {normalizationMode === "per_stylist" && (
            <span>
              <strong>Modo Activo: Intensidad por Estilista Activo.</strong> Divide el volumen entre la cantidad de
              estilistas de cada sede (RD: {activeBranches.RD?.estilistasActivos}, Luxury:{" "}
              {activeBranches.LUXURY_RD?.estilistasActivos}, Gonzales: {activeBranches.GONZALES_AM?.estilistasActivos}
              {activeBranches.GLOSS_SALON ? `, Gloss: ${activeBranches.GLOSS_SALON.estilistasActivos}` : ""}),
              revelando la carga de trabajo por sillón.
            </span>
          )}
          {normalizationMode === "absolute" && (
            <span>
              <strong>Modo Activo: Totales Acumulados Brutos.</strong> Advertencia: Las sedes más grandes presentan cifras más altas
              principalmente debido a su mayor plantilla. Usa "% Relativo" para comparaciones estructurales.
            </span>
          )}
        </p>
      </div>
    </div>
  );
};
