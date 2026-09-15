import React from "react";
import { Building2, CheckCircle2, Clock, AlertTriangle, Scissors, Sparkles, Users } from "lucide-react";
import { MultiBranchBenchmark, BranchKpiSummary } from "../../../types";

export interface BenchmarkBranchCardsProps {
  activeBranches: MultiBranchBenchmark["branches"];
  is2026: boolean;
  fmtMoney: (n: number) => string;
  fmtCompact: (n: number) => string;
}

interface SalonCardProps {
  branch: BranchKpiSummary;
  is2026: boolean;
  fmtMoney: (n: number) => string;
  fmtCompact: (n: number) => string;
  borderColor: string;
  themeColor: "indigo" | "emerald" | "amber" | "pink";
  subTitleNotes: string;
  receiptBadge?: string;
  isWarningBadge?: boolean;
}

const SalonCard: React.FC<SalonCardProps> = ({
  branch,
  is2026,
  fmtMoney,
  fmtCompact,
  borderColor,
  themeColor,
  subTitleNotes,
  receiptBadge = "Recepción Digital",
  isWarningBadge = false
}) => {
  const themeClasses = {
    indigo: {
      blur: "bg-indigo-500/5",
      icon: "text-indigo-600",
      badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200",
      ticketColor: "text-indigo-600",
      prodColor: "text-indigo-600",
      footerPill: "bg-indigo-50 text-indigo-700",
      footerIcon: "text-indigo-500"
    },
    emerald: {
      blur: "bg-emerald-500/5",
      icon: "text-emerald-600",
      badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      ticketColor: "text-emerald-600",
      prodColor: "text-emerald-600",
      footerPill: "bg-emerald-50 text-emerald-700",
      footerIcon: "text-emerald-500"
    },
    amber: {
      blur: "bg-amber-500/10",
      icon: "text-amber-600",
      badgeBg: "bg-amber-100 text-amber-800 border-amber-300",
      ticketColor: "text-amber-700",
      prodColor: "text-amber-700",
      footerPill: "bg-amber-100 text-amber-800",
      footerIcon: "text-amber-500"
    },
    pink: {
      blur: "bg-pink-500/5",
      icon: "text-pink-600",
      badgeBg: "bg-pink-50 text-pink-700 border-pink-200",
      ticketColor: "text-pink-600",
      prodColor: "text-pink-600",
      footerPill: "bg-pink-50 text-pink-700",
      footerIcon: "text-pink-500"
    }
  }[themeColor];

  const activeStaff = branch.estilistasMensualesPromedio || branch.estilistasActivos;

  return (
    <div
      className={`bg-white rounded-2xl p-5 border-2 ${borderColor} shadow-sm relative overflow-hidden flex flex-col justify-between`}
    >
      <div>
        <div className={`absolute top-0 right-0 w-28 h-28 ${themeClasses.blur} rounded-full blur-2xl pointer-events-none`} />

        {/* Card Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className={`w-4 h-4 ${themeClasses.icon}`} />
              <h3 className="text-base font-black text-slate-900">{branch.nombre}</h3>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${themeClasses.badgeBg}`}>
                {branch.badge}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {branch.diasOperativos} días activos
              </span>
            </div>
          </div>

          {isWarningBadge ? (
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-rose-500" /> {receiptBadge}
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> {receiptBadge}
            </span>
          )}
        </div>

        {/* 4 Metric Boxes */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Box 1: Facturación Total & Promedio Mensual */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {is2026 ? "Facturación 2026" : "Facturación Total"}
              </span>
              <p className="text-base font-black text-slate-900 mt-0.5">
                {branch.totalFacturado > 0 ? fmtMoney(branch.totalFacturado) : "En Integración"}
              </p>
            </div>
            <div className="mt-1.5 pt-1.5 border-t border-slate-200/60">
              <span className="text-[10px] font-bold text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200/80 inline-block shadow-2xs">
                ~{fmtMoney(branch.facturacionMensualPromedio || Math.round(branch.totalFacturado / 8))}/mes
              </span>
              <p className="text-[9px] text-slate-400 mt-0.5">{subTitleNotes}</p>
            </div>
          </div>

          {/* Box 2: Ticket Promedio con Desglose Estilismo vs Cosmiatría */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ticket Promedio</span>
              <p className={`text-base font-black mt-0.5 ${themeClasses.ticketColor}`}>
                {branch.ticketPromedio > 0 ? fmtMoney(branch.ticketPromedio) : "Pendiente"}
              </p>
              <span className="text-[10px] text-slate-500">
                {branch.totalTransacciones.toLocaleString()} atenciones
              </span>
            </div>

            {/* Split pills for Estilismo vs Cosmiatría */}
            <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 flex flex-col gap-0.5 text-[10px]">
              <div className="flex items-center justify-between" title="Ticket promedio servicios de peluquería/estilismo">
                <span className="text-slate-500 font-semibold flex items-center gap-1">
                  <Scissors className="w-2.5 h-2.5 text-indigo-500" /> Estilismo:
                </span>
                <strong className="text-slate-800 font-black">
                  {fmtMoney(branch.ticketPromedioEstilismo || branch.ticketPromedio)}
                </strong>
              </div>
              <div className="flex items-center justify-between" title="Ticket promedio manicura, estética, faciales">
                <span className="text-slate-500 font-semibold flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-pink-500" /> Cosmiatría:
                </span>
                <strong className="text-slate-800 font-black">
                  {fmtMoney(branch.ticketPromedioCosmiatria || Math.round(branch.ticketPromedio * 0.45))}
                </strong>
              </div>
            </div>
          </div>

          {/* Box 3: Headcount Activo Mensual (Eliminando distorsión por rotación) */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Users className="w-3 h-3 text-slate-400" /> Estilistas Activos
              </span>
              <p className="text-base font-black text-slate-800 mt-0.5">
                {activeStaff} activos/mes
              </p>
            </div>
            <div className="mt-1.5 pt-1.5 border-t border-slate-200/60">
              <span className="text-[10px] text-slate-500">
                vs <strong className="text-slate-700">{branch.estilistasActivos}</strong> rotación hist.
              </span>
            </div>
          </div>

          {/* Box 4: Productividad Media por Estilista */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Productividad Media</span>
              <p className={`text-base font-black mt-0.5 ${themeClasses.prodColor}`}>
                {branch.productividadPorEstilista > 0 ? fmtCompact(branch.productividadPorEstilista) : "Pendiente"}
              </p>
            </div>
            <div className="mt-1.5 pt-1.5 border-t border-slate-200/60">
              <span className="text-[10px] text-slate-500">Por sillón activo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer: Peak Hour */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
          <Clock className={`w-3.5 h-3.5 ${themeClasses.footerIcon}`} />
          <span>{branch.tieneModuloRecepcion ? "Hora Pico Real:" : "Hora Pico Inferida:"}</span>
        </div>
        <span className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${themeClasses.footerPill}`}>
          {branch.horaPico}:00 hrs ({branch.franjaPico.split("(")[0].trim()})
        </span>
      </div>
    </div>
  );
};

export const BenchmarkBranchCards: React.FC<BenchmarkBranchCardsProps> = ({
  activeBranches,
  is2026,
  fmtMoney,
  fmtCompact
}) => {
  if (!activeBranches?.RD) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
      {/* Sede 1: Salón RD */}
      <SalonCard
        branch={activeBranches.RD}
        is2026={is2026}
        fmtMoney={fmtMoney}
        fmtCompact={fmtCompact}
        borderColor="border-indigo-100"
        themeColor="indigo"
        subTitleNotes="Servicios + Retail ERP"
      />

      {/* Sede 2: Luxury RD */}
      <SalonCard
        branch={activeBranches.LUXURY_RD}
        is2026={is2026}
        fmtMoney={fmtMoney}
        fmtCompact={fmtCompact}
        borderColor="border-emerald-100"
        themeColor="emerald"
        subTitleNotes="11,538 ventas reales POS"
      />

      {/* Sede 3: Gonzales AM */}
      <SalonCard
        branch={activeBranches.GONZALES_AM}
        is2026={is2026}
        fmtMoney={fmtMoney}
        fmtCompact={fmtCompact}
        borderColor="border-amber-200"
        themeColor="amber"
        subTitleNotes="7,279 ventas manuales"
        receiptBadge="Sin Recepción"
        isWarningBadge={true}
      />

      {/* Sede 4: Gloss Salon */}
      {activeBranches.GLOSS_SALON && (
        <SalonCard
          branch={activeBranches.GLOSS_SALON}
          is2026={is2026}
          fmtMoney={fmtMoney}
          fmtCompact={fmtCompact}
          borderColor="border-pink-100"
          themeColor="pink"
          subTitleNotes="Ventas 2026 sincronizadas"
        />
      )}
    </div>
  );
};
