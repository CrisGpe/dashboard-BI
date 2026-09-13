import React, { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid
} from "recharts";
import { SupplyBrandMetric, SupplyTypeMetric } from "../../types";
import { Sparkles, Tag, PieChart as PieIcon } from "lucide-react";

interface SuppliesBrandDistributionProps {
  brandRankings: SupplyBrandMetric[];
  typeRankings: SupplyTypeMetric[];
}

const BRAND_COLORS = [
  "#8b5cf6",
  "#6366f1",
  "#3b82f6",
  "#0ea5e9",
  "#06b6d4",
  "#14b8a6",
  "#10b981",
  "#f59e0b",
  "#f97316",
  "#ec4899"
];

const TYPE_COLORS = [
  "#4f46e5",
  "#059669",
  "#d97706",
  "#db2777",
  "#7c3aed",
  "#2563eb",
  "#0891b2",
  "#475569"
];

export const SuppliesBrandDistribution: React.FC<SuppliesBrandDistributionProps> = ({
  brandRankings,
  typeRankings
}) => {
  const [selectedSubTab, setSelectedSubTab] = useState<"marcas" | "tipos">("marcas");

  const top10Brands = brandRankings.slice(0, 10);
  const top10Types = typeRankings.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Switcher & Overview Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                <PieIcon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Distribución por Marca & Tipología de Insumo
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Catálogo de marcas profesionales y líneas técnicas más consumidas en laboratorio
            </p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
            <button
              onClick={() => setSelectedSubTab("marcas")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition-all ${
                selectedSubTab === "marcas"
                  ? "bg-white text-violet-700 shadow-sm font-bold"
                  : "hover:text-slate-900"
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              Marcas Principales
            </button>
            <button
              onClick={() => setSelectedSubTab("tipos")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition-all ${
                selectedSubTab === "tipos"
                  ? "bg-white text-violet-700 shadow-sm font-bold"
                  : "hover:text-slate-900"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Tipología (Tinte, Peróxido, Shampoo)
            </button>
          </div>
        </div>

        {/* Chart View */}
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {selectedSubTab === "marcas" ? (
              <BarChart
                data={top10Brands}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 80, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                />
                <YAxis
                  type="category"
                  dataKey="marca"
                  tick={{ fill: "#334155", fontSize: 12, fontWeight: 600 }}
                  width={90}
                />
                <Tooltip
                  formatter={(val: any, _name: any, item: any) => [
                    `${Number(val).toLocaleString("es-PE")} despachos (${item.payload.shareDespachosPct}%)`,
                    "Volumen"
                  ]}
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", color: "#fff" }}
                />
                <Bar dataKey="totalDespachos" radius={[0, 6, 6, 0]}>
                  {top10Brands.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={BRAND_COLORS[index % BRAND_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <BarChart
                data={top10Types}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 110, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                />
                <YAxis
                  type="category"
                  dataKey="tipo"
                  tick={{ fill: "#334155", fontSize: 12, fontWeight: 600 }}
                  width={120}
                />
                <Tooltip
                  formatter={(val: any, _name: any, item: any) => [
                    `${Number(val).toLocaleString("es-PE")} despachos (${item.payload.shareDespachosPct}%)`,
                    "Volumen"
                  ]}
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", color: "#fff" }}
                />
                <Bar dataKey="totalDespachos" radius={[0, 6, 6, 0]}>
                  {top10Types.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={TYPE_COLORS[index % TYPE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid of Top Brands with Top Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {brandRankings.slice(0, 6).map((brand, idx) => (
          <div
            key={brand.marca}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:border-violet-300 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: BRAND_COLORS[idx % BRAND_COLORS.length] }}
                />
                <h4 className="font-bold text-slate-900 text-sm">{brand.marca}</h4>
              </div>
              <span className="text-xs font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-100">
                {brand.shareDespachosPct.toFixed(1)}%
              </span>
            </div>

            <div className="flex justify-between items-baseline mb-3">
              <span className="text-2xl font-black text-slate-900">
                {brand.totalDespachos.toLocaleString("es-PE")}
              </span>
              <span className="text-xs text-slate-500">
                {brand.costoTotal > 0
                  ? `S/ ${brand.costoTotal.toLocaleString("es-PE", { minimumFractionDigits: 2 })}`
                  : "Costo N/D"}
              </span>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Top Insumos Específicos:
              </p>
              <div className="space-y-1">
                {brand.topProductos.slice(0, 3).map((prod, pIdx) => (
                  <div key={pIdx} className="flex justify-between text-xs text-slate-700">
                    <span className="truncate max-w-[190px]" title={prod.producto}>
                      {prod.producto}
                    </span>
                    <span className="font-semibold text-slate-500 shrink-0">
                      {prod.count.toLocaleString("es-PE")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
