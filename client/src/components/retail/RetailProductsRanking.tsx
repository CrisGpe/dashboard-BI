import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpDown,
  Clock,
  Zap,
  Award,
  Layers,
  Search,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Calendar
} from "lucide-react";
import { ProductCatalogRanking, BrandPortfolioMetric } from "../../types";
import { formatCurrency, formatNumber } from "../../utils/formatters";
import { usePagination } from "../../hooks/usePagination";
import { PortfolioBehaviorCharts } from "./PortfolioBehaviorCharts";

interface RetailProductsRankingProps {
  products: ProductCatalogRanking[];
  brandMetrics?: BrandPortfolioMetric[];
  searchTerm?: string;
}

const getBrandBadgeClass = (marca: string) => {
  const m = marca.toLowerCase();
  if (m.includes("kerastase")) return "bg-purple-50 text-purple-700 border-purple-200";
  if (m.includes("loreal")) return "bg-blue-50 text-blue-700 border-blue-200";
  if (m.includes("wella")) return "bg-rose-50 text-rose-700 border-rose-200";
  if (m.includes("baor")) return "bg-amber-50 text-amber-800 border-amber-200";
  if (m.includes("opi")) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (m.includes("redken")) return "bg-slate-100 text-slate-800 border-slate-300";
  if (m.includes("revlon")) return "bg-red-50 text-red-700 border-red-200";
  if (m.includes("alfaparf")) return "bg-cyan-50 text-cyan-700 border-cyan-200";
  return "bg-slate-100/70 text-slate-700 border-slate-200";
};

export const RetailProductsRanking: React.FC<RetailProductsRankingProps> = ({
  products,
  brandMetrics = [],
  searchTerm = ""
}) => {
  const [selectedBrand, setSelectedBrand] = useState<string>("ALL");
  const [selectedLine, setSelectedLine] = useState<string>("ALL");
  const [selectedAbc, setSelectedAbc] = useState<string>("ALL");
  const [selectedFranja, setSelectedFranja] = useState<string>("ALL");
  const [selectedDia, setSelectedDia] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"unidades" | "velocidad" | "penetracion" | "facturacion">("unidades");
  const [localFilter, setLocalFilter] = useState<string>("");

  // Portfolio Health Metrics
  const portfolioStats = useMemo(() => {
    const totalUnits = products.reduce((acc, p) => acc + p.unidadesVendidas, 0);
    const classA = products.filter((p) => p.clasificacionABC === "A").length;
    const classB = products.filter((p) => p.clasificacionABC === "B").length;
    const classC = products.filter((p) => p.clasificacionABC === "C").length;
    const avgVelocity =
      products.length > 0
        ? Math.round(
            (products.reduce((acc, p) => acc + (p.rotacionVelocidadDiaria || 0), 0) / products.length) * 100
          ) / 100
        : 0;

    // Peak global hour
    const hourCounts = new Array(24).fill(0);
    products.forEach((p) => {
      if (p.ventasPorHora) {
        p.ventasPorHora.forEach((cnt, h) => {
          hourCounts[h] += cnt;
        });
      }
    });
    let peakH = 19;
    let maxH = -1;
    hourCounts.forEach((cnt, h) => {
      if (cnt > maxH) {
        maxH = cnt;
        peakH = h;
      }
    });

    // Peak global day
    const dayCounts: Record<string, number> = {};
    products.forEach((p) => {
      if (p.ventasPorDia) {
        p.ventasPorDia.forEach((item) => {
          dayCounts[item.dia] = (dayCounts[item.dia] || 0) + item.unidades;
        });
      }
    });
    let peakDay = "Sábado";
    let maxDayUnits = -1;
    Object.entries(dayCounts).forEach(([d, cnt]) => {
      if (cnt > maxDayUnits) {
        maxDayUnits = cnt;
        peakDay = d;
      }
    });

    return {
      totalUnits,
      classA,
      classB,
      classC,
      avgVelocity,
      peakH,
      peakHUnits: maxH,
      peakDay,
      peakDayUnits: maxDayUnits
    };
  }, [products]);

  // Unique brands list with total volume
  const brandsList = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => {
      const b = p.marca || "Sin Marca";
      map.set(b, (map.get(b) || 0) + p.unidadesVendidas);
    });
    return Array.from(map.entries())
      .map(([brand, totalUnits]) => ({ brand, totalUnits }))
      .sort((a, b) => b.totalUnits - a.totalUnits);
  }, [products]);

  // Lines available for selected brand
  const linesList = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (selectedBrand === "ALL" || p.marca === selectedBrand) {
        if (p.linea) set.add(p.linea);
      }
    });
    return Array.from(set).sort();
  }, [products, selectedBrand]);

  // Filtered and Sorted products
  const filteredAndSortedProducts = useMemo(() => {
    const combinedSearch = (searchTerm || localFilter).toLowerCase().trim();

    const filtered = products.filter((p) => {
      if (selectedBrand !== "ALL" && p.marca !== selectedBrand) return false;
      if (selectedLine !== "ALL" && p.linea !== selectedLine) return false;
      if (selectedAbc !== "ALL" && p.clasificacionABC !== selectedAbc) return false;
      if (selectedFranja !== "ALL") {
        if (selectedFranja === "MANANA" && (p.horaPico < 8 || p.horaPico >= 12)) return false;
        if (selectedFranja === "MEDIODIA" && (p.horaPico < 12 || p.horaPico >= 16)) return false;
        if (selectedFranja === "TARDE" && (p.horaPico < 16 || p.horaPico >= 20)) return false;
        if (selectedFranja === "NOCHE" && (p.horaPico < 20 || p.horaPico > 23)) return false;
      }
      if (selectedDia !== "ALL" && p.diaPico !== selectedDia) return false;
      if (combinedSearch) {
        const matchesSku = p.sku.toLowerCase().includes(combinedSearch);
        const matchesMarca = p.marca.toLowerCase().includes(combinedSearch);
        const matchesLinea = p.linea.toLowerCase().includes(combinedSearch);
        const matchesNombre = p.producto.toLowerCase().includes(combinedSearch);
        return matchesSku || matchesMarca || matchesLinea || matchesNombre;
      }
      return true;
    });

    return filtered.sort((a, b) => {
      if (sortBy === "unidades") return b.unidadesVendidas - a.unidadesVendidas;
      if (sortBy === "velocidad") return (b.rotacionVelocidadDiaria || 0) - (a.rotacionVelocidadDiaria || 0);
      if (sortBy === "penetracion") return (b.penetracionTicketsPct || 0) - (a.penetracionTicketsPct || 0);
      if (sortBy === "facturacion") return b.ingresoTotal - a.ingresoTotal;
      return 0;
    });
  }, [products, selectedBrand, selectedLine, selectedAbc, selectedFranja, sortBy, searchTerm, localFilter]);

  const maxUnits = useMemo(() => {
    return Math.max(1, ...filteredAndSortedProducts.map((p) => p.unidadesVendidas));
  }, [filteredAndSortedProducts]);

  const totals = useMemo(() => {
    const units = filteredAndSortedProducts.reduce((acc, p) => acc + p.unidadesVendidas, 0);
    const revenue = filteredAndSortedProducts.reduce((acc, p) => acc + p.ingresoTotal, 0);
    return { units, revenue };
  }, [filteredAndSortedProducts]);

  const pagination = usePagination(filteredAndSortedProducts, 15);

  return (
    <div className="space-y-5">
      {/* 1. Spotlight de Salud & Rotación del Portafolio */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Velocidad de Rotación */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Rotación Portafolio</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-slate-900">
            {formatNumber(portfolioStats.totalUnits)} unid.
          </div>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1">
            ⚡ {portfolioStats.avgVelocity} unid/día promedio por producto
          </p>
        </div>

        {/* Clasificación ABC (Pareto) */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pareto ABC (80/20)</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-extrabold text-indigo-900 flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-bold">
              {portfolioStats.classA} Clase A
            </span>
            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-xs font-bold">
              {portfolioStats.classB} B
            </span>
            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-bold">
              {portfolioStats.classC} C
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            El 39% de productos genera el 80% de ventas
          </p>
        </div>

        {/* Hora y Día Pico de Venta */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pico Temporal Salida</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-amber-900 flex items-baseline gap-2">
            <span>{portfolioStats.peakH.toString().padStart(2, "0")}:00 hrs</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800">
              {portfolioStats.peakDay}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Pico de {formatNumber(portfolioStats.peakHUnits)} unid. ({formatNumber(portfolioStats.peakDayUnits)} unid. los {portfolioStats.peakDay.toLowerCase()}s)
          </p>
        </div>

        {/* Cobertura de Marcas Activas */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Marcas Activas</span>
            <div className="w-7 h-7 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-violet-700">
            {brandsList.length} Firmas
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {formatNumber(products.length)} SKUs en rotación comercial
          </p>
        </div>
      </div>

      {/* 2. Gráficas de Análisis Temporal & Concentración de Marcas */}
      <PortfolioBehaviorCharts
        products={products}
        brandMetrics={brandMetrics}
        selectedBrand={selectedBrand}
        onSelectBrand={(b) => {
          setSelectedBrand(b);
          setSelectedLine("ALL");
        }}
      />

      {/* 3. Contenedor de la Tabla con Filtros Multidimensionales */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* Filters Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
          <div className="flex flex-wrap items-center gap-2">
            {/* Selector de Marca */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Marca:</span>
              <select
                value={selectedBrand}
                onChange={(e) => {
                  setSelectedBrand(e.target.value);
                  setSelectedLine("ALL");
                }}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="ALL">Todas las Marcas ({brandsList.length})</option>
                {brandsList.map((b) => (
                  <option key={b.brand} value={b.brand}>
                    {b.brand} ({formatNumber(b.totalUnits)} unid.)
                  </option>
                ))}
              </select>
            </div>

            {/* Selector de Línea */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Línea:</span>
              <select
                value={selectedLine}
                onChange={(e) => setSelectedLine(e.target.value)}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="ALL">Todas las Líneas ({linesList.length})</option>
                {linesList.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            {/* Selector Clasificación ABC (Pareto) */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Clasificación:</span>
              <select
                value={selectedAbc}
                onChange={(e) => setSelectedAbc(e.target.value)}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="ALL">Todos los Productos (A, B, C)</option>
                <option value="A">🟢 Clase A (Core 80% Rotación)</option>
                <option value="B">🟡 Clase B (Soporte 15%)</option>
                <option value="C">⚪ Clase C (Baja Rotación 5%)</option>
              </select>
            </div>

            {/* Selector Franja Horaria Pico */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Franja Pico:</span>
              <select
                value={selectedFranja}
                onChange={(e) => setSelectedFranja(e.target.value)}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="ALL">Todas las Franjas</option>
                <option value="MANANA">🌅 Mañana (08:00 - 12:00)</option>
                <option value="MEDIODIA">☀️ Mediodía (12:00 - 16:00)</option>
                <option value="TARDE">🌆 Tarde Pico (16:00 - 20:00)</option>
                <option value="NOCHE">🌙 Noche (20:00 - 23:00)</option>
              </select>
            </div>

            {/* Selector Día Pico */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Día Pico:</span>
              <select
                value={selectedDia}
                onChange={(e) => setSelectedDia(e.target.value)}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="ALL">Todos los Días</option>
                <option value="Lunes">Lunes</option>
                <option value="Martes">Martes</option>
                <option value="Miércoles">Miércoles</option>
                <option value="Jueves">Jueves</option>
                <option value="Viernes">Viernes</option>
                <option value="Sábado">⭐ Sábado (Pico)</option>
                <option value="Domingo">Domingo</option>
              </select>
            </div>

            {/* Selector de Ordenamiento */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ordenar:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="unidades">Mayor Rotación (Unidades)</option>
                <option value="velocidad">Mayor Velocidad (Unid/Día)</option>
                <option value="penetracion">Mayor Penetración en Tickets</option>
                <option value="facturacion">Mayor Facturación (S/.)</option>
              </select>
            </div>
          </div>

          {/* Buscador Local Rápido */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={localFilter}
              onChange={(e) => setLocalFilter(e.target.value)}
              placeholder="Buscar Marca, Línea, SKU..."
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {/* Summary Ribbon */}
        <div className="px-4 py-2 bg-indigo-50/40 border-b border-indigo-100/60 flex items-center justify-between text-xs text-indigo-900 font-medium">
          <div>
            <span>Analizando </span>
            <span className="font-extrabold">{formatNumber(filteredAndSortedProducts.length)}</span>
            <span> productos en portafolio</span>
            {selectedBrand !== "ALL" && (
              <span className="ml-1 font-bold text-indigo-700">• Marca: {selectedBrand}</span>
            )}
            {selectedLine !== "ALL" && (
              <span className="ml-1 font-bold text-indigo-700">• Línea: {selectedLine}</span>
            )}
            {selectedAbc !== "ALL" && (
              <span className="ml-1 font-bold text-indigo-700">• Clase: {selectedAbc}</span>
            )}
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>
              Unidades: <strong className="text-slate-900 font-extrabold">{formatNumber(totals.units)}</strong>
            </span>
            <span>
              Facturación: <strong className="text-emerald-700 font-extrabold">{formatCurrency(totals.revenue)}</strong>
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left table-dense">
            <thead className="bg-slate-100/80 text-slate-600 font-semibold uppercase tracking-wider sticky top-0 z-10 border-b border-slate-200">
              <tr>
                <th className="px-3 py-3 text-center w-12">#</th>
                <th className="px-4 py-3">Marca</th>
                <th className="px-4 py-3">Línea</th>
                <th className="px-4 py-3">Producto / Presentación</th>
                <th className="px-4 py-3 text-center">Clasificación ABC</th>
                <th className="px-4 py-3 text-center">Rotación & Velocidad</th>
                <th className="px-4 py-3 text-center">Penetración Tickets</th>
                <th className="px-4 py-3 text-right">Facturación Total</th>
                <th className="px-4 py-3 text-center">Comportamiento Temporal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pagination.paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                    No se encontraron productos con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                pagination.paginatedItems.map((p, idx) => {
                  const rankIndex = (pagination.currentPage - 1) * 15 + idx + 1;
                  const relativePct = Math.round((p.unidadesVendidas / maxUnits) * 100);

                  return (
                    <tr key={p.sku} className="hover:bg-slate-50/70 transition-colors">
                      {/* # Rank */}
                      <td className="px-3 py-2.5 text-center font-bold text-slate-400 font-mono">
                        {rankIndex <= 3 ? (
                          <span
                            className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center text-[11px] font-extrabold ${
                              rankIndex === 1
                                ? "bg-amber-100 text-amber-800 border border-amber-300"
                                : rankIndex === 2
                                ? "bg-slate-200 text-slate-700 border border-slate-300"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {rankIndex}
                          </span>
                        ) : (
                          <span>{rankIndex}</span>
                        )}
                      </td>

                      {/* Marca */}
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold border ${getBrandBadgeClass(
                            p.marca
                          )}`}
                        >
                          {p.marca}
                        </span>
                      </td>

                      {/* Línea */}
                      <td className="px-4 py-2.5 whitespace-nowrap text-slate-600 font-medium">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]">
                          {p.linea || "General"}
                        </span>
                      </td>

                      {/* Producto */}
                      <td className="px-4 py-2.5 font-medium text-slate-800 min-w-[240px]">
                        <div className="font-bold text-slate-900 line-clamp-1">{p.producto}</div>
                        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                          <span>SKU: {p.sku}</span>
                          {p.presentacion && (
                            <span className="text-slate-500 font-semibold">• {p.presentacion}</span>
                          )}
                        </div>
                      </td>

                      {/* Clasificación ABC (Pareto) */}
                      <td className="px-4 py-2.5 text-center whitespace-nowrap">
                        {p.clasificacionABC === "A" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            Clase A (Core 80%)
                          </span>
                        ) : p.clasificacionABC === "B" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                            Clase B (Soporte 15%)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            Clase C (Baja 5%)
                          </span>
                        )}
                      </td>

                      {/* Unidades & Velocidad Diaria */}
                      <td className="px-4 py-2.5 text-center">
                        <div className="font-extrabold text-slate-900 text-sm">
                          {formatNumber(p.unidadesVendidas)} unid.
                        </div>
                        <div className="text-[10px] text-emerald-700 font-bold flex items-center justify-center gap-1 mt-0.5">
                          <Zap className="w-3 h-3" />
                          <span>{p.rotacionVelocidadDiaria || 0} unid/día</span>
                        </div>
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full mx-auto mt-1 overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 rounded-full"
                            style={{ width: `${relativePct}%` }}
                          />
                        </div>
                      </td>

                      {/* Penetración en Tickets */}
                      <td className="px-4 py-2.5 text-center whitespace-nowrap">
                        <div className="font-bold text-slate-900">{formatNumber(p.ticketsCount)} tickets</div>
                        <div className="text-[10px] text-indigo-600 font-bold mt-0.5">
                          {p.penetracionTicketsPct || 0}% de transacciones
                        </div>
                      </td>

                      {/* Facturación Total */}
                      <td className="px-4 py-2.5 text-right whitespace-nowrap">
                        <div className="font-extrabold text-slate-900">{formatCurrency(p.ingresoTotal)}</div>
                        <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                          P.Prom: {formatCurrency(p.precioPromedio)}
                        </div>
                      </td>

                      {/* Comportamiento Temporal: Hora Pico + Día Pico */}
                      <td className="px-4 py-2.5 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center gap-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-indigo-50 text-indigo-800 border border-indigo-200">
                            <Clock className="w-3 h-3 text-indigo-600" />
                            {p.horaPico ? `${p.horaPico.toString().padStart(2, "0")}:00 hrs` : "12:00 hrs"}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                              p.diaPico === "Sábado" || p.diaPico === "Domingo" || p.diaPico === "Viernes"
                                ? "bg-purple-50 text-purple-800 border-purple-200"
                                : "bg-slate-100 text-slate-700 border-slate-200"
                            }`}
                          >
                            <Calendar className="w-2.5 h-2.5 text-slate-500" />
                            {p.diaPico || "Sábado"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/40">
          <span>
            Página {pagination.currentPage} de {pagination.totalPages} (
            {formatNumber(pagination.totalItems)} productos)
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
    </div>
  );
};
