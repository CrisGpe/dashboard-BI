import React from "react";
import { Building2, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { MultiBranchBenchmark } from "../../../types";

export interface BenchmarkBranchCardsProps {
  activeBranches: MultiBranchBenchmark["branches"];
  is2026: boolean;
  fmtMoney: (n: number) => string;
  fmtCompact: (n: number) => string;
}

export const BenchmarkBranchCards: React.FC<BenchmarkBranchCardsProps> = ({
  activeBranches,
  is2026,
  fmtMoney,
  fmtCompact
}) => {
  if (!activeBranches?.RD) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
      {/* Branch 1: Salón RD */}
      <div className="bg-white rounded-2xl p-5 border-2 border-indigo-100 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div>
          <div className="absolute top-0 right-0 w-28 h-28 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <h3 className="text-base font-black text-slate-900">{activeBranches.RD.nombre}</h3>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {activeBranches.RD.badge}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {activeBranches.RD.diasOperativos} días activos
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Recepción Digital
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {is2026 ? "Facturación 2026" : "Facturación Total"}
              </span>
              <p className="text-base font-black text-slate-900 mt-0.5">{fmtMoney(activeBranches.RD.totalFacturado)}</p>
              <span className="text-[10px] text-slate-500">Servicios + Retail ERP</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ticket Promedio</span>
              <p className="text-base font-black text-indigo-600 mt-0.5">{fmtMoney(activeBranches.RD.ticketPromedio)}</p>
              <span className="text-[10px] text-slate-500">
                {activeBranches.RD.totalTransacciones.toLocaleString()} atenciones
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estilistas Activos</span>
              <p className="text-base font-black text-slate-800 mt-0.5">{activeBranches.RD.estilistasActivos} estilistas</p>
              <span className="text-[10px] text-slate-500">Sede principal insignia</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Productividad Media</span>
              <p className="text-base font-black text-emerald-600 mt-0.5">
                {fmtCompact(activeBranches.RD.productividadPorEstilista)}
              </p>
              <span className="text-[10px] text-slate-500">Por estilista activo</span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span>Hora Pico Real:</span>
          </div>
          <span className="font-bold text-slate-900 bg-indigo-50 px-2 py-0.5 rounded-md text-indigo-700">
            {activeBranches.RD.horaPico}:00 hrs ({activeBranches.RD.franjaPico.split("(")[0]})
          </span>
        </div>
      </div>

      {/* Branch 2: Luxury RD */}
      <div className="bg-white rounded-2xl p-5 border-2 border-emerald-100 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div>
          <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <h3 className="text-base font-black text-slate-900">{activeBranches.LUXURY_RD.nombre}</h3>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {activeBranches.LUXURY_RD.badge}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {activeBranches.LUXURY_RD.diasOperativos} días activos
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Recepción Digital
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {is2026 ? "Facturación 2026" : "Facturación Total"}
              </span>
              <p className="text-base font-black text-slate-900 mt-0.5">
                {fmtMoney(activeBranches.LUXURY_RD.totalFacturado)}
              </p>
              <span className="text-[10px] text-slate-500">11,538 ventas reales</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ticket Promedio</span>
              <p className="text-base font-black text-emerald-600 mt-0.5">
                {fmtMoney(activeBranches.LUXURY_RD.ticketPromedio)}
              </p>
              <span className="text-[10px] text-slate-500">
                {activeBranches.LUXURY_RD.totalTransacciones.toLocaleString()} atenciones
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estilistas Activos</span>
              <p className="text-lg font-black text-slate-800 mt-0.5">
                {activeBranches.LUXURY_RD.estilistasActivos} estilistas
              </p>
              <span className="text-[10px] text-slate-500">6,676 check-ins OATC</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Productividad Media</span>
              <p className="text-base font-black text-emerald-600 mt-0.5">
                {fmtCompact(activeBranches.LUXURY_RD.productividadPorEstilista)}
              </p>
              <span className="text-[10px] text-slate-500">Mayor rentabilidad / silla</span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <Clock className="w-3.5 h-3.5 text-emerald-500" />
            <span>Hora Pico Real:</span>
          </div>
          <span className="font-bold text-slate-900 bg-emerald-50 px-2 py-0.5 rounded-md text-emerald-700">
            {activeBranches.LUXURY_RD.horaPico}:00 hrs ({activeBranches.LUXURY_RD.franjaPico.split("(")[0]})
          </span>
        </div>
      </div>

      {/* Branch 3: Gonzales AM */}
      <div className="bg-white rounded-2xl p-5 border-2 border-amber-200 shadow-sm relative overflow-hidden bg-amber-50/20 flex flex-col justify-between">
        <div>
          <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-600" />
                <h3 className="text-base font-black text-slate-900">{activeBranches.GONZALES_AM.nombre}</h3>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  {activeBranches.GONZALES_AM.badge}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {activeBranches.GONZALES_AM.diasOperativos} días activos
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-rose-500" /> Sin Recepción
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {is2026 ? "Facturación 2026" : "Facturación Total"}
              </span>
              <p className="text-base font-black text-amber-600 mt-0.5">
                {fmtMoney(activeBranches.GONZALES_AM.totalFacturado)}
              </p>
              <span className="text-[10px] text-slate-500">7,279 ventas manuales</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ticket Promedio</span>
              <p className="text-base font-black text-slate-900 mt-0.5">
                {fmtMoney(activeBranches.GONZALES_AM.ticketPromedio)}
              </p>
              <span className="text-[10px] text-slate-500">
                {activeBranches.GONZALES_AM.totalTransacciones.toLocaleString()} servicios
              </span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estilistas Activos</span>
              <p className="text-lg font-black text-slate-800 mt-0.5">
                {activeBranches.GONZALES_AM.estilistasActivos} estilistas
              </p>
              <span className="text-[10px] text-slate-500">ECARMEN & EGPOGONZALES</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Productividad Media</span>
              <p className="text-base font-black text-amber-700 mt-0.5">
                {fmtCompact(activeBranches.GONZALES_AM.productividadPorEstilista)}
              </p>
              <span className="text-[10px] text-slate-500">Carga intensiva por silla</span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-amber-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Hora Pico Inferida:</span>
          </div>
          <span className="font-bold text-slate-900 bg-amber-100 px-2 py-0.5 rounded-md text-amber-800">
            {activeBranches.GONZALES_AM.horaPico}:00 hrs ({activeBranches.GONZALES_AM.franjaPico.split("(")[0]})
          </span>
        </div>
      </div>

      {/* Branch 4: Gloss Salon */}
      {activeBranches.GLOSS_SALON && (
        <div className="bg-white rounded-2xl p-5 border-2 border-pink-100 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="absolute top-0 right-0 w-28 h-28 bg-pink-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-pink-600" />
                  <h3 className="text-base font-black text-slate-900">{activeBranches.GLOSS_SALON.nombre}</h3>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-50 text-pink-700 border border-pink-200">
                    {activeBranches.GLOSS_SALON.badge}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {activeBranches.GLOSS_SALON.diasOperativos} días activos
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-pink-50 text-pink-700 border border-pink-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Recepción Digital
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {is2026 ? "Facturación 2026" : "Facturación Total"}
                </span>
                <p className="text-base font-black text-slate-900 mt-0.5">
                  {activeBranches.GLOSS_SALON.totalFacturado > 0 ? fmtMoney(activeBranches.GLOSS_SALON.totalFacturado) : "En Integración"}
                </p>
                <span className="text-[10px] text-slate-500">
                  {activeBranches.GLOSS_SALON.totalFacturado > 0 ? "Ventas 2026 sincronizadas" : "Ventas 2026 pendiente"}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ticket Promedio</span>
                <p className="text-base font-black text-pink-600 mt-0.5">
                  {activeBranches.GLOSS_SALON.ticketPromedio > 0 ? fmtMoney(activeBranches.GLOSS_SALON.ticketPromedio) : "Pendiente"}
                </p>
                <span className="text-[10px] text-slate-500">
                  {activeBranches.GLOSS_SALON.totalTransacciones.toLocaleString()} atenciones
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estilistas Activos</span>
                <p className="text-lg font-black text-slate-800 mt-0.5">
                  {activeBranches.GLOSS_SALON.estilistasActivos} estilistas
                </p>
                <span className="text-[10px] text-slate-500">
                  {activeBranches.GLOSS_SALON.totalServicios.toLocaleString()} servicios OATC
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Productividad Media</span>
                <p className="text-base font-black text-pink-600 mt-0.5">
                  {activeBranches.GLOSS_SALON.productividadPorEstilista > 0 ? fmtCompact(activeBranches.GLOSS_SALON.productividadPorEstilista) : "Pendiente"}
                </p>
                <span className="text-[10px] text-slate-500">Por estilista activo</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-600 font-medium">
              <Clock className="w-3.5 h-3.5 text-pink-500" />
              <span>Hora Pico Real:</span>
            </div>
            <span className="font-bold text-slate-900 bg-pink-50 px-2 py-0.5 rounded-md text-pink-700">
              {activeBranches.GLOSS_SALON.horaPico}:00 hrs ({activeBranches.GLOSS_SALON.franjaPico.split("(")[0]})
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
