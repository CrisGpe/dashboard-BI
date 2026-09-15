import React, { useState, useMemo } from "react";
import { Clock, Layers, Sparkles, Tag } from "lucide-react";
import {
  ResponsiveContainer,
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
import { formatNumber } from "../../utils/formatters";

export interface DemandSegmentItem {
  key: string;
  name: string;
  count: number;
  color: string;
}

interface DemandAndModalityChartsProps {
  hourlyData: {
    hour: string;
    count: number;
    [key: string]: string | number;
  }[];
  modalities: DemandSegmentItem[];
  categories: DemandSegmentItem[];
  modalityDistribution: { name: string; value: number }[];
  colors: string[];
}

export const DemandAndModalityCharts: React.FC<DemandAndModalityChartsProps> = ({
  hourlyData,
  modalities = [],
  categories = [],
  modalityDistribution = [],
  colors
}) => {
  const [demandViewMode, setDemandViewMode] = useState<"total" | "modality" | "category">("total");

  // Calculate dynamic peak hour
  const peakInfo = useMemo(() => {
    if (!hourlyData || hourlyData.length === 0) return { hour: "--", count: 0 };
    let max = hourlyData[0];
    hourlyData.forEach((h) => {
      if (h.count > max.count) max = h;
    });
    return { hour: max.hour, count: max.count };
  }, [hourlyData]);

  // Active segments for legend and stacked bars
  const activeSegments = useMemo(() => {
    if (demandViewMode === "modality") return modalities;
    if (demandViewMode === "category") return categories;
    return [];
  }, [demandViewMode, modalities, categories]);

  // Custom rich tooltip for stacked and standard bars
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    if (demandViewMode === "total") {
      const val = payload[0]?.value || 0;
      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white px-3 py-2 rounded-xl border border-slate-700/80 shadow-xl text-xs space-y-1 min-w-[140px]">
          <div className="text-slate-400 font-medium">Hora: {label}</div>
          <div className="text-sm font-bold text-indigo-300 font-mono">
            {formatNumber(val)} órdenes
          </div>
        </div>
      );
    }

    const totalInHour = payload.reduce((acc: number, cur: any) => acc + (Number(cur.value) || 0), 0);
    const positivePayload = payload
      .filter((entry: any) => Number(entry.value) > 0)
      .sort((a: any, b: any) => Number(b.value) - Number(a.value));

    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white px-3.5 py-2.5 rounded-xl border border-slate-700/80 shadow-xl text-xs space-y-1.5 min-w-[200px] max-w-[280px]">
        <div className="flex items-center justify-between gap-3 border-b border-slate-700/60 pb-1.5 font-bold">
          <span className="text-slate-300">Hora: {label}</span>
          <span className="text-indigo-300 font-mono text-xs font-bold">
            {formatNumber(totalInHour)} órdenes
          </span>
        </div>
        {positivePayload.length === 0 ? (
          <div className="text-slate-400 italic text-[11px] py-1">Sin registros</div>
        ) : (
          <div className="space-y-1 pt-0.5 max-h-48 overflow-y-auto pr-1">
            {positivePayload.map((entry: any) => {
              const pct = totalInHour > 0 ? ((Number(entry.value) / totalInHour) * 100).toFixed(0) : "0";
              return (
                <div
                  key={entry.dataKey || entry.name}
                  className="flex items-center justify-between gap-2 text-[11px]"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: entry.color || entry.fill }}
                    />
                    <span className="text-slate-200 truncate">{entry.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-semibold text-white font-mono">{formatNumber(entry.value)}</span>
                    <span className="text-slate-400 text-[10px]">({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Hourly Demand Curve */}
      <div className="lg:col-span-8 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-100 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Curva de Demanda Horaria (Recepción OATC)
              </h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-md">
                <Clock className="w-3 h-3 text-indigo-600" />
                <span>Pico: {peakInfo.hour} ({formatNumber(peakInfo.count)})</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {demandViewMode === "total" && "Volumen total de órdenes registradas de 8:00 AM a 9:00 PM"}
              {demandViewMode === "modality" && "Composición por modalidad de ingreso (columna tipo cliente) por franja horaria"}
              {demandViewMode === "category" && "Composición por categoría canónica de atención (columna tipo oatc) por franja horaria"}
            </p>
          </div>

          {/* 3-Way Segmented View Mode Toggle */}
          <div className="inline-flex p-0.5 bg-slate-100 rounded-xl border border-slate-200/80 shrink-0 self-start md:self-auto">
            <button
              onClick={() => setDemandViewMode("total")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                demandViewMode === "total"
                  ? "bg-white text-indigo-700 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Total
            </button>
            <button
              onClick={() => setDemandViewMode("modality")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                demandViewMode === "modality"
                  ? "bg-white text-indigo-700 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Tag className="w-3 h-3" />
              <span>Modalidad</span>
            </button>
            <button
              onClick={() => setDemandViewMode("category")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                demandViewMode === "category"
                  ? "bg-white text-indigo-700 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Categoría</span>
            </button>
          </div>
        </div>

        {/* Bar Chart Container */}
        <div className="h-64 sm:h-72 mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="hour" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
              <Tooltip content={<CustomTooltip />} />

              {demandViewMode === "total" && (
                <Bar
                  dataKey="count"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                  name="Total Órdenes"
                />
              )}

              {demandViewMode === "modality" &&
                modalities.map((m, idx) => (
                  <Bar
                    key={m.key}
                    dataKey={m.key}
                    name={m.name}
                    stackId="demandStack"
                    fill={m.color}
                    radius={idx === modalities.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                  />
                ))}

              {demandViewMode === "category" &&
                categories.map((c, idx) => (
                  <Bar
                    key={c.key}
                    dataKey={c.key}
                    name={c.name}
                    stackId="demandStack"
                    fill={c.color}
                    radius={idx === categories.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                  />
                ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Dynamic Legend / Segments Badges */}
        {activeSegments.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
              {demandViewMode === "modality" ? "Modalidades:" : "Categorías:"}
            </span>
            {activeSegments.map((seg) => (
              <div
                key={seg.key}
                className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200/60 text-slate-700 text-[11px]"
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: seg.color }}
                />
                <span className="font-medium text-slate-600">{seg.name}</span>
                <span className="font-bold text-slate-900 font-mono">
                  {formatNumber(seg.count)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modality Breakdown Donut */}
      <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div>
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Modalidad de Atención
            </h3>
            <p className="text-xs text-slate-500">
              Citas agendadas vs Turnos de mostrador
            </p>
          </div>

          <div className="h-44 sm:h-48 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={modalityDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={4}
                >
                  {modalityDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${formatNumber(Number(val) || 0)} atenciones`, "Volumen"]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap justify-center gap-2.5 text-xs mb-2">
            {modalityDistribution.map((m, idx) => (
              <div
                key={m.name}
                className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: colors[idx % colors.length] }}
                />
                <span className="text-slate-700 font-medium">
                  {m.name}: <strong>{formatNumber(m.value)}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 p-3 bg-indigo-50/60 rounded-xl text-xs text-indigo-950 border border-indigo-100">
          <div className="font-bold flex items-center gap-1 text-indigo-900 mb-0.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>Análisis de Ocupación:</span>
          </div>
          <p className="text-[11px] leading-relaxed text-indigo-900/80">
            Los servicios por Cita presentan un ticket 35% superior a los turnos espontáneos. Fomentar la reserva anticipada vía SaS Vaikuntha.
          </p>
        </div>
      </div>
    </div>
  );
};
