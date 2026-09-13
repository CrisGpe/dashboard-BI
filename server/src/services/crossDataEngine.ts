import {
  AgentMaster,
  SettlementRecord,
  OatcRecord,
  AttendanceRecord,
  TicketRecord,
  TicketDetailRecord,
  KardexRecord,
  CashServiceSaleRecord,
  ServiceCategoryMetric,
  Staff360,
  ProductMarginRanking,
  BrandPortfolioMetric,
  UnifiedClient,
  ExecutiveKPIs,
  GonzalesSaleRecord,
  MultiBranchBenchmark,
  OatcCategoryMetric,
  SpecificPortfolioItemMetric
} from "../types.js";

// Re-export common parsers and helpers for backwards compatibility
export {
  parseExcelDateToIso,
  extractHourFromRawDate,
  parseExcelTime,
  parseSafeNumber,
  cleanAgentName,
  cleanClientName,
  parseClientField,
  getDayOfWeek,
  ORDERED_DAYS,
  DAY_SHORT_LABELS
} from "./parsers/dataParsers.js";
export { classifyStandardCategory, STANDARD_CATEGORIES } from "./parsers/categoryClassifier.js";

// Subdomain engines
import { buildAgentRegistry } from "./parsers/rosettaStone.js";
import { processSettlements } from "./staff/settlementEngine.js";
import { processOrdersAndCancellations } from "./operations/cancellationEngine.js";
import { processAttendance } from "./staff/attendanceEngine.js";
import { processRetailAndInventory } from "./retail/retailEngine.js";
import { processCashAndPortfolio } from "./retail/portfolioEngine.js";
import { buildStaff360 } from "./staff/staff360Engine.js";
import { processUnifiedClients } from "./crm/crmEngine.js";
import { buildMultiBranchBenchmark } from "./benchmark/benchmarkEngine.js";

export class CrossDataEngine {
  public static processRawSources(
    agentesRaw: any[][],
    liquidacionesRaw: any[][],
    oatcRaw: any[][],
    borradorRaw: any[][],
    asistenciaRaw: any[][],
    ticketsRaw: any[][],
    ventasDetalleRaw: any[][],
    kardexRaw: any[][],
    ventasCajaRaw: any[][] = [],
    productosCatalogoRaw: any[][] = [],
    ventasGonzalesRaw: any[][] = [],
    ventasLuxuryRaw: any[][] = [],
    oatcLuxuryRaw: any[][] = [],
    asistenciaLuxuryRaw: any[][] = [],
    agentesLuxuryRaw: any[][] = [],
    clientesLuxuryRaw: any[][] = [],
    ventasGlossRaw: any[][] = [],
    oatcGlossRaw: any[][] = [],
    asistenciaGlossRaw: any[][] = [],
    agentesGlossRaw: any[][] = [],
    clientesGlossRaw: any[][] = [],
    borradorGlossRaw: any[][] = []
  ): {
    agents: AgentMaster[];
    settlements: SettlementRecord[];
    orders: OatcRecord[];
    attendance: AttendanceRecord[];
    tickets: TicketRecord[];
    ticketDetails: TicketDetailRecord[];
    kardex: KardexRecord[];
    cashServiceSales: CashServiceSaleRecord[];
    serviceCategoryRankings: ServiceCategoryMetric[];
    oatcCategoryMetrics: OatcCategoryMetric[];
    specificPortfolioRankings: SpecificPortfolioItemMetric[];
    staff360: Staff360[];
    productRankings: ProductMarginRanking[];
    clients: UnifiedClient[];
    executiveKPIs: ExecutiveKPIs;
    brandPortfolioMetrics: BrandPortfolioMetric[];
    multiBranchBenchmark: MultiBranchBenchmark;
    gonzalesSales: GonzalesSaleRecord[];
    luxurySales: GonzalesSaleRecord[];
    glossSales?: GonzalesSaleRecord[];
  } {
    // 1. Rosetta Stone Canonical Staff & Aliases
    const { agents, agentByCanonical, resolveAgentName } = buildAgentRegistry(
      agentesRaw,
      agentesLuxuryRaw,
      agentesGlossRaw
    );

    // 2. Staff Settlements (Pendientes_Liquidacion)
    const settlements = processSettlements(liquidacionesRaw, resolveAgentName);

    // 3. Reception Orders & Multi-Branch Cancellations (Salón RD, Borrador, Luxury RD, Gloss Salon)
    const orders = processOrdersAndCancellations(
      oatcRaw,
      borradorRaw,
      oatcLuxuryRaw,
      oatcGlossRaw,
      borradorGlossRaw,
      agentByCanonical,
      resolveAgentName
    );

    // 4. Time & Attendance (Salón RD, Luxury RD, Gloss Salon)
    const attendance = processAttendance(
      asistenciaRaw,
      asistenciaLuxuryRaw,
      asistenciaGlossRaw,
      resolveAgentName
    );

    // 5. Retail, Inventory Kardex & Catalog ABC Rankings
    const {
      tickets,
      ticketDetails,
      kardex,
      productRankings,
      brandPortfolioMetrics,
      ticketMap,
      totalCostoRetailAcumulado
    } = processRetailAndInventory(
      ticketsRaw,
      ventasDetalleRaw,
      kardexRaw,
      productosCatalogoRaw,
      resolveAgentName
    );

    // 6. Cash Sales & Service Portfolio Metrics
    const {
      cashServiceSales,
      serviceCategoryRankings,
      oatcCategoryMetrics,
      specificPortfolioRankings,
      cashPaymentTotals
    } = processCashAndPortfolio(
      ventasCajaRaw,
      orders,
      productRankings,
      resolveAgentName
    );
    const {
      totalFacturacion: totalFacturacionServiciosCaja,
      totalComisiones: totalComisionesServiciosCaja,
      tarjeta: pagoServiciosTarjeta,
      efectivo: pagoServiciosEfectivo,
      deposito: pagoServiciosDeposito
    } = cashPaymentTotals;

    // 7. Staff 360 Productivity, P&L and Batting Ratios
    const staff360 = buildStaff360(
      agents,
      agentByCanonical,
      orders,
      cashServiceSales,
      tickets,
      ticketDetails,
      settlements,
      attendance,
      ventasLuxuryRaw,
      ventasGlossRaw,
      ventasGonzalesRaw,
      ticketMap,
      resolveAgentName
    );

    // 8. CRM Unified Customers & LTV
    const clients = processUnifiedClients(
      orders,
      tickets,
      clientesLuxuryRaw,
      clientesGlossRaw
    );

    // 9. Executive KPIs Aggregation
    const totalIngresosRetail = tickets.reduce(
      (acc, t) => (t.estado !== "ANULADO" ? acc + t.total : acc),
      0
    );
    const validTicketsCount = tickets.filter((t) => t.estado !== "ANULADO").length;
    const ticketPromedioRetail =
      validTicketsCount > 0 ? Math.round((totalIngresosRetail / validTicketsCount) * 100) / 100 : 0;

    const totalFacturacionGlobal = totalFacturacionServiciosCaja + totalIngresosRetail;
    const margenBrutoGlobalSoles =
      totalFacturacionServiciosCaja - totalComisionesServiciosCaja + (totalIngresosRetail - totalCostoRetailAcumulado);
    const margenBrutoGlobalPct =
      totalFacturacionGlobal > 0 ? Math.round((margenBrutoGlobalSoles / totalFacturacionGlobal) * 100) : 0;

    const totalServiciosAtendidos = orders.filter((o) => !o.isCancelled).length;
    const totalServiciosCancelados = orders.filter((o) => o.isCancelled).length;
    const tasaCancelacionServicios =
      orders.length > 0 ? Math.round((totalServiciosCancelados / orders.length) * 1000) / 10 : 0;

    const totalComisionesPagadas = settlements.reduce(
      (acc, s) => (s.estado === "Pagado" ? acc + s.montoPagar : acc),
      0
    );
    const totalComisionesPendientes = settlements.reduce(
      (acc, s) => (s.estado === "Pendiente" ? acc + s.montoPagar : acc),
      0
    );

    const totalHorasTrabajadasStaff = attendance.reduce((acc, a) => acc + a.horasTrabajadas, 0);

    const crossBuyersCount = clients.filter((c) => c.esCrossBuyer).length;
    const clientsWithServices = clients.filter((c) => c.totalServicios > 0).length;
    const tasaConversionCrossSell =
      clientsWithServices > 0
        ? Math.round((crossBuyersCount / clientsWithServices) * 1000) / 10
        : 0;

    const executiveKPIs: ExecutiveKPIs = {
      totalFacturacionGlobal: Math.round(totalFacturacionGlobal * 100) / 100,
      totalFacturacionServicios: Math.round(totalFacturacionServiciosCaja * 100) / 100,
      totalComisionesServicios: Math.round(totalComisionesServiciosCaja * 100) / 100,
      totalIngresosRetail: Math.round(totalIngresosRetail * 100) / 100,
      margenBrutoGlobalSoles: Math.round(margenBrutoGlobalSoles * 100) / 100,
      margenBrutoGlobalPct,
      totalTicketsRetail: validTicketsCount,
      ticketPromedioRetail,
      totalServiciosAtendidos,
      tasaCancelacionServicios,
      totalComisionesPagadas: Math.round(totalComisionesPagadas * 100) / 100,
      totalComisionesPendientes: Math.round(totalComisionesPendientes * 100) / 100,
      totalHorasTrabajadasStaff: Math.round(totalHorasTrabajadasStaff * 10) / 10,
      tasaConversionCrossSell,
      totalClientesUnicos: clients.length,
      pagoServiciosTarjeta: Math.round(pagoServiciosTarjeta * 100) / 100,
      pagoServiciosEfectivo: Math.round(pagoServiciosEfectivo * 100) / 100,
      pagoServiciosDeposito: Math.round(pagoServiciosDeposito * 100) / 100
    };

    // 10. Multi-Branch Benchmark & Bayesian Demand Normalization
    const {
      multiBranchBenchmark,
      gonzalesSales,
      luxurySales,
      glossSales
    } = buildMultiBranchBenchmark({
      orders,
      oatcLuxuryRaw,
      ventasLuxuryRaw,
      ventasGonzalesRaw,
      ventasGlossRaw,
      agents,
      totalFacturacionGlobal,
      totalIngresosRetail,
      ticketPromedioRetail,
      tasaCancelacionServicios,
      resolveAgentName
    });

    return {
      agents,
      settlements,
      orders,
      attendance,
      tickets,
      ticketDetails,
      kardex,
      cashServiceSales,
      serviceCategoryRankings,
      oatcCategoryMetrics,
      specificPortfolioRankings,
      staff360,
      productRankings,
      clients,
      executiveKPIs,
      brandPortfolioMetrics,
      multiBranchBenchmark,
      gonzalesSales,
      luxurySales,
      glossSales
    };
  }
}
