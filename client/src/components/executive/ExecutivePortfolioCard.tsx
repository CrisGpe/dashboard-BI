import React, { useState } from "react";
import { ArrowUpRight, Scissors, ShoppingBag, Layers, ChevronDown, ChevronUp } from "lucide-react";
import { OatcCategoryMetric, SpecificPortfolioItemMetric, ActiveTab } from "../../types";
import { formatCurrency, formatNumber } from "../../utils/formatters";

interface ExecutivePortfolioCardProps {
  oatcCategoryMetrics?: OatcCategoryMetric[];
  specificPortfolioRankings?: SpecificPortfolioItemMetric[];
  onNavigateTab: (tab: ActiveTab) => void;
}

export const ExecutivePortfolioCard: React.FC<ExecutivePortfolioCardProps> = ({
  oatcCategoryMetrics = [],
  specificPortfolioRankings = [],
  onNavigateTab
}) => {
  const [activeTab, setActiveTab] = useState<"categories" | "portfolio">("categories");
  const [portfolioFilter, setPortfolioFilter] = useState<"all" | "services" | "products">("all");
  const [limit, setLimit] = useState<number>(5);

  // Filtered portfolio items
  const filteredPortfolio = specificPortfolioRankings.filter((item) => {
    if (portfolioFilter === "services") return item.tipo === "SERVICIO";
    if (portfolioFilter === "products") return item.tipo === "PRODUCTO";
    return true;
  });

  const displayedCategories = oatcCategoryMetrics.slice(0, limit);
  const displayedPortfolio = filteredPortfolio.slice(0, limit);

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
      <div>
        {/* Header & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-indigo-50 text-indigo-600">
                {activeTab === "categories" ? (
                  <Layers className="w-4 h-4" />
                ) : (
                  <Scissors className="w-4 h-4" />
                )}
              </span>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                {activeTab === "categories"
                  ? "Rentabilidad por Categoría (Demanda OATC)"
                  : "Ranking de Portafolio Específico (Venta)"}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeTab === "categories"
                ? "Demanda y conversión canónica de recepción cruzada con facturación efectiva"
                : "Procedimientos específicos de estilistas y SKUs de retail con mayor tracción comercial"}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Tab switch pills */}
            <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200/60 text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveTab("categories")}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  activeTab === "categories"
                    ? "bg-white text-indigo-700 font-semibold shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Categorías OATC
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("portfolio")}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  activeTab === "portfolio"
                    ? "bg-white text-indigo-700 font-semibold shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Portafolio Específico
              </button>
            </div>

            {/* Quick Link */}
            <button
              type="button"
              onClick={() => onNavigateTab(activeTab === "categories" ? "operations" : "retail")}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 cursor-pointer ml-1"
              title={activeTab === "categories" ? "Ir a Auditoría de Operaciones" : "Ir a Catálogo Retail"}
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab 1: Categorías OATC */}
        {activeTab === "categories" && (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left table-dense">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider sticky top-0 z-10 border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2.5 rounded-l-lg">Categoría OATC</th>
                    <th className="px-3 py-2.5 text-center">Demanda (OATC)</th>
                    <th className="px-3 py-2.5 text-center">Rechazos (%)</th>
                    <th className="px-3 py-2.5 text-right">Facturación</th>
                    <th className="px-3 py-2.5 text-right">Ticket Prom.</th>
                    <th className="px-3 py-2.5 text-center rounded-r-lg">Margen %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedCategories.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-6 text-center text-slate-400 italic">
                        No hay datos registrados de categorías OATC
                      </td>
                    </tr>
                  ) : (
                    displayedCategories.map((c) => (
                      <tr key={c.categoria} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-3 py-2.5 font-semibold text-slate-800">
                          <div>{c.categoria}</div>
                          <div className="text-[10px] text-slate-400 font-normal">
                            {formatNumber(c.atencionesEfectivas)} atenciones cobradas
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-center font-medium text-slate-700">
                          {formatNumber(c.demandaTotalOatc)}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                              c.tasaCancelacionPct > 6
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {c.canceladasCount} ({c.tasaCancelacionPct}%)
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right font-bold text-slate-800">
                          {formatCurrency(c.facturacionTotal)}
                        </td>
                        <td className="px-3 py-2.5 text-right font-medium text-slate-600">
                          {formatCurrency(c.ticketPromedio)}
                        </td>
                        <td className="px-3 py-2.5 text-center whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {c.margenPct}%
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Portafolio Específico */}
        {activeTab === "portfolio" && (
          <div>
            {/* Filter pills */}
            <div className="flex items-center justify-between gap-2 mb-2 px-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Filtro:</span>
                {(["all", "services", "products"] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setPortfolioFilter(filter)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                      portfolioFilter === filter
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {filter === "all" ? "Todos" : filter === "services" ? "Solo Servicios" : "Solo Productos"}
                  </button>
                ))}
              </div>
              <span className="text-[11px] text-slate-400">
                {filteredPortfolio.length} ítems en catálogo
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left table-dense">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider sticky top-0 z-10 border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2.5 rounded-l-lg">Ítem (Servicio / Producto)</th>
                    <th className="px-3 py-2.5 text-center">Tipo</th>
                    <th className="px-3 py-2.5 text-center">Volumen</th>
                    <th className="px-3 py-2.5 text-right">Facturación</th>
                    <th className="px-3 py-2.5 text-right">Comisión/Costo</th>
                    <th className="px-3 py-2.5 text-center rounded-r-lg">Margen %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedPortfolio.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-6 text-center text-slate-400 italic">
                        No hay ítems registrados en este filtro
                      </td>
                    </tr>
                  ) : (
                    displayedPortfolio.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-3 py-2.5 font-semibold text-slate-800 max-w-[220px] truncate">
                          <div className="truncate" title={item.nombre}>{item.nombre}</div>
                          <div className="text-[10px] text-slate-400 font-normal truncate">
                            {item.categoriaPadre}
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          {item.tipo === "SERVICIO" ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                              <Scissors className="w-2.5 h-2.5" />
                              Servicio
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <ShoppingBag className="w-2.5 h-2.5" />
                              Producto
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-center font-medium text-slate-700">
                          {formatNumber(item.volumen)}
                        </td>
                        <td className="px-3 py-2.5 text-right font-bold text-slate-800">
                          {formatCurrency(item.facturacionTotal)}
                        </td>
                        <td className="px-3 py-2.5 text-right text-slate-500 font-medium">
                          {formatCurrency(item.comisionOCostoTotal)}
                        </td>
                        <td className="px-3 py-2.5 text-center whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {item.margenPct}%
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Footer Toggle (Top 5 vs Top 10) */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-400">
          Mostrando los {limit === 5 ? "Top 5" : "Top 10"} con mayor facturación
        </span>
        <button
          type="button"
          onClick={() => setLimit(limit === 5 ? 10 : 5)}
          className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer transition-colors"
        >
          {limit === 5 ? (
            <>
              Expandir a Top 10 <ChevronDown className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              Contraer a Top 5 <ChevronUp className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
