import React from "react";
import { Calendar, RotateCcw } from "lucide-react";

interface StaffTemporalRibbonProps {
  localStartDate: string;
  localEndDate: string;
  periodLabel: string;
  totalServicios: number;
  availableMonths: string[];
  isFiltered: boolean;
  onApplyPreset: (preset: "all" | "2026" | "2025" | "q3_2026" | "q2_2026" | "30d" | "month", monthVal?: string) => void;
  onUpdateDateRange: (start: string, end: string) => void;
  monthNames: { [key: string]: string };
}

export const StaffTemporalRibbon: React.FC<StaffTemporalRibbonProps> = ({
  localStartDate,
  localEndDate,
  periodLabel,
  totalServicios,
  availableMonths,
  isFiltered,
  onApplyPreset,
  onUpdateDateRange,
  monthNames
}) => {
  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm no-print space-y-3 border border-indigo-900/50">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-600/30 text-indigo-300 border border-indigo-500/30">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-indigo-200">
                Corte Temporal para la Evaluación 1-a-1
              </h3>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-2 py-0.5 rounded-full font-bold">
                Anti-Abrumamiento
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Aísla un mes o trimestre específico para evaluar metas claras sin mezclar dos años de histórico acumulado.
            </p>
          </div>
        </div>

        {/* Active Period Badge */}
        <div className="flex items-center gap-2 bg-slate-800/90 border border-indigo-500/30 px-3.5 py-1.5 rounded-xl text-xs">
          <span className="text-slate-400 text-[11px]">Periodo activo:</span>
          <span className="font-bold text-white text-xs">{periodLabel}</span>
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-lg text-[10px] font-black ml-1">
            {totalServicios} atenciones
          </span>
        </div>
      </div>

      {/* Quick Presets & Date Inputs */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-indigo-900/60">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
          Filtros Rápidos:
        </span>

        <button
          onClick={() => onApplyPreset("all")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            !isFiltered
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
          }`}
        >
          🌟 Todo el Histórico
        </button>

        <button
          onClick={() => onApplyPreset("2026")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            localStartDate === "2026-01-01" && localEndDate === "2026-12-31"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
          }`}
        >
          📅 Año 2026
        </button>

        <button
          onClick={() => onApplyPreset("q3_2026")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            localStartDate === "2026-07-01" && localEndDate === "2026-09-30"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
          }`}
        >
          🍂 Q3 2026 (Jul-Sep)
        </button>

        <button
          onClick={() => onApplyPreset("q2_2026")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            localStartDate === "2026-04-01" && localEndDate === "2026-06-30"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
          }`}
        >
          🌸 Q2 2026 (Abr-Jun)
        </button>

        <button
          onClick={() => onApplyPreset("30d")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            localStartDate === "2026-08-13" && localEndDate === "2026-09-12"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
          }`}
        >
          ⚡ Últimos 30 Días
        </button>

        {/* Month Dropdown */}
        <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1 text-xs">
          <span className="text-[11px] text-slate-400">Mes:</span>
          <select
            value={
              localStartDate && localEndDate && localStartDate.substring(0, 7) === localEndDate.substring(0, 7)
                ? localStartDate.substring(0, 7)
                : ""
            }
            onChange={(e) => {
              if (e.target.value) onApplyPreset("month", e.target.value);
            }}
            className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer"
          >
            <option value="" className="bg-slate-900 text-slate-300">
              Seleccionar mes...
            </option>
            {availableMonths.map((ym) => {
              const [y, m] = ym.split("-");
              return (
                <option key={ym} value={ym} className="bg-slate-900 text-white">
                  {monthNames[m] || m} {y}
                </option>
              );
            })}
          </select>
        </div>

        {/* Custom Date Range Inputs */}
        <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1 text-xs">
          <span className="text-[11px] text-slate-400">Desde:</span>
          <input
            type="date"
            value={localStartDate}
            onChange={(e) => onUpdateDateRange(e.target.value, localEndDate)}
            className="bg-transparent text-white text-xs font-mono focus:outline-none cursor-pointer"
          />
          <span className="text-slate-500">-</span>
          <span className="text-[11px] text-slate-400">Hasta:</span>
          <input
            type="date"
            value={localEndDate}
            onChange={(e) => onUpdateDateRange(localStartDate, e.target.value)}
            className="bg-transparent text-white text-xs font-mono focus:outline-none cursor-pointer"
          />
        </div>

        {isFiltered && (
          <button
            onClick={() => onApplyPreset("all")}
            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-300 hover:text-rose-100 hover:bg-rose-950/40 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Limpiar corte
          </button>
        )}
      </div>
    </div>
  );
};
