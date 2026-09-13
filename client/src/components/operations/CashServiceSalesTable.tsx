import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CashServiceSaleRecord } from "../../types";
import { formatDate, formatCurrency, formatNumber } from "../../utils/formatters";

interface CashServiceSalesTableProps {
  cashSales: CashServiceSaleRecord[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    nextPage: () => void;
    prevPage: () => void;
  };
}

export const CashServiceSalesTable: React.FC<CashServiceSalesTableProps> = ({ cashSales, pagination }) => {
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left table-dense">
          <thead className="bg-slate-100/70 text-slate-600 font-semibold uppercase tracking-wider sticky top-0 z-10 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">Sede</th>
              <th className="px-4 py-3">Ticket / Boleta</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Colaborador</th>
              <th className="px-4 py-3">Servicio</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3 text-right">Efectivo</th>
              <th className="px-4 py-3 text-right">Tarjeta</th>
              <th className="px-4 py-3 text-right">Monto Final</th>
              <th className="px-4 py-3 text-right">Comisión</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cashSales.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-8 text-center text-slate-400">
                  No se encontraron cobros de caja con los filtros aplicados.
                </td>
              </tr>
            ) : (
              cashSales.map((cs) => (
                <tr key={cs.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        cs.sede?.includes("Luxury")
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : cs.sede?.includes("Gonzales")
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : cs.sede?.includes("Gloss")
                          ? "bg-pink-50 text-pink-700 border-pink-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}
                    >
                      {cs.sede || "Salón RD"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono font-bold text-indigo-600">
                    {cs.ticketId || cs.boleta || "-"}
                  </td>
                  <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">
                    {formatDate(cs.fecha)}
                  </td>
                  <td className="px-4 py-2.5 font-bold text-slate-800">
                    {cs.cliente}
                  </td>
                  <td className="px-4 py-2.5 font-semibold text-slate-800">
                    {cs.agente}
                  </td>
                  <td className="px-4 py-2.5 font-medium text-slate-700">
                    {cs.servicioFinal}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {cs.servicioSubCategoria || cs.servicioCategoria}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-slate-600">
                    {cs.montoEfectivo > 0 ? formatCurrency(cs.montoEfectivo) : "-"}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-slate-600">
                    {cs.montoTarjeta > 0 ? formatCurrency(cs.montoTarjeta) : "-"}
                  </td>
                  <td className="px-4 py-2.5 text-right font-extrabold text-slate-900">
                    {formatCurrency(cs.montoFinal)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-bold text-emerald-600">
                    {formatCurrency(cs.comision)}
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
          {formatNumber(pagination.totalItems)} cobros de caja)
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
