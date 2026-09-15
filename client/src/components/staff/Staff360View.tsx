import React, { useState, useEffect, useMemo } from "react";
import { Users, Info } from "lucide-react";
import {
  Staff360,
  OatcRecord,
  AttendanceRecord,
  CashServiceSaleRecord,
  ServiceCategoryMetric,
  TicketRecord,
  TicketDetailRecord,
  UnifiedClient
} from "../../types";
import { formatCurrency } from "../../utils/formatters";
import { StaffTopBar } from "./StaffTopBar";
import { StaffTemporalRibbon } from "./StaffTemporalRibbon";
import { StaffKpiCards } from "./StaffKpiCards";
import { StaffPnlBenchmark } from "./StaffPnlBenchmark";
import { StaffModalityLoyalty } from "./StaffModalityLoyalty";
import { StaffDemandAttendance } from "./StaffDemandAttendance";
import { StaffCoachingRejections } from "./StaffCoachingRejections";
import { StaffErpChangeManagement } from "./StaffErpChangeManagement";

interface Staff360ViewProps {
  staffList: Staff360[];
  selectedAgent: string;
  onSelectAgent: (agent: string) => void;
  orders?: OatcRecord[];
  attendance?: AttendanceRecord[];
  cashServiceSales?: CashServiceSaleRecord[];
  serviceCategories?: ServiceCategoryMetric[];
  tickets?: TicketRecord[];
  ticketDetails?: TicketDetailRecord[];
  clients?: UnifiedClient[];
  startDate?: string;
  onStartDateChange?: (date: string) => void;
  endDate?: string;
  onEndDateChange?: (date: string) => void;
}

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4", "#64748b"];

const MONTH_NAMES_ES: { [key: string]: string } = {
  "01": "Enero",
  "02": "Febrero",
  "03": "Marzo",
  "04": "Abril",
  "05": "Mayo",
  "06": "Junio",
  "07": "Julio",
  "08": "Agosto",
  "09": "Septiembre",
  "10": "Octubre",
  "11": "Noviembre",
  "12": "Diciembre"
};

export const Staff360View: React.FC<Staff360ViewProps> = ({
  staffList,
  selectedAgent,
  onSelectAgent,
  orders = [],
  attendance = [],
  cashServiceSales = [],
  tickets = [],
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange
}) => {
  // Local temporal state
  const [localStartDate, setLocalStartDate] = useState<string>(startDate || "");
  const [localEndDate, setLocalEndDate] = useState<string>(endDate || "");

  // Sync when parent props change
  useEffect(() => {
    if (startDate !== undefined) setLocalStartDate(startDate);
  }, [startDate]);

  useEffect(() => {
    if (endDate !== undefined) setLocalEndDate(endDate);
  }, [endDate]);

  const updateDateRange = (start: string, end: string) => {
    setLocalStartDate(start);
    setLocalEndDate(end);
    if (onStartDateChange) onStartDateChange(start);
    if (onEndDateChange) onEndDateChange(end);
  };

  const [selectedSede, setSelectedSede] = useState<string>("ALL");

  const filteredStaffList = useMemo(() => {
    if (selectedSede === "ALL") return staffList;
    return staffList.filter((s) => s.salon?.toLowerCase() === selectedSede.toLowerCase());
  }, [staffList, selectedSede]);

  const activeAgent = useMemo(() => {
    if (selectedAgent && selectedAgent !== "ALL") {
      const found = filteredStaffList.find((s) => s.agente.toLowerCase() === selectedAgent.toLowerCase());
      if (found) return found;
    }
    return filteredStaffList[0] || staffList[0] || null;
  }, [filteredStaffList, staffList, selectedAgent]);

  // View toggles
  const [chartMode, setChartMode] = useState<"modality" | "stacked" | "cumulative">("modality");
  const [agreementNotes, setAgreementNotes] = useState<string>("");
  const [savedNotesStatus, setSavedNotesStatus] = useState<boolean>(false);
  const [showRejectionAudit, setShowRejectionAudit] = useState<boolean>(false);
  const [rejectionFilterCategory, setRejectionFilterCategory] = useState<string>("ALL");

  // Extract available months for active collaborator
  const availableMonths = useMemo(() => {
    if (!activeAgent) return [];
    const target = activeAgent.agente.toLowerCase().trim();
    const set = new Set<string>();
    cashServiceSales.forEach((cs) => {
      if ((cs.agente || "").toLowerCase().trim() === target && cs.fecha) {
        const ym = cs.fecha.substring(0, 7);
        if (ym.length === 7 && ym.match(/^\d{4}-\d{2}$/)) {
          set.add(ym);
        }
      }
    });
    return Array.from(set).sort().reverse();
  }, [cashServiceSales, activeAgent]);

  // Temporal filter helper
  const isDateInRange = (dateStr?: string) => {
    if (!dateStr) return true;
    if (localStartDate && dateStr < localStartDate) return false;
    if (localEndDate && dateStr > localEndDate) return false;
    return true;
  };

  // Human-readable period label
  const periodLabel = useMemo(() => {
    if (!localStartDate && !localEndDate) {
      return "Histórico Completo (2025 - 2026)";
    }
    if (localStartDate === "2026-01-01" && localEndDate === "2026-12-31") {
      return "Año 2026 Completo";
    }
    if (localStartDate === "2025-01-01" && localEndDate === "2025-12-31") {
      return "Año 2025 Completo";
    }
    if (localStartDate === "2026-07-01" && localEndDate === "2026-09-30") {
      return "Tercer Trimestre 2026 (Q3)";
    }
    if (localStartDate === "2026-04-01" && localEndDate === "2026-06-30") {
      return "Segundo Trimestre 2026 (Q2)";
    }
    if (localStartDate && localEndDate && localStartDate.substring(0, 7) === localEndDate.substring(0, 7)) {
      const ym = localStartDate.substring(0, 7);
      const [y, m] = ym.split("-");
      return `${MONTH_NAMES_ES[m] || m} ${y}`;
    }
    return `${localStartDate || "Inicio"} al ${localEndDate || "Hoy"}`;
  }, [localStartDate, localEndDate]);

  // Apply quick temporal presets
  const applyPreset = (preset: "all" | "2026" | "2025" | "q3_2026" | "q2_2026" | "30d" | "month", monthVal?: string) => {
    if (preset === "all") {
      updateDateRange("", "");
      return;
    }
    if (preset === "2026") {
      updateDateRange("2026-01-01", "2026-12-31");
      return;
    }
    if (preset === "2025") {
      updateDateRange("2025-01-01", "2025-12-31");
      return;
    }
    if (preset === "q3_2026") {
      updateDateRange("2026-07-01", "2026-09-30");
      return;
    }
    if (preset === "q2_2026") {
      updateDateRange("2026-04-01", "2026-06-30");
      return;
    }
    if (preset === "30d") {
      updateDateRange("2026-08-13", "2026-09-12");
      return;
    }
    if (preset === "month" && monthVal) {
      const [y, m] = monthVal.split("-").map(Number);
      const lastDay = new Date(y, m, 0).getDate();
      const start = `${monthVal}-01`;
      const end = `${monthVal}-${String(lastDay).padStart(2, "0")}`;
      updateDateRange(start, end);
    }
  };

  // Filter collaborator datasets dynamically by selected date range
  const agentOrders = useMemo(() => {
    if (!activeAgent) return [];
    const target = activeAgent.agente.toLowerCase().trim();
    return orders.filter(
      (o) =>
        (o.agente || "").toLowerCase().trim() === target &&
        !o.isCancelled &&
        isDateInRange(o.fechaRegistro)
    );
  }, [orders, activeAgent, localStartDate, localEndDate]);

  const agentCashSales = useMemo(() => {
    if (!activeAgent) return [];
    const target = activeAgent.agente.toLowerCase().trim();
    return cashServiceSales.filter(
      (cs) =>
        (cs.agente || "").toLowerCase().trim() === target &&
        isDateInRange(cs.fecha)
    );
  }, [cashServiceSales, activeAgent, localStartDate, localEndDate]);

  const agentAttendance = useMemo(() => {
    if (!activeAgent) return [];
    const target = activeAgent.agente.toLowerCase().trim();
    return attendance.filter(
      (a) =>
        (a.dependiente || "").toLowerCase().trim() === target &&
        isDateInRange(a.fecha)
    );
  }, [attendance, activeAgent, localStartDate, localEndDate]);

  const agentTickets = useMemo(() => {
    if (!activeAgent) return [];
    const target = activeAgent.agente.toLowerCase().trim();
    return tickets.filter(
      (t) =>
        (t.asesor || "").toLowerCase().trim() === target &&
        t.estado !== "ANULADO" &&
        isDateInRange(t.fecha)
    );
  }, [tickets, activeAgent, localStartDate, localEndDate]);

  // Dynamic Period Metrics
  const periodMetrics = useMemo(() => {
    const facturadoServicios = agentCashSales.reduce((acc, cs) => acc + cs.montoFinal, 0);
    const comisionesServicios = agentCashSales.reduce((acc, cs) => acc + cs.comision, 0);
    const totalServicios = agentCashSales.length;
    const ticketPromedioServicio = totalServicios > 0 ? facturadoServicios / totalServicios : 0;

    const facturadoRetail = agentTickets.reduce((acc, t) => acc + t.total, 0);
    const totalTicketsRetail = agentTickets.length;
    const ticketPromedioRetail = totalTicketsRetail > 0 ? facturadoRetail / totalTicketsRetail : 0;
    const comisionesRetail = Math.round(facturadoRetail * 0.05 * 100) / 100;

    const facturacionTotalPeriodo = facturadoServicios + facturadoRetail;
    const comisionesTotalesPeriodo = comisionesServicios + comisionesRetail;

    // Margen Neto Aportado: Considera solo lo generado por la facturación de servicios (excluye retail)
    const margenAportadoEmpresa = facturadoServicios - comisionesServicios;
    const margenPct = facturadoServicios > 0 ? Math.round((margenAportadoEmpresa / facturadoServicios) * 100) : 0;

    const diasAsistidos = new Set(agentAttendance.map((a) => a.fecha)).size;
    const horasTrabajadas = agentAttendance.reduce((acc, a) => acc + (a.horasTrabajadas || 0), 0);
    // Eficiencia Económica: Considera únicamente la facturación por servicios
    const facturacionPorHora = horasTrabajadas > 0 ? facturadoServicios / horasTrabajadas : 0;

    const serviceDates = new Set(agentCashSales.map((cs) => cs.fecha));
    const crossSellTickets = agentTickets.filter((t) => serviceDates.has(t.fecha)).length;
    const crossSellRate = totalServicios > 0 ? Math.round((crossSellTickets / totalServicios) * 1000) / 10 : 0;

    return {
      facturadoServicios: Math.round(facturadoServicios * 100) / 100,
      comisionesServicios: Math.round(comisionesServicios * 100) / 100,
      totalServicios,
      ticketPromedioServicio: Math.round(ticketPromedioServicio * 100) / 100,
      facturadoRetail: Math.round(facturadoRetail * 100) / 100,
      totalTicketsRetail,
      ticketPromedioRetail: Math.round(ticketPromedioRetail * 100) / 100,
      comisionesRetail,
      facturacionTotalPeriodo: Math.round(facturacionTotalPeriodo * 100) / 100,
      comisionesTotalesPeriodo: Math.round(comisionesTotalesPeriodo * 100) / 100,
      margenAportadoEmpresa: Math.round(margenAportadoEmpresa * 100) / 100,
      margenPct,
      diasAsistidos,
      horasTrabajadas: Math.round(horasTrabajadas * 10) / 10,
      facturacionPorHora: Math.round(facturacionPorHora * 100) / 100,
      crossSellTickets,
      crossSellRate
    };
  }, [agentCashSales, agentTickets, agentAttendance]);

  // Modality Breakdown with Zoom to Tipo OATC (Col C OATC / Col P Borrador)
  const modalityStats = useMemo(() => {
    const modalityMap = new Map<
      string,
      { count: number; serviceMap: Map<string, number> }
    >();

    agentOrders.forEach((o) => {
      const rawMod = (o.tipoCliente || "Turno").trim();
      const mod = rawMod ? rawMod.charAt(0).toUpperCase() + rawMod.slice(1).toLowerCase() : "Turno";
      const srv = (o.tipoOatc || "Otros Servicios").trim();

      const cur = modalityMap.get(mod) || { count: 0, serviceMap: new Map() };
      cur.count++;
      cur.serviceMap.set(srv, (cur.serviceMap.get(srv) || 0) + 1);
      modalityMap.set(mod, cur);
    });

    const total = agentOrders.length || 1;
    return Array.from(modalityMap.entries())
      .map(([name, data]) => {
        const serviceBreakdown = Array.from(data.serviceMap.entries())
          .map(([tipoOatc, count]) => ({
            tipoOatc,
            count,
            pct: Math.round((count / (data.count || 1)) * 100)
          }))
          .sort((a, b) => b.count - a.count);

        return {
          name,
          count: data.count,
          pct: Math.round((data.count / total) * 100),
          serviceBreakdown
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [agentOrders]);

  // Category Benchmark vs Sede
  const categoryBenchmark = useMemo(() => {
    const normalizeSalon = (s?: string) => {
      if (!s) return "";
      const lower = s.toLowerCase();
      if (lower.includes("luxury")) return "luxury";
      if (lower.includes("gonzales")) return "gonzales";
      if (lower.includes("gloss")) return "gloss";
      return "rd";
    };
    const activeSalonKey = normalizeSalon(activeAgent?.salon);

    const sedeMap = new Map<string, { total: number; count: number }>();
    cashServiceSales.forEach((cs) => {
      if (!isDateInRange(cs.fecha)) return;
      if (activeSalonKey && cs.sede && normalizeSalon(cs.sede) !== activeSalonKey) {
        return;
      }
      const cat = cs.servicioSubCategoria || cs.servicioCategoria || "General";
      const cur = sedeMap.get(cat) || { total: 0, count: 0 };
      cur.total += cs.montoFinal;
      cur.count++;
      sedeMap.set(cat, cur);
    });

    const agentMap = new Map<
      string,
      { total: number; count: number; comisiones: number; isRetail: boolean }
    >();
    agentCashSales.forEach((cs) => {
      const cat = cs.servicioSubCategoria || cs.servicioCategoria || "General";
      const cur = agentMap.get(cat) || { total: 0, count: 0, comisiones: 0, isRetail: false };
      cur.total += cs.montoFinal;
      cur.count++;
      cur.comisiones += cs.comision;
      if (
        cs.isRetail ||
        cs.servicioCategoria === "Retail" ||
        cat.toLowerCase().startsWith("venta retail") ||
        cat.toLowerCase().includes("retail") ||
        cat.toUpperCase() === "PRODUCTO" ||
        cat.toUpperCase() === "VENTAS"
      ) {
        cur.isRetail = true;
      }
      agentMap.set(cat, cur);
    });

    return Array.from(agentMap.entries())
      .map(([cat, stats]) => {
        const avgAgent = stats.count > 0 ? stats.total / stats.count : 0;
        const sedeStats = sedeMap.get(cat) || { total: 0, count: 1 };
        const avgSede = sedeStats.count > 0 ? sedeStats.total / sedeStats.count : 0;
        const diffPct = avgSede > 0 ? Math.round(((avgAgent - avgSede) / avgSede) * 100) : 0;
        const margenPct = stats.total > 0 ? Math.round(((stats.total - stats.comisiones) / stats.total) * 100) : 0;

        return {
          categoria: cat,
          atenciones: stats.count,
          facturacion: Math.round(stats.total * 100) / 100,
          ticketPromedio: Math.round(avgAgent * 100) / 100,
          ticketSede: Math.round(avgSede * 100) / 100,
          diffPct,
          margenPct,
          isRetail: stats.isRetail,
          sedeAtenciones: sedeStats.count,
          sedeFacturacion: Math.round(sedeStats.total * 100) / 100
        };
      })
      .sort((a, b) => b.facturacion - a.facturacion);
  }, [agentCashSales, cashServiceSales, activeAgent, localStartDate, localEndDate]);

  // Hourly Distribution with Category and Modality Breakdown
  const hourlyAnalysis = useMemo(() => {
    const hours = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];
    const hourMap = new Map<string, { hora: string; total: number; [key: string]: any }>();

    hours.forEach((h) => {
      hourMap.set(h, { hora: h, total: 0 });
    });

    const topCats = activeAgent?.serviciosTop.slice(0, 3).map((s) => s.servicio) || [];
    const modalityTotals: Record<string, number> = {};

    agentOrders.forEach((o) => {
      const rawMod = (o.tipoCliente || "Turno").trim();
      const mod = rawMod ? rawMod.charAt(0).toUpperCase() + rawMod.slice(1).toLowerCase() : "Turno";
      modalityTotals[mod] = (modalityTotals[mod] || 0) + 1;

      if (!o.hrRegistro) return;
      const m = o.hrRegistro.match(/(\d{1,2}):\d{2}\s*(AM|PM)?/i);
      if (!m) return;
      let h = parseInt(m[1], 10);
      const p = (m[2] || "AM").toUpperCase();
      if (p === "PM" && h < 12) h += 12;
      if (p === "AM" && h === 12) h = 0;
      const hStr = (h < 10 ? `0${h}` : `${h}`) + ":00";

      const cur = hourMap.get(hStr);
      if (cur) {
        cur.total++;
        const srv = o.tipoOatc;
        if (topCats.includes(srv)) {
          cur[srv] = (cur[srv] || 0) + 1;
        } else {
          cur["Otros"] = (cur["Otros"] || 0) + 1;
        }

        cur[`mod_${mod}`] = (cur[`mod_${mod}`] || 0) + 1;
      }
    });

    const MODALITY_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4", "#64748b"];
    const modalities = Object.entries(modalityTotals)
      .sort((a, b) => b[1] - a[1])
      .map(([name], idx) => ({
        key: `mod_${name}`,
        name,
        color: MODALITY_COLORS[idx % MODALITY_COLORS.length]
      }));

    let runningTotal = 0;
    const result = hours.map((h) => {
      const entry = hourMap.get(h)!;
      runningTotal += entry.total;
      return {
        ...entry,
        acumulado: runningTotal
      };
    });

    let maxVal = -1;
    let peakHour = "17:00";
    let minMiddayVal = Infinity;
    let valleyHour = "13:00";

    result.forEach((r) => {
      if (r.total > maxVal) {
        maxVal = r.total;
        peakHour = r.hora;
      }
      if (["12:00", "13:00", "14:00"].includes(r.hora) && r.total < minMiddayVal) {
        minMiddayVal = r.total;
        valleyHour = r.hora;
      }
    });

    return {
      data: result,
      topCats,
      modalities,
      peakHour,
      maxVal,
      valleyHour,
      minMiddayVal
    };
  }, [agentOrders, activeAgent]);

  // Client Loyalty & Top VIPs
  const clientLoyaltyStats = useMemo(() => {
    const clientVisits = new Map<string, { count: number; gasto: number; ultimaFecha: string; celular?: string }>();

    agentOrders.forEach((o) => {
      const name = o.clienteNombre.trim();
      if (!name || name.toLowerCase().includes("desconocid") || name.toLowerCase() === "cliente") return;
      const cur = clientVisits.get(name) || { count: 0, gasto: 0, ultimaFecha: "" };
      cur.count++;
      if (o.fechaRegistro && o.fechaRegistro > cur.ultimaFecha) {
        cur.ultimaFecha = o.fechaRegistro;
      }
      clientVisits.set(name, cur);
    });

    agentTickets.forEach((t) => {
      const name = t.clienteNombreLimpio.trim();
      const cur = clientVisits.get(name) || { count: 0, gasto: 0, ultimaFecha: "" };
      cur.gasto += t.total;
      if (t.clienteCelular) cur.celular = t.clienteCelular;
      clientVisits.set(name, cur);
    });

    agentCashSales.forEach((cs) => {
      const name = cs.cliente.trim();
      const cur = clientVisits.get(name);
      if (cur) cur.gasto += cs.montoFinal;
    });

    const list = Array.from(clientVisits.entries()).map(([nombre, s]) => ({
      nombre,
      visitas: s.count,
      gastoTotal: Math.round(s.gasto * 100) / 100,
      ultimaFecha: s.ultimaFecha,
      celular: s.celular
    }));

    const recurrentes = list.filter((c) => c.visitas >= 2).length;
    const tasaRecurrencia = list.length > 0 ? Math.round((recurrentes / list.length) * 1000) / 10 : 0;
    const topClients = list.sort((a, b) => b.gastoTotal - a.gastoTotal || b.visitas - a.visitas).slice(0, 5);

    return {
      totalClientes: list.length,
      recurrentes,
      tasaRecurrencia,
      topClients
    };
  }, [agentOrders, agentTickets, agentCashSales]);

  // Cancellations & Rejections
  const agentCancelled = useMemo(() => {
    if (!activeAgent) return [];
    return orders.filter(
      (o) =>
        o.agente.toLowerCase() === activeAgent.agente.toLowerCase() &&
        Boolean(o.isCancelled) &&
        isDateInRange(o.fechaRegistro)
    );
  }, [orders, activeAgent, localStartDate, localEndDate]);

  const cancellationStats = useMemo(() => {
    let rechazosReales = 0;
    let erroresRegistro = 0;
    let precio = 0;
    let desistimiento = 0;
    let espera = 0;
    let insumo = 0;
    let preferencia = 0;
    let admin = 0;
    let otro = 0;

    agentCancelled.forEach((o) => {
      if (o.macroCategoria === "RECHAZO_CLIENTE") {
        rechazosReales++;
        if (o.subCategoria === "PRECIO") precio++;
        else if (o.subCategoria === "DESISTIMIENTO") desistimiento++;
        else if (o.subCategoria === "ESPERA") espera++;
        else if (o.subCategoria === "INSUMO") insumo++;
        else if (o.subCategoria === "PREFERENCIA") preferencia++;
        else otro++;
      } else {
        erroresRegistro++;
        if (o.subCategoria === "ADMINISTRATIVO") admin++;
        else otro++;
      }
    });

    const atencionesConcretadas = agentOrders.length;
    const totalDemandaReal = atencionesConcretadas + rechazosReales;
    const ratioBateo = totalDemandaReal > 0 ? Math.round((atencionesConcretadas / totalDemandaReal) * 1000) / 10 : 100;

    return {
      totalCancelados: agentCancelled.length,
      rechazosReales,
      erroresRegistro,
      atencionesConcretadas,
      totalDemandaReal,
      ratioBateo,
      subcategories: {
        precio,
        desistimiento,
        espera,
        insumo,
        preferencia,
        admin,
        otro
      }
    };
  }, [agentCancelled, agentOrders]);

  const sedeBattingStats = useMemo(() => {
    if (!activeAgent?.salon) return { ratioBateo: 100, concretadas: 0, rechazos: 0 };
    const salonOrders = orders.filter(
      (o) => o.sede === activeAgent.salon && isDateInRange(o.fechaRegistro)
    );
    const concretadas = salonOrders.filter((o) => !o.isCancelled).length;
    const rechazos = salonOrders.filter((o) => o.isCancelled && o.macroCategoria === "RECHAZO_CLIENTE").length;
    const denom = concretadas + rechazos;
    const ratioBateo = denom > 0 ? Math.round((concretadas / denom) * 1000) / 10 : 100;
    return { ratioBateo, concretadas, rechazos };
  }, [orders, activeAgent, localStartDate, localEndDate]);

  const filteredRejections = useMemo(() => {
    if (rejectionFilterCategory === "ALL") return agentCancelled;
    if (rejectionFilterCategory === "RECHAZO_CLIENTE") {
      return agentCancelled.filter((o) => o.macroCategoria === "RECHAZO_CLIENTE");
    }
    if (rejectionFilterCategory === "ERROR_REGISTRO") {
      return agentCancelled.filter((o) => o.macroCategoria === "ERROR_REGISTRO");
    }
    return agentCancelled.filter((o) => o.subCategoria === rejectionFilterCategory);
  }, [agentCancelled, rejectionFilterCategory]);

  const handleAppendCoachingAgreement = (text: string) => {
    setAgreementNotes((prev) => {
      const updated = prev ? `${prev}\n• ${text}` : `• ${text}`;
      if (activeAgent) {
        localStorage.setItem(`vaikuntha_notes_${activeAgent.agente}`, updated);
      }
      return updated;
    });
    setSavedNotesStatus(true);
    setTimeout(() => setSavedNotesStatus(false), 2000);
  };

  // Agreements persistence
  useEffect(() => {
    if (activeAgent) {
      const saved = localStorage.getItem(`vaikuntha_notes_${activeAgent.agente}`);
      setAgreementNotes(
        saved ||
          `1. Meta de rentabilidad (${periodLabel}): Elevar la facturación a S/. ${Math.max(120, Math.round(periodMetrics.facturacionPorHora * 1.15 || 120))}/hora mediante turnos en horas valle (${hourlyAnalysis.valleyHour}).\n2. Venta cruzada sugerida: Recomendar al menos 1 producto retail cada 3 atenciones (meta: 35% de cross-sell).\n3. Ficha técnica digital: Registrar recetas y diagnósticos en SaS Vaikuntha para fidelizar clientas recurrentes.`
      );
      setSavedNotesStatus(false);
    }
  }, [activeAgent, periodLabel, periodMetrics.facturacionPorHora, hourlyAnalysis.valleyHour]);

  const handleSaveNotes = () => {
    if (activeAgent) {
      localStorage.setItem(`vaikuntha_notes_${activeAgent.agente}`, agreementNotes);
      setSavedNotesStatus(true);
      setTimeout(() => setSavedNotesStatus(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!activeAgent) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
        <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-700">No hay colaboradores registrados</h3>
        <p className="text-xs text-slate-500">Revisa la pestaña Agentes en el archivo de Administración.</p>
      </div>
    );
  }

  const isFiltered = Boolean(localStartDate || localEndDate);

  return (
    <div className="space-y-6">
      {/* 1. Top Controls & Header */}
      <StaffTopBar
        activeAgent={activeAgent}
        staffList={filteredStaffList}
        onSelectAgent={onSelectAgent}
        selectedSede={selectedSede}
        onSelectSede={(sede) => {
          setSelectedSede(sede);
          const list = sede === "ALL" ? staffList : staffList.filter((s) => s.salon?.toLowerCase() === sede.toLowerCase());
          if (list.length > 0 && !list.some((s) => s.agente.toLowerCase() === activeAgent?.agente.toLowerCase())) {
            onSelectAgent(list[0].agente);
          }
        }}
        onPrint={handlePrint}
        periodLabel={periodLabel}
        isFiltered={isFiltered}
        facturacionTotal={periodMetrics.facturacionTotalPeriodo}
        margenEmpresa={periodMetrics.margenAportadoEmpresa}
        margenPct={periodMetrics.margenPct}
      />

      {/* 2. Temporal Ribbon */}
      <StaffTemporalRibbon
        localStartDate={localStartDate}
        localEndDate={localEndDate}
        periodLabel={periodLabel}
        totalServicios={periodMetrics.totalServicios}
        availableMonths={availableMonths}
        isFiltered={isFiltered}
        onApplyPreset={applyPreset}
        onUpdateDateRange={updateDateRange}
        monthNames={MONTH_NAMES_ES}
      />

      {/* 3. Master Document Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-8 print:p-0 print:border-none print:shadow-none">
        {/* Period Context Alert Banner */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Info className="w-4 h-4 text-indigo-600 shrink-0" />
            <div>
              <span className="font-bold text-indigo-950">
                Evaluando Corte: {periodLabel}
              </span>
              <span className="text-indigo-800 ml-1.5">
                • Registrando <strong>{periodMetrics.totalServicios} servicios</strong>,{" "}
                <strong>{periodMetrics.totalTicketsRetail} ventas retail</strong> y{" "}
                <strong>{formatCurrency(periodMetrics.facturacionTotalPeriodo)}</strong> facturados en este periodo.
              </span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 shrink-0">
            Histórico total acumulado:{" "}
            <span className="font-bold text-slate-700">
              {activeAgent.totalServicios} atenciones / {formatCurrency(activeAgent.totalFacturadoServicios + activeAgent.totalVentasRetail)}
            </span>
          </div>
        </div>

        {/* 4 Pillars Summary Cards */}
        <StaffKpiCards
          facturadoServicios={periodMetrics.facturadoServicios}
          totalServicios={periodMetrics.totalServicios}
          ticketPromedioServicio={periodMetrics.ticketPromedioServicio}
          facturadoRetail={periodMetrics.facturadoRetail}
          totalTicketsRetail={periodMetrics.totalTicketsRetail}
          ticketPromedioRetail={periodMetrics.ticketPromedioRetail}
          margenAportadoEmpresa={periodMetrics.margenAportadoEmpresa}
          margenPct={periodMetrics.margenPct}
          facturacionPorHora={periodMetrics.facturacionPorHora}
          horasTrabajadas={periodMetrics.horasTrabajadas}
          diasAsistidos={periodMetrics.diasAsistidos}
        />

        {/* Bloque 1: Estado de Resultados & Benchmark */}
        <StaffPnlBenchmark
          periodLabel={periodLabel}
          facturadoServicios={periodMetrics.facturadoServicios}
          facturadoRetail={periodMetrics.facturadoRetail}
          facturacionTotalPeriodo={periodMetrics.facturacionTotalPeriodo}
          comisionesServicios={periodMetrics.comisionesServicios}
          comisionesRetail={periodMetrics.comisionesRetail}
          margenAportadoEmpresa={periodMetrics.margenAportadoEmpresa}
          categoryBenchmark={categoryBenchmark}
        />

        {/* Bloque 2: Composición de Atenciones & Fidelización */}
        <StaffModalityLoyalty
          totalOrdersInPeriod={agentOrders.length}
          modalityStats={modalityStats}
          clientLoyaltyStats={clientLoyaltyStats}
          agentName={activeAgent.agente}
          colors={COLORS}
        />

        {/* Bloque 3: Curva de Demanda & Asistencia */}
        <StaffDemandAttendance
          periodLabel={periodLabel}
          chartMode={chartMode}
          onChartModeChange={setChartMode}
          hourlyAnalysis={hourlyAnalysis}
          hrEntrada={activeAgent.hrEntrada}
          hrSalida={activeAgent.hrSalida}
          diaDescanso={activeAgent.diaDescanso}
          horasTrabajadas={periodMetrics.horasTrabajadas}
          diasAsistidos={periodMetrics.diasAsistidos}
          facturacionPorHora={periodMetrics.facturacionPorHora}
          colors={COLORS}
        />

        {/* Bloque 4: Sesión de Coaching 1-a-1 & Ratio de Bateo */}
        <StaffCoachingRejections
          periodLabel={periodLabel}
          salon={activeAgent.salon}
          cancellationStats={cancellationStats}
          sedeBattingStats={sedeBattingStats}
          filteredRejections={filteredRejections}
          showRejectionAudit={showRejectionAudit}
          onToggleRejectionAudit={() => setShowRejectionAudit(!showRejectionAudit)}
          rejectionFilterCategory={rejectionFilterCategory}
          onFilterCategoryChange={setRejectionFilterCategory}
          onAppendCoachingAgreement={handleAppendCoachingAgreement}
        />

        {/* Bloque 5: Gestión del Cambio & Acuerdos */}
        <StaffErpChangeManagement
          periodLabel={periodLabel}
          agentName={activeAgent.agente}
          crossSellRate={periodMetrics.crossSellRate}
          crossSellTickets={periodMetrics.crossSellTickets}
          agreementNotes={agreementNotes}
          onAgreementNotesChange={setAgreementNotes}
          savedNotesStatus={savedNotesStatus}
          onSaveNotes={handleSaveNotes}
        />
      </div>
    </div>
  );
};
