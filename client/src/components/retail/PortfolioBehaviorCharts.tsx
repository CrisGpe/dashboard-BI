import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Clock, PieChart as PieIcon, Sparkles, TrendingUp, Flame, Calendar } from "lucide-react";
import { ProductCatalogRanking, BrandPortfolioMetric } from "../../types";
import { formatNumber, formatCurrency } from "../../utils/formatters";

interface PortfolioBehaviorChartsProps {
  products: ProductCatalogRanking[];
  brandMetrics?: BrandPortfolioMetric[];
  selectedBrand?: string;
  onSelectBrand?: (brand: string) => void;
}

const BRAND_COLORS: Record<string, string> = {
  Kerastase: "#8b5cf6",
  Baor: "#f59e0b",
  Loreal: "#3b82f6",
  Wella: "#f43f5e",
  Redken: "#334155",
  Revlon: "#ef4444",
  Alfaparf: "#06b6d4",
  "OPI": "#10b981",
  "American Crew": "#64748b",
  Nioxin: "#6366f1",
  "Abril Nature": "#d946ef",
  Tigi: "#ec4899"
};

const DEFAULT_COLORS = ["#8b5cf6", "#f59e0b", "#3b82f6", "#f43f5e", "#10b981", "#06b6d4", "#64748b", "#cbd5e1"];

export const PortfolioBehaviorCharts: React.FC<PortfolioBehaviorChartsProps> = ({
  products,
  brandMetrics = [],
  selectedBrand = "ALL",
  onSelectBrand
}) => {
  const [activeChartBrand, setActiveChartBrand] = useState<string>(selectedBrand);
  const [temporalDimension, setTemporalDimension] = useState<"hora" | "dia">("hora");

  // Sync with parent filter if changed externally
  React.useEffect(() => {
    setActiveChartBrand(selectedBrand);
  }, [selectedBrand]);

  const handleBrandChange = (brand: string) => {
    setActiveChartBrand(brand);
    if (onSelectBrand) onSelectBrand(brand);
  };

  // Brands list for dropdown
  const brandsList = useMemo(() => {
    if (brandMetrics.length > 0) {
      return brandMetrics.map((b) => ({
        brand: b.marca,
        totalUnits: b.totalUnidades,
        sharePct: b.shareUnidadesPct
      }));
    }
    // Fallback if brandMetrics not loaded
    const map = new Map<string, number>();
    products.forEach((p) => {
      const b = p.marca || "Sin Marca";
      map.set(b, (map.get(b) || 0) + p.unidadesVendidas);
    });
    return Array.from(map.entries())
      .map(([brand, totalUnits]) => ({ brand, totalUnits, sharePct: 0 }))
      .sort((a, b) => b.totalUnits - a.totalUnits);
  }, [brandMetrics, products]);

  // Hourly curve data for the selected chart brand
  const hourlyCurveData = useMemo(() => {
    const hours = Array.from({ length: 15 }, (_, i) => i + 8); // 08:00 to 22:00
    const countByHour = new Array(24).fill(0);

    if (activeChartBrand === "ALL") {
      products.forEach((p) => {
        if (p.ventasPorHora && Array.isArray(p.ventasPorHora)) {
          p.ventasPorHora.forEach((cnt, h) => {
            countByHour[h] = (countByHour[h] || 0) + cnt;
          });
        }
      });
    } else {
      const filtered = products.filter((p) => p.marca === activeChartBrand);
      filtered.forEach((p) => {
        if (p.ventasPorHora && Array.isArray(p.ventasPorHora)) {
          p.ventasPorHora.forEach((cnt, h) => {
            countByHour[h] = (countByHour[h] || 0) + cnt;
          });
        }
      });
    }

    let peakHour = 19;
    let maxHourUnits = 0;
    let afternoonUnits = 0;
    let totalCurveUnits = 0;

    const data = hours.map((h) => {
      const units = countByHour[h] || 0;
      totalCurveUnits += units;
      if (h >= 16 && h <= 21) {
        afternoonUnits += units;
      }
      if (units > maxHourUnits) {
        maxHourUnits = units;
        peakHour = h;
      }
      return {
        hora: h,
        label: `${h.toString().padStart(2, "0")}:00`,
        unidades: units
      };
    });

    const afternoonSharePct =
      totalCurveUnits > 0 ? Math.round((afternoonUnits / totalCurveUnits) * 100) : 0;

    return {
      data,
      peakHour,
      maxHourUnits,
      afternoonSharePct,
      totalCurveUnits
    };
  }, [products, activeChartBrand]);

  // Weekly curve data for the selected chart brand (7 days)
  const weeklyCurveData = useMemo(() => {
    const days = [
      { key: "Lunes", label: "Lun" },
      { key: "Martes", label: "Mar" },
      { key: "Miércoles", label: "Mié" },
      { key: "Jueves", label: "Jue" },
      { key: "Viernes", label: "Vie" },
      { key: "Sábado", label: "Sáb" },
      { key: "Domingo", label: "Dom" }
    ];
    const countByDay: Record<string, number> = {
      Lunes: 0,
      Martes: 0,
      Miércoles: 0,
      Jueves: 0,
      Viernes: 0,
      Sábado: 0,
      Domingo: 0
    };

    const targetProducts =
      activeChartBrand === "ALL"
        ? products
        : products.filter((p) => p.marca === activeChartBrand);

    targetProducts.forEach((p) => {
      if (p.ventasPorDia && Array.isArray(p.ventasPorDia)) {
        p.ventasPorDia.forEach((item) => {
          if (countByDay[item.dia] !== undefined) {
            countByDay[item.dia] += item.unidades;
          }
        });
      }
    });

    let peakDay = "Sábado";
    let maxDayUnits = 0;
    let weekendUnits = 0;
    let totalCurveUnits = 0;

    const data = days.map((d) => {
      const units = countByDay[d.key] || 0;
      totalCurveUnits += units;
      if (d.key === "Viernes" || d.key === "Sábado" || d.key === "Domingo") {
        weekendUnits += units;
      }
      if (units > maxDayUnits) {
        maxDayUnits = units;
        peakDay = d.key;
      }
      return {
        dia: d.key,
        label: d.label,
        unidades: units
      };
    });

    const weekendSharePct =
      totalCurveUnits > 0 ? Math.round((weekendUnits / totalCurveUnits) * 100) : 0;

    return {
      data,
      peakDay,
      maxDayUnits,
      weekendSharePct,
      totalCurveUnits
    };
  }, [products, activeChartBrand]);

  // Donut Market Share Data (Top 6 Brands + Otras)
  const donutData = useMemo(() => {
    const totalUnits = brandsList.reduce((acc, b) => acc + b.totalUnits, 0) || 1;
    const top6 = brandsList.slice(0, 6);
    const othersUnits = brandsList.slice(6).reduce((acc, b) => acc + b.totalUnits, 0);

    const result = top6.map((b) => ({
      name: b.brand,
      value: b.totalUnits,
      sharePct: Math.round((b.totalUnits / totalUnits) * 1000) / 10,
      color: BRAND_COLORS[b.brand] || DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)]
    }));

    if (othersUnits > 0) {
      result.push({
        name: "Otras Marcas",
        value: othersUnits,
        sharePct: Math.round((othersUnits / totalUnits) * 1000) / 10,
        color: "#94a3b8"
      });
    }

    return result;
  }, [brandsList]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* 1. Curva Temporal de Ventas: Horas vs Días (8 columnas) */}
      <div className="lg:col-span-8 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                {temporalDimension === "hora" ? <Clock className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  {temporalDimension === "hora" ? "Curva Horaria de Venta" : "Distribución Semanal de Ventas"}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {temporalDimension === "hora"
                    ? "Distribución de transacciones de salida de mostrador (08:00 a 22:00 hrs)"
                    : "Volumen de compras retail por día de la semana (Lunes a Domingo)"}
                </p>
              </div>
            </div>

            {/* Controls: Dimension Toggle + Brand Filter */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Toggle Dimension */}
              <div className="inline-flex p-0.5 rounded-xl bg-slate-100 border border-slate-200/80 text-xs">
                <button
                  type="button"
                  onClick={() => setTemporalDimension("hora")}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    temporalDimension === "hora"
                      ? "bg-white text-indigo-700 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  Horas (24h)
                </button>
                <button
                  type="button"
                  onClick={() => setTemporalDimension("dia")}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    temporalDimension === "dia"
                      ? "bg-white text-indigo-700 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Días (Semanal)
                </button>
              </div>

              {/* Brand Filter */}
              <select
                value={activeChartBrand}
                onChange={(e) => handleBrandChange(e.target.value)}
                className="text-xs font-bold px-2.5 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="ALL">
                  Todo el Portafolio ({formatNumber(temporalDimension === "hora" ? hourlyCurveData.totalCurveUnits : weeklyCurveData.totalCurveUnits)} unid.)
                </option>
                {brandsList.map((b) => (
                  <option key={b.brand} value={b.brand}>
                    {b.brand} ({formatNumber(b.totalUnits)} unid.)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Temporal Chart */}
          <div className="h-56 w-full">
            {temporalDimension === "hora" ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyCurveData.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRetailVentas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    axisLine={{ stroke: "#e2e8f0" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    axisLine={{ stroke: "#e2e8f0" }}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(val: any) => [`${formatNumber(Number(val) || 0)} unid.`, "Ventas"]}
                    labelFormatter={(lbl) => `Franja Horaria: ${lbl}`}
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                      fontSize: "12px"
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="unidades"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRetailVentas)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyCurveData.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="dia"
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    axisLine={{ stroke: "#e2e8f0" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    axisLine={{ stroke: "#e2e8f0" }}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(val: any) => [`${formatNumber(Number(val) || 0)} unid.`, "Ventas"]}
                    labelFormatter={(lbl) => `Día de Semana: ${lbl}`}
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                      fontSize: "12px"
                    }}
                  />
                  <Bar dataKey="unidades" radius={[8, 8, 0, 0]}>
                    {weeklyCurveData.data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.dia === weeklyCurveData.peakDay
                            ? "#8b5cf6"
                            : entry.dia === "Sábado" || entry.dia === "Domingo" || entry.dia === "Viernes"
                            ? "#6366f1"
                            : "#94a3b8"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Dynamic Insight Strip (Hourly or Weekly) */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          {temporalDimension === "hora" ? (
            <>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-extrabold">
                  <Flame className="w-3.5 h-3.5 text-amber-600" />
                  Hora Pico: {hourlyCurveData.peakHour.toString().padStart(2, "0")}:00 hrs
                </span>
                <span className="text-slate-600 text-[11px]">
                  con <strong>{formatNumber(hourlyCurveData.maxHourUnits)} unidades</strong> en su pico más alto
                </span>
              </div>

              <div className="text-[11px] text-slate-500 font-medium">
                🌆 Tarde/Noche concentra el <strong className="text-indigo-600 font-extrabold">{hourlyCurveData.afternoonSharePct}%</strong> de compras (16h a 21h)
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 text-[11px] font-extrabold">
                  <Calendar className="w-3.5 h-3.5 text-purple-600" />
                  Día Pico: {weeklyCurveData.peakDay}
                </span>
                <span className="text-slate-600 text-[11px]">
                  con <strong>{formatNumber(weeklyCurveData.maxDayUnits)} unidades</strong> en su día más fuerte
                </span>
              </div>

              <div className="text-[11px] text-slate-500 font-medium">
                🎉 Fin de Semana (Vie-Sáb-Dom) concentra el <strong className="text-indigo-600 font-extrabold">{weeklyCurveData.weekendSharePct}%</strong> de ventas
              </div>
            </>
          )}
        </div>
      </div>

      {/* 2. Market Share del Portafolio por Marca (4 columnas) */}
      <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <PieIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Concentración de Marcas
              </h3>
              <p className="text-[11px] text-slate-500">
                Market Share sobre {formatNumber(hourlyCurveData.totalCurveUnits)} unidades
              </p>
            </div>
          </div>

          {/* Donut Chart */}
          <div className="h-44 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${formatNumber(Number(val) || 0)} unid.`, "Volumen"]}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    fontSize: "11px"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-slate-400 font-semibold">Líder</span>
              <span className="text-sm font-extrabold text-slate-900">{donutData[0]?.name || "Kerastase"}</span>
              <span className="text-[10px] text-violet-600 font-bold">{donutData[0]?.sharePct}%</span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-2 pt-2 border-t border-slate-100 grid grid-cols-2 gap-1.5 text-[11px]">
          {donutData.slice(0, 6).map((item) => (
            <div
              key={item.name}
              onClick={() => handleBrandChange(item.name === "Otras Marcas" ? "ALL" : item.name)}
              className={`flex items-center justify-between p-1 rounded-lg transition-colors cursor-pointer hover:bg-slate-50 ${
                activeChartBrand === item.name ? "bg-indigo-50 font-bold" : ""
              }`}
            >
              <div className="flex items-center gap-1.5 truncate mr-1">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-700 truncate">{item.name}</span>
              </div>
              <span className="font-extrabold text-slate-900 shrink-0">{item.sharePct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
