import React from "react";
import { Calendar, Clock, Sparkles } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LineChart,
  Line
} from "recharts";
import { DemandNormalizationMode } from "../../../types";

export interface BenchmarkDemandCurvesProps {
  weeklyChartData: any[];
  hourlyChartData: any[];
  normalizationMode: DemandNormalizationMode;
  formatChartValue: (val: number) => string;
}

export const BenchmarkDemandCurves: React.FC<BenchmarkDemandCurvesProps> = ({
  weeklyChartData,
  hourlyChartData,
  normalizationMode,
  formatChartValue
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Weekly Curve (Lunes a Domingo) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-black text-slate-900">
                Curva Semanal Normalizada (Lunes a Domingo)
              </h3>
            </div>
            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
              {normalizationMode === "relative_pct"
                ? "% Relativo"
                : normalizationMode === "daily_avg"
                ? "Atenciones / Día"
                : normalizationMode === "per_stylist"
                ? "Atenciones / Estilista"
                : "Total Absoluto"}
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Comparativa de la forma de la semana comercial. Sábado concentra entre el 25% y 28% de la demanda en las
            cuatro sedes, con Gonzales AM mostrando mayor polarización de fin de semana.
          </p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) =>
                  normalizationMode === "relative_pct"
                    ? `${val}%`
                    : val >= 1000
                    ? `${(val / 1000).toFixed(0)}k`
                    : `${val}`
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#1e293b",
                  borderRadius: "12px",
                  color: "#fff",
                  fontSize: "12px"
                }}
                formatter={(value: any, name: any) => [formatChartValue(Number(value || 0)), name]}
              />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} iconType="circle" />
              <Bar dataKey="rd" name="Salón RD (Real)" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="luxury" name="Luxury RD (Real)" fill="#059669" radius={[4, 4, 0, 0]} />
              <Bar dataKey="gonzales" name="Gonzales AM (Normalizado)" fill="#d97706" radius={[4, 4, 0, 0]} />
              <Bar dataKey="gloss" name="Gloss Salon (Real)" fill="#ec4899" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <span className="font-semibold text-slate-700">Pico semanal compartido:</span>
          <span className="font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
            Sábado (~26.5% promedio quad-sede)
          </span>
        </div>
      </div>

      {/* Hourly Curve (Real vs Inferida) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-black text-slate-900">
                Curva Horaria Normalizada (08:00 a 22:00 hrs)
              </h3>
            </div>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> P(Hora | Cat, Día)
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Salón RD, Luxury RD y Gloss Salon reflejan check-in digital con hora exacta (15,577, 6,676 y 6,636 registros). Gonzales AM
            proyecta su demanda horaria según su mix de categorías.
          </p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={hourlyChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) =>
                  normalizationMode === "relative_pct"
                    ? `${val}%`
                    : val >= 1000
                    ? `${(val / 1000).toFixed(0)}k`
                    : `${val}`
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#1e293b",
                  borderRadius: "12px",
                  color: "#fff",
                  fontSize: "12px"
                }}
                formatter={(val: any, name: any) => [formatChartValue(Number(val || 0)), name]}
              />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} iconType="circle" />
              <Line
                type="monotone"
                dataKey="rdReal"
                name="Salón RD (Real)"
                stroke="#4f46e5"
                strokeWidth={2.5}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="luxuryReal"
                name="Luxury RD (Real)"
                stroke="#059669"
                strokeWidth={2.5}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="gonzalesInferido"
                name="Gonzales AM (Inferido)"
                stroke="#d97706"
                strokeWidth={3}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: "#d97706" }}
              />
              <Line
                type="monotone"
                dataKey="glossReal"
                name="Gloss Salon (Real)"
                stroke="#ec4899"
                strokeWidth={2.5}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 p-3 bg-amber-50/60 rounded-xl border border-amber-200/60 flex items-center justify-between text-xs text-amber-900">
          <span className="font-semibold">Franja de mayor congestión inferida en Gonzales AM:</span>
          <span className="font-black bg-white px-2 py-0.5 rounded border border-amber-300">
            16:00 a 19:00 hrs (Pico a las 17:00)
          </span>
        </div>
      </div>
    </div>
  );
};
