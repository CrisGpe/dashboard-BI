import React from "react";
import { Store, ArrowRight, TrendingUp, Users, Receipt, AlertTriangle } from "lucide-react";
import { SalonContribution, SalonFilter, SALONES_CONFIG } from "../../types";
import { formatCurrency, formatNumber } from "../../utils/formatters";

interface ExecutiveSalonBreakdownProps {
  breakdown: SalonContribution[];
  onSelectSalon?: (salon: SalonFilter) => void;
}

export const ExecutiveSalonBreakdown: React.FC<ExecutiveSalonBreakdownProps> = ({
  breakdown,
  onSelectSalon
}) => {
  const totalFacturadoGlobal = breakdown.reduce((acc, b) => acc + b.totalFacturado, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
              Aporte por Sede / Salón (Consolidado Multi-Sede)
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                4 Unidades de Negocio
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Desglose de ingresos, órdenes efectivas y ticket promedio por cada salón físico
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs font-bold text-slate-400">Total Consolidado</div>
          <div className="text-base font-black text-slate-900">{formatCurrency(totalFacturadoGlobal)}</div>
        </div>
      </div>

      {/* Multi-Sede Share Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
          <span>Participación en la Facturación Global</span>
          <span>100% Consolidado</span>
        </div>
        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
          {breakdown.map((b) => {
            if (b.sharePct <= 0) return null;
            return (
              <div
                key={b.salonId}
                style={{ width: `${b.sharePct}%`, backgroundColor: b.color }}
                className="h-full transition-all duration-500 hover:opacity-90 relative group"
                title={`${b.nombre}: ${b.sharePct}% (${formatCurrency(b.totalFacturado)})`}
              />
            );
          })}
        </div>
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 pt-1">
          {breakdown.map((b) => (
            <div key={b.salonId} className="flex items-center gap-1.5 text-xs">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.color }} />
              <span className="font-semibold text-slate-700">{b.nombre}</span>
              <span className="text-slate-500 font-bold">({b.sharePct}%)</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4 Salon Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
        {breakdown.map((b) => {
          const config = SALONES_CONFIG[b.salonId];
          const hasVentas = b.totalFacturado > 0;

          return (
            <div
              key={b.salonId}
              onClick={() => onSelectSalon && onSelectSalon(b.salonId)}
              className={`rounded-2xl border p-4 transition-all duration-200 cursor-pointer relative overflow-hidden group hover:shadow-md ${
                config.bgLight
              } ${config.borderLight} hover:scale-[1.01]`}
            >
              <div className="flex items-start justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${config.dotColor}`} />
                  <span className="text-xs font-black text-slate-900 tracking-tight">{b.nombre}</span>
                </div>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white/90 text-slate-700 shadow-2xs border border-slate-200/50">
                  {b.sharePct}%
                </span>
              </div>

              <div className="text-xs font-bold text-slate-500 mb-1">{b.badge}</div>

              {hasVentas ? (
                <div className="text-xl font-black text-slate-900 tracking-tight mb-3">
                  {formatCurrency(b.totalFacturado)}
                </div>
              ) : (
                <div className="mb-3">
                  <div className="text-xl font-black text-slate-400">S/. 0.00</div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-pink-600 mt-0.5">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Ventas pendientes de carga</span>
                  </div>
                </div>
              )}

              {/* Operational Micro-metrics */}
              <div className="space-y-1.5 text-[11px] text-slate-600 border-t border-slate-200/60 pt-2.5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-slate-500">
                    <Receipt className="w-3 h-3 text-slate-400" /> Transacciones:
                  </span>
                  <span className="font-bold text-slate-800">{formatNumber(b.totalTransacciones)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-slate-500">
                    <Users className="w-3 h-3 text-slate-400" /> Servicios atendidos:
                  </span>
                  <span className="font-bold text-slate-800">{formatNumber(b.totalServicios)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-slate-500">
                    <TrendingUp className="w-3 h-3 text-slate-400" /> Ticket promedio:
                  </span>
                  <span className="font-bold text-slate-800">
                    {hasVentas ? formatCurrency(b.ticketPromedio) : "-"}
                  </span>
                </div>
              </div>

              {/* Drill-down action link */}
              {onSelectSalon && (
                <div className="mt-3 pt-2 border-t border-slate-200/40 flex items-center justify-between text-[11px] font-bold text-indigo-600 group-hover:text-indigo-700">
                  <span>Filtrar solo esta sede</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

