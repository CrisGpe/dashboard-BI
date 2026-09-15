import {
  Staff360,
  AgentMaster,
  OatcRecord,
  CashServiceSaleRecord,
  TicketRecord,
  TicketDetailRecord,
  SettlementRecord,
  AttendanceRecord
} from "../../types.js";
import { parseSafeNumber } from "../parsers/dataParsers.js";
import { classifyStandardCategory } from "../parsers/categoryClassifier.js";

export function buildStaff360(
  agents: AgentMaster[],
  agentByCanonical: Map<string, AgentMaster>,
  orders: OatcRecord[],
  cashServiceSales: CashServiceSaleRecord[],
  tickets: TicketRecord[],
  ticketDetails: TicketDetailRecord[],
  settlements: SettlementRecord[],
  attendance: AttendanceRecord[],
  ventasLuxuryRaw: any[][] = [],
  ventasGlossRaw: any[][] = [],
  ventasGonzalesRaw: any[][] = [],
  ticketMap: Map<string, TicketRecord>,
  resolveAgentName: (raw: string) => string
): Staff360[] {
  const luxuryStylistsSet = new Set<string>();
  const glossStylistsSet = new Set<string>();
  const gonzalesStylistsSet = new Set<string>();

  // Cross-Selling Analytics & Staff 360 Aggregation
  const oatcServiceVisits = new Map<string, string[]>();
  orders.forEach((o) => {
    if (o.isCancelled || !o.fechaRegistro) return;
    const clientNorm = o.clienteNombre.trim().toLowerCase();
    if (!clientNorm || clientNorm.includes("desconocid") || clientNorm === "cliente") return;
    const key = `${o.fechaRegistro}_${clientNorm}`;
    const existing = oatcServiceVisits.get(key) || [];
    if (!existing.includes(o.agente)) existing.push(o.agente);
    oatcServiceVisits.set(key, existing);
  });

  const agentAggMap = new Map<
    string,
    {
      serviciosTotal: number;
      serviciosCancelados: number;
      rechazosReales: number;
      erroresRegistro: number;
      serviciosMap: Map<string, number>;
      facturadoServiciosTotal: number;
      comisionesServiciosTotal: number;
      serviciosCobradosCount: number;
      ventasRetailTotal: number;
      cantidadProductos: number;
      costoRetailTotal: number;
      ticketCount: number;
      liquidadoTotal: number;
      pendienteTotal: number;
      asistenciasCount: number;
      horasTrabajadasTotal: number;
      crossSellCount: number;
    }
  >();

  const getOrCreateAgentAgg = (agente: string) => {
    let agg = agentAggMap.get(agente);
    if (!agg) {
      agg = {
        serviciosTotal: 0,
        serviciosCancelados: 0,
        rechazosReales: 0,
        erroresRegistro: 0,
        serviciosMap: new Map(),
        facturadoServiciosTotal: 0,
        comisionesServiciosTotal: 0,
        serviciosCobradosCount: 0,
        ventasRetailTotal: 0,
        cantidadProductos: 0,
        costoRetailTotal: 0,
        ticketCount: 0,
        liquidadoTotal: 0,
        pendienteTotal: 0,
        asistenciasCount: 0,
        horasTrabajadasTotal: 0,
        crossSellCount: 0
      };
      agentAggMap.set(agente, agg);
    }
    return agg;
  };

  // 1. Orders -> Agent
  orders.forEach((o) => {
    const agg = getOrCreateAgentAgg(o.agente);
    if (o.isCancelled) {
      agg.serviciosCancelados++;
      if (o.macroCategoria === "RECHAZO_CLIENTE") {
        agg.rechazosReales++;
      } else {
        agg.erroresRegistro++;
      }
    } else {
      if (o.sede !== "Luxury RD") {
        agg.serviciosTotal++;
        const sCount = agg.serviciosMap.get(o.tipoOatc) || 0;
        agg.serviciosMap.set(o.tipoOatc, sCount + 1);
      }
    }
  });

  // 2. Cash Service Sales -> Agent (Salón RD)
  cashServiceSales.forEach((cs) => {
    const agg = getOrCreateAgentAgg(cs.agente);
    agg.facturadoServiciosTotal += cs.montoFinal;
    agg.comisionesServiciosTotal += cs.comision;
    agg.serviciosCobradosCount++;
  });

  // 3. Tickets -> Agent (as Asesor)
  tickets.forEach((t) => {
    if (t.estado === "ANULADO") return;
    const agg = getOrCreateAgentAgg(t.asesor);
    agg.ventasRetailTotal += t.total;
    agg.ticketCount++;

    if (t.fecha) {
      const clientNorm = t.clienteNombreLimpio.trim().toLowerCase();
      const key = `${t.fecha}_${clientNorm}`;
      const stylists = oatcServiceVisits.get(key);
      if (stylists && stylists.length > 0) {
        agg.crossSellCount++;
      }
    }
  });

  // 4. Ticket Details -> Quantity & Cost
  ticketDetails.forEach((td) => {
    const ticket = ticketMap.get(td.ticket);
    if (ticket && ticket.estado !== "ANULADO") {
      const agg = getOrCreateAgentAgg(ticket.asesor);
      agg.cantidadProductos += td.cantidad;
      if (td.costoUnitario) {
        agg.costoRetailTotal += td.cantidad * td.costoUnitario;
      }
    }
  });

  // 5. Settlements -> Agent
  settlements.forEach((s) => {
    const agg = getOrCreateAgentAgg(s.agente);
    if (s.estado === "Pagado") {
      agg.liquidadoTotal += s.montoPagar;
    } else {
      agg.pendienteTotal += s.montoPagar;
    }
  });

  // 6. Attendance -> Agent
  attendance.forEach((a) => {
    const agg = getOrCreateAgentAgg(a.dependiente);
    agg.asistenciasCount++;
    agg.horasTrabajadasTotal += a.horasTrabajadas;
  });

  // 7. Process Luxury RD Sales -> Agent
  ventasLuxuryRaw.forEach((row) => {
    const rawItem = String(row[6] || "").trim();
    if (!rawItem || rawItem === "Producto / Servicio") return;
    const rawEstilista = String(row[5] || "Sin Asignar").trim();
    if (!rawEstilista || rawEstilista === "Sin Asignar" || rawEstilista.toLowerCase().includes("varios")) return;

    const agente = resolveAgentName(rawEstilista);
    luxuryStylistsSet.add(agente);
    const cantidad = parseSafeNumber(row[7]) || 1;
    const importe = parseSafeNumber(row[8]) || 0;
    const categoria = classifyStandardCategory(rawItem);

    const agg = getOrCreateAgentAgg(agente);
    const isRetail =
      categoria === "Otros Servicios / Retail" ||
      /\b\d*\s*ml\b/i.test(rawItem) ||
      /\bml\b/i.test(rawItem) ||
      /\b\d+\s*(gr|g|oz|kg|lt|l)\b/i.test(rawItem);

    if (isRetail) {
      agg.ventasRetailTotal += importe;
      agg.cantidadProductos += cantidad;
      agg.ticketCount++;
      agg.costoRetailTotal += importe * 0.5;
    } else {
      agg.facturadoServiciosTotal += importe;
      agg.comisionesServiciosTotal += importe * 0.40;
      agg.serviciosCobradosCount += cantidad;
      agg.serviciosTotal += cantidad;
      const sCount = agg.serviciosMap.get(categoria) || 0;
      agg.serviciosMap.set(categoria, sCount + cantidad);
    }
  });

  // 8. Process Gloss Salon Sales -> Agent (reactive when populated)
  if (ventasGlossRaw && ventasGlossRaw.length > 0) {
    ventasGlossRaw.forEach((row) => {
      const rawItem = String(row[6] || "").trim();
      if (!rawItem || rawItem === "Producto / Servicio") return;
      const rawEstilista = String(row[5] || "Sin Asignar").trim();
      if (!rawEstilista || rawEstilista === "Sin Asignar" || rawEstilista.toLowerCase().includes("varios")) return;

      const agente = resolveAgentName(rawEstilista);
      glossStylistsSet.add(agente);
      const cantidad = parseSafeNumber(row[7]) || 1;
      const importe = parseSafeNumber(row[8]) || 0;
      const categoria = classifyStandardCategory(rawItem);

      const agg = getOrCreateAgentAgg(agente);
      const isRetail =
        categoria === "Otros Servicios / Retail" ||
        /\b\d*\s*ml\b/i.test(rawItem) ||
        /\bml\b/i.test(rawItem) ||
        /\b\d+\s*(gr|g|oz|kg|lt|l)\b/i.test(rawItem);

      if (isRetail) {
        agg.ventasRetailTotal += importe;
        agg.cantidadProductos += cantidad;
        agg.ticketCount++;
        agg.costoRetailTotal += importe * 0.5;
      } else {
        agg.facturadoServiciosTotal += importe;
        agg.comisionesServiciosTotal += importe * 0.40;
        agg.serviciosCobradosCount += cantidad;
        agg.serviciosTotal += cantidad;
        const sCount = agg.serviciosMap.get(categoria) || 0;
        agg.serviciosMap.set(categoria, sCount + cantidad);
      }
    });
  }

  // 9. Process Gonzales AM Sales -> Agent (POS receipts)
  if (ventasGonzalesRaw && ventasGonzalesRaw.length > 0) {
    ventasGonzalesRaw.forEach((row) => {
      const rawItem = String(row[6] || "").trim();
      if (!rawItem || rawItem === "Producto / Servicio") return;
      const rawEstilista = String(row[5] || "Sin Asignar").trim();
      if (!rawEstilista || rawEstilista === "Sin Asignar" || rawEstilista.toLowerCase().includes("varios")) return;

      const agente = resolveAgentName(rawEstilista);
      gonzalesStylistsSet.add(agente);
      const cantidad = parseSafeNumber(row[7]) || 1;
      const importe = parseSafeNumber(row[8]) || 0;
      const categoria = classifyStandardCategory(rawItem);

      const agg = getOrCreateAgentAgg(agente);
      const isRetail =
        categoria === "Otros Servicios / Retail" ||
        /\b\d*\s*ml\b/i.test(rawItem) ||
        /\bml\b/i.test(rawItem) ||
        /\b\d+\s*(gr|g|oz|kg|lt|l)\b/i.test(rawItem);

      if (isRetail) {
        agg.ventasRetailTotal += importe;
        agg.cantidadProductos += cantidad;
        agg.ticketCount++;
        agg.costoRetailTotal += importe * 0.5;
      } else {
        agg.facturadoServiciosTotal += importe;
        agg.comisionesServiciosTotal += importe * 0.40;
        agg.serviciosCobradosCount += cantidad;
        agg.serviciosTotal += cantidad;
        const sCount = agg.serviciosMap.get(categoria) || 0;
        agg.serviciosMap.set(categoria, sCount + cantidad);
      }
    });
  }

  // Build Staff 360 array
  const allAgentNames = new Set([
    ...agents.map((a) => a.nombre),
    ...Array.from(agentAggMap.keys())
  ]);

  return Array.from(allAgentNames)
    .filter((name) => name !== "Sin asignar" && name.length > 2)
    .map((name) => {
      const master = agentByCanonical.get(name);
      const agg = agentAggMap.get(name) || {
        serviciosTotal: 0,
        serviciosCancelados: 0,
        rechazosReales: 0,
        erroresRegistro: 0,
        serviciosMap: new Map(),
        facturadoServiciosTotal: 0,
        comisionesServiciosTotal: 0,
        serviciosCobradosCount: 0,
        ventasRetailTotal: 0,
        cantidadProductos: 0,
        costoRetailTotal: 0,
        ticketCount: 0,
        liquidadoTotal: 0,
        pendienteTotal: 0,
        asistenciasCount: 0,
        horasTrabajadasTotal: 0,
        crossSellCount: 0
      };

      const serviciosTop = Array.from(agg.serviciosMap.entries())
        .map(([servicio, count]) => ({ servicio, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const ticketPromedioRetail =
        agg.ticketCount > 0 ? Math.round((agg.ventasRetailTotal / agg.ticketCount) * 100) / 100 : 0;
      const ticketPromedioServicio =
        agg.serviciosCobradosCount > 0
          ? Math.round((agg.facturadoServiciosTotal / agg.serviciosCobradosCount) * 100) / 100
          : 0;

      const serviciosPorHora =
        agg.horasTrabajadasTotal > 0
          ? Math.round((agg.serviciosTotal / agg.horasTrabajadasTotal) * 100) / 100
          : 0;

      const facturacionTotalColaborador = agg.facturadoServiciosTotal + agg.ventasRetailTotal;
      const facturacionPorHora =
        agg.horasTrabajadasTotal > 0
          ? Math.round((facturacionTotalColaborador / agg.horasTrabajadasTotal) * 100) / 100
          : 0;

      const margenServicios = agg.facturadoServiciosTotal - agg.comisionesServiciosTotal;
      const margenRetail = agg.ventasRetailTotal - agg.costoRetailTotal;
      const margenAportadoEmpresa = Math.round((margenServicios + margenRetail) * 100) / 100;

      const crossSellRate =
        agg.serviciosTotal > 0
          ? Math.round((agg.crossSellCount / agg.serviciosTotal) * 1000) / 10
          : 0;

      const oportunidades = agg.serviciosTotal + agg.rechazosReales;
      const ratioBateo =
        oportunidades > 0
          ? Math.round((agg.serviciosTotal / oportunidades) * 1000) / 10
          : 100;

      let salon = "Salón RD";
      if (master?.salon === "Luxury RD" || (!master && luxuryStylistsSet.has(name))) {
        salon = "Luxury RD";
      } else if (master?.salon === "Gloss Salon" || (!master && glossStylistsSet.has(name))) {
        salon = "Gloss Salon";
      } else if (master?.salon === "Gonzales AM" || (!master && gonzalesStylistsSet.has(name))) {
        salon = "Gonzales AM";
      } else if (master?.salon === "RD" || master?.salon === "Salón RD") {
        salon = "Salón RD";
      }

      return {
        agente: name,
        salon,
        especialidad: master?.especialidad || "Estilismo",
        estado: master?.estado || "Activo",
        hrEntrada: master?.hrEntrada || "-",
        hrSalida: master?.hrSalida || "-",
        diaDescanso: master?.diaDescanso || "-",
        totalServicios: agg.serviciosTotal,
        serviciosCancelados: agg.serviciosCancelados,
        rechazosReales: agg.rechazosReales,
        erroresRegistro: agg.erroresRegistro,
        ratioBateo,
        serviciosTop,
        totalFacturadoServicios: Math.round(agg.facturadoServiciosTotal * 100) / 100,
        totalComisionesServicios: Math.round(agg.comisionesServiciosTotal * 100) / 100,
        ticketPromedioServicio,
        totalVentasRetail: Math.round(agg.ventasRetailTotal * 100) / 100,
        cantidadProductosVendidos: agg.cantidadProductos,
        ticketPromedioRetail,
        margenAportadoEmpresa,
        facturacionPorHora,
        totalLiquidado: Math.round(agg.liquidadoTotal * 100) / 100,
        totalPendienteLiquidacion: Math.round(agg.pendienteTotal * 100) / 100,
        diasAsistidos: agg.asistenciasCount,
        horasTotalesTrabajadas: Math.round(agg.horasTrabajadasTotal * 10) / 10,
        serviciosPorHora,
        crossSellCount: agg.crossSellCount,
        crossSellRate
      };
    })
    .sort((a, b) => b.totalFacturadoServicios + b.totalVentasRetail - (a.totalFacturadoServicios + a.totalVentasRetail));
}
