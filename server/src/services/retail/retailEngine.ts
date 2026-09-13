import {
  TicketRecord,
  TicketDetailRecord,
  KardexRecord,
  ProductMarginRanking,
  BrandPortfolioMetric
} from "../../types.js";
import {
  parseExcelDateToIso,
  parseSafeNumber,
  getDayOfWeek,
  extractHourFromRawDate,
  parseClientField,
  ORDERED_DAYS,
  DAY_SHORT_LABELS
} from "../parsers/dataParsers.js";

function normalizeBrandName(raw: string): string {
  if (!raw) return "Sin Marca";
  const clean = raw.trim();
  const upper = clean.toUpperCase();
  if (upper.startsWith("KERASTAS")) return "Kerastase";
  if (upper.startsWith("ALFAPAR")) return "Alfaparf";
  if (upper.startsWith("OPI") || upper.startsWith("OPI.")) return "OPI";
  if (upper.startsWith("LOREAL")) return "Loreal";
  if (upper.startsWith("WELLA")) return "Wella";
  if (upper.startsWith("BAOR")) return "Baor";
  if (upper.startsWith("REDKEN")) return "Redken";
  if (upper.startsWith("REVLON")) return "Revlon";
  if (upper.startsWith("AMERICAN CREW")) return "American Crew";
  if (upper.startsWith("NIOXIN")) return "Nioxin";
  if (upper.startsWith("ABRIL NATURE")) return "Abril Nature";
  if (upper.startsWith("TIGI")) return "Tigi";
  if (upper.startsWith("SEBASTIAN")) return "Sebastian";
  if (upper.startsWith("ITALIAN MAX")) return "Italian Max";
  if (upper.startsWith("SENSCIENCE")) return "Senscience";
  if (upper.startsWith("AGI")) return "Agi Max";
  if (upper.startsWith("ESSIE")) return "Essie";
  if (upper.startsWith("ORLY")) return "Orly";
  if (upper === "GENERAL" || upper === "SIN MARCA") return "General / Sin Marca";
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

function getFranjaFromHour(h: number): string {
  if (h >= 8 && h < 12) return "MAÑANA (08:00 - 12:00)";
  if (h >= 12 && h < 16) return "MEDIODÍA (12:00 - 16:00)";
  if (h >= 16 && h < 20) return "TARDE PICO (16:00 - 20:00)";
  return "NOCHE (20:00 - 23:00)";
}

export function processRetailAndInventory(
  ticketsRaw: any[][] = [],
  ventasDetalleRaw: any[][] = [],
  kardexRaw: any[][] = [],
  productosCatalogoRaw: any[][] = [],
  resolveAgentName: (raw: string) => string
): {
  tickets: TicketRecord[];
  ticketDetails: TicketDetailRecord[];
  kardex: KardexRecord[];
  productRankings: ProductMarginRanking[];
  brandPortfolioMetrics: BrandPortfolioMetric[];
  ticketMap: Map<string, TicketRecord>;
  skuCostMap: Map<string, number>;
  totalCostoRetailAcumulado: number;
} {
  // 1. Process Kardex
  const kardex: KardexRecord[] = [];
  const skuCostMap = new Map<string, number>();

  kardexRaw.forEach((row, idx) => {
    const idMov = String(row[0] || "").trim();
    if (!idMov || idMov === "ID_MOVIMIENTO") return;

    const fechaHoraIso = parseExcelDateToIso(row[1]);
    const tipoMov = String(row[2] || "").trim().toUpperCase();
    const sku = String(row[3] || "").trim();
    const descripcion = String(row[4] || "").trim();
    const cantidad = parseSafeNumber(row[5]);
    const origen = String(row[6] || "").trim();
    const destino = String(row[7] || "").trim();
    const documentoRef = row[8] ? String(row[8]).trim() : undefined;
    const costoUnitario = parseSafeNumber(row[9]);

    if (sku && costoUnitario > 0) {
      skuCostMap.set(sku, costoUnitario);
    }

    kardex.push({
      idMovimiento: idMov || `MOV-${idx}`,
      fechaHora: fechaHoraIso,
      tipoMovimiento: tipoMov,
      sku,
      descripcion,
      cantidad,
      origen,
      destino,
      documentoRef,
      costoUnitario
    });
  });

  // 2. Process Tickets
  const tickets: TicketRecord[] = [];
  const ticketMap = new Map<string, TicketRecord>();

  ticketsRaw.forEach((row) => {
    const ticketId = String(row[0] || "").trim();
    if (!ticketId || ticketId === "Ticket") return;

    const fechaIso = parseExcelDateToIso(row[1]);
    const diaSemana = getDayOfWeek(fechaIso);
    const rawCliente = String(row[2] || "").trim();
    const parsedCliente = parseClientField(rawCliente);
    const rawAsesor = String(row[3] || "").trim();
    const asesor = resolveAgentName(rawAsesor);

    const subtotal = parseSafeNumber(row[4]);
    const total = parseSafeNumber(row[5]) || subtotal;
    const estado = String(row[6] || "COMPLETADO").trim();
    const metodoPago = String(row[9] || "EFECTIVO").trim().toUpperCase();
    const tipoDoc = String(row[10] || "Ticket").trim();
    const nroDoc = String(row[11] || ticketId).trim();
    const expectativas = row[7] ? String(row[7]).trim() : undefined;

    const record: TicketRecord = {
      ticket: ticketId,
      fecha: fechaIso,
      diaSemana,
      cliente: rawCliente,
      clienteNombreLimpio: parsedCliente.nombre,
      clienteDni: parsedCliente.dni,
      clienteCelular: parsedCliente.celular,
      asesor,
      subtotal,
      total,
      estado,
      metodoPago,
      tipoDoc,
      nroDoc,
      expectativas
    };

    tickets.push(record);
    ticketMap.set(ticketId, record);
  });

  // 3. Process Product Catalog
  const catalogMap = new Map<
    string,
    {
      sku: string;
      marca: string;
      linea: string;
      nombre: string;
      presentacion: string;
      stockTienda: number;
      stockPrincipal: number;
    }
  >();

  productosCatalogoRaw.forEach((row) => {
    const sku = String(row[0] || "").trim();
    if (!sku || sku === "SKU") return;
    const rawMarca = String(row[1] || "").trim();
    const rawLinea = String(row[2] || "").trim();
    const rawNombre = String(row[3] || "").trim();
    const rawPresentacion = String(row[4] || "").trim();
    const stockTienda = parseSafeNumber(row[7]);
    const stockPrincipal = parseSafeNumber(row[8]);

    catalogMap.set(sku, {
      sku,
      marca: normalizeBrandName(rawMarca),
      linea: rawLinea || "General",
      nombre: rawNombre,
      presentacion: rawPresentacion,
      stockTienda,
      stockPrincipal
    });
  });

  // 4. Process Sales Details
  const uniqueSellingDays = new Set(
    tickets
      .filter((t) => t.estado !== "ANULADO" && t.fecha)
      .map((t) => t.fecha.slice(0, 10))
  );
  const diasActivos = Math.max(1, uniqueSellingDays.size);
  const totalValidTickets = Math.max(1, tickets.filter((t) => t.estado !== "ANULADO").length);

  const ticketDetails: TicketDetailRecord[] = [];
  const productStatsMap = new Map<
    string,
    {
      sku: string;
      marca: string;
      linea: string;
      producto: string;
      presentacion: string;
      unidades: number;
      tickets: Set<string>;
      ingreso: number;
      ventasPorHora: number[];
      ventasPorDia: Map<string, number>;
      stockTienda: number;
      stockPrincipal: number;
    }
  >();

  const brandStatsMap = new Map<
    string,
    {
      marca: string;
      totalUnidades: number;
      totalIngreso: number;
      tickets: Set<string>;
      skus: Set<string>;
      ventasPorHora: number[];
      ventasPorDia: Map<string, number>;
      lineasMap: Map<string, { unidades: number; ingreso: number }>;
    }
  >();

  let totalCostoRetailAcumulado = 0;

  ventasDetalleRaw.forEach((row, idx) => {
    const ticketId = String(row[1] || "").trim();
    if (!ticketId || ticketId === "Ticket") return;

    const fechaIso = parseExcelDateToIso(row[0]);
    const diaSemana = getDayOfWeek(fechaIso);
    const sku = String(row[2] || "").trim();
    const catalogInfo = catalogMap.get(sku);
    const rawProdName = String(row[3] || "Producto").trim();
    const producto = catalogInfo?.nombre || rawProdName;
    const marca = catalogInfo?.marca || "Sin Marca";
    const linea = catalogInfo?.linea || "General";
    const presentacion = catalogInfo?.presentacion || "";
    const stockTienda = catalogInfo?.stockTienda || 0;
    const stockPrincipal = catalogInfo?.stockPrincipal || 0;

    const cantidad = parseSafeNumber(row[4]) || 1;
    const precioUnitario = parseSafeNumber(row[5]);
    const subtotal = parseSafeNumber(row[6]) || cantidad * precioUnitario;

    const costoUnit = skuCostMap.get(sku) || 0;
    const margen = subtotal - cantidad * costoUnit;
    totalCostoRetailAcumulado += cantidad * costoUnit;

    const hour = extractHourFromRawDate(row[0]);

    ticketDetails.push({
      id: `VD-${idx + 1}`,
      ticket: ticketId,
      fecha: fechaIso,
      diaSemana,
      sku,
      producto,
      cantidad,
      precioUnitario,
      subtotal,
      costoUnitario: costoUnit > 0 ? costoUnit : undefined,
      margenSoles: costoUnit > 0 ? Math.round(margen * 100) / 100 : undefined
    });

    const pKey = sku || producto;
    const current = productStatsMap.get(pKey) || {
      sku,
      marca,
      linea,
      producto,
      presentacion,
      unidades: 0,
      tickets: new Set<string>(),
      ingreso: 0,
      ventasPorHora: new Array(24).fill(0),
      ventasPorDia: new Map<string, number>(),
      stockTienda,
      stockPrincipal
    };

    current.unidades += cantidad;
    current.ingreso += subtotal;
    current.ventasPorHora[hour] += cantidad;
    current.ventasPorDia.set(diaSemana, (current.ventasPorDia.get(diaSemana) || 0) + cantidad);
    if (ticketId) current.tickets.add(ticketId);
    productStatsMap.set(pKey, current);

    // Track brand aggregate
    if (!brandStatsMap.has(marca)) {
      brandStatsMap.set(marca, {
        marca,
        totalUnidades: 0,
        totalIngreso: 0,
        tickets: new Set<string>(),
        skus: new Set<string>(),
        ventasPorHora: new Array(24).fill(0),
        ventasPorDia: new Map<string, number>(),
        lineasMap: new Map()
      });
    }
    const bStats = brandStatsMap.get(marca)!;
    bStats.totalUnidades += cantidad;
    bStats.totalIngreso += subtotal;
    bStats.ventasPorHora[hour] += cantidad;
    bStats.ventasPorDia.set(diaSemana, (bStats.ventasPorDia.get(diaSemana) || 0) + cantidad);
    if (ticketId) bStats.tickets.add(ticketId);
    if (sku) bStats.skus.add(sku);

    const lCur = bStats.lineasMap.get(linea) || { unidades: 0, ingreso: 0 };
    lCur.unidades += cantidad;
    lCur.ingreso += subtotal;
    bStats.lineasMap.set(linea, lCur);
  });

  const rawProductList = Array.from(productStatsMap.values()).sort((a, b) => b.unidades - a.unidades);
  const grandTotalRetailUnits = rawProductList.reduce((acc, p) => acc + p.unidades, 0) || 1;
  const grandTotalRetailIngreso = rawProductList.reduce((acc, p) => acc + p.ingreso, 0) || 1;

  let accumulatedUnits = 0;
  const productRankings: ProductMarginRanking[] = rawProductList.map((p) => {
    accumulatedUnits += p.unidades;
    const cumulativeShare = accumulatedUnits / grandTotalRetailUnits;
    let clasificacionABC: "A" | "B" | "C" = "C";
    if (cumulativeShare <= 0.80 || p.unidades === rawProductList[0]?.unidades) {
      clasificacionABC = "A";
    } else if (cumulativeShare <= 0.95) {
      clasificacionABC = "B";
    } else {
      clasificacionABC = "C";
    }

    let peakHour = 12;
    let maxHourUnits = -1;
    p.ventasPorHora.forEach((cnt, h) => {
      if (cnt > maxHourUnits) {
        maxHourUnits = cnt;
        peakHour = h;
      }
    });

    let peakDay = "Sábado";
    let maxDayUnits = -1;
    const ventasPorDia = ORDERED_DAYS.map((dia) => {
      const unidades = p.ventasPorDia.get(dia) || 0;
      if (unidades > maxDayUnits) {
        maxDayUnits = unidades;
        peakDay = dia;
      }
      return {
        dia,
        label: DAY_SHORT_LABELS[dia] || dia,
        unidades
      };
    });

    const rotacionVelocidadDiaria = Math.round((p.unidades / diasActivos) * 100) / 100;
    const penetracionTicketsPct = Math.round((p.tickets.size / totalValidTickets) * 1000) / 10;
    const ingresoTotal = Math.round(p.ingreso * 100) / 100;
    const precioPromedio = p.unidades > 0 ? Math.round((p.ingreso / p.unidades) * 100) / 100 : 0;
    const stockTotal = p.stockTienda + p.stockPrincipal;

    return {
      sku: p.sku,
      marca: p.marca,
      linea: p.linea,
      producto: p.producto,
      presentacion: p.presentacion,
      unidadesVendidas: p.unidades,
      ticketsCount: p.tickets.size,
      ingresoTotal,
      precioPromedio,
      rotacionVelocidadDiaria,
      penetracionTicketsPct,
      clasificacionABC,
      horaPico: peakHour,
      franjaPico: getFranjaFromHour(peakHour),
      ventasPorHora: p.ventasPorHora,
      diaPico: peakDay,
      ventasPorDia,
      stockTienda: p.stockTienda,
      stockPrincipal: p.stockPrincipal,
      stockTotal,
      costoTotalEstimado: 0,
      margenSoles: 0,
      margenPorcentaje: 0
    };
  });

  const brandPortfolioMetrics: BrandPortfolioMetric[] = Array.from(brandStatsMap.values())
    .map((b) => {
      let peakHour = 12;
      let maxHourUnits = -1;
      b.ventasPorHora.forEach((cnt, h) => {
        if (cnt > maxHourUnits) {
          maxHourUnits = cnt;
          peakHour = h;
        }
      });

      let peakBrandDay = "Sábado";
      let maxBrandDayUnits = -1;
      const ventasPorDia = ORDERED_DAYS.map((dia) => {
        const unidades = b.ventasPorDia.get(dia) || 0;
        if (unidades > maxBrandDayUnits) {
          maxBrandDayUnits = unidades;
          peakBrandDay = dia;
        }
        return {
          dia,
          label: DAY_SHORT_LABELS[dia] || dia,
          unidades
        };
      });

      const ventasPorHora = b.ventasPorHora
        .map((unidades, hora) => ({
          hora,
          label: `${hora.toString().padStart(2, "0")}:00`,
          unidades
        }))
        .filter((item) => item.hora >= 8 && item.hora <= 22);

      const topLineas = Array.from(b.lineasMap.entries())
        .map(([linea, stat]) => ({
          linea,
          unidades: stat.unidades,
          ingreso: Math.round(stat.ingreso * 100) / 100
        }))
        .sort((a, b) => b.unidades - a.unidades)
        .slice(0, 5);

      return {
        marca: b.marca,
        totalUnidades: b.totalUnidades,
        totalIngreso: Math.round(b.totalIngreso * 100) / 100,
        totalTickets: b.tickets.size,
        shareUnidadesPct: Math.round((b.totalUnidades / grandTotalRetailUnits) * 1000) / 10,
        shareIngresoPct: Math.round((b.totalIngreso / grandTotalRetailIngreso) * 1000) / 10,
        productosCount: b.skus.size,
        horaPico: peakHour,
        franjaPico: getFranjaFromHour(peakHour),
        diaPico: peakBrandDay,
        ventasPorHora,
        ventasPorDia,
        topLineas
      };
    })
    .sort((a, b) => b.totalUnidades - a.totalUnidades);

  return {
    tickets,
    ticketDetails,
    kardex,
    productRankings,
    brandPortfolioMetrics,
    ticketMap,
    skuCostMap,
    totalCostoRetailAcumulado
  };
}
