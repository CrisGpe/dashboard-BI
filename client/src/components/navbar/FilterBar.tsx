import React from "react";
import { Filter, Calendar, User, Search, RotateCcw, Store } from "lucide-react";
import { Staff360, SalonFilter, SALONES_CONFIG } from "../../types";

interface FilterBarProps {
  staffList: Staff360[];
  selectedSalon: SalonFilter;
  onSelectSalon: (salon: SalonFilter) => void;
  selectedAgent: string;
  onSelectAgent: (agent: string) => void;
  startDate: string;
  onStartDateChange: (date: string) => void;
  endDate: string;
  onEndDateChange: (date: string) => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onClearFilters: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  staffList,
  selectedSalon,
  onSelectSalon,
  selectedAgent,
  onSelectAgent,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  searchTerm,
  onSearchChange,
  onClearFilters
}) => {
  const hasActiveFilters =
    selectedSalon !== "ALL" ||
    selectedAgent !== "ALL" ||
    Boolean(startDate) ||
    Boolean(endDate) ||
    Boolean(searchTerm);

  const applyPreset = (preset: "all" | "30d" | "thisMonth") => {
    if (preset === "all") {
      onStartDateChange("");
      onEndDateChange("");
      return;
    }
    const today = new Date();
    const endStr = today.toISOString().split("T")[0];
    if (preset === "30d") {
      const past30 = new Date();
      past30.setDate(today.getDate() - 30);
      onStartDateChange(past30.toISOString().split("T")[0]);
      onEndDateChange(endStr);
    } else if (preset === "thisMonth") {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      onStartDateChange(startOfMonth.toISOString().split("T")[0]);
      onEndDateChange(endStr);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs mb-6 no-print">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Left: Salon, Agent & Search */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Salon Selector */}
          <div className="relative min-w-[200px] sm:w-60 flex-1 sm:flex-initial">
            <Store className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedSalon}
              onChange={(e) => onSelectSalon(e.target.value as SalonFilter)}
              className="w-full text-xs font-bold pl-9 pr-8 py-2 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
            >
              <option value="ALL">🏢 Todos los Salones (4 Sedes)</option>
              <option value="RD">🟦 Salón RD</option>
              <option value="LUXURY_RD">🟩 Luxury RD</option>
              <option value="GONZALES_AM">🟨 Gonzales AM</option>
              <option value="GLOSS_SALON">🌸 Gloss Salon</option>
            </select>
          </div>

          {/* Agent Selector */}
          <div className="relative min-w-[220px] sm:w-64 flex-1 sm:flex-initial">
            <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedAgent}
              onChange={(e) => onSelectAgent(e.target.value)}
              className="w-full text-xs font-medium pl-9 pr-8 py-2 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700"
            >
              <option value="ALL">👥 Colaboradores ({staffList.length})</option>
              {staffList.map((s) => (
                <option key={s.agente} value={s.agente}>
                  {s.agente} ({s.totalServicios} serv / S/. {s.totalVentasRetail.toFixed(0)})
                </option>
              ))}
            </select>
          </div>

          {/* Quick Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar cliente, ticket, servicio..."
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Right: Date Range & Quick Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="hidden sm:inline">Desde:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <span className="hidden sm:inline">Hasta:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Presets */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => applyPreset("30d")}
              className="px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200/60"
            >
              30 Días
            </button>
            <button
              onClick={() => applyPreset("thisMonth")}
              className="px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200/60"
            >
              Este Mes
            </button>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              title="Restablecer filtros"
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Limpiar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
