import React from "react";
import { ShieldAlert, Building2 } from "lucide-react";
import { BranchCancellationSummary } from "../../../types";

export interface BenchmarkCancellationsProps {
  comparativaCancelaciones?: BranchCancellationSummary[];
}

export const BenchmarkCancellations: React.FC<BenchmarkCancellationsProps> = ({
  comparativaCancelaciones
}) => {
  if (!comparativaCancelaciones || comparativaCancelaciones.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-black text-slate-900">
              Comparativa de Cancelaciones, Rechazos y Retención Quad-Sede
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Auditoría real de rechazos en recepción (Salón RD, Luxury RD y Gloss Salon) vs la ceguera operativa de Gonzales AM.
          </p>
        </div>
        <span className="px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold">
          Control Operativo & Coaching
        </span>
      </div>

      {/* KPI Cards Quad-Sede */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {comparativaCancelaciones.map((branch) => {
          const isBlind = branch.sedeId === "GONZALES_AM";
          const isLuxury = branch.sedeId === "LUXURY_RD";
          const isGloss = branch.sedeId === "GLOSS_SALON";
          return (
            <div
              key={branch.sedeId}
              className={`rounded-2xl p-5 border flex flex-col justify-between transition-all ${
                isBlind
                  ? "bg-rose-50/40 border-rose-200 shadow-xs"
                  : isLuxury
                  ? "bg-purple-50/30 border-purple-200 shadow-xs"
                  : isGloss
                  ? "bg-pink-50/30 border-pink-200 shadow-xs"
                  : "bg-indigo-50/30 border-indigo-200 shadow-xs"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Building2
                      className={`w-4 h-4 ${
                        isBlind
                          ? "text-rose-600"
                          : isLuxury
                          ? "text-purple-600"
                          : isGloss
                          ? "text-pink-600"
                          : "text-indigo-600"
                      }`}
                    />
                    <h4 className="text-sm font-black text-slate-900">{branch.nombre}</h4>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isBlind
                        ? "bg-rose-100 text-rose-800 border-rose-300"
                        : isLuxury
                        ? "bg-purple-100 text-purple-800 border-purple-300"
                        : isGloss
                        ? "bg-pink-100 text-pink-800 border-pink-300"
                        : "bg-indigo-100 text-indigo-800 border-indigo-300"
                    }`}
                  >
                    {isBlind ? "Sin Recepción" : "Módulo OATC"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Atenciones
                    </span>
                    <p className="text-base font-black text-slate-800 mt-0.5">
                      {branch.totalAtenciones.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Cancelados
                    </span>
                    <p
                      className={`text-base font-black mt-0.5 ${
                        isBlind ? "text-rose-600" : branch.totalCancelados > 500 ? "text-amber-600" : "text-emerald-600"
                      }`}
                    >
                      {isBlind ? "0 (Oculto)" : branch.totalCancelados.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-xs mb-4">
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-600">Tasa de Cancelación:</span>
                    <span
                      className={`font-black ${
                        isBlind
                          ? "text-rose-600"
                          : branch.tasaCancelacionPct > 4
                          ? "text-amber-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {isBlind ? "0% (Ceguera)" : `${branch.tasaCancelacionPct}%`}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isBlind
                          ? "bg-rose-400"
                          : branch.tasaCancelacionPct > 4
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.min(100, isBlind ? 100 : branch.tasaCancelacionPct * 10)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {isBlind
                      ? "Pérdida invisible sin registro de motivos"
                      : `${branch.totalAtenciones - branch.totalCancelados} atenciones efectivas completadas`}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                    Top Motivos Registrados:
                  </span>
                  <div className="space-y-1.5">
                    {branch.topMotivos.map((motivo, mIdx) => (
                      <div
                        key={mIdx}
                        className="text-[11px] p-2 rounded-lg bg-white border border-slate-100 flex items-center justify-between text-slate-700 shadow-2xs"
                      >
                        <span className="truncate pr-2">{motivo.motivo}</span>
                        <span className="font-bold text-slate-900 shrink-0">
                          {motivo.count > 0 ? `${motivo.count}` : "-"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
