import { useMemo, useState, useEffect } from "react";
import {
  Dashboard360Response,
  SalonFilter,
  SalonContribution,
  SALONES_CONFIG,
  Staff360,
  CashServiceSaleRecord,
  TicketRecord,
  TicketDetailRecord,
  MultiSalonRetailProduct
} from "../types";
import {
  isRetailItem,
  normalizeSaleToCashRecord,
  normalizeSaleToTicket,
  normalizeSaleToTicketDetail,
  detectBrandFromItem
} from "../utils/salesNormalizer";

export function useFilteredData(data: Dashboard360Response | null) {
  const [selectedSalon, setSelectedSalon] = useState<SalonFilter>("ALL");
  const [selectedAgent, setSelectedAgent] = useState<string>("ALL");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // 1. Filter staff list strictly based on selected salon for cascading dropdown
  const staffList = useMemo<Staff360[]>(() => {
    if (!data?.staff360) return [];
    if (selectedSalon === "ALL") return data.staff360;

    return data.staff360.filter((s) => {
      if (selectedSalon === "RD") return s.salon === "Salón RD" || s.salon === "RD";
      if (selectedSalon === "LUXURY_RD") return s.salon === "Luxury RD";
      if (selectedSalon === "GONZALES_AM") return s.salon === "Gonzales AM";
      if (selectedSalon === "GLOSS_SALON") return s.salon === "Gloss Salon";
      return true;
    });
  }, [data?.staff360, selectedSalon]);

  // 2. Cascading reset: If selected agent is not in current salon's staff list, reset to "ALL"
  useEffect(() => {
    if (selectedAgent === "ALL") return;
    const exists = staffList.some(
      (s) => s.agente.toLowerCase() === selectedAgent.toLowerCase()
    );
    if (!exists) {
      setSelectedAgent("ALL");
    }
  }, [selectedSalon, staffList, selectedAgent]);

  // 3. Filter all datasets according to selectedSalon, selectedAgent, and Date range
  const filtered = useMemo(() => {
    if (!data) return null;

    // Filter Orders (OATC Reception)
    const orders = (data.orders || []).filter((o) => {
      // Salon filter
      if (selectedSalon === "RD" && (o.sede === "Luxury RD" || o.sede === "Gloss Salon")) return false;
      if (selectedSalon === "LUXURY_RD" && o.sede !== "Luxury RD") return false;
      if (selectedSalon === "GLOSS_SALON" && o.sede !== "Gloss Salon") return false;
      if (selectedSalon === "GONZALES_AM") return false; // Gonzales AM has no OATC reception module

      // Agent filter
      if (selectedAgent !== "ALL" && o.agente.toLowerCase() !== selectedAgent.toLowerCase()) {
        return false;
      }

      // Date range
      if (startDate && o.fechaRegistro && o.fechaRegistro < startDate) return false;
      if (endDate && o.fechaRegistro && o.fechaRegistro > endDate) return false;
      return true;
    });

    // Filter Attendance
    const attendance = (data.attendance || []).filter((a) => {
      // Salon filter
      if (selectedSalon === "RD" && (a.sede === "Luxury RD" || a.sede === "Gloss Salon")) return false;
      if (selectedSalon === "LUXURY_RD" && a.sede !== "Luxury RD") return false;
      if (selectedSalon === "GLOSS_SALON" && a.sede !== "Gloss Salon") return false;
      if (selectedSalon === "GONZALES_AM") return false; // Gonzales AM has no digital attendance

      // Agent filter
      if (selectedAgent !== "ALL" && a.dependiente.toLowerCase() !== selectedAgent.toLowerCase()) {
        return false;
      }

      // Date range
      if (startDate && a.fecha && a.fecha < startDate) return false;
      if (endDate && a.fecha && a.fecha > endDate) return false;
      return true;
    });

    // Pre-normalize Multi-Sede POS sales to CashServiceSaleRecord and TicketRecord
    const normalizedLuxuryCash = (data.luxurySales || [])
      .filter((ls) => !isRetailItem(ls.item, ls.categoria))
      .map((ls) => normalizeSaleToCashRecord(ls, "Luxury RD"));

    const normalizedLuxuryTickets = (data.luxurySales || [])
      .filter((ls) => isRetailItem(ls.item, ls.categoria))
      .map((ls) => normalizeSaleToTicket(ls, "Luxury RD"));

    const normalizedLuxuryDetails = (data.luxurySales || [])
      .filter((ls) => isRetailItem(ls.item, ls.categoria))
      .map(normalizeSaleToTicketDetail);

    const normalizedGonzalesCash = (data.gonzalesSales || [])
      .filter((gs) => !isRetailItem(gs.item, gs.categoria))
      .map((gs) => normalizeSaleToCashRecord(gs, "Gonzales AM"));

    const normalizedGonzalesTickets = (data.gonzalesSales || [])
      .filter((gs) => isRetailItem(gs.item, gs.categoria))
      .map((gs) => normalizeSaleToTicket(gs, "Gonzales AM"));

    const normalizedGonzalesDetails = (data.gonzalesSales || [])
      .filter((gs) => isRetailItem(gs.item, gs.categoria))
      .map(normalizeSaleToTicketDetail);

    const normalizedGlossCash = (data.glossSales || [])
      .filter((gl) => !isRetailItem(gl.item, gl.categoria))
      .map((gl) => normalizeSaleToCashRecord(gl, "Gloss Salon"));

    const normalizedGlossTickets = (data.glossSales || [])
      .filter((gl) => isRetailItem(gl.item, gl.categoria))
      .map((gl) => normalizeSaleToTicket(gl, "Gloss Salon"));

    const normalizedGlossDetails = (data.glossSales || [])
      .filter((gl) => isRetailItem(gl.item, gl.categoria))
      .map(normalizeSaleToTicketDetail);

    const baseRdCash = (data.cashServiceSales || []).map((cs) => ({
      ...cs,
      sede: cs.sede || "Salón RD"
    }));

    const baseRdTickets = (data.tickets || []).map((t) => ({
      ...t,
      sede: t.sede || "Salón RD"
    }));

    // Universal unified collections across all salons (for Staff360View and comprehensive reporting)
    const allUnifiedCashSales = [
      ...baseRdCash,
      ...normalizedLuxuryCash,
      ...normalizedGonzalesCash,
      ...normalizedGlossCash
    ];

    const allUnifiedTickets = [
      ...baseRdTickets,
      ...normalizedLuxuryTickets,
      ...normalizedGonzalesTickets,
      ...normalizedGlossTickets
    ];

    const allUnifiedTicketDetails = [
      ...(data.ticketDetails || []),
      ...normalizedLuxuryDetails,
      ...normalizedGonzalesDetails,
      ...normalizedGlossDetails
    ];

    // Filter Tickets based on selectedSalon
    let targetTicketPool: TicketRecord[] = [];
    if (selectedSalon === "ALL") targetTicketPool = allUnifiedTickets;
    else if (selectedSalon === "RD") targetTicketPool = baseRdTickets;
    else if (selectedSalon === "LUXURY_RD") targetTicketPool = normalizedLuxuryTickets;
    else if (selectedSalon === "GONZALES_AM") targetTicketPool = normalizedGonzalesTickets;
    else if (selectedSalon === "GLOSS_SALON") targetTicketPool = normalizedGlossTickets;

    const tickets = targetTicketPool.filter((t) => {
      if (selectedAgent !== "ALL") {
        const agentNorm = selectedAgent.toLowerCase().trim();
        const asesorNorm = (t.asesor || "").toLowerCase().trim();
        if (asesorNorm !== agentNorm && !asesorNorm.includes(agentNorm) && !agentNorm.includes(asesorNorm)) {
          return false;
        }
      }
      if (startDate && t.fecha && t.fecha < startDate) return false;
      if (endDate && t.fecha && t.fecha > endDate) return false;
      return true;
    });

    // Filter Settlements (Salón RD Admin)
    const settlements = (selectedSalon === "RD" || selectedSalon === "ALL")
      ? (data.settlements || []).filter((s) => {
          if (selectedAgent !== "ALL" && s.agente.toLowerCase() !== selectedAgent.toLowerCase()) {
            return false;
          }
          if (startDate && s.fechaSolicitud && s.fechaSolicitud < startDate) return false;
          if (endDate && s.fechaSolicitud && s.fechaSolicitud > endDate) return false;
          return true;
        })
      : [];

    // Filter Cash Service Sales based on selectedSalon
    let targetCashPool: CashServiceSaleRecord[] = [];
    if (selectedSalon === "ALL") targetCashPool = allUnifiedCashSales;
    else if (selectedSalon === "RD") targetCashPool = baseRdCash;
    else if (selectedSalon === "LUXURY_RD") targetCashPool = normalizedLuxuryCash;
    else if (selectedSalon === "GONZALES_AM") targetCashPool = normalizedGonzalesCash;
    else if (selectedSalon === "GLOSS_SALON") targetCashPool = normalizedGlossCash;

    const cashServiceSales = targetCashPool.filter((cs) => {
      if (selectedAgent !== "ALL") {
        const agentNorm = selectedAgent.toLowerCase().trim();
        const csAgentNorm = (cs.agente || "").toLowerCase().trim();
        if (csAgentNorm !== agentNorm && !csAgentNorm.includes(agentNorm) && !agentNorm.includes(csAgentNorm)) {
          return false;
        }
      }
      if (startDate && cs.fecha && cs.fecha < startDate) return false;
      if (endDate && cs.fecha && cs.fecha > endDate) return false;
      return true;
    });

    // Filter Luxury Sales (Luxury RD POS)
    const luxurySales = (selectedSalon === "LUXURY_RD" || selectedSalon === "ALL")
      ? (data.luxurySales || []).filter((ls) => {
          if (selectedAgent !== "ALL") {
            const agentNorm = selectedAgent.toLowerCase().trim();
            const estNorm = (ls.estilista || "").toLowerCase().trim();
            if (estNorm !== agentNorm && !agentNorm.includes(estNorm) && !estNorm.includes(agentNorm)) {
              return false;
            }
          }
          if (startDate && ls.fecha && ls.fecha < startDate) return false;
          if (endDate && ls.fecha && ls.fecha > endDate) return false;
          return true;
        })
      : [];

    // Filter Gonzales Sales (Gonzales AM POS)
    const gonzalesSales = (selectedSalon === "GONZALES_AM" || selectedSalon === "ALL")
      ? (data.gonzalesSales || []).filter((gs) => {
          if (selectedAgent !== "ALL") {
            const agentNorm = selectedAgent.toLowerCase().trim();
            const estNorm = (gs.estilista || "").toLowerCase().trim();
            if (estNorm !== agentNorm && !agentNorm.includes(estNorm) && !estNorm.includes(agentNorm)) {
              return false;
            }
          }
          if (startDate && gs.fecha && gs.fecha < startDate) return false;
          if (endDate && gs.fecha && gs.fecha > endDate) return false;
          return true;
        })
      : [];

    // Filter Gloss Sales (Gloss Salon POS)
    const glossSales = (selectedSalon === "GLOSS_SALON" || selectedSalon === "ALL")
      ? (data.glossSales || []).filter((gl) => {
          if (selectedAgent !== "ALL") {
            const agentNorm = selectedAgent.toLowerCase().trim();
            const estNorm = (gl.estilista || "").toLowerCase().trim();
            if (estNorm !== agentNorm && !agentNorm.includes(estNorm) && !estNorm.includes(agentNorm)) {
              return false;
            }
          }
          if (startDate && gl.fecha && gl.fecha < startDate) return false;
          if (endDate && gl.fecha && gl.fecha > endDate) return false;
          return true;
        })
      : [];

    // Filter Staff 360 rows
    const staff360 = staffList.filter((s) => {
      if (selectedAgent !== "ALL" && s.agente.toLowerCase() !== selectedAgent.toLowerCase()) {
        return false;
      }
      return true;
    });

    // Filter Clients
    const clients = (data.clients || []).filter((c) => {
      if (selectedSalon === "RD" && c.sede && c.sede !== "Salón RD" && c.sede !== "RD") return false;
      if (selectedSalon === "LUXURY_RD" && c.sede !== "Luxury RD") return false;
      if (selectedSalon === "GONZALES_AM" && c.sede !== "Gonzales AM") return false;
      if (selectedSalon === "GLOSS_SALON" && c.sede !== "Gloss Salon") return false;
      return true;
    });

    // 4. Multi-Salon Financial & Operational Calculations
    // Salón RD
    const isDateInRange = (dateStr?: string) => {
      if (!dateStr) return true;
      if (startDate && dateStr < startDate) return false;
      if (endDate && dateStr > endDate) return false;
      return true;
    };
    const matchesAgent = (name?: string) => {
      if (selectedAgent === "ALL") return true;
      if (!name) return false;
      const aNorm = selectedAgent.toLowerCase().trim();
      const nNorm = name.toLowerCase().trim();
      return nNorm === aNorm || nNorm.includes(aNorm) || aNorm.includes(nNorm);
    };

    const rdValidTickets = (data.tickets || []).filter((t) => t.estado !== "ANULADO" && isDateInRange(t.fecha) && matchesAgent(t.asesor));
    const rdRetailFacturado = rdValidTickets.reduce((acc, t) => acc + t.total, 0);
    const rdFilteredCash = baseRdCash.filter((cs) => isDateInRange(cs.fecha) && matchesAgent(cs.agente));
    const rdServiciosFacturado = rdFilteredCash.reduce((acc, cs) => acc + cs.montoFinal, 0);
    const rdServiciosComisiones = rdFilteredCash.reduce((acc, cs) => acc + cs.comision, 0);

    // Luxury RD
    let luxuryServiciosFacturado = 0;
    let luxuryServiciosComision = 0;
    let luxuryRetailFacturado = 0;
    let luxuryServiciosCount = 0;
    luxurySales.forEach((ls) => {
      if (isRetailItem(ls.item, ls.categoria)) {
        luxuryRetailFacturado += ls.importe;
      } else {
        luxuryServiciosFacturado += ls.importe;
        luxuryServiciosComision += ls.importe * 0.40;
        luxuryServiciosCount += ls.cantidad;
      }
    });

    // Gonzales AM
    let gonzalesServiciosFacturado = 0;
    let gonzalesServiciosComision = 0;
    let gonzalesRetailFacturado = 0;
    let gonzalesServiciosCount = 0;
    gonzalesSales.forEach((gs) => {
      if (isRetailItem(gs.item, gs.categoria)) {
        gonzalesRetailFacturado += gs.importe;
      } else {
        gonzalesServiciosFacturado += gs.importe;
        gonzalesServiciosComision += gs.importe * 0.40;
        gonzalesServiciosCount += gs.cantidad;
      }
    });

    // Gloss Salon
    let glossServiciosFacturado = 0;
    let glossServiciosComision = 0;
    let glossRetailFacturado = 0;
    let glossServiciosCount = 0;
    glossSales.forEach((gl) => {
      if (isRetailItem(gl.item, gl.categoria)) {
        glossRetailFacturado += gl.importe;
      } else {
        glossServiciosFacturado += gl.importe;
        glossServiciosComision += gl.importe * 0.40;
        glossServiciosCount += gl.cantidad;
      }
    });

    // Consolidated or Selected KPI aggregation
    let totalServiciosFacturado = 0;
    let totalComisionesServicios = 0;
    let totalRetail = 0;
    let totalTransacciones = 0;

    if (selectedSalon === "ALL") {
      totalServiciosFacturado = rdServiciosFacturado + luxuryServiciosFacturado + gonzalesServiciosFacturado + glossServiciosFacturado;
      totalComisionesServicios = rdServiciosComisiones + luxuryServiciosComision + gonzalesServiciosComision + glossServiciosComision;
      totalRetail = rdRetailFacturado + luxuryRetailFacturado + gonzalesRetailFacturado + glossRetailFacturado;
      totalTransacciones = rdValidTickets.length + luxurySales.length + gonzalesSales.length + glossSales.length;
    } else if (selectedSalon === "RD") {
      totalServiciosFacturado = rdServiciosFacturado;
      totalComisionesServicios = rdServiciosComisiones;
      totalRetail = rdRetailFacturado;
      totalTransacciones = rdValidTickets.length;
    } else if (selectedSalon === "LUXURY_RD") {
      totalServiciosFacturado = luxuryServiciosFacturado;
      totalComisionesServicios = luxuryServiciosComision;
      totalRetail = luxuryRetailFacturado;
      totalTransacciones = luxurySales.length;
    } else if (selectedSalon === "GONZALES_AM") {
      totalServiciosFacturado = gonzalesServiciosFacturado;
      totalComisionesServicios = gonzalesServiciosComision;
      totalRetail = gonzalesRetailFacturado;
      totalTransacciones = gonzalesSales.length;
    } else if (selectedSalon === "GLOSS_SALON") {
      totalServiciosFacturado = glossServiciosFacturado;
      totalComisionesServicios = glossServiciosComision;
      totalRetail = glossRetailFacturado;
      totalTransacciones = glossSales.length;
    }

    const facturacionGlobal = totalServiciosFacturado + totalRetail;
    const margenBrutoGlobal = (totalServiciosFacturado - totalComisionesServicios) + (totalRetail * 0.45);
    const margenBrutoGlobalPct = facturacionGlobal > 0 ? Math.round((margenBrutoGlobal / facturacionGlobal) * 100) : 0;

    // Services & Cancellations
    let totalServicios = orders.filter((o) => !o.isCancelled).length;
    if (selectedSalon === "GONZALES_AM") {
      totalServicios = gonzalesServiciosCount;
    } else if (selectedSalon === "ALL") {
      totalServicios += gonzalesServiciosCount;
    }

    const cancelados = orders.filter((o) => o.isCancelled).length;
    const cancelRate = orders.length > 0 ? Math.round((cancelados / orders.length) * 1000) / 10 : 0;

    const avgTicket = totalTransacciones > 0 ? Math.round((facturacionGlobal / totalTransacciones) * 100) / 100 : 0;

    const comisionesPagadas = settlements.reduce(
      (acc, s) => (s.estado === "Pagado" ? acc + s.montoPagar : acc),
      0
    );
    const comisionesPendientes = settlements.reduce(
      (acc, s) => (s.estado === "Pendiente" ? acc + s.montoPagar : acc),
      0
    );
    const totalHoras = attendance.reduce((acc, a) => acc + a.horasTrabajadas, 0);

    // 5. Build Multi-Sede Contribution Breakdown (authoritative full figures for executive overview)
    const benchmark = data.multiBranchBenchmark?.branches;
    const rdBranchFacturado = benchmark?.RD?.totalFacturado ?? (rdServiciosFacturado + rdRetailFacturado);
    const luxuryBranchFacturado = benchmark?.LUXURY_RD?.totalFacturado ?? (luxuryServiciosFacturado + luxuryRetailFacturado);
    const gonzalesBranchFacturado = benchmark?.GONZALES_AM?.totalFacturado ?? (gonzalesServiciosFacturado + gonzalesRetailFacturado);
    const glossBranchFacturado = benchmark?.GLOSS_SALON?.totalFacturado ?? (glossServiciosFacturado + glossRetailFacturado);
    const totalConsolidado = rdBranchFacturado + luxuryBranchFacturado + gonzalesBranchFacturado + glossBranchFacturado;

    const salonBreakdown: SalonContribution[] = [
      {
        salonId: "RD",
        nombre: SALONES_CONFIG.RD.nombre,
        totalFacturado: rdBranchFacturado,
        totalTransacciones: benchmark?.RD?.totalTransacciones ?? rdValidTickets.length,
        totalServicios: benchmark?.RD?.totalServicios ?? rdServiciosFacturado,
        ticketPromedio: benchmark?.RD?.ticketPromedio ?? (rdValidTickets.length > 0 ? Math.round((rdBranchFacturado / rdValidTickets.length) * 100) / 100 : 0),
        sharePct: totalConsolidado > 0 ? Math.round((rdBranchFacturado / totalConsolidado) * 1000) / 10 : 0,
        color: SALONES_CONFIG.RD.color,
        badge: SALONES_CONFIG.RD.badge
      },
      {
        salonId: "LUXURY_RD",
        nombre: SALONES_CONFIG.LUXURY_RD.nombre,
        totalFacturado: luxuryBranchFacturado,
        totalTransacciones: benchmark?.LUXURY_RD?.totalTransacciones ?? luxurySales.length,
        totalServicios: benchmark?.LUXURY_RD?.totalServicios ?? luxuryServiciosCount,
        ticketPromedio: benchmark?.LUXURY_RD?.ticketPromedio ?? (luxurySales.length > 0 ? Math.round((luxuryBranchFacturado / luxurySales.length) * 100) / 100 : 0),
        sharePct: totalConsolidado > 0 ? Math.round((luxuryBranchFacturado / totalConsolidado) * 1000) / 10 : 0,
        color: SALONES_CONFIG.LUXURY_RD.color,
        badge: SALONES_CONFIG.LUXURY_RD.badge
      },
      {
        salonId: "GONZALES_AM",
        nombre: SALONES_CONFIG.GONZALES_AM.nombre,
        totalFacturado: gonzalesBranchFacturado,
        totalTransacciones: benchmark?.GONZALES_AM?.totalTransacciones ?? gonzalesSales.length,
        totalServicios: benchmark?.GONZALES_AM?.totalServicios ?? gonzalesServiciosCount,
        ticketPromedio: benchmark?.GONZALES_AM?.ticketPromedio ?? (gonzalesSales.length > 0 ? Math.round((gonzalesBranchFacturado / gonzalesSales.length) * 100) / 100 : 0),
        sharePct: totalConsolidado > 0 ? Math.round((gonzalesBranchFacturado / totalConsolidado) * 1000) / 10 : 0,
        color: SALONES_CONFIG.GONZALES_AM.color,
        badge: SALONES_CONFIG.GONZALES_AM.badge
      },
      {
        salonId: "GLOSS_SALON",
        nombre: SALONES_CONFIG.GLOSS_SALON.nombre,
        totalFacturado: glossBranchFacturado,
        totalTransacciones: benchmark?.GLOSS_SALON?.totalTransacciones ?? glossSales.length,
        totalServicios: benchmark?.GLOSS_SALON?.totalServicios ?? glossServiciosCount,
        ticketPromedio: benchmark?.GLOSS_SALON?.ticketPromedio ?? (glossSales.length > 0 ? Math.round((glossBranchFacturado / glossSales.length) * 100) / 100 : 0),
        sharePct: totalConsolidado > 0 ? Math.round((glossBranchFacturado / totalConsolidado) * 1000) / 10 : 0,
        color: SALONES_CONFIG.GLOSS_SALON.color,
        badge: SALONES_CONFIG.GLOSS_SALON.badge
      }
    ];

    // Filter Ticket Details matching filtered tickets
    const filteredTicketSet = new Set(tickets.map((t) => t.ticket));
    const ticketDetails = allUnifiedTicketDetails.filter((td) => filteredTicketSet.has(td.ticket));

    // Multi-Salon Retail Products Ranking across 4 salons
    const productMap = new Map<string, {
      producto: string;
      marca: string;
      unidades: number;
      ingresoTotal: number;
      sedes: Set<string>;
    }>();

    ticketDetails.forEach((td) => {
      const prodName = td.producto || "Producto Varios";
      const brand = td.marca || detectBrandFromItem(prodName);
      const existing = productMap.get(prodName) || {
        producto: prodName,
        marca: brand,
        unidades: 0,
        ingresoTotal: 0,
        sedes: new Set<string>()
      };
      existing.unidades += td.cantidad || 1;
      existing.ingresoTotal += td.subtotal || 0;
      if (brand && brand !== "OTRAS MARCAS RETAIL" && existing.marca === "OTRAS MARCAS RETAIL") {
        existing.marca = brand;
      }
      const t = tickets.find((tk) => tk.ticket === td.ticket);
      if (t?.sede) existing.sedes.add(t.sede);
      else existing.sedes.add("Salón RD");
      productMap.set(prodName, existing);
    });

    const multiSalonRetailProducts: MultiSalonRetailProduct[] = Array.from(productMap.values())
      .map((p) => ({
        producto: p.producto,
        marca: p.marca,
        unidades: p.unidades,
        ingresoTotal: Math.round(p.ingresoTotal * 100) / 100,
        precioPromedio: p.unidades > 0 ? Math.round((p.ingresoTotal / p.unidades) * 100) / 100 : 0,
        sedes: Array.from(p.sedes)
      }))
      .sort((a, b) => b.ingresoTotal - a.ingresoTotal);

    return {
      orders,
      tickets,
      attendance,
      settlements,
      cashServiceSales,
      allUnifiedCashSales,
      allUnifiedTickets,
      allUnifiedTicketDetails,
      multiSalonRetailProducts,
      luxurySales,
      gonzalesSales,
      glossSales,
      kardex: data.kardex,
      ticketDetails,
      staff360,
      productRankings: data.productRankings,
      brandPortfolioMetrics: data.brandPortfolioMetrics,
      serviceCategoryRankings: data.serviceCategoryRankings,
      clients,
      metadata: data.metadata,
      salonBreakdown,
      dynamicKPIs: {
        facturacionGlobal: Math.round(facturacionGlobal * 100) / 100,
        totalServiciosFacturado: Math.round(totalServiciosFacturado * 100) / 100,
        totalComisionesServicios: Math.round(totalComisionesServicios * 100) / 100,
        totalRetail: Math.round(totalRetail * 100) / 100,
        margenBrutoGlobal: Math.round(margenBrutoGlobal * 100) / 100,
        margenBrutoGlobalPct,
        ticketsCount: totalTransacciones,
        avgTicket,
        totalServicios,
        cancelados,
        cancelRate,
        comisionesPagadas: Math.round(comisionesPagadas * 100) / 100,
        comisionesPendientes: Math.round(comisionesPendientes * 100) / 100,
        totalHoras: Math.round(totalHoras * 10) / 10
      }
    };
  }, [data, selectedSalon, selectedAgent, startDate, endDate, staffList]);

  const clearFilters = () => {
    setSelectedSalon("ALL");
    setSelectedAgent("ALL");
    setStartDate("");
    setEndDate("");
    setSearchTerm("");
  };

  return {
    filtered,
    selectedSalon,
    setSelectedSalon,
    selectedAgent,
    setSelectedAgent,
    staffList,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    searchTerm,
    setSearchTerm,
    clearFilters
  };
}
