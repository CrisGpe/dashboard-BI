import React from "react";
import { Scissors, ShoppingBag, TrendingUp, Sparkles, Award, Users } from "lucide-react";
import { formatCurrency, formatNumber, formatPercent } from "../../utils/formatters";

interface ExecutiveKpiCardsProps {
  totalServiciosFacturado: number;
  totalComisionesServicios: number;
  totalRetail: number;
  ticketsCount: number;
  avgTicket: number;
  margenBrutoGlobal: number;
  margenBrutoGlobalPct: number;
  tasaConversionCrossSell: number;
  totalServicios: number;
  totalHoras: number;
  totalClientesUnicos: number;
}

export const ExecutiveKpiCards: React.FC<ExecutiveKpiCardsProps> = ({
  totalServiciosFacturado,
  totalComisionesServicios,
  totalRetail,
  ticketsCount,
  avgTicket,
  margenBrutoGlobal,
  margenBrutoGlobalPct,
  tasaConversionCrossSell,
  totalServicios,
  totalHoras,
  totalClientesUnicos
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {/* KPI 1: Facturación Servicios */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:border-indigo-300 transition-all">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Servicios Salón</span>
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Scissors className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-extrabold text-slate-900">
          {formatCurrency(totalServiciosFacturado)}
        </div>
        <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
          <span>Comisiones: {formatCurrency(totalComisionesServicios)}</span>
        </div>
      </div>

      {/* KPI 2: Ventas Retail */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:border-indigo-300 transition-all">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Retail ERP</span>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShoppingBag className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-extrabold text-slate-900">
          {formatCurrency(totalRetail)}
        </div>
        <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
          <span>{formatNumber(ticketsCount)} tickets</span>
          <span className="font-semibold text-emerald-600">Prom: {formatCurrency(avgTicket)}</span>
        </div>
      </div>

      {/* KPI 3: Margen Bruto Global */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:border-indigo-300 transition-all">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Margen Ganancia</span>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-extrabold text-emerald-600">
          {formatCurrency(margenBrutoGlobal)}
        </div>
        <p className="text-[11px] text-slate-500 mt-1">
          Margen: <span className="font-bold text-slate-700">{margenBrutoGlobalPct}%</span>
        </p>
      </div>

      {/* KPI 4: Conversión Cross-Selling */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:border-indigo-300 transition-all">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Cross-Selling</span>
          <div className="w-7 h-7 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-extrabold text-violet-700">
          {formatPercent(tasaConversionCrossSell)}
        </div>
        <p className="text-[11px] text-slate-500 mt-1">
          Clientes de salón que compraron producto
        </p>
      </div>

      {/* KPI 5: Atenciones OATC */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:border-indigo-300 transition-all">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Órdenes Atendidas</span>
          <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
            <Award className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-extrabold text-slate-900">
          {formatNumber(totalServicios)}
        </div>
        <p className="text-[11px] text-slate-500 mt-1">
          {formatNumber(totalHoras)} horas trabajadas
        </p>
      </div>

      {/* KPI 6: Clientes Únicos */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:border-indigo-300 transition-all">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Directorio Clientes</span>
          <div className="w-7 h-7 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-extrabold text-slate-900">
          {formatNumber(totalClientesUnicos)}
        </div>
        <p className="text-[11px] text-slate-500 mt-1">
          Clientes fidelizados en sistema
        </p>
      </div>
    </div>
  );
};
