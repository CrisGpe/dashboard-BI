import React from "react";
import { DollarSign, ShoppingBag, TrendingUp, Layers } from "lucide-react";
import { formatCurrency, formatNumber } from "../../utils/formatters";

interface RetailKpisProps {
  totalFacturacion: number;
  totalTickets: number;
  totalUnidades: number;
  ticketPromedio: number;
  totalMarcas: number;
  totalProductos: number;
}

export const RetailKpis: React.FC<RetailKpisProps> = ({
  totalFacturacion,
  totalTickets,
  totalUnidades,
  ticketPromedio,
  totalMarcas,
  totalProductos
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Facturación Retail */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Facturación Retail</span>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-extrabold text-slate-900">
          {formatCurrency(totalFacturacion)}
        </div>
        <p className="text-[11px] text-slate-500 mt-1">
          En {formatNumber(totalTickets)} tickets emitidos
        </p>
      </div>

      {/* 2. Unidades Vendidas */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Unidades Vendidas</span>
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <ShoppingBag className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-extrabold text-slate-900">
          {formatNumber(totalUnidades)} unid.
        </div>
        <p className="text-[11px] text-slate-500 mt-1">
          Productos salidos de inventario
        </p>
      </div>

      {/* 3. Ticket Promedio Retail */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Ticket Promedio Retail</span>
          <div className="w-7 h-7 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-extrabold text-violet-700">
          {formatCurrency(ticketPromedio)}
        </div>
        <p className="text-[11px] text-slate-500 mt-1">
          Gasto medio por ticket en mostrador
        </p>
      </div>

      {/* 4. Marcas & Catálogo Activo */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Marcas & Catálogo</span>
          <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-extrabold text-slate-900">
          {totalMarcas} Marcas
        </div>
        <p className="text-[11px] text-slate-500 mt-1">
          {formatNumber(totalProductos)} productos en rotación
        </p>
      </div>
    </div>
  );
};
