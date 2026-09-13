import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { OatcRecord } from "../../types";
import { formatDate, formatNumber } from "../../utils/formatters";

interface OatcOrdersTableProps {
  orders: OatcRecord[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    nextPage: () => void;
    prevPage: () => void;
  };
}

export const OatcOrdersTable: React.FC<OatcOrdersTableProps> = ({ orders, pagination }) => {
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left table-dense">
          <thead className="bg-slate-100/70 text-slate-600 font-semibold uppercase tracking-wider sticky top-0 z-10 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3"># OATC</th>
              <th className="px-4 py-3">Fecha & Hora</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Tipo de Servicio</th>
              <th className="px-4 py-3">Modalidad</th>
              <th className="px-4 py-3">Colaborador / Agente</th>
              <th className="px-4 py-3 text-center">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  No se encontraron órdenes OATC con los filtros aplicados.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-2.5 font-mono font-bold text-indigo-600">
                    #{o.numeroOatc}
                  </td>
                  <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">
                    {formatDate(o.fechaRegistro)} • <span className="font-mono text-slate-500">{o.hrRegistro}</span>
                  </td>
                  <td className="px-4 py-2.5 font-bold text-slate-800">
                    {o.clienteNombre}
                  </td>
                  <td className="px-4 py-2.5 font-medium text-slate-700">
                    {o.tipoOatc}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        o.tipoCliente.toLowerCase().includes("cita")
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {o.tipoCliente}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-semibold text-slate-800">
                    {o.agente}
                  </td>
                  <td className="px-4 py-2.5 text-center whitespace-nowrap">
                    {o.isCancelled ? (
                      <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-[10px] font-bold">
                        Cancelado
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold">
                        Completado
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/30">
        <span>
          Página {pagination.currentPage} de {pagination.totalPages} (
          {formatNumber(pagination.totalItems)} órdenes)
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
