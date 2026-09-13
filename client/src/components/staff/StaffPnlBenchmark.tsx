import React from "react";
import { DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

interface CategoryBenchmarkItem {
  categoria: string;
  atenciones: number;
  facturacion: number;
  ticketPromedio: number;
  ticketSede: number;
  diffPct: number;
  margenPct: number;
}

interface StaffPnlBenchmarkProps {
  periodLabel: string;
  facturadoServicios: number;
  facturadoRetail: number;
  facturacionTotalPeriodo: number;
  comisionesServicios: number;
  comisionesRetail: number;
  margenAportadoEmpresa: number;
  categoryBenchmark: CategoryBenchmarkItem[];
}

export const StaffPnlBenchmark: React.FC<StaffPnlBenchmarkProps> = ({
  periodLabel,
  facturadoServicios,
  facturadoRetail,
  facturacionTotalPeriodo,
  comisionesServicios,
  comisionesRetail,
  margenAportadoEmpresa,
  categoryBenchmark
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-emerald-600" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            Bloque 1: Estado de Resultados 360° & Benchmark de Tickets por Categoría
          </h2>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Corte: {periodLabel}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* P&L Breakdown (4 cols on lg/xl) */}
        <div className="lg:col-span-4 bg-slate-50/70 rounded-2xl p-5 border border-slate-200/60 space-y-3 shadow-2xs">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Estado de Resultados Individual ({periodLabel})
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-200/60">
              <span className="text-slate-600">(+) Facturación Servicios (Caja):</span>
              <span className="font-bold text-slate-800">{formatCurrency(facturadoServicios)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-200/60">
              <span className="text-slate-600">(+) Facturación Retail (ERP):</span>
              <span className="font-bold text-slate-800">{formatCurrency(facturadoRetail)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-200/60 bg-indigo-50/50 px-2 rounded-lg">
              <span className="font-bold text-indigo-900">(=) Ingreso Total Generado:</span>
              <span className="font-black text-indigo-900">{formatCurrency(facturacionTotalPeriodo)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-200/60">
              <span className="text-rose-600">(-) Comisiones Servicios (Caja):</span>
              <span className="font-bold text-rose-600">{formatCurrency(comisionesServicios)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-200/60">
              <span className="text-rose-600">(-) Comisiones Retail (Estimado):</span>
              <span className="font-bold text-rose-600">{formatCurrency(comisionesRetail)}</span>
            </div>
            <div className="flex justify-between py-2 bg-emerald-50 px-2 rounded-lg text-emerald-950 font-bold">
              <span>(=) Margen Neto Aportado:</span>
              <span className="font-black text-sm text-emerald-700">{formatCurrency(margenAportadoEmpresa)}</span>
            </div>
          </div>
        </div>

        {/* Category Benchmark Table (8 cols on lg/xl) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-5 border border-slate-200/60 shadow-2xs overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Ticket Promedio por Categoría vs Promedio de la Sede
            </h3>
            <span className="text-[11px] text-slate-400">Comparativa directa en {periodLabel}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left table-dense">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider sticky top-0 z-10 border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2 rounded-l-lg">Categoría</th>
                  <th className="px-3 py-2 text-center">Atenciones</th>
                  <th className="px-3 py-2 text-right">Facturación</th>
                  <th className="px-3 py-2 text-right">Ticket Colab.</th>
                  <th className="px-3 py-2 text-right">Ticket Sede</th>
                  <th className="px-3 py-2 text-center rounded-r-lg">Diferencial</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categoryBenchmark.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-slate-400">
                      No se registraron atenciones en las categorías durante este corte temporal.
                    </td>
                  </tr>
                ) : (
                  categoryBenchmark.slice(0, 6).map((c) => (
                    <tr key={c.categoria} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-3 py-2 font-bold text-slate-800">{c.categoria}</td>
                      <td className="px-3 py-2 text-center text-slate-600">{c.atenciones}</td>
                      <td className="px-3 py-2 text-right font-bold text-slate-800">{formatCurrency(c.facturacion)}</td>
                      <td className="px-3 py-2 text-right font-extrabold text-indigo-600">{formatCurrency(c.ticketPromedio)}</td>
                      <td className="px-3 py-2 text-right text-slate-500">{formatCurrency(c.ticketSede)}</td>
                      <td className="px-3 py-2 text-center whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-0.5 ${
                            c.diffPct >= 0
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {c.diffPct >= 0 ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3" />
                          )}
                          {c.diffPct >= 0 ? `+${c.diffPct}%` : `${c.diffPct}%`}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
