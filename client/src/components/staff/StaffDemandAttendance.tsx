import React from "react";
import { Clock, Flame, Coffee, AlertTriangle } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  LineChart,
  Line
} from "recharts";

interface HourlyAnalysisData {
  hora: string;
  total: number;
  acumulado: number;
  [cat: string]: any;
}

interface StaffDemandAttendanceProps {
  periodLabel: string;
  chartMode: "modality" | "stacked" | "cumulative";
  onChartModeChange: (mode: "modality" | "stacked" | "cumulative") => void;
  hourlyAnalysis: {
    data: HourlyAnalysisData[];
    topCats: string[];
    modalities?: { key: string; name: string; color: string }[];
    peakHour: string;
    valleyHour: string;
  };
  hrEntrada?: string;
  hrSalida?: string;
  diaDescanso?: string;
  horasTrabajadas: number;
  diasAsistidos: number;
  facturacionPorHora: number;
  colors: string[];
}

export const StaffDemandAttendance: React.FC<StaffDemandAttendanceProps> = ({
  periodLabel,
  chartMode,
  onChartModeChange,
  hourlyAnalysis,
  hrEntrada,
  hrSalida,
  diaDescanso,
  horasTrabajadas,
  diasAsistidos,
  facturacionPorHora,
  colors
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-2 gap-2">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-sky-600" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            Bloque 3: Curva de Demanda Individual & Cruce con Asistencia ({periodLabel})
          </h2>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold no-print self-start sm:self-auto">
          <button
            onClick={() => onChartModeChange("modality")}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              chartMode === "modality" ? "bg-white text-indigo-600 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Por Modalidad
          </button>
          <button
            onClick={() => onChartModeChange("stacked")}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              chartMode === "stacked" ? "bg-white text-indigo-600 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Por Especialidad
          </button>
          <button
            onClick={() => onChartModeChange("cumulative")}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              chartMode === "cumulative" ? "bg-white text-indigo-600 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Flujo Acumulado
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Demand Chart (8 cols on lg/xl) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-5 border border-slate-200/60 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {chartMode === "modality"
                  ? "Demanda Horaria por Modalidad de Ingreso"
                  : chartMode === "stacked"
                  ? "Demanda Horaria por Especialidad de Atención"
                  : "Flujo de Carga Horaria Acumulada a lo Largo de la Jornada"}
              </h3>
              <p className="text-[11px] text-slate-500">
                Horas de mayor saturación vs horas valle para descansos o promociones en este corte
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                <Flame className="w-3.5 h-3.5" /> Pico: {hourlyAnalysis.peakHour}
              </span>
              <span className="flex items-center gap-1 font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200/60">
                <Coffee className="w-3.5 h-3.5" /> Valle: {hourlyAnalysis.valleyHour}
              </span>
            </div>
          </div>

          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              {chartMode === "modality" ? (
                <BarChart data={hourlyAnalysis.data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="hora" tick={{ fontSize: 10, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "11px" }} />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  {(hourlyAnalysis.modalities || []).map((m, idx, arr) => (
                    <Bar
                      key={m.key}
                      dataKey={m.key}
                      name={m.name}
                      stackId="modStack"
                      fill={m.color}
                      radius={idx === arr.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                    />
                  ))}
                </BarChart>
              ) : chartMode === "stacked" ? (
                <BarChart data={hourlyAnalysis.data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="hora" tick={{ fontSize: 10, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "11px" }} />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  {hourlyAnalysis.topCats.map((cat, idx) => (
                    <Bar
                      key={cat}
                      dataKey={cat}
                      stackId="a"
                      fill={colors[idx % colors.length]}
                      radius={idx === hourlyAnalysis.topCats.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                    />
                  ))}
                  <Bar dataKey="Otros" stackId="a" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <LineChart data={hourlyAnalysis.data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="hora" tick={{ fontSize: 10, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "11px" }} />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#6366f1"
                    strokeWidth={2}
                    name="Atenciones por Hora"
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="acumulado"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Atenciones Acumuladas"
                    dot={false}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance & Shift Match Analysis (4 cols on lg/xl) */}
        <div className="lg:col-span-4 bg-slate-50/70 rounded-2xl p-5 border border-slate-200/60 flex flex-col justify-between shadow-2xs">
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Cruce con Asistencia y Jornada Real
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 bg-white rounded-xl border border-slate-200/80">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Horario Oficial en Administración</span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {hrEntrada || "9:00 AM"} a {hrSalida || "8:00 PM"}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Día de descanso oficial: {diaDescanso || "domingo"}</span>
              </div>

              <div className="p-2.5 bg-white rounded-xl border border-slate-200/80">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Jornada en este Corte ({periodLabel})</span>
                <span className="font-extrabold text-indigo-700 text-sm">
                  {horasTrabajadas} horas • {diasAsistidos} días asistidos
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Ingresos por servicios por hora: <strong>S/. {facturacionPorHora.toFixed(0)}/h</strong>
                </span>
              </div>

              <div className="p-2.5 bg-amber-50/80 rounded-xl border border-amber-200/80 text-amber-900">
                <span className="font-bold flex items-center gap-1 text-[11px] mb-0.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Tiempos Muertos Detectados:
                </span>
                <p className="text-[11px] leading-relaxed">
                  Entre <strong>1:00 PM y 2:30 PM</strong> el volumen de atención cae en un <strong>60%</strong>. Se recomienda alinear turnos de refrigerio en esta franja para evitar colas en las horas pico (5:00 - 8:00 PM).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
