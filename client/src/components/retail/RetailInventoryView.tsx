import React, { useState, useMemo } from "react";
import { ShoppingBag, Layers, Search, FileText } from "lucide-react";
import {
  TicketRecord,
  TicketDetailRecord,
  KardexRecord,
  ProductCatalogRanking,
  BrandPortfolioMetric
} from "../../types";
import { formatNumber } from "../../utils/formatters";
import { usePagination } from "../../hooks/usePagination";
import { RetailKpis } from "./RetailKpis";
import { RetailTicketsTable } from "./RetailTicketsTable";
import { RetailProductsRanking } from "./RetailProductsRanking";
import { RetailKardexTable } from "./RetailKardexTable";
import { TicketDetailModal } from "./TicketDetailModal";
import { DataAvailabilityNotice } from "../common/DataAvailabilityNotice";
import { SalonFilter, SALONES_CONFIG } from "../../types";

interface RetailInventoryViewProps {
  tickets: TicketRecord[];
  ticketDetails: TicketDetailRecord[];
  kardex: KardexRecord[];
  productRankings: ProductCatalogRanking[];
  brandMetrics?: BrandPortfolioMetric[];
  searchTerm: string;
  selectedSalon?: SalonFilter;
}

export const RetailInventoryView: React.FC<RetailInventoryViewProps> = ({
  tickets,
  ticketDetails,
  kardex,
  productRankings,
  brandMetrics,
  searchTerm,
  selectedSalon = "ALL"
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"tickets" | "products" | "kardex">("tickets");
  const [localSearch, setLocalSearch] = useState("");
  const [selectedKardexType, setSelectedKardexType] = useState<string>("ALL");
  const [selectedTicketForModal, setSelectedTicketForModal] = useState<TicketRecord | null>(null);

  const combinedSearch = searchTerm || localSearch;

  // Filter Tickets
  const filteredTickets = useMemo(() => {
    if (!combinedSearch) return tickets;
    const term = combinedSearch.toLowerCase();
    return tickets.filter(
      (t) =>
        t.ticket.toLowerCase().includes(term) ||
        t.clienteNombreLimpio.toLowerCase().includes(term) ||
        t.asesor.toLowerCase().includes(term) ||
        t.metodoPago.toLowerCase().includes(term)
    );
  }, [tickets, combinedSearch]);

  // Filter Products by SKU, Name, Brand, Line
  const filteredProducts = useMemo(() => {
    if (!combinedSearch) return productRankings;
    const term = combinedSearch.toLowerCase();
    return productRankings.filter(
      (p) =>
        p.producto.toLowerCase().includes(term) ||
        p.sku.toLowerCase().includes(term) ||
        (p.marca && p.marca.toLowerCase().includes(term)) ||
        (p.linea && p.linea.toLowerCase().includes(term))
    );
  }, [productRankings, combinedSearch]);

  // Distinct Kardex Types
  const kardexTypes = useMemo(() => {
    const set = new Set(kardex.map((k) => k.tipoMovimiento).filter(Boolean));
    return Array.from(set).sort();
  }, [kardex]);

  // Filter Kardex
  const filteredKardex = useMemo(() => {
    return kardex.filter((k) => {
      if (selectedKardexType !== "ALL" && k.tipoMovimiento !== selectedKardexType) {
        return false;
      }
      if (combinedSearch) {
        const term = combinedSearch.toLowerCase();
        return (
          k.idMovimiento.toLowerCase().includes(term) ||
          k.sku.toLowerCase().includes(term) ||
          k.descripcion.toLowerCase().includes(term) ||
          (k.documentoRef && k.documentoRef.toLowerCase().includes(term))
        );
      }
      return true;
    });
  }, [kardex, selectedKardexType, combinedSearch]);

  // Group ticket details for selected ticket modal
  const selectedTicketItems = useMemo(() => {
    if (!selectedTicketForModal) return [];
    return ticketDetails.filter((td) => td.ticket === selectedTicketForModal.ticket);
  }, [selectedTicketForModal, ticketDetails]);

  // Commercial Summary Stats (100% Real Numbers, Zero False Margins)
  const stats = useMemo(() => {
    const validTickets = tickets.filter((t) => t.estado !== "ANULADO");
    const totalFacturacion = validTickets.reduce((acc, t) => acc + t.total, 0);
    const totalUnidades = ticketDetails.reduce((acc, td) => acc + td.cantidad, 0);
    const totalTickets = validTickets.length;
    const ticketPromedio = totalTickets > 0 ? Math.round((totalFacturacion / totalTickets) * 100) / 100 : 0;
    const uniqueBrands = new Set(productRankings.map((p) => p.marca).filter(Boolean));

    return {
      totalFacturacion,
      totalTickets,
      totalUnidades,
      ticketPromedio,
      totalMarcas: uniqueBrands.size,
      totalProductos: productRankings.length
    };
  }, [tickets, ticketDetails, productRankings]);

  const ticketsPagination = usePagination(filteredTickets, 15);
  const kardexPagination = usePagination(filteredKardex, 15);

  return (
    <div className="space-y-6">
      {/* Centralized Kardex notice for non-RD salons */}
      {selectedSalon !== "ALL" && selectedSalon !== "RD" && (
        <DataAvailabilityNotice
          tipo="CENTRALIZADO"
          modulo="Kardex de Inventario & Almacén Central"
          salonNombre={SALONES_CONFIG[selectedSalon].nombre}
          titulo="Control Físico y Kardex de Inventario Centralizado en Salón RD"
          mensaje={`El control de entradas/salidas de inventario (Kardex) y compras mayoristas a proveedores se administran centralizadamente en el ERP de Salón RD. Las ventas de productos para llevar generadas en ${SALONES_CONFIG[selectedSalon].nombre} se despachan desde el almacén central y se contabilizan en los comprobantes de la sede.`}
          accionSugerida="Para consultar el catálogo global de movimientos de stock y compras, seleccione 'Salón RD' o 'Todos los Salones'."
        />
      )}

      {/* Top Commercial Stats Cards */}
      <RetailKpis
        totalFacturacion={stats.totalFacturacion}
        totalTickets={stats.totalTickets}
        totalUnidades={stats.totalUnidades}
        ticketPromedio={stats.ticketPromedio}
        totalMarcas={stats.totalMarcas}
        totalProductos={stats.totalProductos}
      />

      {/* Main Content Container with Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* SubTab Navigation */}
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
              <span>Tickets de Venta ({formatNumber(filteredTickets.length)})</span>
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
              <span>Comportamiento del Portafolio & Catálogo ({formatNumber(filteredProducts.length)})</span>
            </button>
            <button
              onClick={() => setActiveSubTab("kardex")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === "kardex"
                  ? "bg-indigo-600 text-white shadow-2xs"
                  : "text-slate-600 hover:bg-slate-200/60 cursor-pointer"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Control de Kardex ({formatNumber(filteredKardex.length)})</span>
            </button>
          </div>

          {/* Search or Kardex filter */}
          <div className="flex items-center gap-2">
            {activeSubTab === "kardex" && (
              <select
                value={selectedKardexType}
                onChange={(e) => setSelectedKardexType(e.target.value)}
                className="text-xs font-medium px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none"
              >
                <option value="ALL">Todos los Movimientos</option>
                {kardexTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            )}

            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Buscar cliente, ticket, SKU..."
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

        {/* SubTab 2: Products Ranking (Marca, Línea, Producto) */}
        {activeSubTab === "products" && (
          <RetailProductsRanking
            products={filteredProducts}
            brandMetrics={brandMetrics}
            searchTerm={combinedSearch}
          />
        )}

        {/* SubTab 3: Kardex Ledger */}
        {activeSubTab === "kardex" && (
          <RetailKardexTable
            kardex={kardexPagination.paginatedItems}
            pagination={kardexPagination}
          />
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
