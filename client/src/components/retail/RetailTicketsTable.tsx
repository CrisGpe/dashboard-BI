import React from "react";
import { Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { TicketRecord } from "../../types";
import { formatCurrency, formatDate, formatNumber } from "../../utils/formatters";

interface RetailTicketsTableProps {
  tickets: TicketRecord[];
  onSelectTicket: (ticket: TicketRecord) => void;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    nextPage: () => void;
    prevPage: () => void;
  };
}

export const RetailTicketsTable: React.FC<RetailTicketsTableProps> = ({
  tickets,
  onSelectTicket,
  pagination
}) => {
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left table-dense">
          <thead className="bg-slate-100/70 text-slate-600 font-semibold uppercase tracking-wider sticky top-0 z-10 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">Sede</th>
              <th className="px-4 py-3">Ticket</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Asesor / Vendedor</th>
              <th className="px-4 py-3">Medio de Pago</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-center">Estado</th>
              <th className="px-4 py-3 text-center">Detalle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tickets.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                  No se encontraron tickets con los filtros aplicados.
                </td>
              </tr>
            ) : (
              tickets.map((t) => {
                const getSedeBadge = (sede?: string) => {
                  switch (sede) {
                    case "Salón RD":
                      return "bg-indigo-50 text-indigo-700 border-indigo-200";
                    case "Gloss Salon":
                      return "bg-pink-50 text-pink-700 border-pink-200";
                    case "Gonzales AM":
                      return "bg-emerald-50 text-emerald-700 border-emerald-200";
                    case "Luxury RD":
                      return "bg-amber-50 text-amber-700 border-amber-200";
                    default:
                      return "bg-slate-100 text-slate-700 border-slate-200";
                  }
                };
                return (
                <tr key={`${t.sede || "salon-rd"}-${t.ticket}`} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getSedeBadge(t.sede)}`}>
                      {t.sede || "Salón RD"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-bold font-mono text-indigo-600">
                    {t.ticket}
                  </td>
                  <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span>{formatDate(t.fecha)}</span>
                      {t.diaSemana && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          {t.diaSemana.slice(0, 3)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 font-medium text-slate-800">
                    <div>{t.clienteNombreLimpio}</div>
                    {(t.clienteDni || t.clienteCelular) && (
                      <div className="text-[10px] text-slate-400">
                        {t.clienteDni ? `DNI: ${t.clienteDni}` : ""}
                        {t.clienteCelular ? ` • Cel: ${t.clienteCelular}` : ""}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2.5 font-semibold text-slate-700">
                    {t.asesor}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {t.metodoPago}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-extrabold text-slate-900">
                    {formatCurrency(t.total)}
                  </td>
                  <td className="px-4 py-2.5 text-center whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        t.estado === "COMPLETADO"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {t.estado}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center whitespace-nowrap">
                    <button
                      onClick={() => onSelectTicket(t)}
                      className="p-1 rounded-lg hover:bg-indigo-50 text-indigo-600 transition-colors cursor-pointer"
                      title="Ver detalle de productos"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            }))}
          </tbody>
        </table>
      </div>

      <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/30">
        <span>
          Página {pagination.currentPage} de {pagination.totalPages} (
          {formatNumber(pagination.totalItems)} tickets)
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={pagination.prevPage}
            disabled={pagination.currentPage === 1}
            className="p-1 rounded-lg hover:bg-slate-200 disabled:opacity-40 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={pagination.nextPage}
            disabled={pagination.currentPage === pagination.totalPages}
            className="p-1 rounded-lg hover:bg-slate-200 disabled:opacity-40 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
