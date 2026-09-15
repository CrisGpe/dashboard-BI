import {
  CashServiceSaleRecord,
  ServiceCategoryMetric,
  OatcCategoryMetric,
  SpecificPortfolioItemMetric,
  OatcRecord,
  ProductMarginRanking
} from "../../types.js";
import { parseExcelDateToIso, parseSafeNumber, getDayOfWeek } from "../parsers/dataParsers.js";
import { normalizeBrandName } from "./retailEngine.js";

export function normalizeOatcCategory(catRaw: string, serviceName?: string): string {
  let c = (catRaw || "").trim().toLowerCase();
  const s = (serviceName || "").trim().toLowerCase();

  // If category is generic or "general", infer from service name
  if (!c || c === "general" || c === "otros" || c === "otros servicios") {
    if (
      s.includes("shampoo") ||
      s.includes("mascarilla") ||
      s.includes("oleo") ||
      s.includes("óleo") ||
      s.includes("serum") ||
      s.includes("crema") ||
      s.includes("bain") ||
      s.includes("revlon") ||
      s.includes("baor") ||
      s.includes("equave") ||
      s.includes("small talk")
    ) {
      return "Retail & Productos";
    }
    if (
      s.includes("tinte") ||
      s.includes("color") ||
      s.includes("mechas") ||
      s.includes("balayage") ||
      s.includes("decolor")
    ) {
      return "Colorimetría";
    }
    if (s.includes("corte")) {
      return "Corte y Diseño";
    }
    if (
      s.includes("depila") ||
      s.includes("facial") ||
      s.includes("cosmiatri") ||
      s.includes("limpieza")
    ) {
      return "Cosmiatría";
    }
    if (
      s.includes("tratamiento") ||
      s.includes("kérastase") ||
      s.includes("kerastase") ||
      s.includes("ampolla")
    ) {
      return "Tratamientos Capilares";
    }
    if (
      s.includes("peinado") ||
      s.includes("cepillado") ||
      s.includes("brushing") ||
      s.includes("planchado")
    ) {
      return "Peinados y Cepillados";
    }
    if (s.includes("alisad") || s.includes("lacead") || s.includes("botox")) {
      return "Alisados, Laceados & Botox";
    }
    if (
      s.includes("manicur") ||
      s.includes("pedicur") ||
      s.includes("uña") ||
      s.includes("unas")
    ) {
      return "Manicure & Pedicure";
    }
  }

  if (c.includes("color")) return "Colorimetría";
  if (c.includes("corte")) return "Corte y Diseño";
  if (c.includes("cosmiatri")) return "Cosmiatría";
  if (c.includes("tratamiento")) return "Tratamientos Capilares";
  if (c.includes("peinado") || c.includes("cepillado") || c.includes("brushing")) return "Peinados y Cepillados";
  if (c.includes("alisad") || c.includes("lacead") || c.includes("botox")) return "Alisados, Laceados & Botox";
  if (c.includes("cosmetol")) return "Cosmetología";
  if (c.includes("barber")) return "Barbería";
  if (c.includes("manicur") || c.includes("pedicur") || c.includes("uñas") || c.includes("unas")) return "Manicure & Pedicure";
  if (c.includes("producto") || c.includes("retail") || c.includes("venta")) return "Retail & Productos";
  return catRaw.trim();
}

export function processCashAndPortfolio(
  ventasCajaRaw: any[][] = [],
  orders: OatcRecord[] = [],
  productRankings: ProductMarginRanking[] = [],
  resolveAgentName: (raw: string) => string,
  ventasDetalleRaw: any[][] = [],
  productosCatalogoRaw: any[][] = []
): {
  cashServiceSales: CashServiceSaleRecord[];
  serviceCategoryRankings: ServiceCategoryMetric[];
  oatcCategoryMetrics: OatcCategoryMetric[];
  specificPortfolioRankings: SpecificPortfolioItemMetric[];
  cashPaymentTotals: {
    totalFacturacion: number;
    totalComisiones: number;
    tarjeta: number;
    efectivo: number;
    deposito: number;
  };
} {
  const cashServiceSales: CashServiceSaleRecord[] = [];
  const categoryStatsMap = new Map<
    string,
    {
      categoria: string;
      subcategoria: string;
      count: number;
      facturacion: number;
      comisiones: number;
    }
  >();

  // Index Product Catalog (BBDD_Productos)
  const catalogMap = new Map<
    string,
    {
      sku: string;
      marca: string;
      linea: string;
      nombre: string;
      presentacion: string;
    }
  >();

  productosCatalogoRaw.forEach((row) => {
    const sku = String(row[0] || "").trim();
    if (!sku || sku === "SKU") return;
    const rawMarca = String(row[1] || "").trim();
    const rawLinea = String(row[2] || "").trim();
    const rawNombre = String(row[3] || "").trim();
    const rawPresentacion = String(row[4] || "").trim();

    catalogMap.set(sku, {
      sku,
      marca: normalizeBrandName(rawMarca),
      linea: rawLinea || "General",
      nombre: rawNombre,
      presentacion: rawPresentacion
    });
  });

  // Index Ventas_Detalle by Ticket
  const detTicketMap = new Map<string, Array<{ sku: string; prod: string }>>();
  ventasDetalleRaw.forEach((row) => {
    const ticketId = String(row[1] || "").trim();
    const sku = String(row[2] || "").trim();
    const prod = String(row[3] || "").trim();
    if (ticketId && ticketId !== "Ticket") {
      if (!detTicketMap.has(ticketId)) {
        detTicketMap.set(ticketId, []);
      }
      detTicketMap.get(ticketId)!.push({ sku, prod });
    }
  });

  let totalFacturacionServiciosCaja = 0;
  let totalComisionesServiciosCaja = 0;
  let pagoServiciosTarjeta = 0;
  let pagoServiciosEfectivo = 0;
  let pagoServiciosDeposito = 0;

  ventasCajaRaw.forEach((row, idx) => {
    const ticketId = String(row[1] || "").trim();
    if (!ticketId || ticketId === "Ticket_ID") return;

    const fechaIso = parseExcelDateToIso(row[0]);
    const diaSemana = getDayOfWeek(fechaIso);
    const idOatc = row[2] || idx + 1;
    const cliente = String(row[3] || "Cliente Casual").trim();
    const agente = resolveAgentName(String(row[4] || ""));
    const servOrig = String(row[5] || "").trim();
    let servFin = String(row[6] || servOrig).trim();
    let subCat = String(row[7] || "General").trim();
    let cat = String(row[8] || "Estilismo").trim();

    const isRetailItem =
      servOrig.toUpperCase() === "VENTAS" ||
      servOrig.toUpperCase().includes("VENTA") ||
      subCat.toUpperCase() === "VENTAS" ||
      subCat.toUpperCase() === "VENTA PRODUCTO" ||
      cat.toUpperCase() === "PRODUCTO" ||
      cat.toUpperCase() === "VENTAS";

    let resolvedSku: string | undefined = undefined;
    let resolvedMarca: string | undefined = undefined;
    let resolvedLinea: string | undefined = undefined;
    let isRetail = false;

    if (isRetailItem) {
      isRetail = true;
      // 1. Look up Ticket in Ventas_Detalle (Col B)
      const detItems = detTicketMap.get(ticketId);
      if (detItems && detItems.length > 0) {
        let match = detItems.find(
          (it) =>
            servFin.toLowerCase().includes(it.prod.toLowerCase()) ||
            it.prod.toLowerCase().includes(servFin.toLowerCase())
        );
        if (!match && detItems.length === 1) match = detItems[0];
        resolvedSku = match ? match.sku : detItems[0].sku;
        const catProd = catalogMap.get(resolvedSku);
        if (catProd) {
          resolvedMarca = catProd.marca;
          resolvedLinea = catProd.linea;
        }
      }

      // 2. Fallback: Search in BBDD_Productos by product name (Col G)
      if (!resolvedMarca) {
        for (const [sku, p] of catalogMap.entries()) {
          if (
            p.nombre &&
            (servFin.toLowerCase().includes(p.nombre.toLowerCase()) ||
              p.nombre.toLowerCase().includes(servFin.toLowerCase()))
          ) {
            resolvedSku = sku;
            resolvedMarca = p.marca;
            resolvedLinea = p.linea;
            break;
          }
        }
      }

      const finalBrand =
        resolvedMarca &&
        resolvedMarca !== "General / Sin Marca" &&
        resolvedMarca !== "Sin Marca" &&
        resolvedMarca !== "GENERAL"
          ? resolvedMarca
          : "Otras Marcas";

      subCat = `Venta Retail - ${finalBrand}`;
      cat = "Retail";
    }

    const mEfectivo = parseSafeNumber(row[9]);
    const mTarjeta = parseSafeNumber(row[10]);
    const mDeposito = parseSafeNumber(row[11]);
    const mFinal = parseSafeNumber(row[12]) || mEfectivo + mTarjeta + mDeposito;
    const comision = parseSafeNumber(row[13]);
    const estado = String(row[14] || "Cobrado").trim();
    const ruc = String(row[15] || "").trim();
    const boleta = String(row[16] || "").trim();
    const mes = String(row[17] || "").trim();
    const anio = String(row[18] || "").trim();

    totalFacturacionServiciosCaja += mFinal;
    totalComisionesServiciosCaja += comision;
    pagoServiciosTarjeta += mTarjeta;
    pagoServiciosEfectivo += mEfectivo;
    pagoServiciosDeposito += mDeposito;

    const record: CashServiceSaleRecord = {
      id: `CS-${idx + 1}`,
      fecha: fechaIso,
      diaSemana,
      ticketId,
      idOatc,
      cliente,
      agente,
      servicioOriginal: servOrig,
      servicioFinal: servFin,
      servicioSubCategoria: subCat,
      servicioCategoria: cat,
      montoEfectivo: mEfectivo,
      montoTarjeta: mTarjeta,
      montoDeposito: mDeposito,
      montoFinal: mFinal,
      comision,
      estado,
      ruc,
      boleta,
      mes,
      anio,
      sku: resolvedSku,
      productoMarca: resolvedMarca,
      productoLinea: resolvedLinea,
      isRetail
    };

    cashServiceSales.push(record);

    // Category rankings
    const catKey = `${cat}_${subCat}`;
    const curCat = categoryStatsMap.get(catKey) || {
      categoria: cat,
      subcategoria: subCat,
      count: 0,
      facturacion: 0,
      comisiones: 0
    };
    curCat.count++;
    curCat.facturacion += mFinal;
    curCat.comisiones += comision;
    categoryStatsMap.set(catKey, curCat);
  });

  const serviceCategoryRankings: ServiceCategoryMetric[] = Array.from(categoryStatsMap.values())
    .map((c) => {
      const margenSoles = c.facturacion - c.comisiones;
      const margenPct = c.facturacion > 0 ? Math.round((margenSoles / c.facturacion) * 100) : 0;
      return {
        categoria: c.categoria,
        subcategoria: c.subcategoria,
        serviciosCount: c.count,
        facturacionTotal: Math.round(c.facturacion * 100) / 100,
        comisionesTotal: Math.round(c.comisiones * 100) / 100,
        margenSoles: Math.round(margenSoles * 100) / 100,
        margenPct
      };
    })
    .sort((a, b) => b.facturacionTotal - a.facturacionTotal);

  // OATC Canonical Category Metrics & Specific Portfolio
  const oatcOrderCatMap = new Map<string, string>();
  const oatcCategoryMap = new Map<string, {
    categoria: string;
    demandaTotalOatc: number;
    atencionesEfectivas: number;
    canceladasCount: number;
    facturacionTotal: number;
    comisionesTotal: number;
  }>();

  const getOrCreateOatcCat = (catName: string) => {
    let rec = oatcCategoryMap.get(catName);
    if (!rec) {
      rec = {
        categoria: catName,
        demandaTotalOatc: 0,
        atencionesEfectivas: 0,
        canceladasCount: 0,
        facturacionTotal: 0,
        comisionesTotal: 0
      };
      oatcCategoryMap.set(catName, rec);
    }
    return rec;
  };

  orders.forEach((o) => {
    const rawCat = o.tipoOatc || "";
    if (!rawCat.trim()) return;
    const cat = normalizeOatcCategory(rawCat);
    if (
      cat === "Retail & Productos" ||
      cat.toLowerCase().includes("producto") ||
      cat.toLowerCase().includes("venta") ||
      cat.toLowerCase() === "general"
    ) {
      return;
    }

    const rec = getOrCreateOatcCat(cat);
    rec.demandaTotalOatc += 1;
    if (o.isCancelled) {
      rec.canceladasCount += 1;
    } else {
      rec.atencionesEfectivas += 1;
    }

    const idClean = String(o.id || "").replace(/^[^\d]+/, "").trim();
    const numClean = String(o.numeroOatc || "").replace(/^[^\d]+/, "").trim();
    if (idClean) oatcOrderCatMap.set(idClean, cat);
    if (numClean) oatcOrderCatMap.set(numClean, cat);
    if (o.id) oatcOrderCatMap.set(String(o.id).trim(), cat);
  });

  cashServiceSales.forEach((s) => {
    const rawCat = s.servicioCategoria || "";
    if (rawCat.toUpperCase().includes("VENTAS") || rawCat.toUpperCase().includes("RETAIL")) {
      return;
    }

    let matchedCat: string | undefined;
    const sId = String(s.idOatc || "").trim();
    const sIdClean = sId.replace(/^[^\d]+/, "").trim();

    if (sId && oatcOrderCatMap.has(sId)) {
      matchedCat = oatcOrderCatMap.get(sId);
    } else if (sIdClean && oatcOrderCatMap.has(sIdClean)) {
      matchedCat = oatcOrderCatMap.get(sIdClean);
    }

    if (!matchedCat) {
      matchedCat = normalizeOatcCategory(rawCat, s.servicioFinal || s.servicioOriginal);
    }

    if (matchedCat && matchedCat !== "Retail & Productos" && matchedCat !== "General") {
      const rec = getOrCreateOatcCat(matchedCat);
      rec.facturacionTotal += s.montoFinal || 0;
      rec.comisionesTotal += s.comision || 0;
    }
  });

  const oatcCategoryMetrics: OatcCategoryMetric[] = Array.from(oatcCategoryMap.values())
    .filter((c) => c.demandaTotalOatc > 0 && c.categoria !== "General" && c.categoria !== "Retail & Productos")
    .map((c) => {
      const facturacion = Math.round(c.facturacionTotal * 100) / 100;
      const comisiones = Math.round(c.comisionesTotal * 100) / 100;
      const margenSoles = Math.round((facturacion - comisiones) * 100) / 100;
      const margenPct = facturacion > 0 ? Math.round((margenSoles / facturacion) * 100) : 0;
      const tasaCancelacionPct = c.demandaTotalOatc > 0 ? Math.round((c.canceladasCount / c.demandaTotalOatc) * 1000) / 10 : 0;
      const ticketPromedio = c.atencionesEfectivas > 0 ? Math.round((facturacion / c.atencionesEfectivas) * 100) / 100 : 0;

      return {
        categoria: c.categoria,
        demandaTotalOatc: c.demandaTotalOatc,
        atencionesEfectivas: c.atencionesEfectivas,
        canceladasCount: c.canceladasCount,
        tasaCancelacionPct,
        facturacionTotal: facturacion,
        comisionesTotal: comisiones,
        margenSoles,
        margenPct,
        ticketPromedio
      };
    })
    .sort((a, b) => b.facturacionTotal - a.facturacionTotal);

  // Specific Portfolio Map
  const specificPortfolioMap = new Map<string, SpecificPortfolioItemMetric>();

  cashServiceSales.forEach((s) => {
    const rawCat = (s.servicioCategoria || "").trim();
    if (rawCat.toUpperCase().includes("VENTAS") || rawCat.toUpperCase().includes("RETAIL")) return;

    const rawName = (s.servicioFinal || s.servicioOriginal || "").trim();
    if (!rawName || rawName.toLowerCase() === "sin servicio" || rawName.toLowerCase() === "n/a") return;

    const name = rawName.charAt(0).toUpperCase() + rawName.slice(1);
    const id = `srv_${name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`;

    let catPadre = normalizeOatcCategory(rawCat);
    const sId = String(s.idOatc || "").trim();
    const sIdClean = sId.replace(/^[^\d]+/, "").trim();
    if (sId && oatcOrderCatMap.has(sId)) {
      catPadre = oatcOrderCatMap.get(sId)!;
    } else if (sIdClean && oatcOrderCatMap.has(sIdClean)) {
      catPadre = oatcOrderCatMap.get(sIdClean)!;
    }

    const existing = specificPortfolioMap.get(id);
    if (existing) {
      existing.volumen += 1;
      existing.facturacionTotal += s.montoFinal || 0;
      existing.comisionOCostoTotal += s.comision || 0;
    } else {
      specificPortfolioMap.set(id, {
        id,
        nombre: name,
        tipo: "SERVICIO",
        categoriaPadre: catPadre || "Servicios",
        volumen: 1,
        facturacionTotal: s.montoFinal || 0,
        comisionOCostoTotal: s.comision || 0,
        margenSoles: 0,
        margenPct: 0,
        precioPromedio: 0
      });
    }
  });

  productRankings.forEach((p) => {
    const name = (p.producto || "").trim();
    if (!name || name.toLowerCase().includes("sin producto")) return;

    const id = `prd_${(p.sku || name).toLowerCase().replace(/[^a-z0-9]+/g, "_")}`;
    const costoEstimado = p.costoTotalEstimado && p.costoTotalEstimado > 0
      ? p.costoTotalEstimado
      : Math.round(p.ingresoTotal * 0.45 * 100) / 100;

    const catPadre = p.marca ? `${p.marca} - ${p.linea || "General"}` : (p.linea || "Retail");

    specificPortfolioMap.set(id, {
      id,
      nombre: name,
      tipo: "PRODUCTO",
      categoriaPadre: catPadre,
      volumen: p.unidadesVendidas,
      facturacionTotal: p.ingresoTotal,
      comisionOCostoTotal: costoEstimado,
      margenSoles: 0,
      margenPct: 0,
      precioPromedio: p.precioPromedio
    });
  });

  const specificPortfolioRankings: SpecificPortfolioItemMetric[] = Array.from(specificPortfolioMap.values())
    .map((item) => {
      const fact = Math.round(item.facturacionTotal * 100) / 100;
      const comOCost = Math.round(item.comisionOCostoTotal * 100) / 100;
      const margenSoles = Math.round((fact - comOCost) * 100) / 100;
      const margenPct = fact > 0 ? Math.round((margenSoles / fact) * 100) : 0;
      const precioPromedio = item.volumen > 0 ? Math.round((fact / item.volumen) * 100) / 100 : 0;

      return {
        ...item,
        facturacionTotal: fact,
        comisionOCostoTotal: comOCost,
        margenSoles,
        margenPct,
        precioPromedio
      };
    })
    .sort((a, b) => b.facturacionTotal - a.facturacionTotal);

  return {
    cashServiceSales,
    serviceCategoryRankings,
    oatcCategoryMetrics,
    specificPortfolioRankings,
    cashPaymentTotals: {
      totalFacturacion: totalFacturacionServiciosCaja,
      totalComisiones: totalComisionesServiciosCaja,
      tarjeta: pagoServiciosTarjeta,
      efectivo: pagoServiciosEfectivo,
      deposito: pagoServiciosDeposito
    }
  };
}
