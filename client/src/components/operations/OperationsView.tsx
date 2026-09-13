import React, { useState, useMemo } from "react";
import {
  Scissors,
  Users,
  Search,
  Receipt,
  AlertOctagon
} from "lucide-react";
import {
  OatcRecord,
  AttendanceRecord,
  CashServiceSaleRecord,
  ServiceCategoryMetric
} from "../../types";
import { formatNumber } from "../../utils/formatters";
import { usePagination } from "../../hooks/usePagination";
import { DemandAndModalityCharts } from "./DemandAndModalityCharts";
import { OatcOrdersTable } from "./OatcOrdersTable";
import { AttendanceTable } from "./AttendanceTable";
import { CashServiceSalesTable } from "./CashServiceSalesTable";
import { CancellationsAnalysisTab } from "./CancellationsAnalysisTab";
import { DataAvailabilityNotice } from "../common/DataAvailabilityNotice";
import { SalonFilter } from "../../types";

interface OperationsViewProps {
  orders: OatcRecord[];
  attendance: AttendanceRecord[];
  cashServiceSales: CashServiceSaleRecord[];
  serviceCategories?: ServiceCategoryMetric[];
  searchTerm?: string;
  selectedSalon?: SalonFilter;
}

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4", "#64748b"];

const DAYS_OF_WEEK = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export const OperationsView: React.FC<OperationsViewProps> = ({
  orders,
  attendance,
  cashServiceSales,
  searchTerm = "",
  selectedSalon = "ALL"
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"orders" | "attendance" | "cashSales" | "cancellations">("orders");
  const [localSearch, setLocalSearch] = useState<string>("");

  // Rejections & Cancellation filters
  const [selectedSedeFilter, setSelectedSedeFilter] = useState<string>("ALL");
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>("ALL");
  const [selectedMacroFilter, setSelectedMacroFilter] = useState<string>("ALL");
  const [selectedSubFilter, setSelectedSubFilter] = useState<string>("ALL");

  const combinedSearch = (localSearch || searchTerm).toLowerCase();

  // Filtered standard orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (o.isCancelled) return false;
      if (!combinedSearch) return true;
      const term = combinedSearch.toLowerCase();
      return (
        o.clienteNombre.toLowerCase().includes(term) ||
        o.agente.toLowerCase().includes(term) ||
        o.tipoOatc.toLowerCase().includes(term) ||
        String(o.numeroOatc).includes(term)
      );
    });
  }, [orders, combinedSearch]);

  // Filtered attendance
  const filteredAttendance = useMemo(() => {
    if (!combinedSearch) return attendance;
    const term = combinedSearch.toLowerCase();
    return attendance.filter((a) => a.dependiente.toLowerCase().includes(term));
  }, [attendance, combinedSearch]);

  // Filtered cash service sales
  const filteredCashSales = useMemo(() => {
    if (!combinedSearch) return cashServiceSales;
    const term = combinedSearch.toLowerCase();
    return cashServiceSales.filter(
      (cs) =>
        cs.cliente.toLowerCase().includes(term) ||
        cs.agente.toLowerCase().includes(term) ||
        cs.servicioFinal.toLowerCase().includes(term) ||
        cs.boleta.toLowerCase().includes(term) ||
        cs.ticketId.toLowerCase().includes(term) ||
        (cs.sede && cs.sede.toLowerCase().includes(term))
    );
  }, [cashServiceSales, combinedSearch]);

  // Cancelled records
  const cancelledOrders = useMemo(() => {
    return orders.filter((o) => o.isCancelled);
  }, [orders]);

  const uniqueSedes = useMemo(() => {
    const set = new Set<string>();
    orders.forEach((o) => {
      if (o.sede) set.add(o.sede);
    });
    return Array.from(set).sort();
  }, [orders]);

  // Cancellation KPIs
  const cancellationsKPIs = useMemo(() => {
    const total = cancelledOrders.length;
    const realRejections = cancelledOrders.filter((o) => o.macroCategoria === "RECHAZO_CLIENTE").length;
    const adminErrors = cancelledOrders.filter((o) => o.macroCategoria === "ERROR_REGISTRO").length;
    const completed = orders.filter((o) => !o.isCancelled).length;
    const denominator = completed + realRejections;
    const sedeBattingRatio = denominator > 0 ? Math.round((completed / denominator) * 1000) / 10 : 100;

    return {
      total,
      realRejections,
      realRejectionsPct: total > 0 ? Math.round((realRejections / total) * 100) : 0,
      adminErrors,
      adminErrorsPct: total > 0 ? Math.round((adminErrors / total) * 100) : 0,
      sedeBattingRatio
    };
  }, [cancelledOrders, orders]);

  // Cancellations by Day of Week
  const cancellationsByDay = useMemo(() => {
    const map = new Map<
      string,
      {
        dia: string;
        total: number;
        precio: number;
        espera: number;
        desistimiento: number;
        administrativo: number;
        otros: number;
      }
    >();

    DAYS_OF_WEEK.forEach((d) => {
      map.set(d, {
        dia: d,
        total: 0,
        precio: 0,
        espera: 0,
        desistimiento: 0,
        administrativo: 0,
        otros: 0
      });
    });

    cancelledOrders.forEach((o) => {
      if (selectedSedeFilter !== "ALL" && o.sede !== selectedSedeFilter) return;
      const day = o.diaSemana || "Lunes";
      const entry = map.get(day);
      if (!entry) return;

      entry.total++;
      if (o.subCategoria === "PRECIO") entry.precio++;
      else if (o.subCategoria === "ESPERA") entry.espera++;
      else if (o.subCategoria === "DESISTIMIENTO") entry.desistimiento++;
      else if (o.subCategoria === "ADMINISTRATIVO") entry.administrativo++;
      else entry.otros++;
    });

    return DAYS_OF_WEEK.map((d) => map.get(d)!);
  }, [cancelledOrders, selectedSedeFilter]);

  // Ranking of Batting Ratio by Staff
  const battingRatioByStaff = useMemo(() => {
    const map = new Map<
      string,
      {
        agente: string;
        sede: string;
        completadas: number;
        rechazosReales: number;
        erroresRegistro: number;
        topMotivo: string;
      }
    >();

    orders.forEach((o) => {
      if (selectedSedeFilter !== "ALL" && o.sede !== selectedSedeFilter) return;
      const ag = o.agente || "Sin asignar";
      if (ag === "Sin asignar" || ag.length < 3) return;

      const cur = map.get(ag) || {
        agente: ag,
        sede: o.sede || "RD",
        completadas: 0,
        rechazosReales: 0,
        erroresRegistro: 0,
        topMotivo: "Ninguno"
      };

      if (!o.isCancelled) {
        cur.completadas++;
      } else {
        if (o.macroCategoria === "RECHAZO_CLIENTE") {
          cur.rechazosReales++;
        } else {
          cur.erroresRegistro++;
        }
      }
      map.set(ag, cur);
    });

    return Array.from(map.values())
      .map((item) => {
        const totalOpp = item.completadas + item.rechazosReales;
        const ratio = totalOpp > 0 ? Math.round((item.completadas / totalOpp) * 1000) / 10 : 100;
        return {
          ...item,
          totalOportunidades: totalOpp,
          ratioBateo: ratio
        };
      })
      .sort((a, b) => b.totalOportunidades - a.totalOportunidades);
  }, [orders, selectedSedeFilter]);

  // Filtered Cancellations Table List
  const filteredCancellations = useMemo(() => {
    return cancelledOrders.filter((o) => {
      if (selectedSedeFilter !== "ALL" && o.sede !== selectedSedeFilter) return false;
      if (selectedDayFilter !== "ALL" && o.diaSemana !== selectedDayFilter) return false;
      if (selectedMacroFilter !== "ALL" && o.macroCategoria !== selectedMacroFilter) return false;
      if (selectedSubFilter !== "ALL" && o.subCategoria !== selectedSubFilter) return false;

      if (combinedSearch) {
        const term = combinedSearch.toLowerCase();
        const matchesClient = o.clienteNombre.toLowerCase().includes(term);
        const matchesAgent = o.agente.toLowerCase().includes(term);
        const matchesService = o.tipoOatc.toLowerCase().includes(term);
        const matchesMotivo = (o.motivoLimpio || o.motivo || "").toLowerCase().includes(term);
        const matchesNum = String(o.numeroOatc).includes(term);
        if (!matchesClient && !matchesAgent && !matchesService && !matchesMotivo && !matchesNum) {
          return false;
        }
      }
      return true;
    });
  }, [
    cancelledOrders,
    selectedSedeFilter,
    selectedDayFilter,
    selectedMacroFilter,
    selectedSubFilter,
    combinedSearch
  ]);

  const ordersPagination = usePagination(filteredOrders, 12);
  const attendancePagination = usePagination(filteredAttendance, 12);
  const cashSalesPagination = usePagination(filteredCashSales, 12);
  const cancellationsPagination = usePagination(filteredCancellations, 12);

  // Hourly Demand Curve (From hrRegistro)
  const hourlyData = useMemo(() => {
    const hours = [
      "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
      "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"
    ];
    const counts: { [key: string]: number } = {};
    hours.forEach((h) => (counts[h] = 0));

    orders.forEach((o) => {
      if (!o.hrRegistro) return;
      const match = o.hrRegistro.match(/(\d{1,2}):\d{2}\s*(AM|PM)?/i);
      if (!match) return;
      let hourNum = parseInt(match[1], 10);
      const period = (match[2] || "AM").toUpperCase();
      if (period === "PM" && hourNum < 12) hourNum += 12;
      if (period === "AM" && hourNum === 12) hourNum = 0;
      const hourStr = (hourNum < 10 ? `0${hourNum}` : `${hourNum}`) + ":00";
      if (counts[hourStr] !== undefined) {
        counts[hourStr]++;
      }
    });

    return hours.map((hour) => ({
      hour,
      count: counts[hour]
    }));
  }, [orders]);

  // Modality Breakdown
  const modalityDistribution = useMemo(() => {
    const map: { [key: string]: number } = {};
    orders.forEach((o) => {
      const mod = o.tipoCliente || "Turno";
      map[mod] = (map[mod] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [orders]);

  return (
    <div className="space-y-6">
      {/* Contextual Notices */}
      {selectedSalon === "GONZALES_AM" && (
        <DataAvailabilityNotice
          tipo="NO_IMPLEMENTADO"
          modulo="Recepción Digital OATC & Asistencia"
          salonNombre="Gonzales AM"
          titulo="Sin Terminal de Recepción OATC Digital"
          mensaje="Gonzales AM gestiona el flujo de clientes directamente en caja POS y no utiliza el formulario de recepción OATC ni control digital de asistencia. Las estadísticas de clientes y servicios se procesan desde las 7,279 boletas de caja."
          accionSugerida="Para comparar la afluencia horaria inferida de Gonzales AM con Salón RD y Luxury RD, consulte la pestaña 'Benchmark Multi-Sede'."
        />
      )}

      {selectedSalon === "GLOSS_SALON" && (
        <DataAvailabilityNotice
          tipo="PENDIENTE_CARGA"
          modulo="Auditoría de Caja"
          salonNombre="Gloss Salon"
          titulo="Órdenes OATC y Asistencia Operativas • Ventas de Caja Pendientes"
          mensaje="Gloss Salon cuenta con 6,636 órdenes en recepción digital OATC y 2,666 asistencias de estilistas registradas con total normalidad. La pestaña de facturación de caja 2026 está pendiente de sincronización en Google Sheets."
          accionSugerida="A continuación puede auditar todas las órdenes de atención y turnos de asistencia de Gloss Salon."
        />
      )}

      {/* 1. Demand & Modality Charts */}
      <DemandAndModalityCharts
        hourlyData={hourlyData}
        modalityDistribution={modalityDistribution}
        colors={COLORS}
      />

      {/* 2. Tables Section with SubTab Selector */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveSubTab("orders")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === "orders"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-200/60"
              }`}
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>Órdenes OATC ({formatNumber(filteredOrders.length)})</span>
            </button>

            <button
              onClick={() => setActiveSubTab("attendance")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === "attendance"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-200/60"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Asistencia ({formatNumber(filteredAttendance.length)})</span>
            </button>

            <button
              onClick={() => setActiveSubTab("cashSales")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === "cashSales"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-200/60"
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Auditoría de Caja 2025 ({formatNumber(filteredCashSales.length)})</span>
            </button>

            <button
              onClick={() => setActiveSubTab("cancellations")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === "cancellations"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/60"
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Rechazos & Cancelaciones ({formatNumber(cancelledOrders.length)})</span>
            </button>
          </div>

          {/* Table Search */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Buscar en esta tabla..."
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {/* SubTab 1: Orders Table */}
        {activeSubTab === "orders" && (
          <OatcOrdersTable
            orders={ordersPagination.paginatedItems}
            pagination={ordersPagination}
          />
        )}

        {/* SubTab 2: Attendance Table */}
        {activeSubTab === "attendance" && (
          <AttendanceTable
            attendance={attendancePagination.paginatedItems}
            pagination={attendancePagination}
          />
        )}

        {/* SubTab 3: Cash Sales Table */}
        {activeSubTab === "cashSales" && (
          <CashServiceSalesTable
            cashSales={cashSalesPagination.paginatedItems}
            pagination={cashSalesPagination}
          />
        )}

        {/* SubTab 4: Cancellations & Rejections Module */}
        {activeSubTab === "cancellations" && (
          <CancellationsAnalysisTab
            cancellationsKPIs={cancellationsKPIs}
            uniqueSedes={uniqueSedes}
            daysOfWeek={DAYS_OF_WEEK}
            selectedSedeFilter={selectedSedeFilter}
            onSedeFilterChange={setSelectedSedeFilter}
            selectedDayFilter={selectedDayFilter}
            onDayFilterChange={setSelectedDayFilter}
            selectedMacroFilter={selectedMacroFilter}
            onMacroFilterChange={setSelectedMacroFilter}
            selectedSubFilter={selectedSubFilter}
            onSubFilterChange={setSelectedSubFilter}
            onClearFilters={() => {
              setSelectedSedeFilter("ALL");
              setSelectedDayFilter("ALL");
              setSelectedMacroFilter("ALL");
              setSelectedSubFilter("ALL");
            }}
            cancellationsByDay={cancellationsByDay}
            battingRatioByStaff={battingRatioByStaff}
            paginatedCancellations={cancellationsPagination.paginatedItems}
            pagination={cancellationsPagination}
          />
        )}
      </div>
    </div>
  );
};
