import React from "react";
import { Printer } from "lucide-react";
import { Staff360 } from "../../types";
import { formatCurrency } from "../../utils/formatters";

interface StaffTopBarProps {
  activeAgent: Staff360;
  staffList: Staff360[];
  onSelectAgent: (agent: string) => void;
  selectedSede: string;
  onSelectSede: (sede: string) => void;
  onPrint: () => void;
  periodLabel: string;
  isFiltered: boolean;
  facturacionTotal: number;
  margenEmpresa: number;
  margenPct: number;
}

export const StaffTopBar: React.FC<StaffTopBarProps> = ({
  activeAgent,
  staffList,
  onSelectAgent,
  selectedSede,
  onSelectSede,
  onPrint,
  periodLabel,
  isFiltered,
  facturacionTotal,
  margenEmpresa,
  margenPct
}) => {
  return (
    <div className="space-y-5">
      {/* Top Controls: Agent Selector & Print Button */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-base shadow-sm">
            360°
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Ficha 360° & P&L Individual del Colaborador
            </h2>
            <p className="text-xs text-slate-500">
              Inteligencia Financiera, Curva de Demanda, Asistencia y Gestión del Cambio para SaS Vaikuntha
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Sede Selector Pills */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => onSelectSede("ALL")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedSede === "ALL"
                  ? "bg-white text-indigo-600 shadow-xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => onSelectSede("Salón RD")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedSede === "Salón RD"
                  ? "bg-white text-indigo-600 shadow-xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Salón RD
            </button>
            <button
              onClick={() => onSelectSede("Luxury RD")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedSede === "Luxury RD"
                  ? "bg-white text-emerald-700 shadow-xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Luxury RD
            </button>
            <button
              onClick={() => onSelectSede("Gonzales AM")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedSede === "Gonzales AM"
                  ? "bg-white text-amber-700 shadow-xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Gonzales AM
            </button>
            <button
              onClick={() => onSelectSede("Gloss Salon")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedSede === "Gloss Salon"
                  ? "bg-white text-pink-600 shadow-xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Gloss Salon
            </button>
          </div>

          <div className="relative min-w-[240px]">
            <select
              value={activeAgent.agente}
              onChange={(e) => onSelectAgent(e.target.value)}
              className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-xs cursor-pointer"
            >
              {staffList.map((s) => (
                <option key={s.agente} value={s.agente}>
                  {s.agente} ({s.salon} • {s.especialidad})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onPrint}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / PDF</span>
          </button>
        </div>
      </div>

      {/* Document Master Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4 print:p-0 print:border-none print:shadow-none">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-2xl text-white flex items-center justify-center text-2xl font-black shadow-md print:shadow-none ${
            activeAgent.salon === "Luxury RD"
              ? "bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-emerald-200"
              : activeAgent.salon === "Gonzales AM"
              ? "bg-gradient-to-tr from-amber-600 to-orange-500 shadow-amber-200"
              : activeAgent.salon === "Gloss Salon"
              ? "bg-gradient-to-tr from-pink-600 to-rose-500 shadow-pink-200"
              : "bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-indigo-200"
          }`}>
            {activeAgent.agente.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900">{activeAgent.agente}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                activeAgent.salon === "Luxury RD"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                  : activeAgent.salon === "Gonzales AM"
                  ? "bg-amber-50 text-amber-800 border-amber-300"
                  : activeAgent.salon === "Gloss Salon"
                  ? "bg-pink-50 text-pink-700 border-pink-200/60"
                  : "bg-indigo-50 text-indigo-700 border-indigo-200/60"
              }`}>
                🏢 {activeAgent.salon}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                {activeAgent.estado}
              </span>
              {isFiltered && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  Corte: {periodLabel}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Especialidad: <span className="font-semibold text-slate-700">{activeAgent.especialidad}</span> • Sede:{" "}
              <span className="font-semibold text-slate-700">{activeAgent.salon}</span> • Horario Programado:{" "}
              <span className="font-semibold text-indigo-600">{activeAgent.hrEntrada || "9:00 AM"} - {activeAgent.hrSalida || "8:00 PM"}</span> (Descanso: {activeAgent.diaDescanso || "domingo"})
            </p>
          </div>
        </div>

        <div className="text-right text-xs">
          <div className="font-black text-slate-900 text-lg">
            Facturación en Corte: {formatCurrency(facturacionTotal)}
          </div>
          <div className="text-emerald-600 font-bold text-sm">
            Margen Empresa: {formatCurrency(margenEmpresa)} ({margenPct}%)
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Periodo: {periodLabel} • Emisión: {new Date().toLocaleDateString("es-PE")}
          </div>
        </div>
      </div>
    </div>
  );
};
