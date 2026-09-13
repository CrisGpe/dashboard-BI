import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  CheckCircle2,
  FileText,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download
} from "lucide-react";
import { SupplyDispatchRecord } from "../../types";

interface SuppliesAuditTableProps {
  dispatches: SupplyDispatchRecord[];
}

export const SuppliesAuditTable: React.FC<SuppliesAuditTableProps> = ({ dispatches }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("ALL");
  const [selectedTraceability, setSelectedTraceability] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Filter records
  const filteredRecords = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return dispatches.filter((rec) => {
      // 1. Text filter
      if (term) {
        const matchesText =
          rec.dependiente.toLowerCase().includes(term) ||
          rec.producto.toLowerCase().includes(term) ||
          rec.marca.toLowerCase().includes(term) ||
          (rec.ticket && rec.ticket.toLowerCase().includes(term)) ||
          (rec.oatcId && rec.oatcId.toLowerCase().includes(term)) ||
          (rec.clienteNombre && rec.clienteNombre.toLowerCase().includes(term)) ||
          (rec.dni && rec.dni.toLowerCase().includes(term));

        if (!matchesText) return false;
      }

      // 2. Year filter
      if (selectedYear !== "ALL" && rec.anio !== selectedYear) {
        return false;
      }

      // 3. Traceability filter
      if (selectedTraceability !== "ALL" && rec.trazabilidad !== selectedTraceability) {
        return false;
      }

      return true;
    });
  }, [dispatches, searchTerm, selectedYear, selectedTraceability]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + pageSize);

  // Export to CSV helper
  const handleExportCsv = () => {
    const headers = [
      "Fecha",
      "Hora",
      "Dependiente",
      "Producto",
      "Marca",
      "Tipo",
      "Cantidad",
      "Volumen",
      "Costo",
      "Trazabilidad",
      "OATC ID",
      "Ticket",
      "Cliente",
      "DNI"
    ];
    const rows = filteredRecords.map((r) => [
      r.fecha,
      r.hora || "",
      `"${r.dependiente}"`,
      `"${r.producto}"`,
      `"${r.marca}"`,
      `"${r.tipo}"`,
      r.cantidad,
      r.volumen || "",
      r.costo || "",
      r.trazabilidad,
      r.oatcId || "",
      r.ticket || "",
      `"${r.clienteNombre || ""}"`,
      r.dni || ""
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `auditoria_despachos_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-5">
      {/* Table Header & Interactive Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-violet-100 text-violet-700 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Auditoría & Exploración de Despachos de Insumos
              </h3>
              <p className="text-xs text-slate-500">
                Mostrando {filteredRecords.length.toLocaleString("es-PE")} registros (muestra de {dispatches.length.toLocaleString("es-PE")} registros recientes)
              </p>
            </div>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar insumo, estilista, ticket, OATC..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl w-60 sm:w-72 focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Year Filter */}
          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="ALL">Todos los Años</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>

          {/* Traceability Filter */}
          <select
            value={selectedTraceability}
            onChange={(e) => {
              setSelectedTraceability(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="ALL">Trazabilidad: Todas</option>
            <option value="CON_OATC">🟢 Con OATC Directa</option>
            <option value="CON_TICKET">🟡 Con Ticket / Cliente</option>
            <option value="USO_INTERNO">⚪ Consumo Interno</option>
          </select>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
            title="Descargar datos filtrados como CSV"
          >
            <Download className="w-3.5 h-3.5" />
            CSV
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px] bg-slate-50">
              <th className="py-3 px-3">Fecha & Hora</th>
              <th className="py-3 px-3">Colaborador / Solicitante</th>
              <th className="py-3 px-3">Insumo & Marca</th>
              <th className="py-3 px-3">Tipo / Cantidad</th>
              <th className="py-3 px-3 text-right">Costo (S/)</th>
              <th className="py-3 px-3">Trazabilidad</th>
              <th className="py-3 px-3">Ticket / Cliente</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedRecords.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  No se encontraron despachos que coincidan con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              paginatedRecords.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Fecha & Hora */}
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <div className="font-semibold text-slate-800">{item.fecha}</div>
                    <div className="text-[10px] text-slate-400">
                      {item.diaSemana || ""} {item.hora ? `• ${item.hora}` : ""}
                    </div>
                  </td>

                  {/* Colaborador */}
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <div className="font-medium text-slate-900">{item.dependiente}</div>
                  </td>

                  {/* Insumo & Marca */}
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-800 line-clamp-1" title={item.producto}>
                      {item.producto}
                    </div>
                    <span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                      {item.marca}
                    </span>
                  </td>

                  {/* Tipo & Cantidad */}
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <div className="text-slate-700">{item.tipo}</div>
                    <div className="text-[10px] text-slate-500">
                      Cant: {item.cantidad} {item.volumen ? `(${item.volumen})` : ""}
                    </div>
                  </td>

                  {/* Costo */}
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    {item.costo ? (
                      <span className="font-semibold text-emerald-700">
                        S/ {item.costo.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-slate-300 font-normal">-</span>
                    )}
                  </td>

                  {/* Trazabilidad Badge */}
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    {item.trazabilidad === "CON_OATC" && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        OATC #{item.oatcId}
                      </span>
                    )}
                    {item.trazabilidad === "CON_TICKET" && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        <FileText className="w-3 h-3" />
                        Tkt / Cliente
                      </span>
                    )}
                    {item.trazabilidad === "USO_INTERNO" && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                        <HelpCircle className="w-3 h-3" />
                        Uso Interno
                      </span>
                    )}
                  </td>

                  {/* Ticket / Cliente */}
                  <td className="py-2.5 px-3 text-slate-600">
                    {item.clienteNombre && (
                      <div className="font-medium text-slate-800 truncate max-w-[150px]" title={item.clienteNombre}>
                        {item.clienteNombre}
                      </div>
                    )}
                    <div className="text-[10px] text-slate-400">
                      {item.ticket ? `Tkt: ${item.ticket}` : ""}
                      {item.dni ? ` • DNI: ${item.dni}` : ""}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span>Filas por página:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-slate-200 rounded-lg px-2 py-1 bg-slate-50 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-slate-400 ml-2">
            Mostrando {startIndex + 1} - {Math.min(startIndex + pageSize, filteredRecords.length)} de {filteredRecords.length.toLocaleString("es-PE")}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={validCurrentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-slate-100 transition-colors"
            title="Primera página"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={validCurrentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-slate-100 transition-colors"
            title="Página anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 py-1 font-semibold text-slate-800">
            Página {validCurrentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={validCurrentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-slate-100 transition-colors"
            title="Página siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={validCurrentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-slate-100 transition-colors"
            title="Última página"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
