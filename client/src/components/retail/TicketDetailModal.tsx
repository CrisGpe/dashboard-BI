import React from "react";
import { X } from "lucide-react";
import { TicketRecord, TicketDetailRecord } from "../../types";
import { formatCurrency, formatDate } from "../../utils/formatters";

interface TicketDetailModalProps {
  ticket: TicketRecord | null;
  items: TicketDetailRecord[];
  onClose: () => void;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  ticket,
  items,
  onClose
}) => {
  if (!ticket) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Detalle del Ticket: {ticket.ticket}
            </h3>
            <p className="text-xs text-slate-500">
              {ticket.diaSemana ? `${ticket.diaSemana}, ` : ""}{formatDate(ticket.fecha)} • Asesor: {ticket.asesor}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-indigo-50/60 rounded-xl p-3 border border-indigo-100 text-xs">
            <div className="font-bold text-indigo-900">{ticket.clienteNombreLimpio}</div>
            {ticket.clienteDni && <div>DNI: {ticket.clienteDni}</div>}
            {ticket.clienteCelular && <div>Cel: {ticket.clienteCelular}</div>}
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Productos Comprados ({items.length})
            </h4>
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
              {items.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  Líneas del ticket no encontradas en Ventas_Detalle
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="p-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-800">{item.producto}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        SKU: {item.sku} • Cant: {item.cantidad} x {formatCurrency(item.precioUnitario)}
                      </div>
                    </div>
                    <div className="text-right font-extrabold text-slate-900">
                      {formatCurrency(item.subtotal)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-sm">
            <span className="font-bold text-slate-600">Total del Ticket:</span>
            <span className="font-extrabold text-lg text-indigo-600">
              {formatCurrency(ticket.total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
