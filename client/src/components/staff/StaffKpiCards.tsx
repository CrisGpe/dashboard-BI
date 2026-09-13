import React from "react";
import { Scissors, ShoppingBag, TrendingUp, Activity } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

interface StaffKpiCardsProps {
  facturadoServicios: number;
  totalServicios: number;
  ticketPromedioServicio: number;
  facturadoRetail: number;
  totalTicketsRetail: number;
  ticketPromedioRetail: number;
  margenAportadoEmpresa: number;
  margenPct: number;
  facturacionPorHora: number;
  horasTrabajadas: number;
  diasAsistidos: number;
}

export const StaffKpiCards: React.FC<StaffKpiCardsProps> = ({
  facturadoServicios,
  totalServicios,
  ticketPromedioServicio,
  facturadoRetail,
  totalTicketsRetail,
  ticketPromedioRetail,
  margenAportadoEmpresa,
  margenPct,
  facturacionPorHora,
  horasTrabajadas,
  diasAsistidos
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/60 print:border-slate-300 shadow-2xs">
        <div className="flex items-center justify-between text-indigo-600 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            1. Facturación Servicios
          </span>
          <Scissors className="w-4 h-4" />
        </div>
        <div className="text-xl font-extrabold text-slate-900">
          {formatCurrency(facturadoServicios)}
        </div>
        <p className="text-[11px] text-slate-500 mt-0.5">
          {totalServicios} atenciones • Ticket: {formatCurrency(ticketPromedioServicio)}
        </p>
      </div>

      <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/60 print:border-slate-300 shadow-2xs">
        <div className="flex items-center justify-between text-emerald-600 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            2. Venta Retail Asesorada
          </span>
          <ShoppingBag className="w-4 h-4" />
        </div>
        <div className="text-xl font-extrabold text-slate-900">
          {formatCurrency(facturadoRetail)}
        </div>
        <p className="text-[11px] text-slate-500 mt-0.5">
          {totalTicketsRetail} tickets • Ticket: {formatCurrency(ticketPromedioRetail)}
        </p>
      </div>

      <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/60 print:border-slate-300 shadow-2xs">
        <div className="flex items-center justify-between text-violet-600 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            3. Margen Neto Aportado
          </span>
          <TrendingUp className="w-4 h-4" />
        </div>
        <div className="text-xl font-extrabold text-emerald-600">
          {formatCurrency(margenAportadoEmpresa)}
        </div>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Ganancia neta tras comisiones y costo retail ({margenPct}%)
        </p>
      </div>

      <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/60 print:border-slate-300 shadow-2xs">
        <div className="flex items-center justify-between text-sky-600 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            4. Eficiencia Económica
          </span>
          <Activity className="w-4 h-4" />
        </div>
        <div className="text-xl font-extrabold text-indigo-600">
          S/. {facturacionPorHora.toFixed(0)}/h
        </div>
        <p className="text-[11px] text-slate-500 mt-0.5">
          {horasTrabajadas} hrs en salón • {diasAsistidos} días
        </p>
      </div>
    </div>
  );
};
