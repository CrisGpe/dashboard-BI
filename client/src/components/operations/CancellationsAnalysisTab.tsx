import React from "react";
import {
  AlertOctagon,
  XCircle,
  Layers,
  Target,
  Filter,
  Info,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from "recharts";
import { OatcRecord } from "../../types";
import { formatDate, formatNumber } from "../../utils/formatters";

interface CancellationsAnalysisTabProps {
  cancellationsKPIs: {
    total: number;
    realRejections: number;
    realRejectionsPct: number;
    adminErrors: number;
    adminErrorsPct: number;
    sedeBattingRatio: number;
  };
  uniqueSedes: string[];
  daysOfWeek: string[];
  selectedSedeFilter: string;
  onSedeFilterChange: (sede: string) => void;
  selectedDayFilter: string;
  onDayFilterChange: (day: string) => void;
  selectedMacroFilter: string;
  onMacroFilterChange: (macro: string) => void;
  selectedSubFilter: string;
  onSubFilterChange: (sub: string) => void;
  onClearFilters: () => void;
  cancellationsByDay: {
    dia: string;
    total: number;
    precio: number;
    espera: number;
    desistimiento: number;
    administrativo: number;
    otros: number;
  }[];
  battingRatioByStaff: {
    agente: string;
    sede: string;
    completadas: number;
    rechazosReales: number;
    erroresRegistro: number;
    totalOportunidades: number;
    ratioBateo: number;
  }[];
  paginatedCancellations: OatcRecord[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    nextPage: () => void;
    prevPage: () => void;
  };
}

export const CancellationsAnalysisTab: React.FC<CancellationsAnalysisTabProps> = ({
  cancellationsKPIs,
  uniqueSedes,
  daysOfWeek,
  selectedSedeFilter,
  onSedeFilterChange,
  selectedDayFilter,
  onDayFilterChange,
  selectedMacroFilter,
  onMacroFilterChange,
  selectedSubFilter,
  onSubFilterChange,
  onClearFilters,
  cancellationsByDay,
  battingRatioByStaff,
  paginatedCancellations,
  pagination
}) => {
  const hasActiveFilters =
    selectedSedeFilter !== "ALL" ||
    selectedDayFilter !== "ALL" ||
    selectedMacroFilter !== "ALL" ||
    selectedSubFilter !== "ALL";

  return (
    <div className="p-4 sm:p-5 space-y-5">
      {/* 4 Spotlight KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-rose-600 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Total Cancelados
            </span>
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-rose-900">
            {formatNumber(cancellationsKPIs.total)}
          </div>
          <p className="text-[11px] text-rose-700 mt-0.5">
            Registros con formato "Cancelado: H:MM"
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-amber-600 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Rechazos Reales (Cliente)
            </span>
            <XCircle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-amber-900">
            {formatNumber(cancellationsKPIs.realRejections)}{" "}
            <span className="text-sm font-bold text-amber-700">
              ({cancellationsKPIs.realRejectionsPct}%)
            </span>
          </div>
          <p className="text-[11px] text-amber-700 mt-0.5">
            Oportunidades perdidas (precio, espera, desistimiento)
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-100/80 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-600 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Errores de Registro
            </span>
            <Layers className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-slate-800">
            {formatNumber(cancellationsKPIs.adminErrors)}{" "}
            <span className="text-sm font-bold text-slate-500">
              ({cancellationsKPIs.adminErrorsPct}%)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Duplicados y errores de tipeo de recepción
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Ratio de Bateo Promedio
            </span>
            <Target className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-emerald-900">
            {cancellationsKPIs.sedeBattingRatio}%
          </div>
          <p className="text-[11px] text-emerald-700 mt-0.5">
            Efectividad de cierre: atenciones vs oportunidades
          </p>
        </div>
      </div>

      {/* Filter Bar for Cancellations */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-slate-600 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-indigo-600" /> Filtrar por:
          </span>

          {/* Sede Filter */}
          <select
            value={selectedSedeFilter}
            onChange={(e) => onSedeFilterChange(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium cursor-pointer"
          >
            <option value="ALL">🏢 Todas las Sedes</option>
            {uniqueSedes.map((s) => (
              <option key={s} value={s}>
                Sede {s}
              </option>
            ))}
          </select>

          {/* Day Filter */}
          <select
            value={selectedDayFilter}
            onChange={(e) => onDayFilterChange(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium cursor-pointer"
          >
            <option value="ALL">📅 Todos los Días</option>
            {daysOfWeek.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Macro Category Filter */}
          <select
            value={selectedMacroFilter}
            onChange={(e) => onMacroFilterChange(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium cursor-pointer"
          >
            <option value="ALL">🎯 Clasificación Macro</option>
            <option value="RECHAZO_CLIENTE">Rechazo Real (Cliente)</option>
            <option value="ERROR_REGISTRO">Error Administrativo / Duplicado</option>
          </select>

          {/* Subcategory Filter */}
          <select
            value={selectedSubFilter}
            onChange={(e) => onSubFilterChange(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium cursor-pointer"
          >
            <option value="ALL">🔍 Motivo Específico</option>
            <option value="PRECIO">Precio / Muy caro</option>
            <option value="ESPERA">Tiempo de espera / Cola</option>
            <option value="DESISTIMIENTO">Desistimiento / No convencido</option>
            <option value="INSUMO">Falta de insumo / Stock</option>
            <option value="PREFERENCIA">Preferencia de estilista</option>
            <option value="ADMINISTRATIVO">Error Administrativo / Duplicado</option>
            <option value="OTRO">Otros motivos</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-xs text-rose-600 hover:text-rose-800 font-bold cursor-pointer"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Visual Analytics: Cancellations by Day of Week & Batting Ratio Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Stacked Chart by Day of Week (7 cols) */}
        <div className="lg:col-span-7 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Rechazos por Día de la Semana {selectedSedeFilter !== "ALL" ? `(Sede ${selectedSedeFilter})` : ""}
            </h4>
            <p className="text-[11px] text-slate-500">
              ¿Qué días se pierden más clientes por precio vs tiempos de espera?
            </p>
          </div>

          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cancellationsByDay} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="dia" tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "11px" }} />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Bar dataKey="precio" name="Precio / Costo" stackId="a" fill="#ef4444" />
                <Bar dataKey="espera" name="Tiempo Espera" stackId="a" fill="#f59e0b" />
                <Bar dataKey="desistimiento" name="No Convencido" stackId="a" fill="#8b5cf6" />
                <Bar dataKey="administrativo" name="Error / Duplicado" stackId="a" fill="#94a3b8" />
                <Bar dataKey="otros" name="Otros" stackId="a" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ranking of Batting Ratio by Staff (5 cols) */}
        <div className="lg:col-span-5 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Ranking de Ratio de Bateo por Colaborador
                </h4>
                <p className="text-[11px] text-slate-500">
                  Atenciones Concretadas vs Rechazos Reales de Clientes
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                Coaching Target
              </span>
            </div>

            <div className="overflow-y-auto max-h-56 sm:max-h-64">
              <table className="w-full text-xs text-left table-dense">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider sticky top-0 z-10 border-b border-slate-200">
                  <tr>
                    <th className="px-2.5 py-1.5 rounded-l-lg">Colaborador</th>
                    <th className="px-2.5 py-1.5 text-center">Concretadas</th>
                    <th className="px-2.5 py-1.5 text-center">Rechazos</th>
                    <th className="px-2.5 py-1.5 text-center rounded-r-lg">Ratio Bateo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {battingRatioByStaff.slice(0, 10).map((st) => (
                    <tr key={st.agente} className="hover:bg-slate-50/60">
                      <td className="px-2.5 py-1.5 font-bold text-slate-800">
                        <div>{st.agente}</div>
                        <div className="text-[10px] text-slate-400 font-normal">Sede: {st.sede}</div>
                      </td>
                      <td className="px-2.5 py-1.5 text-center font-semibold text-emerald-600">
                        {st.completadas}
                      </td>
                      <td className="px-2.5 py-1.5 text-center font-semibold text-rose-600">
                        {st.rechazosReales}
                      </td>
                      <td className="px-2.5 py-1.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            st.ratioBateo >= 90
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : st.ratioBateo >= 75
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {st.ratioBateo}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              El <strong>Ratio de Bateo</strong> no castiga los errores de tipeo de recepción; mide estrictamente cuántos clientes que solicitaron servicio se atendieron efectivamente.
            </span>
          </div>
        </div>
      </div>

      {/* Detailed Table of Rejections & Reasons */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="p-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Auditoría Detallada de Rechazos ({formatNumber(pagination.totalItems)} registros)
          </h4>
          <span className="text-[11px] text-slate-500">
            Data dura para toma de decisiones y coaching
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left table-dense">
            <thead className="bg-slate-100/70 text-slate-600 font-semibold uppercase tracking-wider sticky top-0 z-10 border-b border-slate-200">
              <tr>
                <th className="px-3.5 py-2.5">ID / # OATC</th>
                <th className="px-3.5 py-2.5">Fecha & Día</th>
                <th className="px-3.5 py-2.5">Hora Cancelación</th>
                <th className="px-3.5 py-2.5">Cliente</th>
                <th className="px-3.5 py-2.5">Colaborador</th>
                <th className="px-3.5 py-2.5">Servicio</th>
                <th className="px-3.5 py-2.5">Clasificación</th>
                <th className="px-3.5 py-2.5">Motivo Exacto Registrado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedCancellations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    No se encontraron rechazos con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                paginatedCancellations.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-3.5 py-2 font-mono font-bold text-indigo-600">
                      #{c.numeroOatc}
                    </td>
                    <td className="px-3.5 py-2 text-slate-600 whitespace-nowrap">
                      {formatDate(c.fechaRegistro)} • <span className="font-bold">{c.diaSemana}</span>
                    </td>
                    <td className="px-3.5 py-2 font-mono text-slate-700 whitespace-nowrap">
                      {c.horaCancelacion || c.horaResolucion || "-"}
                    </td>
                    <td className="px-3.5 py-2 font-bold text-slate-800">
                      {c.clienteNombre}
                    </td>
                    <td className="px-3.5 py-2 font-semibold text-slate-800">
                      {c.agente}
                    </td>
                    <td className="px-3.5 py-2 font-medium text-slate-700">
                      {c.tipoOatc}
                    </td>
                    <td className="px-3.5 py-2 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.macroCategoria === "RECHAZO_CLIENTE"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {c.subCategoria || "OTRO"}
                      </span>
                    </td>
                    <td
                      className="px-3.5 py-2 text-slate-700 font-medium max-w-xs truncate"
                      title={c.motivoLimpio || c.motivo}
                    >
                      {c.motivoLimpio || c.motivo || "Cancelación sin motivo registrado"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/30">
          <span>
            Página {pagination.currentPage} de {pagination.totalPages} (
            {formatNumber(pagination.totalItems)} rechazos filtrados)
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={pagination.prevPage}
              disabled={pagination.currentPage === 1}
              className="p-1 rounded-lg hover:bg-slate-200 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={pagination.nextPage}
              disabled={pagination.currentPage === pagination.totalPages}
              className="p-1 rounded-lg hover:bg-slate-200 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
