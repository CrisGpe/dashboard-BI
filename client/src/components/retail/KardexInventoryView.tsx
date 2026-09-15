import React, { useState, useMemo } from "react";
import { Layers, ArrowDownLeft, ArrowUpRight, Search, Package, Warehouse } from "lucide-react";
import { KardexRecord, SalonFilter } from "../../types";
import { formatNumber } from "../../utils/formatters";
import { usePagination } from "../../hooks/usePagination";
import { RetailKardexTable } from "./RetailKardexTable";

interface KardexInventoryViewProps {
  kardex: KardexRecord[];
  searchTerm: string;
  selectedSalon?: SalonFilter;
}

export const KardexInventoryView: React.FC<KardexInventoryViewProps> = ({
  kardex,
  searchTerm,
  selectedSalon = "ALL"
}) => {
  const [localSearch, setLocalSearch] = useState("");
  const [selectedKardexType, setSelectedKardexType] = useState<string>("ALL");

  const combinedSearch = searchTerm || localSearch;

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

  // Kardex KPIs
  const stats = useMemo(() => {
    const totalMovimientos = kardex.length;
    const uniqueSkus = new Set(kardex.map((k) => k.sku)).size;
    const entradas = kardex.filter((k) => k.tipoMovimiento.toUpperCase().includes("ENTRADA")).length;
    const salidas = kardex.filter((k) => k.tipoMovimiento.toUpperCase().includes("SALIDA")).length;

    return {
      totalMovimientos,
      uniqueSkus,
      entradas,
      salidas
    };
  }, [kardex]);

  const pagination = usePagination(filteredKardex, 15);

  return (
    <div className="space-y-6">
      {/* Central Warehouse Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-sm border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/30">
            <Warehouse className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black tracking-tight text-white">
                Kardex de Inventario & Almacén Central
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                Sede Central: Salón RD
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Registro legal de entradas y salidas físicas de almacén, compras a proveedores y traslados de mercadería. El control físico centralizado se custodia en la sede Salón RD.
            </p>
          </div>
        </div>
        <div className="text-right whitespace-nowrap bg-white/10 px-3 py-2 rounded-xl border border-white/10">
          <div className="text-[10px] uppercase tracking-wider text-slate-300 font-bold">Total Movimientos</div>
          <div className="text-lg font-black text-white">{formatNumber(stats.totalMovimientos)}</div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Movimientos Totales</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-slate-900">
            {formatNumber(stats.totalMovimientos)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Asientos de kardex registrados
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">SKUs Controlados</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-slate-900">
            {formatNumber(stats.uniqueSkus)} SKUs
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Artículos con historial de stock
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Entradas (Compras/Ingreso)</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-emerald-600">
            {formatNumber(stats.entradas)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Ingresos a depósito central
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Salidas (Venta/Despacho)</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-rose-600">
            {formatNumber(stats.salidas)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Salidas de mostrador o consumo
          </p>
        </div>
      </div>

      {/* Main Kardex Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* Table Filters Header */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-700">
              Movimientos de Kardex ({formatNumber(filteredKardex.length)})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedKardexType}
              onChange={(e) => setSelectedKardexType(e.target.value)}
              className="text-xs font-medium px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none"
            >
              <option value="ALL">Todos los Tipos de Movimiento</option>
              {kardexTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Buscar SKU, descripción, doc..."
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
        </div>

        {/* Kardex Table */}
        <RetailKardexTable
          kardex={pagination.paginatedItems}
          pagination={pagination}
        />
      </div>
    </div>
  );
};
