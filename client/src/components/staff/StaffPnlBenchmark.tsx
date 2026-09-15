import React, { useState, useMemo } from "react";
import { DollarSign, ArrowUpRight, ArrowDownRight, Scissors, ShoppingBag, Layers } from "lucide-react";
import { formatCurrency, formatNumber } from "../../utils/formatters";

export interface CategoryBenchmarkItem {
  categoria: string;
  atenciones: number;
  facturacion: number;
  ticketPromedio: number;
  ticketSede: number;
  diffPct: number;
  margenPct: number;
  isRetail?: boolean;
  sedeAtenciones?: number;
  sedeFacturacion?: number;
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
  const [viewMode, setViewMode] = useState<"services" | "retail" | "all">("services");

  // Separate services from retail
  const filteredBenchmark = useMemo(() => {
    if (viewMode === "services") {
      return categoryBenchmark.filter((c) => !c.isRetail);
    }
    if (viewMode === "retail") {
      return categoryBenchmark.filter((c) => c.isRetail);
    }
    return categoryBenchmark;
  }, [categoryBenchmark, viewMode]);

  const totalServices = useMemo(() => {
    return categoryBenchmark
      .filter((c) => !c.isRetail)
      .reduce((acc, c) => acc + c.atenciones, 0);
  }, [categoryBenchmark]);

  const totalRetailUnits = useMemo(() => {
    return categoryBenchmark
      .filter((c) => c.isRetail)
      .reduce((acc, c) => acc + c.atenciones, 0);
  }, [categoryBenchmark]);

  // Totales ponderados para la fila de totales
  const totals = useMemo(() => {
    const totalAtenciones = filteredBenchmark.reduce((acc, c) => acc + c.atenciones, 0);
    const totalFacturacion = filteredBenchmark.reduce((acc, c) => acc + c.facturacion, 0);
    const ticketColab = totalAtenciones > 0 ? totalFacturacion / totalAtenciones : 0;

    const totalSedeAtenciones = filteredBenchmark.reduce(
      (acc, c) => acc + (c.sedeAtenciones || c.atenciones),
      0
    );
    const totalSedeFacturacion = filteredBenchmark.reduce(
      (acc, c) => acc + (c.sedeFacturacion || c.atenciones * c.ticketSede),
      0
    );
    const ticketSede = totalSedeAtenciones > 0 ? totalSedeFacturacion / totalSedeAtenciones : 0;

    const diffPct =
      ticketSede > 0 ? Math.round(((ticketColab - ticketSede) / ticketSede) * 100) : 0;

    return {
      totalAtenciones,
      totalFacturacion,
      ticketColab,
      ticketSede,
      diffPct
    };
  }, [filteredBenchmark]);

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
        <div className="lg:col-span-8 bg-white rounded-2xl p-5 border border-slate-200/60 shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Ticket Promedio por Categoría vs Promedio de la Sede
                </h3>
                <span className="text-[11px] text-slate-400">Comparativa directa en {periodLabel}</span>
              </div>

              {/* Toggle Segmentado: Servicios | Venta Retail | Todos */}
              <div className="inline-flex p-0.5 bg-slate-100 rounded-xl border border-slate-200/80 shrink-0 self-start sm:self-auto">
                <button
                  onClick={() => setViewMode("services")}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewMode === "services"
                      ? "bg-white text-indigo-700 shadow-xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Scissors className="w-3 h-3" />
                  <span>Servicios</span>
                  {totalServices > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 bg-indigo-50 text-indigo-700 rounded-full font-bold">
                      {formatNumber(totalServices)}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setViewMode("retail")}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewMode === "retail"
                      ? "bg-white text-indigo-700 shadow-xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <ShoppingBag className="w-3 h-3" />
                  <span>Venta Retail</span>
                  {totalRetailUnits > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 bg-emerald-50 text-emerald-700 rounded-full font-bold">
                      {formatNumber(totalRetailUnits)}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setViewMode("all")}
                  className={`px-2 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                    viewMode === "all"
                      ? "bg-white text-indigo-700 shadow-xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Layers className="w-3 h-3" />
                  <span>Todos</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left table-dense">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider sticky top-0 z-10 border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2 rounded-l-lg">
                      {viewMode === "retail" ? "Marca Retail" : "Categoría"}
                    </th>
                    <th className="px-3 py-2 text-center">
                      {viewMode === "retail" ? "Unidades" : viewMode === "services" ? "Atenciones" : "Atenc. / Unid."}
                    </th>
                    <th className="px-3 py-2 text-right">Facturación</th>
                    <th className="px-3 py-2 text-right">Ticket Colab.</th>
                    <th className="px-3 py-2 text-right">Ticket Sede</th>
                    <th className="px-3 py-2 text-center rounded-r-lg">Diferencial</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBenchmark.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-6 text-center text-slate-400">
                        {viewMode === "services" && "No se registraron atenciones de servicios durante este corte temporal."}
                        {viewMode === "retail" && "El colaborador no registra ventas de productos retail en este corte temporal."}
                        {viewMode === "all" && "No se registraron atenciones ni ventas durante este corte temporal."}
                      </td>
                    </tr>
                  ) : (
                    filteredBenchmark.slice(0, 8).map((c) => (
                      <tr key={c.categoria} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-3 py-2 font-bold text-slate-800">
                          {c.categoria}
                        </td>
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
                {filteredBenchmark.length > 0 && (
                  <tfoot className="bg-slate-50/90 font-bold border-t-2 border-slate-200 text-slate-800">
                    <tr>
                      <td className="px-3 py-2.5 rounded-l-lg font-black uppercase text-slate-900 tracking-wider">
                        {viewMode === "retail"
                          ? "Total Retail"
                          : viewMode === "services"
                          ? "Total Servicios"
                          : "Total General"}
                      </td>
                      <td className="px-3 py-2.5 text-center text-slate-900 font-black font-mono">
                        {formatNumber(totals.totalAtenciones)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-black text-slate-900 font-mono">
                        {formatCurrency(totals.totalFacturacion)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-black text-indigo-700 font-mono">
                        {formatCurrency(totals.ticketColab)}
                      </td>
                      <td className="px-3 py-2.5 text-right text-slate-600 font-bold font-mono">
                        {formatCurrency(totals.ticketSede)}
                      </td>
                      <td className="px-3 py-2.5 text-center rounded-r-lg whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold inline-flex items-center gap-0.5 ${
                            totals.diffPct >= 0
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : "bg-rose-100 text-rose-800 border border-rose-300"
                          }`}
                        >
                          {totals.diffPct >= 0 ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3" />
                          )}
                          {totals.diffPct >= 0 ? `+${totals.diffPct}%` : `${totals.diffPct}%`}
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>
              {viewMode === "services" && `Base: ${formatNumber(totalServices)} atenciones de servicios registradas en el corte`}
              {viewMode === "retail" && `Base: ${formatNumber(totalRetailUnits)} productos retail vendidos en el corte`}
              {viewMode === "all" && `Base: ${formatNumber(totalServices + totalRetailUnits)} registros totales en el corte`}
            </span>
            <span className="text-slate-400 text-[10px]">
              {viewMode === "services" ? "Servicios en sillón" : viewMode === "retail" ? "Ventas mostrador / asesoradas" : "Visión Integral 360°"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
