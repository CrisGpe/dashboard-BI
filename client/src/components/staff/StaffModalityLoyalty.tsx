import React, { useState } from "react";
import { Users, Star, MessageCircle, ZoomIn, ChevronDown, ChevronRight, Scissors, X } from "lucide-react";
import { formatCurrency, formatDate, getWhatsAppUrl, formatNumber } from "../../utils/formatters";

export interface ServiceBreakdownItem {
  tipoOatc: string;
  count: number;
  pct: number;
}

export interface ModalityStat {
  name: string;
  count: number;
  pct: number;
  serviceBreakdown?: ServiceBreakdownItem[];
}

interface VipClient {
  nombre: string;
  visitas: number;
  gastoTotal: number;
  ultimaFecha: string;
  celular?: string;
}

interface StaffModalityLoyaltyProps {
  totalOrdersInPeriod: number;
  modalityStats: ModalityStat[];
  clientLoyaltyStats: {
    totalClientes: number;
    recurrentes: number;
    tasaRecurrencia: number;
    topClients: VipClient[];
  };
  agentName: string;
  colors: string[];
}

export const StaffModalityLoyalty: React.FC<StaffModalityLoyaltyProps> = ({
  totalOrdersInPeriod,
  modalityStats,
  clientLoyaltyStats,
  agentName,
  colors
}) => {
  const [activeZoomModality, setActiveZoomModality] = useState<string | null>(null);

  const toggleZoom = (modName: string) => {
    setActiveZoomModality((prev) => (prev === modName ? null : modName));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-600" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            Bloque 2: Composición de Atenciones & Fidelización de Clientes
          </h2>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Base: {formatNumber(totalOrdersInPeriod)} atenciones registradas en el corte
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Modality Breakdown (4 cols on lg/xl) with Interactive Zoom */}
        <div className="lg:col-span-4 bg-slate-50/70 rounded-2xl p-5 border border-slate-200/60 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Modalidad de Ingreso de Clientes
              </h3>
              <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/60 flex items-center gap-1">
                <ZoomIn className="w-3 h-3" />
                <span>Click para zoom</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-4">
              Citas programadas vs Turnos de tráfico espontáneo en este periodo
            </p>

            <div className="space-y-3">
              {modalityStats.map((mod, idx) => {
                const isExpanded = activeZoomModality === mod.name;
                const modColor = colors[idx % colors.length];

                return (
                  <div
                    key={mod.name}
                    className={`rounded-xl transition-all border ${
                      isExpanded
                        ? "bg-white p-3 border-indigo-200 shadow-sm"
                        : "bg-transparent p-1.5 border-transparent hover:bg-white/80 hover:border-slate-200/60"
                    }`}
                  >
                    {/* Header Row (Clickable) */}
                    <button
                      type="button"
                      onClick={() => toggleZoom(mod.name)}
                      className="w-full text-left space-y-1.5 cursor-pointer"
                    >
                      <div className="flex justify-between items-center text-xs font-medium">
                        <span className="text-slate-800 flex items-center gap-1.5 font-bold">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: modColor }}
                          />
                          <span>{mod.name}</span>
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-900">
                            {formatNumber(mod.count)}
                          </span>
                          <span className="text-slate-400 text-[11px]">({mod.pct}%)</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2 bg-slate-200/70 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${mod.pct}%`,
                            backgroundColor: modColor
                          }}
                        />
                      </div>
                    </button>

                    {/* Expanded Zoom Panel: Tipo OATC / Tipo de Atención */}
                    {isExpanded && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-2 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                          <span className="flex items-center gap-1 text-indigo-900">
                            <Scissors className="w-3 h-3 text-indigo-600" />
                            <span>Tipo de Atención (OATC / Borrador):</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {mod.serviceBreakdown?.length || 0} categorías
                          </span>
                        </div>

                        {!mod.serviceBreakdown || mod.serviceBreakdown.length === 0 ? (
                          <div className="text-[11px] text-slate-400 italic py-1 text-center">
                            Sin servicios especificados
                          </div>
                        ) : (
                          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                            {mod.serviceBreakdown.map((item) => (
                              <div
                                key={item.tipoOatc}
                                className="bg-slate-50/90 px-2 py-1.5 rounded-lg border border-slate-200/60 flex items-center justify-between text-xs"
                              >
                                <div className="truncate pr-2">
                                  <span className="font-medium text-slate-800 text-[11px] block truncate">
                                    {item.tipoOatc}
                                  </span>
                                  {/* Relative Mini Bar */}
                                  <div className="w-20 sm:w-28 h-1 bg-slate-200 rounded-full mt-1 overflow-hidden">
                                    <div
                                      className="h-full rounded-full bg-indigo-500"
                                      style={{ width: `${item.pct}%` }}
                                    />
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="font-bold text-slate-900 font-mono text-[11px]">
                                    {formatNumber(item.count)}
                                  </span>
                                  <span className="text-[10px] text-slate-500 ml-1">
                                    ({item.pct}%)
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/80 text-[11px] text-slate-500">
            💡 <strong>Análisis Vaikuntha:</strong>{" "}
            {modalityStats.find((m) => m.name.toLowerCase().includes("cita"))?.pct || 0}% de clientas entraron con cita en este periodo.
          </div>
        </div>

        {/* Recurrence & Top Clients (8 cols on lg/xl) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-5 border border-slate-200/60 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Top Clientes VIP & Recurrencia en el Periodo
              </h3>
              <p className="text-[11px] text-slate-500">
                Tasa de fidelidad del corte:{" "}
                <span className="font-bold text-indigo-600">{clientLoyaltyStats.tasaRecurrencia}%</span> (
                {clientLoyaltyStats.recurrentes} de {clientLoyaltyStats.totalClientes} clientes repitieron)
              </p>
            </div>
            <span className="text-[11px] text-slate-400">Contacto directo WhatsApp</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left table-dense">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider sticky top-0 z-10 border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2 rounded-l-lg">Cliente VIP</th>
                  <th className="px-3 py-2 text-center">Visitas</th>
                  <th className="px-3 py-2 text-right">Gasto Total</th>
                  <th className="px-3 py-2 text-right">Última Visita</th>
                  <th className="px-3 py-2 text-center rounded-r-lg">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clientLoyaltyStats.topClients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-slate-400">
                      No se registraron atenciones de clientes recurrentes en este corte temporal.
                    </td>
                  </tr>
                ) : (
                  clientLoyaltyStats.topClients.map((vip, i) => (
                    <tr key={vip.nombre + i} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-3 py-2 font-bold text-slate-800 flex items-center gap-1.5">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-400 shrink-0" />
                        <span className="truncate max-w-[180px]">{vip.nombre}</span>
                      </td>
                      <td className="px-3 py-2 text-center font-bold text-indigo-600">{vip.visitas}</td>
                      <td className="px-3 py-2 text-right font-extrabold text-slate-900">{formatCurrency(vip.gastoTotal)}</td>
                      <td className="px-3 py-2 text-right text-slate-500">{formatDate(vip.ultimaFecha)}</td>
                      <td className="px-3 py-2 text-center">
                        {vip.celular && getWhatsAppUrl(vip.celular, agentName) ? (
                          <a
                            href={getWhatsAppUrl(vip.celular, agentName) || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md hover:bg-emerald-100 transition-colors"
                          >
                            <MessageCircle className="w-3 h-3 text-emerald-600" />
                            <span>WhatsApp</span>
                          </a>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Sin teléfono</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
