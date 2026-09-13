import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AttendanceRecord } from "../../types";
import { formatDate, formatNumber } from "../../utils/formatters";

interface AttendanceTableProps {
  attendance: AttendanceRecord[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    nextPage: () => void;
    prevPage: () => void;
  };
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({ attendance, pagination }) => {
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left table-dense">
          <thead className="bg-slate-100/70 text-slate-600 font-semibold uppercase tracking-wider sticky top-0 z-10 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Colaborador</th>
              <th className="px-4 py-3 text-center">Entrada</th>
              <th className="px-4 py-3 text-center">Refrigerio</th>
              <th className="px-4 py-3 text-center">Salida</th>
              <th className="px-4 py-3 text-center">Total Horas</th>
              <th className="px-4 py-3 text-center">Atenciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {attendance.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  No se encontraron registros de asistencia con los filtros aplicados.
                </td>
              </tr>
            ) : (
              attendance.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-slate-700 whitespace-nowrap">
                    {formatDate(a.fecha)}
                  </td>
                  <td className="px-4 py-2.5 font-bold text-slate-800">
                    {a.dependiente}
                  </td>
                  <td className="px-4 py-2.5 text-center font-mono font-medium text-emerald-600">
                    {a.entrada || "-"}
                  </td>
                  <td className="px-4 py-2.5 text-center font-mono text-slate-500">
                    {a.refI && a.refT ? `${a.refI} - ${a.refT}` : "-"}
                  </td>
                  <td className="px-4 py-2.5 text-center font-mono font-medium text-indigo-600">
                    {a.salida || "-"}
                  </td>
                  <td className="px-4 py-2.5 text-center font-bold text-slate-900">
                    {a.horasTrabajadas.toFixed(1)} hrs
                  </td>
                  <td className="px-4 py-2.5 text-center font-semibold text-slate-700">
                    {a.totalAtenciones}
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
          {formatNumber(pagination.totalItems)} jornadas)
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
