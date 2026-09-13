import React from "react";
import { Users, Search } from "lucide-react";

export interface BenchmarkStylistAuditProps {
  stylistStats: {
    estilista: string;
    atenciones: number;
    facturacion: number;
    ticketPromedio: number;
    sharePct: number;
    categoriaTop: string;
    razones: string;
  }[];
  razonFilter: string;
  setRazonFilter: (razon: string) => void;
  stylistSearch: string;
  setStylistSearch: (search: string) => void;
  fmtMoney: (n: number) => string;
}

export const BenchmarkStylistAudit: React.FC<BenchmarkStylistAuditProps> = ({
  stylistStats,
  razonFilter,
  setRazonFilter,
  stylistSearch,
  setStylistSearch,
  fmtMoney
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-black text-slate-900">
              Ranking de Productividad de Estilistas - Sede Gonzales AM ({stylistStats.length} colaboradores)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Consolidado de facturación, volumen y ticket promedio por profesional en Gonzales AM
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter by Razón Social */}
          <select
            value={razonFilter}
            onChange={(e) => setRazonFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Todas las Razones Sociales</option>
            <option value="ECARMEN">ECARMEN</option>
            <option value="EGPOGONZALES">EGPOGONZALES</option>
          </select>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar estilista o servicio..."
              value={stylistSearch}
              onChange={(e) => setStylistSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <th className="py-2.5 px-3">#</th>
              <th className="py-2.5 px-4">Estilista</th>
              <th className="py-2.5 px-3">Razón Social</th>
              <th className="py-2.5 px-3 text-center">Atenciones</th>
              <th className="py-2.5 px-4 text-right">Facturación Total</th>
              <th className="py-2.5 px-3 text-center">Share Fact.</th>
              <th className="py-2.5 px-3 text-right">Ticket Promedio</th>
              <th className="py-2.5 px-4">Categoría Principal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {stylistStats.slice(0, 15).map((s, idx) => (
              <tr key={s.estilista} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-2.5 px-3 font-bold text-slate-400">{idx + 1}</td>
                <td className="py-2.5 px-4 font-bold text-slate-800 flex items-center gap-1.5">
                  {s.estilista}
                  {idx < 3 && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" title="Top 3 Producción" />
                  )}
                </td>
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                    {s.razones || "General"}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-center font-semibold text-slate-700">{s.atenciones}</td>
                <td className="py-2.5 px-4 text-right font-black text-slate-900">{fmtMoney(s.facturacion)}</td>
                <td className="py-2.5 px-3 text-center">
                  <span className="font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded text-[10px]">
                    {s.sharePct}%
                  </span>
                </td>
                <td className="py-2.5 px-3 text-right font-semibold text-slate-700">{fmtMoney(s.ticketPromedio)}</td>
                <td className="py-2.5 px-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {s.categoriaTop}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {stylistStats.length > 15 && (
          <div className="py-2.5 text-center text-xs text-slate-400 bg-slate-50/50">
            Mostrando los 15 estilistas más productivos de Gonzales AM de un total de {stylistStats.length}
          </div>
        )}
      </div>
    </div>
  );
};
