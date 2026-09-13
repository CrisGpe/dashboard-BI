import React from "react";
import { Sparkles } from "lucide-react";
import { formatCurrency, formatNumber } from "../../utils/formatters";
import { SalonFilter, SALONES_CONFIG } from "../../types";

interface ExecutiveSpotlightBannerProps {
  facturacionGlobal: number;
  totalServiciosFacturado: number;
  totalComisionesServicios: number;
  totalRetail: number;
  ticketsCount: number;
  margenBrutoGlobal: number;
  margenBrutoGlobalPct: number;
  selectedSalon?: SalonFilter;
}

export const ExecutiveSpotlightBanner: React.FC<ExecutiveSpotlightBannerProps> = ({
  facturacionGlobal,
  totalServiciosFacturado,
  totalComisionesServicios,
  totalRetail,
  ticketsCount,
  margenBrutoGlobal,
  margenBrutoGlobalPct,
  selectedSalon = "ALL"
}) => {
  const salonConfig = SALONES_CONFIG[selectedSalon] || SALONES_CONFIG.ALL;
  const isConsolidated = selectedSalon === "ALL";
  const badgeText = isConsolidated
    ? "Consolidado Multi-Sede • 4 Salones • 7 Fuentes de Datos"
    : `${salonConfig.nombre} • ${salonConfig.badge}`;
  const subtitleText = isConsolidated
    ? "Facturación Total Global de la Red: Consolidando los servicios operados en las 4 sedes más las ventas de productos retail."
    : `Facturación y rendimiento financiero exclusivo de la sede ${salonConfig.nombre}.`;

  return (
    <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-violet-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
      <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                {badgeText}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Inteligencia Financiera Total
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              {formatCurrency(facturacionGlobal)}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              {subtitleText}
            </p>
          </div>

          {/* Quick Financial Split Pill */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 bg-white/10 p-3 rounded-2xl border border-white/10 backdrop-blur-sm">
            <div className="px-3 py-1.5 border-r border-white/10">
              <div className="text-[10px] uppercase font-bold text-indigo-300">Servicios Salón (Caja)</div>
              <div className="text-base font-black text-white">{formatCurrency(totalServiciosFacturado)}</div>
              <div className="text-[10px] text-slate-300">Comisiones: {formatCurrency(totalComisionesServicios)}</div>
            </div>
            <div className="px-3 py-1.5 border-r border-white/10">
              <div className="text-[10px] uppercase font-bold text-emerald-300">Ventas Retail (ERP)</div>
              <div className="text-base font-black text-white">{formatCurrency(totalRetail)}</div>
              <div className="text-[10px] text-slate-300">{formatNumber(ticketsCount)} tickets</div>
            </div>
            <div className="px-3 py-1.5">
              <div className="text-[10px] uppercase font-bold text-violet-300">Margen Bruto Total</div>
              <div className="text-base font-black text-emerald-400">{formatCurrency(margenBrutoGlobal)}</div>
              <div className="text-[10px] text-slate-300">Margen: <span className="font-bold text-white">{margenBrutoGlobalPct}%</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
