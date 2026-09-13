import React from "react";
import { ArrowUpRight } from "lucide-react";
import { Staff360, ServiceCategoryMetric, ActiveTab, OatcCategoryMetric, SpecificPortfolioItemMetric } from "../../types";
import { formatCurrency } from "../../utils/formatters";
import { ExecutivePortfolioCard } from "./ExecutivePortfolioCard";

interface ExecutiveRankingsProps {
  topStaff: Staff360[];
  topCategories?: ServiceCategoryMetric[];
  oatcCategoryMetrics?: OatcCategoryMetric[];
  specificPortfolioRankings?: SpecificPortfolioItemMetric[];
  onNavigateTab: (tab: ActiveTab) => void;
  onSelectAgent: (agent: string) => void;
}

export const ExecutiveRankings: React.FC<ExecutiveRankingsProps> = ({
  topStaff,
  oatcCategoryMetrics = [],
  specificPortfolioRankings = [],
  onNavigateTab,
  onSelectAgent
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top 5 Staff by Profit Margin */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Top Colaboradores por Aporte de Margen
              </h3>
              <p className="text-xs text-slate-500">
                P&L individual de estilistas con mayor rendimiento financiero neto
              </p>
            </div>
            <button
              onClick={() => onNavigateTab("staff")}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              Ver todos <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left table-dense">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider sticky top-0 z-10 border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2.5 rounded-l-lg">Colaborador</th>
                  <th className="px-3 py-2.5 text-right">Fact. Servicios</th>
                  <th className="px-3 py-2.5 text-right">Fact. Retail</th>
                  <th className="px-3 py-2.5 text-right">Margen Empresa</th>
                  <th className="px-3 py-2.5 text-center rounded-r-lg">S/./Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topStaff.map((s) => (
                  <tr
                    key={s.agente}
                    onClick={() => {
                      onSelectAgent(s.agente);
                      onNavigateTab("staff");
                    }}
                    className="hover:bg-indigo-50/40 cursor-pointer transition-colors"
                  >
                    <td className="px-3 py-2.5 font-semibold text-slate-800">
                      <div>{s.agente}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{s.especialidad}</div>
                    </td>
                    <td className="px-3 py-2.5 text-right font-medium text-slate-700">
                      {formatCurrency(s.totalFacturadoServicios)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-medium text-emerald-600">
                      {formatCurrency(s.totalVentasRetail)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-bold text-slate-900">
                      {formatCurrency(s.margenAportadoEmpresa)}
                    </td>
                    <td className="px-3 py-2.5 text-center font-bold text-indigo-600">
                      S/.{s.facturacionPorHora.toFixed(0)}/h
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Executive Portfolio Intelligence Card (OATC Canonical Demand & Specific Portfolio Items) */}
      <ExecutivePortfolioCard
        oatcCategoryMetrics={oatcCategoryMetrics}
        specificPortfolioRankings={specificPortfolioRankings}
        onNavigateTab={onNavigateTab}
      />
    </div>
  );
};
