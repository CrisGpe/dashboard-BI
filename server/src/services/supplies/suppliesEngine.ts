import {
  SuppliesDashboardResponse,
  SupplyDispatchRecord,
  SupplyYearlyMetric,
  SupplyMonthlyMetric,
  SupplyStylistConsumption,
  SupplyBrandMetric,
  SupplyTypeMetric
} from "../../types.js";
import { parseExcelDateToIso, parseExcelTime, parseSafeNumber, getDayOfWeek } from "../parsers/dataParsers.js";

// Brand normalization dictionary
function normalizeBrandName(raw: string): string {
  if (!raw) return "Sin Marca";
  const lower = raw.trim().toLowerCase();
  if (lower.includes("kerastase") || lower.includes("kérastase")) return "Kérastase";
  if (lower === "inoa") return "Inoa";
  if (lower.includes("loreal") || lower.includes("l'oreal") || lower.includes("loréal")) return "L'Oréal";
  if (lower.includes("majirel")) return "Majirel";
  if (lower.includes("richesse")) return "Richesse";
  if (lower.includes("evolution")) return "Evolution";
  if (lower.includes("redken")) return "Redken";
  if (lower.includes("alfaparf") || lower.includes("alfapart")) return "Alfaparf";
  if (lower.includes("color wear")) return "Color Wear";
  if (lower.includes("baor")) return "Baor";
  if (lower.includes("moroccanoil") || lower.includes("morocan")) return "Moroccanoil";
  if (lower.includes("wella")) return "Wella";
  if (lower.includes("schwarzkopf") || lower.includes("igora")) return "Schwarzkopf";
  if (lower.includes("revlon")) return "Revlon";
  if (lower.includes("yellow")) return "Yellow";
  if (lower.includes("italian max")) return "Italian Max";
  if (lower.includes("brazilian")) return "Brazilian Blowout";
  return raw.trim();
}

// Product Type normalization dictionary
function normalizeTypeName(raw: string): string {
  if (!raw) return "Otros Insumos";
  const lower = raw.trim().toLowerCase();
  if (lower.includes("tinte") || lower.includes("coloracion") || lower.includes("tono")) return "Tinte";
  if (lower.includes("peroxido") || lower.includes("oxigenta") || lower.includes("revelador")) return "Peróxido / Oxigenta";
  if (lower.includes("shampo")) return "Shampoo";
  if (lower.includes("mascarilla") || lower.includes("masque")) return "Mascarilla";
  if (lower.includes("ampolla") || lower.includes("fusio")) return "Ampolla";
  if (lower.includes("polvo") || lower.includes("decoloran")) return "Polvo Decolorante";
  if (lower.includes("booster") || lower.includes("booter")) return "Booster";
  if (lower.includes("keratina") || lower.includes("alisado") || lower.includes("botox")) return "Tratamiento / Keratina";
  if (lower.includes("oleo") || lower.includes("óleo") || lower.includes("aceite") || lower.includes("serum")) return "Óleo / Serum";
  if (lower.includes("termo") || lower.includes("protector") || lower.includes("leave in")) return "Termoprotector";
  return raw.trim();
}

export function processSuppliesData(rawRows: any[][], sheetId: string): SuppliesDashboardResponse {
  // Check header
  let dataRows = rawRows;
  if (dataRows.length > 0 && String(dataRows[0][0]).toLowerCase().includes("fecha")) {
    dataRows = dataRows.slice(1);
  }

  const yearlyMap = new Map<
    string,
    {
      despachosCount: number;
      costoTotal: number;
      dependientesSet: Set<string>;
      marcasSet: Set<string>;
      conOatcCount: number;
      conTicketCount: number;
    }
  >();

  const monthlyMap = new Map<string, { despachosCount: number; costoTotal: number }>();

  const stylistMap = new Map<
    string,
    {
      totalDespachos: number;
      costoTotal: number;
      marcasMap: Map<string, number>;
      insumosMap: Map<string, number>;
      ultimoDespacho: string;
    }
  >();

  const brandMap = new Map<
    string,
    {
      despachosCount: number;
      costoTotal: number;
      productosMap: Map<string, number>;
    }
  >();

  const typeMap = new Map<string, { despachosCount: number; costoTotal: number }>();

  let totalDespachos = 0;
  let totalCostoRegistrado = 0;
  let conOatcCount = 0;
  let conTicketCount = 0;
  let usoInternoCount = 0;

  const validDispatches: SupplyDispatchRecord[] = [];

  for (let idx = 0; idx < dataRows.length; idx++) {
    const row = dataRows[idx];
    if (!row || row.length === 0) continue;

    const fechaIso = parseExcelDateToIso(row[0]) || "";
    const anio = fechaIso ? fechaIso.substring(0, 4) : "SIN_FECHA";
    const mes = fechaIso ? fechaIso.substring(5, 7) : "00";
    const periodo = fechaIso ? fechaIso.substring(0, 7) : "SIN_FECHA";
    const diaSemana = fechaIso ? getDayOfWeek(fechaIso) : undefined;

    const rawDependiente = String(row[1] || "").trim();
    const dependiente = rawDependiente && rawDependiente !== "?" ? rawDependiente : "Sin Asignar";

    const rawProducto = String(row[2] || "").trim();
    const producto = rawProducto || "Insumo No Especificado";

    const marca = normalizeBrandName(String(row[3] || ""));
    const tipo = normalizeTypeName(String(row[4] || ""));
    const cantidad = parseSafeNumber(row[5]) || 1;
    const volumen = row[6] ? String(row[6]).trim() : undefined;
    const observacion = row[8] ? String(row[8]).trim() : undefined;

    const rawCosto = parseSafeNumber(row[10]);
    const costo = rawCosto > 0 ? rawCosto : undefined;

    const ticket = row[11] ? String(row[11]).trim() : undefined;
    const hora = parseExcelTime(row[12]) || (row[12] ? String(row[12]).trim() : undefined);
    const oatcId = row[13] ? String(row[13]).trim() : undefined;
    const clienteNombre = row[14] ? String(row[14]).trim() : undefined;
    const dni = row[15] ? String(row[15]).trim() : undefined;

    let trazabilidad: "CON_OATC" | "CON_TICKET" | "USO_INTERNO" = "USO_INTERNO";
    if (oatcId && oatcId !== "" && oatcId !== "0") {
      trazabilidad = "CON_OATC";
      conOatcCount++;
    } else if ((ticket && ticket !== "" && ticket !== "?") || (clienteNombre && clienteNombre !== "")) {
      trazabilidad = "CON_TICKET";
      conTicketCount++;
    } else {
      usoInternoCount++;
    }

    totalDespachos++;
    if (costo) totalCostoRegistrado += costo;

    // 1. Yearly Map
    let yEntry = yearlyMap.get(anio);
    if (!yEntry) {
      yEntry = {
        despachosCount: 0,
        costoTotal: 0,
        dependientesSet: new Set(),
        marcasSet: new Set(),
        conOatcCount: 0,
        conTicketCount: 0
      };
      yearlyMap.set(anio, yEntry);
    }
    yEntry.despachosCount++;
    if (costo) yEntry.costoTotal += costo;
    if (dependiente !== "Sin Asignar") yEntry.dependientesSet.add(dependiente);
    if (marca !== "Sin Marca") yEntry.marcasSet.add(marca);
    if (trazabilidad === "CON_OATC") yEntry.conOatcCount++;
    if (trazabilidad === "CON_TICKET") yEntry.conTicketCount++;

    // 2. Monthly Map
    if (periodo !== "SIN_FECHA") {
      let mEntry = monthlyMap.get(periodo);
      if (!mEntry) {
        mEntry = { despachosCount: 0, costoTotal: 0 };
        monthlyMap.set(periodo, mEntry);
      }
      mEntry.despachosCount++;
      if (costo) mEntry.costoTotal += costo;
    }

    // 3. Stylist Map
    if (dependiente !== "Sin Asignar") {
      let sEntry = stylistMap.get(dependiente);
      if (!sEntry) {
        sEntry = {
          totalDespachos: 0,
          costoTotal: 0,
          marcasMap: new Map(),
          insumosMap: new Map(),
          ultimoDespacho: fechaIso
        };
        stylistMap.set(dependiente, sEntry);
      }
      sEntry.totalDespachos++;
      if (costo) sEntry.costoTotal += costo;
      if (fechaIso && fechaIso > sEntry.ultimoDespacho) sEntry.ultimoDespacho = fechaIso;
      sEntry.marcasMap.set(marca, (sEntry.marcasMap.get(marca) || 0) + 1);
      sEntry.insumosMap.set(tipo, (sEntry.insumosMap.get(tipo) || 0) + 1);
    }

    // 4. Brand Map
    let bEntry = brandMap.get(marca);
    if (!bEntry) {
      bEntry = { despachosCount: 0, costoTotal: 0, productosMap: new Map() };
      brandMap.set(marca, bEntry);
    }
    bEntry.despachosCount++;
    if (costo) bEntry.costoTotal += costo;
    bEntry.productosMap.set(producto, (bEntry.productosMap.get(producto) || 0) + 1);

    // 5. Type Map
    let tEntry = typeMap.get(tipo);
    if (!tEntry) {
      tEntry = { despachosCount: 0, costoTotal: 0 };
      typeMap.set(tipo, tEntry);
    }
    tEntry.despachosCount++;
    if (costo) tEntry.costoTotal += costo;

    // Push into dispatches
    validDispatches.push({
      id: `DSP-${idx + 1}`,
      fecha: fechaIso,
      diaSemana,
      anio,
      mes,
      dependiente,
      producto,
      marca,
      tipo,
      cantidad,
      volumen,
      observacion,
      costo: costo ? Math.round(costo * 100) / 100 : undefined,
      ticket,
      hora,
      oatcId,
      clienteNombre,
      dni,
      trazabilidad
    });
  }

  // Format Yearly Metrics
  const yearlyTrends: SupplyYearlyMetric[] = Array.from(yearlyMap.entries())
    .map(([anio, val]) => ({
      anio,
      despachosCount: val.despachosCount,
      costoTotal: Math.round(val.costoTotal * 100) / 100,
      costoPromedio:
        val.despachosCount > 0 ? Math.round((val.costoTotal / val.despachosCount) * 100) / 100 : 0,
      dependientesCount: val.dependientesSet.size,
      marcasCount: val.marcasSet.size,
      conOatcCount: val.conOatcCount,
      conTicketCount: val.conTicketCount
    }))
    .sort((a, b) => a.anio.localeCompare(b.anio));

  // Format Monthly Metrics
  const monthlyTrends: SupplyMonthlyMetric[] = Array.from(monthlyMap.entries())
    .map(([periodo, val]) => ({
      periodo,
      anio: periodo.substring(0, 4),
      mes: periodo.substring(5, 7),
      despachosCount: val.despachosCount,
      costoTotal: Math.round(val.costoTotal * 100) / 100
    }))
    .sort((a, b) => a.periodo.localeCompare(b.periodo));

  // Format Stylist Rankings
  const stylistRankings: SupplyStylistConsumption[] = Array.from(stylistMap.entries())
    .map(([dependiente, val]) => {
      const topMarcas = Array.from(val.marcasMap.entries())
        .map(([marca, count]) => ({ marca, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      const topInsumos = Array.from(val.insumosMap.entries())
        .map(([tipo, count]) => ({ tipo, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      return {
        dependiente,
        totalDespachos: val.totalDespachos,
        costoTotal: Math.round(val.costoTotal * 100) / 100,
        costoPromedio:
          val.totalDespachos > 0 ? Math.round((val.costoTotal / val.totalDespachos) * 100) / 100 : 0,
        shareDespachosPct:
          totalDespachos > 0 ? Math.round((val.totalDespachos / totalDespachos) * 1000) / 10 : 0,
        topMarcas,
        topInsumos,
        ultimoDespacho: val.ultimoDespacho
      };
    })
    .sort((a, b) => b.totalDespachos - a.totalDespachos);

  // Format Brand Rankings
  const brandRankings: SupplyBrandMetric[] = Array.from(brandMap.entries())
    .map(([marca, val]) => {
      const topProductos = Array.from(val.productosMap.entries())
        .map(([producto, count]) => ({ producto, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      return {
        marca,
        despachosCount: val.despachosCount,
        costoTotal: Math.round(val.costoTotal * 100) / 100,
        sharePct:
          totalDespachos > 0 ? Math.round((val.despachosCount / totalDespachos) * 1000) / 10 : 0,
        topProductos
      };
    })
    .sort((a, b) => b.despachosCount - a.despachosCount);

  // Format Type Rankings
  const typeRankings: SupplyTypeMetric[] = Array.from(typeMap.entries())
    .map(([tipo, val]) => ({
      tipo,
      despachosCount: val.despachosCount,
      costoTotal: Math.round(val.costoTotal * 100) / 100,
      sharePct:
        totalDespachos > 0 ? Math.round((val.despachosCount / totalDespachos) * 1000) / 10 : 0
    }))
    .sort((a, b) => b.despachosCount - a.despachosCount);

  // Extract the most recent 3,000 dispatches for the responsive audit table
  const recentDispatches = validDispatches.slice(-3500).reverse();

  const totalCostoRegRound = Math.round(totalCostoRegistrado * 100) / 100;
  const costoPromedioPorDespacho =
    totalDespachos > 0 ? Math.round((totalCostoRegRound / totalDespachos) * 100) / 100 : 0;
  const tasaConTrazabilidadPct =
    totalDespachos > 0
      ? Math.round(((conOatcCount + conTicketCount) / totalDespachos) * 1000) / 10
      : 0;

  return {
    metadata: {
      totalFilas: totalDespachos,
      sheetId,
      generatedAt: new Date().toISOString()
    },
    kpis: {
      totalDespachos,
      totalCostoRegistrado: totalCostoRegRound,
      costoPromedioPorDespacho,
      totalColaboradores: stylistMap.size,
      totalMarcas: brandMap.size,
      totalTipos: typeMap.size,
      tasaConTrazabilidadPct,
      conOatcCount,
      conTicketCount,
      usoInternoCount
    },
    yearlyTrends,
    monthlyTrends,
    stylistRankings,
    brandRankings,
    typeRankings,
    recentDispatches
  };
}

