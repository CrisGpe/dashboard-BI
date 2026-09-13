import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  MessageCircle,
  Search,
  Sparkles,
  ShoppingBag,
  Scissors,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Filter,
  DollarSign
} from "lucide-react";
import { UnifiedClient, SalonFilter } from "../../types";
import { formatCurrency, formatNumber, formatDate, getWhatsAppUrl } from "../../utils/formatters";
import { usePagination } from "../../hooks/usePagination";

interface ClientsLoyaltyViewProps {
  clients: UnifiedClient[];
  searchTerm: string;
  selectedSalon?: SalonFilter;
}

export const ClientsLoyaltyView: React.FC<ClientsLoyaltyViewProps> = ({
  clients,
  searchTerm,
  selectedSalon
}) => {
  const [localSearch, setLocalSearch] = useState("");
  const [filterMode, setFilterMode] = useState<"ALL" | "CROSS" | "SERVICES" | "RETAIL">("ALL");
  const [sedeFilter, setSedeFilter] = useState<string>("ALL");

  useEffect(() => {
    if (!selectedSalon || selectedSalon === "ALL") {
      setSedeFilter("ALL");
    } else if (selectedSalon === "RD") {
      setSedeFilter("Salón RD");
    } else if (selectedSalon === "LUXURY_RD") {
      setSedeFilter("Luxury RD");
    } else if (selectedSalon === "GONZALES_AM") {
      setSedeFilter("Gonzales AM");
    } else if (selectedSalon === "GLOSS_SALON") {
      setSedeFilter("Gloss Salon");
    }
  }, [selectedSalon]);

  const combinedSearch = searchTerm || localSearch;

  // Filter clients
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      if (sedeFilter !== "ALL" && c.sede !== sedeFilter) return false;
      if (filterMode === "CROSS" && !c.esCrossBuyer) return false;
      if (filterMode === "SERVICES" && c.totalServicios === 0) return false;
      if (filterMode === "RETAIL" && c.totalComprasRetail === 0) return false;

      if (combinedSearch) {
        const term = combinedSearch.toLowerCase();
        return (
          c.nombre.toLowerCase().includes(term) ||
          (c.dni && c.dni.includes(term)) ||
          (c.celular && c.celular.includes(term)) ||
          (c.email && c.email.toLowerCase().includes(term))
        );
      }
      return true;
    });
  }, [clients, sedeFilter, filterMode, combinedSearch]);

  const pagination = usePagination(filteredClients, 14);

  // Overall KPIs
  const clientKPIs = useMemo(() => {
    const total = clients.length;
    const crossBuyers = clients.filter((c) => c.esCrossBuyer).length;
    const withPhone = clients.filter((c) => Boolean(c.celular)).length;
    const vipClients = clients.filter((c) => c.montoTotalGastado >= 300).length;

    return {
      total,
      crossBuyers,
      crossPercent: total > 0 ? Math.round((crossBuyers / total) * 1000) / 10 : 0,
      withPhone,
      vipClients
    };
  }, [clients]);

  return (
    <div className="space-y-6">
      {/* Top Client KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Directorio Unificado</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-slate-900">
            {formatNumber(clientKPIs.total)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Clientes consolidados OATC + ERP
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Clientes Cross-Buyers</span>
            <div className="w-7 h-7 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-violet-700">
            {formatNumber(clientKPIs.crossBuyers)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {clientKPIs.crossPercent}% combinan salón + retail
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Contactables WhatsApp</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MessageCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-emerald-600">
            {formatNumber(clientKPIs.withPhone)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Con número de celular validado
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Clientes VIP (&ge; S/.300)</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-slate-900">
            {formatNumber(clientKPIs.vipClients)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Segmento de mayor valor de compra
          </p>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Controls */}
        <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex flex-wrap items-center gap-2">
            {/* Sede selector pills */}
            <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-xl">
              <button
                onClick={() => setSedeFilter("ALL")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  sedeFilter === "ALL"
                    ? "bg-white text-indigo-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setSedeFilter("Salón RD")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  sedeFilter === "Salón RD"
                    ? "bg-white text-indigo-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Salón RD
              </button>
              <button
                onClick={() => setSedeFilter("Luxury RD")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  sedeFilter === "Luxury RD"
                    ? "bg-white text-emerald-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Luxury RD
              </button>
              <button
                onClick={() => setSedeFilter("Gonzales AM")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  sedeFilter === "Gonzales AM"
                    ? "bg-white text-amber-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Gonzales AM
              </button>
              <button
                onClick={() => setSedeFilter("Gloss Salon")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  sedeFilter === "Gloss Salon"
                    ? "bg-white text-pink-600 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Gloss Salon
              </button>
            </div>

            {/* Filter chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                onClick={() => setFilterMode("ALL")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  filterMode === "ALL"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-200/60 border border-slate-200/80"
                }`}
              >
                Todos ({formatNumber(clients.length)})
              </button>
              <button
                onClick={() => setFilterMode("CROSS")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                  filterMode === "CROSS"
                    ? "bg-violet-600 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-200/60 border border-slate-200/80"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Cross-Buyers ({clientKPIs.crossBuyers})</span>
              </button>
              <button
                onClick={() => setFilterMode("SERVICES")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  filterMode === "SERVICES"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-200/60 border border-slate-200/80"
                }`}
              >
                Con Servicios Salón
              </button>
              <button
                onClick={() => setFilterMode("RETAIL")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  filterMode === "RETAIL"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-200/60 border border-slate-200/80"
                }`}
              >
                Con Compras Retail
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Buscar cliente, DNI, celular..."
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left table-dense">
            <thead className="bg-slate-100/70 text-slate-600 font-semibold uppercase tracking-wider sticky top-0 z-10 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Documento / Contacto</th>
                <th className="px-4 py-3 text-center">Servicios Salón</th>
                <th className="px-4 py-3 text-center">Compras Retail</th>
                <th className="px-4 py-3 text-right">Monto Gastado</th>
                <th className="px-4 py-3">Última Visita</th>
                <th className="px-4 py-3 text-center">Perfil</th>
                <th className="px-4 py-3 text-center">WhatsApp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pagination.paginatedItems.map((c) => {
                const waUrl = getWhatsAppUrl(c.celular, c.nombre);
                return (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-2.5 font-bold text-slate-800">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span>{c.nombre}</span>
                        {c.sede && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              c.sede === "Luxury RD"
                                ? "bg-purple-100 text-purple-700"
                                : c.sede === "Gloss Salon"
                                ? "bg-pink-100 text-pink-700"
                                : "bg-indigo-50 text-indigo-700"
                            }`}
                          >
                            {c.sede}
                          </span>
                        )}
                      </div>
                      {c.email && (
                        <div className="text-[10px] text-slate-400 font-normal truncate max-w-[200px]">
                          {c.email}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-slate-600 font-mono text-[11px]">
                      {c.dni && <div>DNI: {c.dni}</div>}
                      {c.celular && <div className="text-slate-500">Cel: {c.celular}</div>}
                      {c.cumpleanos && (
                        <div className="text-amber-600 text-[10px] font-sans font-medium">🎂 {c.cumpleanos}</div>
                      )}
                      {!c.dni && !c.celular && !c.cumpleanos && <span className="text-slate-400">-</span>}
                    </td>
                    <td className="px-4 py-2.5 text-center font-semibold text-slate-700">
                      {c.totalServicios}
                    </td>
                    <td className="px-4 py-2.5 text-center font-semibold text-slate-700">
                      {c.totalComprasRetail}
                    </td>
                    <td className="px-4 py-2.5 text-right font-extrabold text-slate-900">
                      {formatCurrency(c.montoTotalGastado)}
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">
                      {formatDate(c.ultimaVisita)}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {c.esCrossBuyer ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-50 text-violet-700 flex items-center justify-center gap-1">
                          <Sparkles className="w-3 h-3" /> Cross-Buyer
                        </span>
                      ) : c.totalServicios > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                          Solo Salón
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700">
                          Solo Retail
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {waUrl ? (
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] transition-colors shadow-xs"
                          title="Contactar por WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Chat</span>
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/30">
          <span>
            Página {pagination.currentPage} de {pagination.totalPages} (
            {formatNumber(pagination.totalItems)} clientes)
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={pagination.prevPage}
              disabled={pagination.currentPage === 1}
              className="p-1 rounded-lg hover:bg-slate-200 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={pagination.nextPage}
              disabled={pagination.currentPage === pagination.totalPages}
              className="p-1 rounded-lg hover:bg-slate-200 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
