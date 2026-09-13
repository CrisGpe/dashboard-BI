import React, { useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  AreaChart,
  Area
} from "recharts";
import { SupplyYearlyMetric, SupplyMonthlyMetric } from "../../types";
import { TrendingUp, Calendar, Layers } from "lucide-react";

interface SuppliesYearlyTrendProps {
  yearlyTrends: SupplyYearlyMetric[];
  monthlyTrends: SupplyMonthlyMetric[];
}

export const SuppliesYearlyTrend: React.FC<SuppliesYearlyTrendProps> = ({
  yearlyTrends,
  monthlyTrends
}) => {
  const [selectedView, setSelectedView] = useState<"yearly" | "monthly">("yearly");
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>("ALL");

  // Filter valid years (exclude SIN_FECHA if desired or keep labeled)
  const chartYearlyData = yearlyTrends
    .filter((y) => y.anio !== "SIN_FECHA")
    .map((y) => ({
      anio: y.anio,
      despachos: y.despachosCount,
      costo: y.costoTotal,
      costoPromedio: y.costoPromedio,
      conOatc: y.conOatcCount,
      conTicket: y.conTicketCount,
      usoInterno: Math.max(0, y.despachosCount - (y.conOatcCount + y.conTicketCount))
    }));

  const chartMonthlyData = monthlyTrends
    .filter((m) => selectedYearFilter === "ALL" || m.anio === selectedYearFilter)
    .map((m) => ({
      periodo: m.periodo,
      despachos: m.despachosCount,
      costo: m.costoTotal
    }));

  return (
    <div className="space-y-6">
      {/* Header with Switcher */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-violet-100 text-violet-700 rounded-lg">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Evolución Histórica de Insumos & Costos (2022 - 2026)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Volumen de despachos despachados en salón y valorización acumulada en soles
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setSelectedView("yearly")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  selectedView === "yearly"
                    ? "bg-white text-violet-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Anual (2022-2026)
              </button>
              <button
                onClick={() => setSelectedView("monthly")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  selectedView === "monthly"
                    ? "bg-white text-violet-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                Mensual
              </button>
            </div>

            {selectedView === "monthly" && (
              <select
                value={selectedYearFilter}
                onChange={(e) => setSelectedYearFilter(e.target.value)}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="ALL">Todos los Años</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </select>
            )}
          </div>
        </div>

        {/* Main Chart */}
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {selectedView === "yearly" ? (
              <ComposedChart data={chartYearlyData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="anio" tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                  label={{ value: "N° Despachos", angle: -90, position: "insideLeft", fill: "#8b5cf6", fontSize: 11 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: "#059669", fontSize: 12 }}
                  tickFormatter={(val) => `S/${(val / 1000).toFixed(0)}k`}
                  label={{ value: "Costo Total (S/)", angle: 90, position: "insideRight", fill: "#059669", fontSize: 11 }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl text-xs shadow-xl border border-slate-800">
                        <p className="font-bold text-slate-200 mb-1">Año {label}</p>
                        {payload.map((item, idx) => (
                          <div key={idx} className="flex justify-between gap-4 py-0.5">
                            <span style={{ color: item.color }}>{item.name}:</span>
                            <span className="font-semibold text-white">
                              {item.name?.toString().toLowerCase().includes("costo")
                                ? `S/ ${Number(item.value).toLocaleString("es-PE", { minimumFractionDigits: 2 })}`
                                : Number(item.value).toLocaleString("es-PE")}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Bar
                  yAxisId="left"
                  dataKey="despachos"
                  name="Total Despachos"
                  fill="#8b5cf6"
                  radius={[6, 6, 0, 0]}
                  barSize={40}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="costo"
                  name="Costo Registrado (S/)"
                  stroke="#059669"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "#059669" }}
                  activeDot={{ r: 7 }}
                />
              </ComposedChart>
            ) : (
              <AreaChart data={chartMonthlyData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMonthly" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="periodo" tick={{ fill: "#64748b", fontSize: 11 }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    name === "costo"
                      ? `S/ ${Number(value).toLocaleString("es-PE", { minimumFractionDigits: 2 })}`
                      : Number(value).toLocaleString("es-PE"),
                    name === "costo" ? "Costo Registrado" : "Despachos"
                  ]}
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", color: "#fff" }}
                />
                <Area
                  type="monotone"
                  dataKey="despachos"
                  name="Despachos"
                  stroke="#7c3aed"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorMonthly)"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Traceability Adoption Over Time & Yearly Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Traceability breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <h4 className="text-sm font-bold text-slate-900 mb-1">
            Evolución de Trazabilidad por Año
          </h4>
          <p className="text-xs text-slate-500 mb-4">
            Distribución entre OATC directa, Ticket de caja y Consumo Interno
          </p>

          <div className="space-y-4">
            {chartYearlyData.map((year) => {
              const total = year.despachos || 1;
              const oatcPct = Math.round((year.conOatc / total) * 100);
              const ticketPct = Math.round((year.conTicket / total) * 100);
              const internoPct = Math.max(0, 100 - oatcPct - ticketPct);

              return (
                <div key={year.anio} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-800 font-bold">{year.anio}</span>
                    <span className="text-slate-500">{year.despachos.toLocaleString("es-PE")} despachos</span>
                  </div>
                  {/* Multi-segmented progress bar */}
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${oatcPct}%` }}
                      className="bg-emerald-500 transition-all duration-300"
                      title={`Con OATC ID: ${year.conOatc.toLocaleString()} (${oatcPct}%)`}
                    />
                    <div
                      style={{ width: `${ticketPct}%` }}
                      className="bg-amber-400 transition-all duration-300"
                      title={`Con Ticket Manual: ${year.conTicket.toLocaleString()} (${ticketPct}%)`}
                    />
                    <div
                      style={{ width: `${internoPct}%` }}
                      className="bg-slate-300 transition-all duration-300"
                      title={`Uso Interno: ${year.usoInterno.toLocaleString()} (${internoPct}%)`}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span className="text-emerald-700 font-medium">OATC: {oatcPct}% ({year.conOatc})</span>
                    <span className="text-amber-700 font-medium">Ticket: {ticketPct}% ({year.conTicket})</span>
                    <span className="text-slate-500">Interno: {internoPct}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center gap-4 text-[11px] text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              OATC ID
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
              Ticket POS
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block"></span>
              Uso Interno
            </span>
          </div>
        </div>

        {/* Yearly Metrics Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm overflow-x-auto">
          <h4 className="text-sm font-bold text-slate-900 mb-1">
            Resumen Consolidado por Año Fiscal
          </h4>
          <p className="text-xs text-slate-500 mb-4">
            Comparativa de volumen, montos valorizados y cobertura operativa
          </p>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px] bg-slate-50">
                <th className="py-2.5 px-3">Año</th>
                <th className="py-2.5 px-3 text-right">Despachos</th>
                <th className="py-2.5 px-3 text-right">Costo Total</th>
                <th className="py-2.5 px-3 text-right">Costo Medio</th>
                <th className="py-2.5 px-3 text-center">Colaboradores</th>
                <th className="py-2.5 px-3 text-center">Marcas</th>
                <th className="py-2.5 px-3 text-right">OATC Directa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {yearlyTrends.map((row) => (
                <tr key={row.anio} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-900">
                    {row.anio === "SIN_FECHA" ? (
                      <span className="text-slate-400 italic">Sin Fecha</span>
                    ) : (
                      row.anio
                    )}
                  </td>
                  <td className="py-3 px-3 text-right font-semibold text-slate-800">
                    {row.despachosCount.toLocaleString("es-PE")}
                  </td>
                  <td className="py-3 px-3 text-right font-semibold text-emerald-700">
                    {row.costoTotal > 0
                      ? `S/ ${row.costoTotal.toLocaleString("es-PE", { minimumFractionDigits: 2 })}`
                      : <span className="text-slate-400 font-normal">S/ 0.00*</span>}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-600">
                    {row.costoPromedio > 0 ? `S/ ${row.costoPromedio.toFixed(2)}` : "-"}
                  </td>
                  <td className="py-3 px-3 text-center text-slate-700">
                    {row.dependientesCount}
                  </td>
                  <td className="py-3 px-3 text-center text-slate-700">
                    {row.marcasCount}
                  </td>
                  <td className="py-3 px-3 text-right font-medium text-emerald-600">
                    {row.conOatcCount.toLocaleString("es-PE")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[10px] text-slate-400 mt-3 italic">
            * Nota: En 2026 los costos no fueron consignados en la columna K del documento fuente, registrándose únicamente volumen y código OATC.
          </p>
        </div>
      </div>
    </div>
  );
};
