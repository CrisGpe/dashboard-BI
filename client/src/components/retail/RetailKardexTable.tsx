import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { KardexRecord } from "../../types";
import { formatCurrency, formatDate, formatNumber } from "../../utils/formatters";

interface RetailKardexTableProps {
  kardex: KardexRecord[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    nextPage: () => void;
    prevPage: () => void;
  };
}

export const RetailKardexTable: React.FC<RetailKardexTableProps> = ({
  kardex,
  pagination
}) => {
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left table-dense">
          <thead className="bg-slate-100/70 text-slate-600 font-semibold uppercase tracking-wider sticky top-0 z-10 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">ID Movimiento</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Tipo Movimiento</th>
              <th className="px-4 py-3">SKU & Descripción</th>
              <th className="px-4 py-3 text-center">Cantidad</th>
              <th className="px-4 py-3">Origen ➔ Destino</th>
              <th className="px-4 py-3">Doc Ref</th>
              <th className="px-4 py-3 text-right">Costo Unitario</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {kardex.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                  No se encontraron movimientos de kardex con los filtros aplicados.
                </td>
              </tr>
            ) : (
              kardex.map((k, idx) => (
                <tr key={`${k.idMovimiento}-${idx}`} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-2.5 font-mono text-slate-600 font-bold whitespace-nowrap">
                    {k.idMovimiento}
                  </td>
                  <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">
                    {formatDate(k.fechaHora)}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        k.tipoMovimiento === "VENTA"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : k.tipoMovimiento.includes("FACTURA")
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {k.tipoMovimiento}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-medium text-slate-800">
                    <div>{k.descripcion}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{k.sku}</div>
                  </td>
                  <td className="px-4 py-2.5 text-center font-bold text-slate-900">
                    {k.cantidad}
                  </td>
                  <td className="px-4 py-2.5 text-slate-600 text-[11px]">
                    {k.origen} ➔ {k.destino}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-slate-600 text-[11px]">
                    {k.documentoRef || "-"}
                  </td>
                  <td className="px-4 py-2.5 text-right font-medium text-slate-700 whitespace-nowrap">
                    {k.costoUnitario > 0 ? formatCurrency(k.costoUnitario) : "-"}
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
          {formatNumber(pagination.totalItems)} movimientos)
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
