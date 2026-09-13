import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { formatCurrency } from "../../utils/formatters";

interface TrendDataPoint {
  period: string;
  serviciosFact: number;
  retailFact: number;
}

interface PaymentBreakdownItem {
  name: string;
  value: number;
  pct: number;
}

interface ExecutiveChartsProps {
  trendData: TrendDataPoint[];
  servicePaymentBreakdown: PaymentBreakdownItem[];
  colors: string[];
}

export const ExecutiveCharts: React.FC<ExecutiveChartsProps> = ({
  trendData,
  servicePaymentBreakdown,
  colors
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Monthly Trend Bar Chart (8 cols on lg/xl) */}
      <div className="lg:col-span-8 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Evolución Comparativa: Facturación Servicios vs Facturación Retail
            </h3>
            <p className="text-xs text-slate-500">
              Comparativa mensual en soles de ingresos por salón (Caja) vs ventas de tienda (ERP)
            </p>
          </div>
          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2.5 py-1 rounded-lg self-start sm:self-auto">
            Últimos Meses
          </span>
        </div>

        <div className="h-64 sm:h-72 mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="period" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickFormatter={(val) => `S/.${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value: any, name: any) => [
                  formatCurrency(Number(value)),
                  name === "serviciosFact" ? "Servicios Salón (Caja)" : "Retail Productos (ERP)"
                ]}
                contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }}
              />
              <Legend
                formatter={(value) => (value === "serviciosFact" ? "Servicios Salón (S/.)" : "Retail Productos (S/.)")}
                wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
              />
              <Bar dataKey="serviciosFact" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="retailFact" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Payment Method Breakdown in Cash (4 cols on lg/xl) */}
      <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div>
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Medios de Pago en Caja (Servicios)
            </h3>
            <p className="text-xs text-slate-500">
              Distribución de ingresos cobrados en recepción
            </p>
          </div>

          <div className="h-44 sm:h-48 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={servicePaymentBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={4}
                >
                  {servicePaymentBreakdown.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val)), "Monto"]}
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 mt-1">
            {servicePaymentBreakdown.map((m, idx) => (
              <div key={m.name} className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: colors[idx % colors.length] }}
                  />
                  <span className="text-slate-700 font-medium">{m.name}</span>
                </div>
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span>{formatCurrency(m.value)}</span>
                  <span className="text-slate-400 font-normal">({m.pct}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-200/60">
          💡 <strong>Predominio Digital:</strong> El POS y depósitos bancarios representan el{" "}
          <span className="font-bold text-indigo-600">
            {(servicePaymentBreakdown[0]?.pct || 0) + (servicePaymentBreakdown[2]?.pct || 0)}%
          </span>{" "}
          de la recaudación de servicios.
        </div>
      </div>
    </div>
  );
};
