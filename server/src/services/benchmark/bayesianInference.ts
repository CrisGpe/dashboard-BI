import { OatcRecord, GonzalesSaleRecord } from "../../types.js";
import { parseExcelDateToIso, parseSafeNumber, getDayOfWeek, ORDERED_DAYS } from "../parsers/dataParsers.js";
import { classifyStandardCategory } from "../parsers/categoryClassifier.js";

export interface EmpiricalHourlyDistributions {
  hourlyMatrixCatDay: Map<string, number[]>;
  hourlyMatrixCat: Map<string, number[]>;
  hourlyMatrixDay: Map<string, number[]>;
  globalHourlyPattern: number[];
  rdHourlyCount: number[];
  rdHourly2026Count: number[];
  rdWeeklyCount: Map<string, number>;
  rdWeekly2026Count: Map<string, number>;
  rdCategoryCount: Map<string, number>;
  rdCategory2026Count: Map<string, number>;
  rdDatesAllSet: Set<string>;
  rdDates2026Set: Set<string>;
}

export function buildEmpiricalDistributions(
  orders: OatcRecord[],
  luxuryOrders: OatcRecord[]
): EmpiricalHourlyDistributions {
  const hourlyMatrixCatDay = new Map<string, number[]>();
  const hourlyMatrixCat = new Map<string, number[]>();
  const hourlyMatrixDay = new Map<string, number[]>();
  const globalHourlyPattern = new Array<number>(24).fill(0);

  const rdHourlyCount = new Array<number>(24).fill(0);
  const rdWeeklyCount = new Map<string, number>();
  const rdWeekly2026Count = new Map<string, number>();
  const rdHourly2026Count = new Array<number>(24).fill(0);
  const rdCategoryCount = new Map<string, number>();
  const rdCategory2026Count = new Map<string, number>();
  const rdDatesAllSet = new Set<string>();
  const rdDates2026Set = new Set<string>();

  ORDERED_DAYS.forEach((d) => {
    rdWeeklyCount.set(d, 0);
    rdWeekly2026Count.set(d, 0);
  });

  // Feed Salón RD orders
  orders.forEach((o) => {
    if (o.sede === "Luxury RD" || o.sede === "Gloss Salon") return;
    if (o.fechaRegistro) {
      rdDatesAllSet.add(o.fechaRegistro);
      if (o.fechaRegistro >= "2026-01-01") rdDates2026Set.add(o.fechaRegistro);
    }
    if (o.isCancelled) return;
    const stdCat = classifyStandardCategory(o.tipoOatc);
    const dia = o.diaSemana || "Lunes";
    const is2026 = o.fechaRegistro >= "2026-01-01";

    rdWeeklyCount.set(dia, (rdWeeklyCount.get(dia) || 0) + 1);
    rdCategoryCount.set(stdCat, (rdCategoryCount.get(stdCat) || 0) + 1);

    if (is2026) {
      rdWeekly2026Count.set(dia, (rdWeekly2026Count.get(dia) || 0) + 1);
      rdCategory2026Count.set(stdCat, (rdCategory2026Count.get(stdCat) || 0) + 1);
    }

    let h = -1;
    if (o.hrRegistro) {
      const m = o.hrRegistro.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      if (m) {
        let hour = parseInt(m[1], 10);
        const ampm = m[3] ? m[3].toUpperCase() : null;
        if (ampm === "PM" && hour < 12) hour += 12;
        if (ampm === "AM" && hour === 12) hour = 0;
        if (hour >= 0 && hour <= 23) h = hour;
      }
    }

    if (h >= 8 && h <= 22) {
      rdHourlyCount[h]++;
      if (is2026) rdHourly2026Count[h]++;

      const keyCatDay = `${stdCat}__${dia}`;
      if (!hourlyMatrixCatDay.has(keyCatDay)) hourlyMatrixCatDay.set(keyCatDay, new Array(24).fill(0));
      hourlyMatrixCatDay.get(keyCatDay)![h]++;

      if (!hourlyMatrixCat.has(stdCat)) hourlyMatrixCat.set(stdCat, new Array(24).fill(0));
      hourlyMatrixCat.get(stdCat)![h]++;

      if (!hourlyMatrixDay.has(dia)) hourlyMatrixDay.set(dia, new Array(24).fill(0));
      hourlyMatrixDay.get(dia)![h]++;

      globalHourlyPattern[h]++;
    }
  });

  // Also feed Luxury RD orders to enrich empirical matrix
  luxuryOrders.forEach((o) => {
    if (o.isCancelled) return;
    const stdCat = classifyStandardCategory(o.tipoOatc);
    const dia = o.diaSemana || "Lunes";

    let h = -1;
    if (o.hrRegistro) {
      const m = o.hrRegistro.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      if (m) {
        let hour = parseInt(m[1], 10);
        const ampm = m[3] ? m[3].toUpperCase() : null;
        if (ampm === "PM" && hour < 12) hour += 12;
        if (ampm === "AM" && hour === 12) hour = 0;
        if (hour >= 0 && hour <= 23) h = hour;
      }
    }

    if (h >= 8 && h <= 22) {
      const keyCatDay = `${stdCat}__${dia}`;
      if (!hourlyMatrixCatDay.has(keyCatDay)) hourlyMatrixCatDay.set(keyCatDay, new Array(24).fill(0));
      hourlyMatrixCatDay.get(keyCatDay)![h]++;

      if (!hourlyMatrixCat.has(stdCat)) hourlyMatrixCat.set(stdCat, new Array(24).fill(0));
      hourlyMatrixCat.get(stdCat)![h]++;

      if (!hourlyMatrixDay.has(dia)) hourlyMatrixDay.set(dia, new Array(24).fill(0));
      hourlyMatrixDay.get(dia)![h]++;

      globalHourlyPattern[h]++;
    }
  });

  // Also feed Gloss Salon orders to enrich empirical matrix
  orders.forEach((o) => {
    if (o.sede !== "Gloss Salon" || o.isCancelled) return;
    const stdCat = classifyStandardCategory(o.tipoOatc);
    const dia = o.diaSemana || "Lunes";

    let h = -1;
    if (o.hrRegistro) {
      const m = o.hrRegistro.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      if (m) {
        let hour = parseInt(m[1], 10);
        const ampm = m[3] ? m[3].toUpperCase() : null;
        if (ampm === "PM" && hour < 12) hour += 12;
        if (ampm === "AM" && hour === 12) hour = 0;
        if (hour >= 0 && hour <= 23) h = hour;
      }
    }

    if (h >= 8 && h <= 22) {
      const keyCatDay = `${stdCat}__${dia}`;
      if (!hourlyMatrixCatDay.has(keyCatDay)) hourlyMatrixCatDay.set(keyCatDay, new Array(24).fill(0));
      hourlyMatrixCatDay.get(keyCatDay)![h]++;

      if (!hourlyMatrixCat.has(stdCat)) hourlyMatrixCat.set(stdCat, new Array(24).fill(0));
      hourlyMatrixCat.get(stdCat)![h]++;

      if (!hourlyMatrixDay.has(dia)) hourlyMatrixDay.set(dia, new Array(24).fill(0));
      hourlyMatrixDay.get(dia)![h]++;

      globalHourlyPattern[h]++;
    }
  });

  return {
    hourlyMatrixCatDay,
    hourlyMatrixCat,
    hourlyMatrixDay,
    globalHourlyPattern,
    rdHourlyCount,
    rdHourly2026Count,
    rdWeeklyCount,
    rdWeekly2026Count,
    rdCategoryCount,
    rdCategory2026Count,
    rdDatesAllSet,
    rdDates2026Set
  };
}

export interface GonzalesInferenceResult {
  gonzalesSales: GonzalesSaleRecord[];
  gonzalesHourlyUnits: number[];
  gonzalesHourlyRevenue: number[];
  gonzalesCategoryMap: Map<string, { cantidad: number; ingreso: number }>;
  gonzalesWeeklyMap: Map<string, { unidades: number; ingreso: number }>;
  gonzalesStylistsSet: Set<string>;
  gonzalesDatesSet: Set<string>;
  totalFacturadoGonzales: number;
  totalAnonimosGonzales: number;
  totalIdentificadosGonzales: number;
}

export function inferGonzalesDemand(
  ventasGonzalesRaw: any[][],
  distributions: EmpiricalHourlyDistributions,
  resolveAgentName?: (raw: string) => string
): GonzalesInferenceResult {
  const { hourlyMatrixCatDay, hourlyMatrixCat, hourlyMatrixDay, globalHourlyPattern } = distributions;

  const gonzalesSales: GonzalesSaleRecord[] = [];
  const gonzalesHourlyUnits = new Array<number>(24).fill(0);
  const gonzalesHourlyRevenue = new Array<number>(24).fill(0);
  const gonzalesCategoryMap = new Map<string, { cantidad: number; ingreso: number }>();
  const gonzalesWeeklyMap = new Map<string, { unidades: number; ingreso: number }>();
  const gonzalesStylistsSet = new Set<string>();
  const gonzalesDatesSet = new Set<string>();
  let totalFacturadoGonzales = 0;
  let totalAnonimosGonzales = 0;
  let totalIdentificadosGonzales = 0;

  ORDERED_DAYS.forEach((d) => gonzalesWeeklyMap.set(d, { unidades: 0, ingreso: 0 }));

  ventasGonzalesRaw.forEach((row, idx) => {
    const rawItem = String(row[6] || "").trim();
    if (!rawItem || rawItem === "Producto / Servicio") return;

    const fechaIso = parseExcelDateToIso(row[0]);
    if (fechaIso) gonzalesDatesSet.add(fechaIso);
    const diaSemana = getDayOfWeek(fechaIso);
    const razSoc = String(row[1] || "").trim();
    const docTipo = String(row[2] || "BOL").trim();
    const docNumero = String(row[3] || "").trim();
    const rawCliente = String(row[4] || "CLIENTES VARIOS").trim();
    const rawEstilista = String(row[5] || "Sin Asignar").trim();
    const resolvedEstilista = resolveAgentName ? resolveAgentName(rawEstilista) : rawEstilista;
    const cantidad = parseSafeNumber(row[7]) || 1;
    const importe = parseSafeNumber(row[8]) || 0;
    const categoria = classifyStandardCategory(rawItem);

    if (resolvedEstilista && resolvedEstilista !== "Sin Asignar" && !resolvedEstilista.toLowerCase().includes("varios")) {
      gonzalesStylistsSet.add(resolvedEstilista);
    }

    const isAnonimo =
      rawCliente.toUpperCase().includes("VARIOS") ||
      rawCliente.toUpperCase().includes("CLIENTE CASUAL") ||
      rawCliente.toUpperCase().includes("GENERIC") ||
      !rawCliente;

    if (isAnonimo) totalAnonimosGonzales++;
    else totalIdentificadosGonzales++;

    totalFacturadoGonzales += importe;

    const catEntry = gonzalesCategoryMap.get(categoria) || { cantidad: 0, ingreso: 0 };
    catEntry.cantidad += cantidad;
    catEntry.ingreso += importe;
    gonzalesCategoryMap.set(categoria, catEntry);

    const weekEntry = gonzalesWeeklyMap.get(diaSemana) || { unidades: 0, ingreso: 0 };
    weekEntry.unidades += cantidad;
    weekEntry.ingreso += importe;
    gonzalesWeeklyMap.set(diaSemana, weekEntry);

    // Hourly inference based on enriched matrix
    const keyCatDay = `${categoria}__${diaSemana}`;
    const patternCatDay = hourlyMatrixCatDay.get(keyCatDay);
    const patternCat = hourlyMatrixCat.get(categoria);
    const patternDay = hourlyMatrixDay.get(diaSemana);

    const sumVec = (vec?: number[]) => (vec ? vec.reduce((a, b) => a + b, 0) : 0);
    let chosenVec = patternCatDay;
    if (!chosenVec || sumVec(chosenVec) < 10) chosenVec = patternCat;
    if (!chosenVec || sumVec(chosenVec) < 10) chosenVec = patternDay;
    if (!chosenVec || sumVec(chosenVec) < 10) chosenVec = globalHourlyPattern;

    const sumTotal = sumVec(chosenVec) || 1;
    let peakH = 17;
    let maxVal = -1;

    for (let h = 8; h <= 22; h++) {
      const prob = (chosenVec[h] || 0) / sumTotal;
      if (prob > maxVal) {
        maxVal = prob;
        peakH = h;
      }
      gonzalesHourlyUnits[h] += cantidad * prob;
      gonzalesHourlyRevenue[h] += importe * prob;
    }

    gonzalesSales.push({
      id: `GONZALES-${idx + 1}`,
      fecha: fechaIso,
      diaSemana,
      razonSocial: razSoc,
      docTipo,
      docNumero,
      cliente: rawCliente,
      estilista: resolvedEstilista,
      item: rawItem,
      categoria,
      cantidad,
      importe,
      horaInferidaPico: peakH
    });
  });

  return {
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
  };
}
