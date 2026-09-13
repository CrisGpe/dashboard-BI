import React, { useState, useMemo } from "react";
import { Search, UserCheck, Award, ArrowUpDown, Tag, Sparkles } from "lucide-react";
import { SupplyStylistConsumption } from "../../types";

interface SuppliesStylistRankingProps {
  stylistRankings: SupplyStylistConsumption[];
}

export const SuppliesStylistRanking: React.FC<SuppliesStylistRankingProps> = ({
  stylistRankings
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"despachos" | "costo">("despachos");
  const [displayCount, setDisplayCount] = useState(20);

  const filteredStylists = useMemo(() => {
    let list = stylistRankings.filter((s) =>
      s.dependiente.toLowerCase().includes(searchTerm.toLowerCase().trim())
    );

    if (sortBy === "costo") {
      list = [...list].sort((a, b) => b.costoTotal - a.costoTotal);
    } else {
      list = [...list].sort((a, b) => b.totalDespachos - a.totalDespachos);
    }
    return list;
  }, [stylistRankings, searchTerm, sortBy]);

  const visibleList = filteredStylists.slice(0, displayCount);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Ranking de Consumo por Colaborador / Estilista
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Volumen de insumos despachados a cada estilista y marcas de mayor frecuencia
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar colaborador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl w-48 sm:w-60 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
            <button
              onClick={() => setSortBy("despachos")}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-all ${
                sortBy === "despachos" ? "bg-white text-indigo-700 shadow-sm" : "hover:text-slate-900"
              }`}
            >
              <ArrowUpDown className="w-3 h-3" />
              Por Despachos
            </button>
            <button
              onClick={() => setSortBy("costo")}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-all ${
                sortBy === "costo" ? "bg-white text-indigo-700 shadow-sm" : "hover:text-slate-900"
              }`}
            >
              <ArrowUpDown className="w-3 h-3" />
              Por Costo (S/)
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px] bg-slate-50">
              <th className="py-3 px-3 w-12 text-center">#</th>
              <th className="py-3 px-3">Colaborador / Dependiente</th>
              <th className="py-3 px-3 text-right">Despachos</th>
              <th className="py-3 px-3 text-right">Share %</th>
              <th className="py-3 px-3 text-right">Costo Total</th>
              <th className="py-3 px-3 text-right">Costo Promedio</th>
              <th className="py-3 px-4">Top Marcas</th>
              <th className="py-3 px-4">Top Insumos</th>
              <th className="py-3 px-3 text-right">Último Reg.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visibleList.map((stylist, index) => (
              <tr key={stylist.dependiente} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3 px-3 text-center font-bold text-slate-400">
                  {index + 1}
                </td>
                <td className="py-3 px-3 font-semibold text-slate-900">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-xs shrink-0">
                      {stylist.dependiente.charAt(0)}
                    </div>
                    <span>{stylist.dependiente}</span>
                  </div>
                </td>
                <td className="py-3 px-3 text-right font-bold text-slate-800">
                  {stylist.totalDespachos.toLocaleString("es-PE")}
                </td>
                <td className="py-3 px-3 text-right text-slate-600">
                  <div className="flex items-center justify-end gap-1.5">
                    <span>{stylist.shareDespachosPct.toFixed(1)}%</span>
                    <div className="w-12 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full"
                        style={{ width: `${Math.min(100, stylist.shareDespachosPct * 5)}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3 text-right font-semibold text-emerald-700">
                  {stylist.costoTotal > 0
                    ? `S/ ${stylist.costoTotal.toLocaleString("es-PE", { minimumFractionDigits: 2 })}`
                    : <span className="text-slate-400 font-normal">-</span>}
                </td>
                <td className="py-3 px-3 text-right text-slate-600">
                  {stylist.costoPromedio > 0 ? `S/ ${stylist.costoPromedio.toFixed(2)}` : "-"}
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-1">
                    {stylist.topMarcas.map((m, mIdx) => (
                      <span
                        key={mIdx}
                        className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 border border-violet-100 font-medium"
                      >
                        <Tag className="w-2.5 h-2.5" />
                        {m.marca} ({m.count})
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-1">
                    {stylist.topInsumos.map((i, iIdx) => (
                      <span
                        key={iIdx}
                        className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-100 font-medium"
                      >
                        <Sparkles className="w-2.5 h-2.5" />
                        {i.tipo} ({i.count})
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3 px-3 text-right text-slate-500 font-mono text-[11px]">
                  {stylist.ultimoDespacho || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination / Show More */}
      {filteredStylists.length > displayCount && (
        <div className="pt-3 flex justify-center">
          <button
            onClick={() => setDisplayCount((prev) => prev + 20)}
            className="px-4 py-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all"
          >
            Mostrar más colaboradores ({filteredStylists.length - displayCount} restantes)
          </button>
        </div>
      )}
    </div>
  );
};
