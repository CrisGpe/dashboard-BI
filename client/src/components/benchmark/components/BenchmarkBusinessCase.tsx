import React from "react";
import { ShieldAlert, AlertTriangle, Users, Clock, TrendingUp } from "lucide-react";
import { MultiBranchBenchmark } from "../../../types";

export interface BenchmarkBusinessCaseProps {
  vaikunthaBusinessCase: MultiBranchBenchmark["vaikunthaBusinessCase"];
  fmtMoney: (n: number) => string;
}

export const BenchmarkBusinessCase: React.FC<BenchmarkBusinessCaseProps> = ({
  vaikunthaBusinessCase,
  fmtMoney
}) => {
  if (!vaikunthaBusinessCase) return null;

  return (
    <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-xl border border-indigo-500/20">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <h2 className="text-lg font-black text-white tracking-tight">
              Diagnóstico de Puntos de Dolor en Gonzales AM & Caso de Negocio Vaikuntha ERP
            </h2>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl">
            Al no contar con el módulo de recepción digital, Gonzales AM opera con puntos ciegos críticos que Vaikuntha
            ERP resolverá de manera inmediata al unificar el flujo operativo.
          </p>
        </div>
        <span className="px-3 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-bold uppercase tracking-wider shrink-0">
          ROI de Adopción
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Invisible Lost Sales */}
        <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 hover:border-rose-500/40 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Demanda Invisible Perdida</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-rose-400">
            {fmtMoney(vaikunthaBusinessCase.ventasPerdidasEstimadasGonzales)}
          </p>
          <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
            ~{vaikunthaBusinessCase.citasPerdidasEstimadasGonzales} citas canceladas o clientes que desisten por espera no
            registradas en caja.
          </p>
          <div className="mt-3 pt-2 border-t border-slate-700/60 text-[10px] text-slate-400">
            En Salón RD se registran con motivo (precio, demora, etc.). En Gonzales AM son 100% invisibles.
          </div>
        </div>

        {/* Card 2: Client Anonymity */}
        <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Anonimato de Clientes</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400">
            {vaikunthaBusinessCase.tasaAnonimatoClienteGonzales}%
          </p>
          <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
            {vaikunthaBusinessCase.totalClientesAnonimosGonzales.toLocaleString()} tickets a "CLIENTES VARIOS" sin DNI ni
            teléfono.
          </p>
          <div className="mt-3 pt-2 border-t border-slate-700/60 text-[10px] text-slate-400">
            Fuga masiva de LTV: imposibilidad de enviar campañas automáticas de recompra o fidelización.
          </div>
        </div>

        {/* Card 3: Unmeasured Wait Times */}
        <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 hover:border-indigo-500/40 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ceguera de Tiempos</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-indigo-400">0 min medidos</p>
          <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
            No existe registro de hora de ingreso vs hora de atención en sillón.
          </p>
          <div className="mt-3 pt-2 border-t border-slate-700/60 text-[10px] text-slate-400">
            Vaikuntha ERP registra el flujo completo desde check-in con QR hasta el cobro en caja.
          </div>
        </div>

        {/* Card 4: Shift Misalignment */}
        <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Desajuste de Turnos</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400">42% en 2 días</p>
          <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
            Viernes y sábado saturan la capacidad mientras los días de semana tienen sub-utilización de personal.
          </p>
          <div className="mt-3 pt-2 border-t border-slate-700/60 text-[10px] text-slate-400">
            Vaikuntha ERP optimiza la planilla asignando turnos dinámicos basados en la demanda inferida.
          </div>
        </div>
      </div>
    </div>
  );
};
