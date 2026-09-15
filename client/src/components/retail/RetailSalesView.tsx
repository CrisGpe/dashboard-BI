import React, { useState, useMemo } from "react";
import {
  ShoppingBag,
  FileText,
  Search,
  Award,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Store
} from "lucide-react";
import {
  TicketRecord,
  TicketDetailRecord,
  MultiSalonRetailProduct,
  BrandPortfolioMetric,
  SalonFilter
} from "../../types";
import { formatCurrency, formatNumber } from "../../utils/formatters";
import { usePagination } from "../../hooks/usePagination";
import { RetailKpis } from "./RetailKpis";
import { RetailTicketsTable } from "./RetailTicketsTable";
import { TicketDetailModal } from "./TicketDetailModal";

interface RetailSalesViewProps {
  tickets: TicketRecord[];
  ticketDetails: TicketDetailRecord[];
  multiSalonRetailProducts: MultiSalonRetailProduct[];
  brandMetrics?: BrandPortfolioMetric[];
  searchTerm: string;
  selectedSalon?: SalonFilter;
  onSelectSalon?: (salon: SalonFilter) => void;
}

export const RetailSalesView: React.FC<RetailSalesViewProps> = ({
  tickets,
  ticketDetails,
  multiSalonRetailProducts,
  brandMetrics = [],
  searchTerm,
  selectedSalon = "ALL",
  onSelectSalon
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"tickets" | "products" | "brands">("tickets");
  const [localSearch, setLocalSearch] = useState("");
  const [sedeFilter, setSedeFilter] = useState<string>("ALL");
  const [selectedTicketForModal, setSelectedTicketForModal] = useState<TicketRecord | null>(null);

  const combinedSearch = searchTerm || localSearch;

  // Filter Tickets by Sede & Text Search
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (sedeFilter !== "ALL") {
        const ticketSede = t.sede || "Salón RD";
        if (ticketSede !== sedeFilter) return false;
      }
      if (combinedSearch) {
        const term = combinedSearch.toLowerCase();
        return (
          t.ticket.toLowerCase().includes(term) ||
          t.clienteNombreLimpio.toLowerCase().includes(term) ||
          t.asesor.toLowerCase().includes(term) ||
          t.metodoPago.toLowerCase().includes(term) ||
          (t.sede && t.sede.toLowerCase().includes(term)) ||
          (t.item && t.item.toLowerCase().includes(term))
        );
      }
      return true;
    });
  }, [tickets, sedeFilter, combinedSearch]);

  // Filter Products by Search
  const filteredProducts = useMemo(() => {
    if (!combinedSearch) return multiSalonRetailProducts;
    const term = combinedSearch.toLowerCase();
    return multiSalonRetailProducts.filter(
      (p) =>
        p.producto.toLowerCase().includes(term) ||
        p.marca.toLowerCase().includes(term) ||
        p.sedes.some((s) => s.toLowerCase().includes(term))
    );
  }, [multiSalonRetailProducts, combinedSearch]);

  // Brand Breakdown computed across all retail tickets
  const brandBreakdown = useMemo(() => {
    const map = new Map<string, { marca: string; totalIngreso: number; totalUnidades: number; prods: Set<string>; sedes: Set<string> }>();
    multiSalonRetailProducts.forEach((p) => {
      const b = p.marca || "OTRAS MARCAS";
      const existing = map.get(b) || { marca: b, totalIngreso: 0, totalUnidades: 0, prods: new Set(), sedes: new Set() };
      existing.totalIngreso += p.ingresoTotal;
      existing.totalUnidades += p.unidades;
      existing.prods.add(p.producto);
      p.sedes.forEach((s) => existing.sedes.add(s));
      map.set(b, existing);
    });

    return Array.from(map.values())
      .map((b) => ({
        marca: b.marca,
        totalIngreso: Math.round(b.totalIngreso * 100) / 100,
        totalUnidades: b.totalUnidades,
        productosCount: b.prods.size,
        sedes: Array.from(b.sedes)
      }))
      .sort((a, b) => b.totalIngreso - a.totalIngreso);
  }, [multiSalonRetailProducts]);

  // Per-Salon Metrics Summary
  const salonSummary = useMemo(() => {
    const sedes = ["Salón RD", "Gloss Salon", "Gonzales AM", "Luxury RD"];
    const totalGlobal = tickets.reduce((acc, t) => acc + (t.estado !== "ANULADO" ? t.total : 0), 0);

    return sedes.map((s) => {
      const sTickets = tickets.filter((t) => (t.sede || "Salón RD") === s && t.estado !== "ANULADO");
      const facturacion = sTickets.reduce((acc, t) => acc + t.total, 0);
      const count = sTickets.length;
      const share = totalGlobal > 0 ? (facturacion / totalGlobal) * 100 : 0;
      return {
        sede: s,
        facturacion,
        count,
        share: Math.round(share * 10) / 10
      };
    });
  }, [tickets]);

  // Global KPIs
  const stats = useMemo(() => {
    const validTickets = tickets.filter((t) => t.estado !== "ANULADO");
    const totalFacturacion = validTickets.reduce((acc, t) => acc + t.total, 0);
    const totalUnidades = ticketDetails.reduce((acc, td) => acc + td.cantidad, 0);
    const totalTickets = validTickets.length;
    const ticketPromedio = totalTickets > 0 ? Math.round((totalFacturacion / totalTickets) * 100) / 100 : 0;
    const uniqueBrands = new Set(multiSalonRetailProducts.map((p) => p.marca).filter(Boolean));

    return {
      totalFacturacion,
      totalTickets,
      totalUnidades,
      ticketPromedio,
      totalMarcas: uniqueBrands.size,
      totalProductos: multiSalonRetailProducts.length
    };
  }, [tickets, ticketDetails, multiSalonRetailProducts]);

  // Ticket modal details
  const selectedTicketItems = useMemo(() => {
    if (!selectedTicketForModal) return [];
    return ticketDetails.filter((td) => td.ticket === selectedTicketForModal.ticket);
  }, [selectedTicketForModal, ticketDetails]);

  const ticketsPagination = usePagination(filteredTickets, 15);
  const productsPagination = usePagination(filteredProducts, 15);

  const getSedeColor = (sede: string) => {
    switch (sede) {
      case "Salón RD":
        return { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", bar: "bg-indigo-500" };
      case "Gloss Salon":
        return { bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-200", bar: "bg-pink-500" };
      case "Gonzales AM":
        return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", bar: "bg-emerald-500" };
      case "Luxury RD":
        return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", bar: "bg-amber-500" };
      default:
        return { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200", bar: "bg-slate-500" };
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Top Commercial Stats */}
      <RetailKpis
        totalFacturacion={stats.totalFacturacion}
        totalTickets={stats.totalTickets}
        totalUnidades={stats.totalUnidades}
        ticketPromedio={stats.ticketPromedio}
        totalMarcas={stats.totalMarcas}
        totalProductos={stats.totalProductos}
      />

      {/* 2. Sede Contribution Breakdown Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 tracking-tight">
                Ventas Retail por Salón (4 Sedes)
              </h3>
              <p className="text-[11px] text-slate-500">
                Consolidación de ventas de productos para llevar en mostrador
              </p>
            </div>
          </div>
          <div className="text-xs font-semibold text-slate-600">
            Total Multi-Sede: <span className="font-extrabold text-indigo-600">{formatCurrency(stats.totalFacturacion)}</span>
          </div>
        </div>

        {/* Contribution Bar */}
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex mb-4">
          {salonSummary.map((s) => {
            const colors = getSedeColor(s.sede);
            if (s.share <= 0) return null;
            return (
              <div
                key={s.sede}
                style={{ width: `${s.share}%` }}
                className={`${colors.bar} transition-all duration-500`}
                title={`${s.sede}: ${formatCurrency(s.facturacion)} (${s.share}%)`}
              />
            );
          })}
        </div>

        {/* 4 Salon Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {salonSummary.map((s) => {
            const colors = getSedeColor(s.sede);
            const isFilterActive = sedeFilter === s.sede;
            return (
              <div
                key={s.sede}
                onClick={() => setSedeFilter(isFilterActive ? "ALL" : s.sede)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isFilterActive
                    ? `${colors.bg} ${colors.border} ring-2 ring-indigo-500/20 shadow-xs`
                    : "bg-slate-50/70 border-slate-200/70 hover:bg-slate-100/80"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${colors.bg} ${colors.text} ${colors.border}`}>
                    {s.sede}
                  </span>
                  <span className="text-[11px] font-extrabold text-slate-700">{s.share}%</span>
                </div>
                <div className="text-base font-black text-slate-900">
                  {formatCurrency(s.facturacion)}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {formatNumber(s.count)} tickets {isFilterActive && "• (Filtro Activo)"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Main Navigation Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* SubTabs Header */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveSubTab("tickets")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === "tickets"
                  ? "bg-indigo-600 text-white shadow-2xs"
                  : "text-slate-600 hover:bg-slate-200/60 cursor-pointer"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Tickets Multi-Sede ({formatNumber(filteredTickets.length)})</span>
            </button>

            <button
              onClick={() => setActiveSubTab("products")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === "products"
                  ? "bg-indigo-600 text-white shadow-2xs"
                  : "text-slate-600 hover:bg-slate-200/60 cursor-pointer"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Ranking de Productos ({formatNumber(filteredProducts.length)})</span>
            </button>

            <button
              onClick={() => setActiveSubTab("brands")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === "brands"
                  ? "bg-indigo-600 text-white shadow-2xs"
                  : "text-slate-600 hover:bg-slate-200/60 cursor-pointer"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Portafolio de Marcas ({brandBreakdown.length})</span>
            </button>
          </div>

          {/* Filters & Search */}
          <div className="flex items-center gap-2">
            {activeSubTab === "tickets" && (
              <select
                value={sedeFilter}
                onChange={(e) => setSedeFilter(e.target.value)}
                className="text-xs font-medium px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none"
              >
                <option value="ALL">Todas las Sedes</option>
                <option value="Salón RD">Salón RD</option>
                <option value="Gloss Salon">Gloss Salon</option>
                <option value="Gonzales AM">Gonzales AM</option>
                <option value="Luxury RD">Luxury RD</option>
              </select>
            )}

            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Buscar ticket, cliente, producto..."
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
        </div>

        {/* SubTab 1: Tickets Table */}
        {activeSubTab === "tickets" && (
          <RetailTicketsTable
            tickets={ticketsPagination.paginatedItems}
            onSelectTicket={setSelectedTicketForModal}
            pagination={ticketsPagination}
          />
        )}

        {/* SubTab 2: Products Multi-Salon Table */}
        {activeSubTab === "products" && (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left table-dense">
                <thead className="bg-slate-100/70 text-slate-600 font-semibold uppercase tracking-wider sticky top-0 z-10 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Producto / Presentación</th>
                    <th className="px-4 py-3">Marca</th>
                    <th className="px-4 py-3">Sedes con Venta</th>
                    <th className="px-4 py-3 text-right">Unidades</th>
                    <th className="px-4 py-3 text-right">Precio Prom.</th>
                    <th className="px-4 py-3 text-right">Ingreso Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {productsPagination.paginatedItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                        No se encontraron productos para los criterios de búsqueda.
                      </td>
                    </tr>
                  ) : (
                    productsPagination.paginatedItems.map((p, idx) => {
                      const rank = (productsPagination.currentPage - 1) * 15 + idx + 1;
                      return (
                        <tr key={p.producto} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-2.5 font-bold font-mono text-slate-400">
                            {rank <= 3 ? (
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-black">
                                {rank}
                              </span>
                            ) : (
                              rank
                            )}
                          </td>
                          <td className="px-4 py-2.5 font-semibold text-slate-800">
                            {p.producto}
                          </td>
                          <td className="px-4 py-2.5">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {p.marca}
                            </span>
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex flex-wrap gap-1">
                              {p.sedes.map((s) => {
                                const col = getSedeColor(s);
                                return (
                                  <span
                                    key={s}
                                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${col.bg} ${col.text} ${col.border}`}
                                  >
                                    {s}
                                  </span>
                                );
                              })}
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-right font-bold text-slate-700">
                            {formatNumber(p.unidades)}
                          </td>
                          <td className="px-4 py-2.5 text-right text-slate-600">
                            {formatCurrency(p.precioPromedio)}
                          </td>
                          <td className="px-4 py-2.5 text-right font-extrabold text-slate-900">
                            {formatCurrency(p.ingresoTotal)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/30">
              <span>
                Página {productsPagination.currentPage} de {productsPagination.totalPages} (
                {formatNumber(productsPagination.totalItems)} productos)
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={productsPagination.prevPage}
                  disabled={productsPagination.currentPage === 1}
                  className="p-1 rounded-lg hover:bg-slate-200 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={productsPagination.nextPage}
                  disabled={productsPagination.currentPage === productsPagination.totalPages}
                  className="p-1 rounded-lg hover:bg-slate-200 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SubTab 3: Brands Breakdown */}
        {activeSubTab === "brands" && (
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {brandBreakdown.map((b) => (
                <div
                  key={b.marca}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-xs transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      {b.marca}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {b.productosCount} SKUs
                    </span>
                  </div>
                  <div className="text-lg font-black text-slate-900">
                    {formatCurrency(b.totalIngreso)}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                    <span>{formatNumber(b.totalUnidades)} unid. vendidas</span>
                    <div className="flex gap-1">
                      {b.sedes.map((s) => (
                        <span key={s} className="text-[9px] px-1 rounded bg-slate-200 text-slate-700 font-semibold">
                          {s.replace(" Salón", "").replace(" RD", "")}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Ticket Details Modal */}
      <TicketDetailModal
        ticket={selectedTicketForModal}
        items={selectedTicketItems}
        onClose={() => setSelectedTicketForModal(null)}
      />
    </div>
  );
};
