import React from "react";
import { Users, Star, MessageCircle } from "lucide-react";
import { formatCurrency, formatDate, getWhatsAppUrl } from "../../utils/formatters";

interface ModalityStat {
  name: string;
  count: number;
  pct: number;
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
          Base: {totalOrdersInPeriod} atenciones registradas en el corte
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Modality Breakdown (4 cols on lg/xl) */}
        <div className="lg:col-span-4 bg-slate-50/70 rounded-2xl p-5 border border-slate-200/60 flex flex-col justify-between shadow-2xs">
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Modalidad de Ingreso de Clientes
            </h3>
            <p className="text-[11px] text-slate-500 mb-4">
              Citas programadas vs Turnos de tráfico espontáneo en este periodo
            </p>

            <div className="space-y-2.5">
              {modalityStats.map((mod, idx) => (
                <div key={mod.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-700 flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: colors[idx % colors.length] }}
                      />
                      {mod.name}
                    </span>
                    <span className="font-bold text-slate-900">
                      {mod.count} ({mod.pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200/70 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${mod.pct}%`,
                        backgroundColor: colors[idx % colors.length]
                      }}
                    />
                  </div>
                </div>
              ))}
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
                  <th className="px-3 py-2 text-center">Última Atención</th>
                  <th className="px-3 py-2 text-center rounded-r-lg">Acción WhatsApp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clientLoyaltyStats.topClients.map((client) => {
                  const waUrl = client.celular
                    ? getWhatsAppUrl(
                        client.celular,
                        `Hola ${client.nombre}, te saluda ${agentName} de SaS Vaikuntha. Espero que tu último servicio haya quedado excelente. ¿Te gustaría agendar tu próximo retoque?`
                      )
                    : null;

                  return (
                    <tr key={client.nombre} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-3 py-2 font-bold text-slate-800 flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400 shrink-0" />
                        {client.nombre}
                      </td>
                      <td className="px-3 py-2 text-center font-semibold text-slate-600">
                        {client.visitas}
                      </td>
                      <td className="px-3 py-2 text-right font-extrabold text-indigo-600">
                        {formatCurrency(client.gastoTotal)}
                      </td>
                      <td className="px-3 py-2 text-center text-slate-500 text-[11px] whitespace-nowrap">
                        {client.ultimaFecha ? formatDate(client.ultimaFecha) : "-"}
                      </td>
                      <td className="px-3 py-2 text-center whitespace-nowrap">
                        {waUrl ? (
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg border border-emerald-200 transition-colors text-[10px]"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>Fidelizar</span>
                          </a>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Sin celular</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
