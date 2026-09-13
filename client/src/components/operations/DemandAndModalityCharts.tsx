import React from "react";
import { Clock } from "lucide-react";
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

interface DemandAndModalityChartsProps {
  hourlyData: { hour: string; count: number }[];
  modalityDistribution: { name: string; value: number }[];
  colors: string[];
}

export const DemandAndModalityCharts: React.FC<DemandAndModalityChartsProps> = ({
  hourlyData,
  modalityDistribution,
  colors
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Hourly Demand Curve */}
      <div className="lg:col-span-8 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Curva de Demanda Horaria (Recepción OATC)
            </h3>
            <p className="text-xs text-slate-500">
              Concentración horaria de atenciones registradas de 8:00 AM a 9:00 PM
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2.5 py-1 rounded-lg self-start sm:self-auto">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span>Pico: 5:00 PM - 8:00 PM</span>
          </span>
        </div>

        <div className="h-64 sm:h-72 mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="hour" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
              <Tooltip
                formatter={(value: any) => [`${value} órdenes`, "Volumen"]}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  fontSize: "12px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                }}
              />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Modality Breakdown */}
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
                  formatter={(val: any) => [`${val} atenciones`, "Volumen"]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap justify-center gap-3 text-xs mb-2">
            {modalityDistribution.map((m, idx) => (
              <div key={m.name} className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
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
            💡 Análisis de Ocupación:
          </div>
          <p className="text-[11px] leading-relaxed text-indigo-900/80">
            Los servicios por Cita presentan un ticket 35% superior a los turnos espontáneos. Fomentar la reserva anticipada vía SaS Vaikuntha.
          </p>
        </div>
      </div>
    </div>
  );
};
