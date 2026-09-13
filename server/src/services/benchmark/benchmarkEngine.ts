import {
  MultiBranchBenchmark,
  BranchKpiSummary,
  GonzalesSaleRecord,
  OatcRecord,
  AgentMaster
} from "../../types.js";
import {
  ORDERED_DAYS,
  DAY_SHORT_LABELS,
  parseExcelDateToIso,
  parseExcelTime,
  parseSafeNumber,
  getDayOfWeek
} from "../parsers/dataParsers.js";
import { classifyCancellation } from "../operations/cancellationEngine.js";
import { classifyStandardCategory } from "../parsers/categoryClassifier.js";
import {
  ALL_BENCHMARK_CATEGORIES,
  getFranjaFromHour,
  buildNormalized
} from "./demandNormalizer.js";
import {
  buildEmpiricalDistributions,
  inferGonzalesDemand
} from "./bayesianInference.js";
import { buildCancellationBenchmark } from "./cancellationBenchmark.js";
import { buildVaikunthaBusinessCase } from "./vaikunthaBusinessCase.js";

export interface BenchmarkEngineParams {
  orders: OatcRecord[];
  oatcLuxuryRaw: any[][];
  ventasLuxuryRaw: any[][];
  ventasGonzalesRaw: any[][];
  ventasGlossRaw: any[][];
  agents: AgentMaster[];
  totalFacturacionGlobal: number;
  totalIngresosRetail: number;
  ticketPromedioRetail: number;
  tasaCancelacionServicios: number;
  resolveAgentName: (raw: string) => string;
}

export interface BenchmarkEngineResult {
  multiBranchBenchmark: MultiBranchBenchmark;
  gonzalesSales: GonzalesSaleRecord[];
  luxurySales: GonzalesSaleRecord[];
  glossSales: GonzalesSaleRecord[];
}

export function buildMultiBranchBenchmark(params: BenchmarkEngineParams): BenchmarkEngineResult {
  const {
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
  } = params;

  // 1. Process Luxury RD OATC Reception Records (6,676 Check-ins)
  const luxuryOrders: OatcRecord[] = [];
  const luxuryHourlyCount = new Array<number>(24).fill(0);
  const luxuryWeeklyOatcCount = new Map<string, number>();
  const luxuryOatcDatesSet = new Set<string>();
  ORDERED_DAYS.forEach((d) => luxuryWeeklyOatcCount.set(d, 0));

  oatcLuxuryRaw.forEach((row, idx) => {
    const rawTipo = String(row[2] || "").trim();
    if (!rawTipo || rawTipo === "Tipo OATC 7") return;

    const fechaIso = parseExcelDateToIso(row[3]);
    if (fechaIso) luxuryOatcDatesSet.add(fechaIso);
    const diaSemana = getDayOfWeek(fechaIso);
    const hrRegistro = parseExcelTime(row[0]);
    const hrResol = parseExcelTime(row[7]);
    const motivo = String(row[8] || "").trim();
    const cancelInfo = classifyCancellation(motivo, hrResol, rawTipo);
    const cliente = String(row[4] || "Cliente Casual").trim();
    const agente = resolveAgentName(String(row[6] || ""));

    luxuryWeeklyOatcCount.set(diaSemana, (luxuryWeeklyOatcCount.get(diaSemana) || 0) + 1);

    if (!cancelInfo.isCancelled && hrRegistro) {
      const m = hrRegistro.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      if (m) {
        let hour = parseInt(m[1], 10);
        const ampm = m[3] ? m[3].toUpperCase() : null;
        if (ampm === "PM" && hour < 12) hour += 12;
        if (ampm === "AM" && hour === 12) hour = 0;
        if (hour >= 8 && hour <= 22) {
          luxuryHourlyCount[hour]++;
        }
      }
    }

    luxuryOrders.push({
      id: `LUX-OATC-${idx + 1}`,
      hrRegistro,
      numeroOatc: row[1] || idx + 1,
      tipoOatc: rawTipo,
      fechaRegistro: fechaIso,
      clienteNombre: cliente,
      tipoCliente: String(row[5] || "Turno").trim(),
      agente,
      sede: "Luxury RD",
      diaSemana,
      horaResolucion: hrResol || undefined,
      motivo: motivo || undefined,
      motivoLimpio: cancelInfo.motivoLimpio,
      isCancelled: cancelInfo.isCancelled,
      horaCancelacion: cancelInfo.horaCancelacion,
      macroCategoria: cancelInfo.macroCategoria,
      subCategoria: cancelInfo.subCategoria,
      source: "OATC"
    });
  });

  // 2. Build Empirical Distributions and run Bayesian Demand Inference
  const distributions = buildEmpiricalDistributions(orders, luxuryOrders);
  const {
    rdHourlyCount,
    rdHourly2026Count,
    rdWeeklyCount,
    rdWeekly2026Count,
    rdCategoryCount,
    rdDatesAllSet,
    rdDates2026Set
  } = distributions;

  // 3. Process Luxury RD Sales (11,538 Real Sales)
  const luxurySales: GonzalesSaleRecord[] = [];
  const luxuryCategoryMap = new Map<string, { cantidad: number; ingreso: number }>();
  const luxuryWeeklySalesMap = new Map<string, { unidades: number; ingreso: number }>();
  const luxuryStylistsSet = new Set<string>();
  const luxuryDatesSet = new Set<string>();
  let totalFacturadoLuxury = 0;

  ORDERED_DAYS.forEach((d) => luxuryWeeklySalesMap.set(d, { unidades: 0, ingreso: 0 }));

  ventasLuxuryRaw.forEach((row, idx) => {
    const rawItem = String(row[6] || "").trim();
    if (!rawItem || rawItem === "Producto / Servicio") return;

    const fechaIso = parseExcelDateToIso(row[0]);
    if (fechaIso) luxuryDatesSet.add(fechaIso);
    const diaSemana = getDayOfWeek(fechaIso);
    const razSoc = String(row[1] || "").trim();
    const docTipo = String(row[2] || "BOL").trim();
    const docNumero = String(row[3] || "").trim();
    const rawCliente = String(row[4] || "CLIENTE").trim();
    const rawEstilista = String(row[5] || "Sin Asignar").trim();
    const cantidad = parseSafeNumber(row[7]) || 1;
    const importe = parseSafeNumber(row[8]) || 0;
    const categoria = classifyStandardCategory(rawItem);

    if (rawEstilista && rawEstilista !== "Sin Asignar" && !rawEstilista.toLowerCase().includes("varios")) {
      luxuryStylistsSet.add(rawEstilista);
    }

    totalFacturadoLuxury += importe;

    const catEntry = luxuryCategoryMap.get(categoria) || { cantidad: 0, ingreso: 0 };
    catEntry.cantidad += cantidad;
    catEntry.ingreso += importe;
    luxuryCategoryMap.set(categoria, catEntry);

    const weekEntry = luxuryWeeklySalesMap.get(diaSemana) || { unidades: 0, ingreso: 0 };
    weekEntry.unidades += cantidad;
    weekEntry.ingreso += importe;
    luxuryWeeklySalesMap.set(diaSemana, weekEntry);

    luxurySales.push({
      id: `LUXURY-SALE-${idx + 1}`,
      fecha: fechaIso,
      diaSemana,
      razonSocial: razSoc,
      docTipo,
      docNumero,
      cliente: rawCliente,
      estilista: resolveAgentName(rawEstilista),
      item: rawItem,
      categoria,
      cantidad,
      importe
    });
  });

  // 4. Process Gonzales AM Sales & Bayesian Demand Inference
  const gonzalesInference = inferGonzalesDemand(ventasGonzalesRaw, distributions, resolveAgentName);
  const {
    gonzalesSales,
    gonzalesHourlyUnits,
    gonzalesHourlyRevenue,
    gonzalesCategoryMap,
    gonzalesWeeklyMap,
    gonzalesStylistsSet,
    gonzalesDatesSet,
    totalFacturadoGonzales,
    totalAnonimosGonzales,
    totalIdentificadosGonzales
  } = gonzalesInference;

  // 5. Process Gloss Salon Sales (Empty now, fully reactive when populated)
  const glossSales: GonzalesSaleRecord[] = [];
  const glossCategorySalesMap = new Map<string, { cantidad: number; ingreso: number }>();
  const glossWeeklySalesMap = new Map<string, { unidades: number; ingreso: number }>();
  const glossSalesDatesSet = new Set<string>();
  let totalFacturadoGloss = 0;

  ORDERED_DAYS.forEach((d) => glossWeeklySalesMap.set(d, { unidades: 0, ingreso: 0 }));

  if (ventasGlossRaw && ventasGlossRaw.length > 0) {
    ventasGlossRaw.forEach((row, idx) => {
      const rawItem = String(row[6] || "").trim();
      if (!rawItem || rawItem === "Producto / Servicio") return;

      const fechaIso = parseExcelDateToIso(row[0]);
      if (fechaIso) glossSalesDatesSet.add(fechaIso);
      const diaSemana = getDayOfWeek(fechaIso);
      const razSoc = String(row[1] || "").trim();
      const docTipo = String(row[2] || "BOL").trim();
      const docNumero = String(row[3] || "").trim();
      const rawCliente = String(row[4] || "CLIENTE").trim();
      const rawEstilista = String(row[5] || "Sin Asignar").trim();
      const cantidad = parseSafeNumber(row[7]) || 1;
      const importe = parseSafeNumber(row[8]) || 0;
      const categoria = classifyStandardCategory(rawItem);

      totalFacturadoGloss += importe;

      const catEntry = glossCategorySalesMap.get(categoria) || { cantidad: 0, ingreso: 0 };
      catEntry.cantidad += cantidad;
      catEntry.ingreso += importe;
      glossCategorySalesMap.set(categoria, catEntry);

      const weekEntry = glossWeeklySalesMap.get(diaSemana) || { unidades: 0, ingreso: 0 };
      weekEntry.unidades += cantidad;
      weekEntry.ingreso += importe;
      glossWeeklySalesMap.set(diaSemana, weekEntry);

      glossSales.push({
        id: `GLOSS-SALE-${idx + 1}`,
        fecha: fechaIso,
        diaSemana,
        razonSocial: razSoc,
        docTipo,
        docNumero,
        cliente: rawCliente,
        estilista: resolveAgentName(rawEstilista),
        item: rawItem,
        categoria,
        cantidad,
        importe
      });
    });
  }

  // 6. Branch Summaries and Metrics
  const allCategories = ALL_BENCHMARK_CATEGORIES;

  const rdStylistsCount = agents.filter((a) => a.salon === "RD").length || 65;
  const luxuryStylistsCount = luxuryStylistsSet.size || 28;
  const gonzalesStylistsCount = gonzalesStylistsSet.size || 21;

  const rdDaysAll = Math.max(1, rdDatesAllSet.size || 302);
  const rdDays2026 = Math.max(1, rdDates2026Set.size || 252);
  const luxuryDaysCount = Math.max(1, (luxuryDatesSet.size || luxuryOatcDatesSet.size) || 247);
  const gonzalesDaysCount = Math.max(1, gonzalesDatesSet.size || 252);

  const rdTotalCatUnits = Math.max(1, Array.from(rdCategoryCount.values()).reduce((a, b) => a + b, 0));
  const luxuryTotalCatUnits = Math.max(1, Array.from(luxuryCategoryMap.values()).reduce((a, b) => a + b.cantidad, 0));
  const gonzalesTotalCatUnits = Math.max(1, Array.from(gonzalesCategoryMap.values()).reduce((a, b) => a + b.cantidad, 0));

  // RD Branch Summary (All History)
  let rdPeakHour = 17;
  let rdMaxHour = -1;
  const rdDistribucionHoraria = [];
  for (let h = 8; h <= 22; h++) {
    const cnt = rdHourlyCount[h];
    if (cnt > rdMaxHour) {
      rdMaxHour = cnt;
      rdPeakHour = h;
    }
    rdDistribucionHoraria.push({
      hora: h,
      label: `${h.toString().padStart(2, "0")}:00`,
      atenciones: cnt,
      ingresoEstimado: Math.round(cnt * ticketPromedioRetail * 10) / 10
    });
  }

  const rdWeeklyList = ORDERED_DAYS.map((dia) => {
    const u = rdWeeklyCount.get(dia) || 0;
    return {
      dia,
      label: DAY_SHORT_LABELS[dia] || dia,
      unidades: u,
      ingreso: Math.round(u * 95),
      sharePct: Math.round((u / rdTotalCatUnits) * 1000) / 10
    };
  });

  const rdMixCategorias = allCategories.map((cat) => {
    const cnt = rdCategoryCount.get(cat) || 0;
    return {
      categoria: cat,
      cantidad: cnt,
      ingreso: Math.round(cnt * 85),
      sharePct: Math.round((cnt / rdTotalCatUnits) * 1000) / 10
    };
  });

  const branchRD: BranchKpiSummary = {
    sedeId: "RD",
    nombre: "Salón RD (Principal)",
    badge: "Recepción AppSheet + ERP",
    color: "#4f46e5",
    tieneModuloRecepcion: true,
    diasOperativos: rdDaysAll,
    totalFacturado: Math.round(totalFacturacionGlobal * 100) / 100,
    totalTransacciones: orders.length,
    totalServicios: orders.filter((o) => !o.isCancelled).length,
    totalRetail: Math.round(totalIngresosRetail * 100) / 100,
    ticketPromedio: Math.round((totalFacturacionGlobal / Math.max(1, orders.length)) * 100) / 100,
    estilistasActivos: rdStylistsCount,
    productividadPorEstilista: Math.round((totalFacturacionGlobal / Math.max(1, rdStylistsCount)) * 100) / 100,
    mixCategorias: rdMixCategorias,
    distribucionSemanal: rdWeeklyList,
    distribucionHoraria: rdDistribucionHoraria,
    horaPico: rdPeakHour,
    franjaPico: getFranjaFromHour(rdPeakHour)
  };

  // Luxury RD Branch Summary (Real 11,538 Sales + 6,676 OATC Check-ins)
  let luxuryPeakHour = 17;
  let luxuryMaxHour = -1;
  const luxuryDistribucionHoraria = [];
  for (let h = 8; h <= 22; h++) {
    const cnt = luxuryHourlyCount[h];
    if (cnt > luxuryMaxHour) {
      luxuryMaxHour = cnt;
      luxuryPeakHour = h;
    }
    luxuryDistribucionHoraria.push({
      hora: h,
      label: `${h.toString().padStart(2, "0")}:00`,
      atenciones: cnt,
      ingresoEstimado: Math.round(cnt * (totalFacturadoLuxury / Math.max(1, luxurySales.length)))
    });
  }

  const luxuryWeeklyList = ORDERED_DAYS.map((dia) => {
    const stat = luxuryWeeklySalesMap.get(dia) || { unidades: 0, ingreso: 0 };
    return {
      dia,
      label: DAY_SHORT_LABELS[dia] || dia,
      unidades: stat.unidades,
      ingreso: Math.round(stat.ingreso * 100) / 100,
      sharePct: Math.round((stat.unidades / luxuryTotalCatUnits) * 1000) / 10
    };
  });

  const luxuryMixCategorias = allCategories.map((cat) => {
    const stat = luxuryCategoryMap.get(cat) || { cantidad: 0, ingreso: 0 };
    return {
      categoria: cat,
      cantidad: stat.cantidad,
      ingreso: Math.round(stat.ingreso * 100) / 100,
      sharePct: Math.round((stat.cantidad / luxuryTotalCatUnits) * 1000) / 10
    };
  });

  const branchLuxury: BranchKpiSummary = {
    sedeId: "LUXURY_RD",
    nombre: "Luxury RD (G Luxury)",
    badge: "Recepción AppSheet + POS",
    color: "#059669",
    tieneModuloRecepcion: true,
    diasOperativos: luxuryDaysCount,
    totalFacturado: Math.round(totalFacturadoLuxury * 100) / 100,
    totalTransacciones: luxurySales.length,
    totalServicios: luxurySales.length,
    ticketPromedio: luxurySales.length > 0 ? Math.round((totalFacturadoLuxury / luxurySales.length) * 100) / 100 : 0,
    estilistasActivos: luxuryStylistsCount,
    productividadPorEstilista: Math.round((totalFacturadoLuxury / Math.max(1, luxuryStylistsCount)) * 100) / 100,
    mixCategorias: luxuryMixCategorias,
    distribucionSemanal: luxuryWeeklyList,
    distribucionHoraria: luxuryDistribucionHoraria,
    horaPico: luxuryPeakHour,
    franjaPico: getFranjaFromHour(luxuryPeakHour)
  };

  // Gonzales AM Branch Summary
  let gonzalesPeakHour = 17;
  let gonzalesMaxHour = -1;
  const gonzalesDistribucionHoraria = [];
  for (let h = 8; h <= 22; h++) {
    const u = Math.round(gonzalesHourlyUnits[h] * 10) / 10;
    const rev = Math.round(gonzalesHourlyRevenue[h] * 100) / 100;
    if (u > gonzalesMaxHour) {
      gonzalesMaxHour = u;
      gonzalesPeakHour = h;
    }
    gonzalesDistribucionHoraria.push({
      hora: h,
      label: `${h.toString().padStart(2, "0")}:00`,
      atenciones: u,
      ingresoEstimado: rev
    });
  }

  const gonzalesWeeklyList = ORDERED_DAYS.map((dia) => {
    const stat = gonzalesWeeklyMap.get(dia) || { unidades: 0, ingreso: 0 };
    return {
      dia,
      label: DAY_SHORT_LABELS[dia] || dia,
      unidades: stat.unidades,
      ingreso: Math.round(stat.ingreso * 100) / 100,
      sharePct: Math.round((stat.unidades / gonzalesTotalCatUnits) * 1000) / 10
    };
  });

  const gonzalesMixCategorias = allCategories.map((cat) => {
    const stat = gonzalesCategoryMap.get(cat) || { cantidad: 0, ingreso: 0 };
    return {
      categoria: cat,
      cantidad: stat.cantidad,
      ingreso: Math.round(stat.ingreso * 100) / 100,
      sharePct: Math.round((stat.cantidad / gonzalesTotalCatUnits) * 1000) / 10
    };
  });

  const branchGonzales: BranchKpiSummary = {
    sedeId: "GONZALES_AM",
    nombre: "Gonzales AM",
    badge: "Sin Módulo Recepción (Solo Caja POS)",
    color: "#d97706",
    tieneModuloRecepcion: false,
    diasOperativos: gonzalesDaysCount,
    totalFacturado: Math.round(totalFacturadoGonzales * 100) / 100,
    totalTransacciones: gonzalesSales.length,
    totalServicios: gonzalesSales.length,
    ticketPromedio: gonzalesSales.length > 0 ? Math.round((totalFacturadoGonzales / gonzalesSales.length) * 100) / 100 : 0,
    estilistasActivos: gonzalesStylistsCount,
    productividadPorEstilista: Math.round((totalFacturadoGonzales / Math.max(1, gonzalesStylistsCount)) * 100) / 100,
    mixCategorias: gonzalesMixCategorias,
    distribucionSemanal: gonzalesWeeklyList,
    distribucionHoraria: gonzalesDistribucionHoraria,
    horaPico: gonzalesPeakHour,
    franjaPico: getFranjaFromHour(gonzalesPeakHour)
  };

  // Gloss Salon Branch Summary (Real 6,636 OATC Check-ins + 2,650 Attendance)
  const glossOrders = orders.filter((o) => o.sede === "Gloss Salon");
  const glossStylistsSet = new Set<string>();
  const glossOatcDatesSet = new Set<string>();
  const glossOatcDates2026Set = new Set<string>();
  const glossHourlyCount = new Array<number>(24).fill(0);
  const glossHourly2026Count = new Array<number>(24).fill(0);
  const glossWeeklyCount = new Map<string, number>();
  const glossWeekly2026Count = new Map<string, number>();
  const glossCategoryMap = new Map<string, number>();
  const glossCategory2026Map = new Map<string, number>();

  ORDERED_DAYS.forEach((d) => {
    glossWeeklyCount.set(d, 0);
    glossWeekly2026Count.set(d, 0);
  });

  glossOrders.forEach((o) => {
    if (o.agente && o.agente !== "Sin asignar") glossStylistsSet.add(o.agente);
    if (o.fechaRegistro) {
      glossOatcDatesSet.add(o.fechaRegistro);
      if (o.fechaRegistro >= "2026-01-01") glossOatcDates2026Set.add(o.fechaRegistro);
    }
    const diaSemana = o.diaSemana || "Lunes";
    const is2026 = o.fechaRegistro >= "2026-01-01";
    const cat = classifyStandardCategory(o.tipoOatc);

    glossWeeklyCount.set(diaSemana, (glossWeeklyCount.get(diaSemana) || 0) + 1);
    glossCategoryMap.set(cat, (glossCategoryMap.get(cat) || 0) + 1);
    if (is2026) {
      glossWeekly2026Count.set(diaSemana, (glossWeekly2026Count.get(diaSemana) || 0) + 1);
      glossCategory2026Map.set(cat, (glossCategory2026Map.get(cat) || 0) + 1);
    }

    if (!o.isCancelled && o.hrRegistro) {
      const m = o.hrRegistro.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      if (m) {
        let hour = parseInt(m[1], 10);
        const ampm = m[3] ? m[3].toUpperCase() : null;
        if (ampm === "PM" && hour < 12) hour += 12;
        if (ampm === "AM" && hour === 12) hour = 0;
        if (hour >= 8 && hour <= 22) {
          glossHourlyCount[hour]++;
          if (is2026) glossHourly2026Count[hour]++;
        }
      }
    }
  });

  const glossStylistsCount = agents.filter((a) => a.salon === "Gloss Salon").length || glossStylistsSet.size || 16;
  const glossDaysCount = Math.max(1, glossOatcDatesSet.size || 250);
  const glossDays2026 = Math.max(1, glossOatcDates2026Set.size || 200);
  const glossTotalCatUnits = Math.max(1, Array.from(glossCategoryMap.values()).reduce((a, b) => a + b, 0));

  let glossPeakHour = 17;
  let glossMaxHour = -1;
  const glossDistribucionHoraria = [];
  for (let h = 8; h <= 22; h++) {
    const cnt = glossHourlyCount[h];
    if (cnt > glossMaxHour) {
      glossMaxHour = cnt;
      glossPeakHour = h;
    }
    glossDistribucionHoraria.push({
      hora: h,
      label: `${h.toString().padStart(2, "0")}:00`,
      atenciones: cnt,
      ingresoEstimado: Math.round(cnt * 85)
    });
  }

  const glossWeeklyList = ORDERED_DAYS.map((dia) => {
    const u = glossWeeklyCount.get(dia) || 0;
    return {
      dia,
      label: DAY_SHORT_LABELS[dia] || dia,
      unidades: u,
      ingreso: Math.round(u * 85),
      sharePct: Math.round((u / glossTotalCatUnits) * 1000) / 10
    };
  });

  const glossMixCategorias = allCategories.map((cat) => {
    const cnt = glossCategoryMap.get(cat) || 0;
    return {
      categoria: cat,
      cantidad: cnt,
      ingreso: Math.round(cnt * 85),
      sharePct: Math.round((cnt / glossTotalCatUnits) * 1000) / 10
    };
  });

  const branchGloss: BranchKpiSummary = {
    sedeId: "GLOSS_SALON",
    nombre: "Gloss Salon",
    badge: "Recepción Digital OATC + Asistencia",
    color: "#ec4899",
    tieneModuloRecepcion: true,
    diasOperativos: glossDaysCount,
    totalFacturado: Math.round(totalFacturadoGloss * 100) / 100,
    totalTransacciones: glossOrders.length,
    totalServicios: glossOrders.filter((o) => !o.isCancelled).length,
    ticketPromedio: glossSales.length > 0 ? Math.round((totalFacturadoGloss / glossSales.length) * 100) / 100 : 0,
    estilistasActivos: glossStylistsCount,
    productividadPorEstilista: Math.round((totalFacturadoGloss / Math.max(1, glossStylistsCount)) * 100) / 100,
    mixCategorias: glossMixCategorias,
    distribucionSemanal: glossWeeklyList,
    distribucionHoraria: glossDistribucionHoraria,
    horaPico: glossPeakHour,
    franjaPico: getFranjaFromHour(glossPeakHour)
  };

  // 7. Normalized Weekly Demand (Full History)
  const glossWeeklyTotal = glossWeeklyList.reduce((a, b) => a + b.unidades, 0) || 1;

  const rawWeeklyPoints = ORDERED_DAYS.map((dia) => ({
    key: dia,
    label: DAY_SHORT_LABELS[dia] || dia,
    rdVal: rdWeeklyList.find((w) => w.dia === dia)?.unidades || 0,
    luxVal: luxuryWeeklyList.find((w) => w.dia === dia)?.unidades || 0,
    gonzVal: gonzalesWeeklyList.find((w) => w.dia === dia)?.unidades || 0,
    glossVal: glossWeeklyList.find((w) => w.dia === dia)?.unidades || 0
  }));

  const rdWeeklyTotal = rdWeeklyList.reduce((a, b) => a + b.unidades, 0) || 1;
  const luxuryWeeklyTotal = luxuryWeeklyList.reduce((a, b) => a + b.unidades, 0) || 1;
  const gonzalesWeeklyTotal = gonzalesWeeklyList.reduce((a, b) => a + b.unidades, 0) || 1;

  const comparativaSemanalNormalizada = buildNormalized(
    rawWeeklyPoints,
    rdWeeklyTotal,
    luxuryWeeklyTotal,
    gonzalesWeeklyTotal,
    glossWeeklyTotal,
    rdDaysAll,
    luxuryDaysCount,
    gonzalesDaysCount,
    glossDaysCount,
    rdStylistsCount,
    luxuryStylistsCount,
    gonzalesStylistsCount,
    glossStylistsCount
  );

  // 8. Normalized Hourly Demand (Full History)
  const rawHourlyPoints = [];
  for (let h = 8; h <= 22; h++) {
    rawHourlyPoints.push({
      key: `${h.toString().padStart(2, "0")}:00`,
      label: `${h.toString().padStart(2, "0")}:00`,
      rdVal: rdHourlyCount[h] || 0,
      luxVal: luxuryHourlyCount[h] || 0,
      gonzVal: Math.round(gonzalesHourlyUnits[h] * 10) / 10,
      glossVal: glossHourlyCount[h] || 0
    });
  }

  const rdHourlyTotal = rdHourlyCount.slice(8, 23).reduce((a, b) => a + b, 0) || 1;
  const luxuryHourlyTotal = luxuryHourlyCount.slice(8, 23).reduce((a, b) => a + b, 0) || 1;
  const gonzalesHourlyTotal = gonzalesHourlyUnits.slice(8, 23).reduce((a, b) => a + b, 0) || 1;
  const glossHourlyTotal = glossHourlyCount.slice(8, 23).reduce((a, b) => a + b, 0) || 1;

  const comparativaHorariaNormalizada = rawHourlyPoints.map((p) => ({
    key: p.key,
    label: p.label,
    rd: {
      absolute: Math.round(p.rdVal * 10) / 10,
      relativePct: Math.round((p.rdVal / rdHourlyTotal) * 1000) / 10,
      dailyAvg: Math.round((p.rdVal / rdDaysAll) * 10) / 10,
      perStylist: Math.round((p.rdVal / rdStylistsCount) * 10) / 10
    },
    luxury: {
      absolute: Math.round(p.luxVal * 10) / 10,
      relativePct: Math.round((p.luxVal / luxuryHourlyTotal) * 1000) / 10,
      dailyAvg: Math.round((p.luxVal / luxuryDaysCount) * 10) / 10,
      perStylist: Math.round((p.luxVal / luxuryStylistsCount) * 10) / 10
    },
    gonzales: {
      absolute: Math.round(p.gonzVal * 10) / 10,
      relativePct: Math.round((p.gonzVal / gonzalesHourlyTotal) * 1000) / 10,
      dailyAvg: Math.round((p.gonzVal / gonzalesDaysCount) * 10) / 10,
      perStylist: Math.round((p.gonzVal / gonzalesStylistsCount) * 10) / 10
    },
    gloss: {
      absolute: Math.round(p.glossVal * 10) / 10,
      relativePct: Math.round((p.glossVal / glossHourlyTotal) * 1000) / 10,
      dailyAvg: Math.round((p.glossVal / glossDaysCount) * 10) / 10,
      perStylist: Math.round((p.glossVal / glossStylistsCount) * 10) / 10
    }
  }));

  // 9. Mix comparison
  const comparativaMix = allCategories.map((cat) => ({
    categoria: cat,
    rdPct: rdMixCategorias.find((m) => m.categoria === cat)?.sharePct || 0,
    luxuryPct: luxuryMixCategorias.find((m) => m.categoria === cat)?.sharePct || 0,
    gonzalesPct: gonzalesMixCategorias.find((m) => m.categoria === cat)?.sharePct || 0,
    glossPct: glossMixCategorias.find((m) => m.categoria === cat)?.sharePct || 0
  }));

  const comparativaSemanal = ORDERED_DAYS.map((dia) => ({
    dia,
    label: DAY_SHORT_LABELS[dia] || dia,
    rd: rdWeeklyList.find((w) => w.dia === dia)?.unidades || 0,
    luxury: luxuryWeeklyList.find((w) => w.dia === dia)?.unidades || 0,
    gonzales: gonzalesWeeklyList.find((w) => w.dia === dia)?.unidades || 0,
    gloss: glossWeeklyList.find((w) => w.dia === dia)?.unidades || 0
  }));

  const comparativaHoraria = rawHourlyPoints.map((p, idx) => ({
    hora: idx + 8,
    label: p.label,
    rdReal: p.rdVal,
    luxuryReal: p.luxVal,
    gonzalesInferido: p.gonzVal,
    glossReal: p.glossVal
  }));

  // 10. Compute 2026 Homogeneous Window Benchmark
  const rdOrders2026 = orders.filter(
    (o) => (o.sede === "Salón RD" || o.sede === "RD") && o.fechaRegistro >= "2026-01-01" && !o.isCancelled
  );
  const rdFacturado2026 = Math.round(rdOrders2026.length * 135);

  const rawWeekly2026Points = ORDERED_DAYS.map((dia) => ({
    key: dia,
    label: DAY_SHORT_LABELS[dia] || dia,
    rdVal: rdWeekly2026Count.get(dia) || 0,
    luxVal: luxuryWeeklyList.find((w) => w.dia === dia)?.unidades || 0,
    gonzVal: gonzalesWeeklyList.find((w) => w.dia === dia)?.unidades || 0,
    glossVal: glossWeekly2026Count.get(dia) || 0
  }));

  const rdWeekly2026Total = Array.from(rdWeekly2026Count.values()).reduce((a, b) => a + b, 0) || 1;
  const glossWeekly2026Total = Array.from(glossWeekly2026Count.values()).reduce((a, b) => a + b, 0) || 1;

  const comparativaSemanal2026Normalizada = buildNormalized(
    rawWeekly2026Points,
    rdWeekly2026Total,
    luxuryWeeklyTotal,
    gonzalesWeeklyTotal,
    glossWeekly2026Total,
    rdDays2026,
    luxuryDaysCount,
    gonzalesDaysCount,
    glossDays2026,
    rdStylistsCount,
    luxuryStylistsCount,
    gonzalesStylistsCount,
    glossStylistsCount
  );

  const rawHourly2026Points = [];
  for (let h = 8; h <= 22; h++) {
    rawHourly2026Points.push({
      key: `${h.toString().padStart(2, "0")}:00`,
      label: `${h.toString().padStart(2, "0")}:00`,
      rdVal: rdHourly2026Count[h] || 0,
      luxVal: luxuryHourlyCount[h] || 0,
      gonzVal: Math.round(gonzalesHourlyUnits[h] * 10) / 10,
      glossVal: glossHourly2026Count[h] || 0
    });
  }

  const rdHourly2026Total = rdHourly2026Count.slice(8, 23).reduce((a, b) => a + b, 0) || 1;
  const glossHourly2026Total = glossHourly2026Count.slice(8, 23).reduce((a, b) => a + b, 0) || 1;

  const comparativaHoraria2026Normalizada = rawHourly2026Points.map((p) => ({
    key: p.key,
    label: p.label,
    rd: {
      absolute: Math.round(p.rdVal * 10) / 10,
      relativePct: Math.round((p.rdVal / rdHourly2026Total) * 1000) / 10,
      dailyAvg: Math.round((p.rdVal / rdDays2026) * 10) / 10,
      perStylist: Math.round((p.rdVal / rdStylistsCount) * 10) / 10
    },
    luxury: {
      absolute: Math.round(p.luxVal * 10) / 10,
      relativePct: Math.round((p.luxVal / luxuryHourlyTotal) * 1000) / 10,
      dailyAvg: Math.round((p.luxVal / luxuryDaysCount) * 10) / 10,
      perStylist: Math.round((p.luxVal / luxuryStylistsCount) * 10) / 10
    },
    gonzales: {
      absolute: Math.round(p.gonzVal * 10) / 10,
      relativePct: Math.round((p.gonzVal / gonzalesHourlyTotal) * 1000) / 10,
      dailyAvg: Math.round((p.gonzVal / gonzalesDaysCount) * 10) / 10,
      perStylist: Math.round((p.gonzVal / gonzalesStylistsCount) * 10) / 10
    },
    gloss: {
      absolute: Math.round(p.glossVal * 10) / 10,
      relativePct: Math.round((p.glossVal / glossHourly2026Total) * 1000) / 10,
      dailyAvg: Math.round((p.glossVal / glossDays2026) * 10) / 10,
      perStylist: Math.round((p.glossVal / glossStylistsCount) * 10) / 10
    }
  }));

  const branchRD2026: BranchKpiSummary = {
    ...branchRD,
    diasOperativos: rdDays2026,
    totalFacturado: rdFacturado2026,
    totalTransacciones: rdOrders2026.length,
    totalServicios: rdOrders2026.length,
    productividadPorEstilista: Math.round((rdFacturado2026 / Math.max(1, rdStylistsCount)) * 100) / 100
  };

  const branchGloss2026: BranchKpiSummary = {
    ...branchGloss,
    diasOperativos: glossDays2026,
    totalTransacciones: glossOrders.filter((o) => o.fechaRegistro >= "2026-01-01").length,
    totalServicios: glossOrders.filter((o) => o.fechaRegistro >= "2026-01-01" && !o.isCancelled).length
  };

  const benchmark2026 = {
    branches: {
      RD: branchRD2026,
      LUXURY_RD: branchLuxury,
      GONZALES_AM: branchGonzales,
      GLOSS_SALON: branchGloss2026
    },
    comparativaSemanalNormalizada: comparativaSemanal2026Normalizada,
    comparativaHorariaNormalizada: comparativaHoraria2026Normalizada,
    comparativaMix
  };

  // 11. Quad-Branch Cancellation Benchmark Comparison
  const comparativaCancelaciones = buildCancellationBenchmark(orders, gonzalesSales.length);

  // 12. Vaikuntha Business Case
  const vaikunthaBusinessCase = buildVaikunthaBusinessCase(
    totalFacturadoGonzales,
    gonzalesSales.length,
    tasaCancelacionServicios,
    totalAnonimosGonzales,
    totalIdentificadosGonzales
  );

  const multiBranchBenchmark: MultiBranchBenchmark = {
    branches: {
      RD: branchRD,
      LUXURY_RD: branchLuxury,
      GONZALES_AM: branchGonzales,
      GLOSS_SALON: branchGloss
    },
    comparativaMix,
    comparativaSemanal,
    comparativaHoraria,
    comparativaSemanalNormalizada,
    comparativaHorariaNormalizada,
    comparativaCancelaciones,
    benchmark2026,
    vaikunthaBusinessCase
  };

  return {
    multiBranchBenchmark,
    gonzalesSales,
    luxurySales,
    glossSales
  };
}
