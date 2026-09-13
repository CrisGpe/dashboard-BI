import * as XLSX from "xlsx";
import { CrossDataEngine } from "./crossDataEngine.js";
import { processSuppliesData } from "./supplies/suppliesEngine.js";
import { Dashboard360Response, SheetIdsConfig, SuppliesDashboardResponse } from "../types.js";
import { getFallbackMockData } from "../mockData.js";

export class GoogleSheetsService {
  private sheetIds: SheetIdsConfig = {
    adminSheetId: "1U0TkAI74Q0Opqs6UcuVxYtqN41UApPorusopaQDk-3E",
    recepcionSheetId: "1kbj7BGZyIWcXMj2aqNelSkw25ISuFRUY6AArTt8WjzI",
    erpSheetId: "1RQpMXqorsIzmMyoYAv0Jp0QS2PL-w5pzDEKBMKugfXc",
    ventasCajaSheetId: "1J2efkmlDygvOE9wIK0hsp-WzUevNzP8_kWi_Nz7RYGk",
    gonzalesSheetId: "1X7BxDAUiWWmn6l58tUTCcy7vaK5f30O1LUh05cKwP18",
    luxurySheetId: "1w2ZiQPfDfUWM6ODpHQoKn14FGBwwNhzIKxe5-RmEfBw",
    glossSheetId: "1SXuedQigLxVUF2oxn65wEZ5-HnDDiVdy7lY7HaweVC4",
    despachosSheetId: "1Rj1eexlnPcTPScIAoyew4vvFgs3DhiTt97iHL7S45_M"
  };

  private cachedResponse: { data: Dashboard360Response; timestamp: number } | null = null;
  private cacheTtlMs: number = 5 * 60 * 1000; // 5 minutos de caché optimizado

  private cachedSuppliesResponse: { data: SuppliesDashboardResponse; timestamp: number } | null = null;
  private suppliesCacheTtlMs: number = 10 * 60 * 1000; // 10 minutos de caché para insumos (102K filas)

  public extractSpreadsheetId(input: string): string {
    if (!input) return "";
    const trimmed = input.trim();
    const urlMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (urlMatch) {
      return urlMatch[1];
    }
    return trimmed;
  }

  public getSheetConfig(): SheetIdsConfig {
    return { ...this.sheetIds };
  }

  public updateSheetConfig(newConfig: Partial<SheetIdsConfig>): SheetIdsConfig {
    if (newConfig.adminSheetId) {
      this.sheetIds.adminSheetId = this.extractSpreadsheetId(newConfig.adminSheetId);
    }
    if (newConfig.recepcionSheetId) {
      this.sheetIds.recepcionSheetId = this.extractSpreadsheetId(newConfig.recepcionSheetId);
    }
    if (newConfig.erpSheetId) {
      this.sheetIds.erpSheetId = this.extractSpreadsheetId(newConfig.erpSheetId);
    }
    if (newConfig.ventasCajaSheetId) {
      this.sheetIds.ventasCajaSheetId = this.extractSpreadsheetId(newConfig.ventasCajaSheetId);
    }
    if (newConfig.gonzalesSheetId) {
      this.sheetIds.gonzalesSheetId = this.extractSpreadsheetId(newConfig.gonzalesSheetId);
    }
    if (newConfig.luxurySheetId) {
      this.sheetIds.luxurySheetId = this.extractSpreadsheetId(newConfig.luxurySheetId);
    }
    if (newConfig.glossSheetId) {
      this.sheetIds.glossSheetId = this.extractSpreadsheetId(newConfig.glossSheetId);
    }
    if (newConfig.despachosSheetId) {
      this.sheetIds.despachosSheetId = this.extractSpreadsheetId(newConfig.despachosSheetId);
    }
    this.cachedResponse = null;
    this.cachedSuppliesResponse = null;
    return this.getSheetConfig();
  }

  private async fetchSpreadsheetBuffer(sheetId: string, label: string): Promise<Buffer> {
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=xlsx&_t=${Date.now()}`;
    console.log(`[GoogleSheetsService] Descargando ${label} (ID: ${sheetId})...`);
    const res = await fetch(url, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache"
      }
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} al descargar ${label}`);
    }

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("text/html")) {
      throw new Error(`El archivo de ${label} no es público o requiere inicio de sesión en Google`);
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    if (buffer.length < 500) {
      throw new Error(`Descarga de ${label} corrupta o demasiado pequeña (${buffer.length} bytes)`);
    }

    console.log(`[GoogleSheetsService] ✅ ${label} descargado con éxito (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);
    return buffer;
  }

  public async fetchDashboard360Data(forceRefresh = false): Promise<Dashboard360Response> {
    const now = Date.now();
    if (!forceRefresh && this.cachedResponse && now - this.cachedResponse.timestamp < this.cacheTtlMs) {
      return this.cachedResponse.data;
    }

    try {
      console.log("[GoogleSheetsService] Sincronizando en paralelo las 7 fuentes de Google Sheets...");
      const [adminBuf, recBuf, erpBuf, cajaBuf, gonzalesBuf, luxuryBuf, glossBuf] = await Promise.all([
        this.fetchSpreadsheetBuffer(this.sheetIds.adminSheetId, "Registros Admin"),
        this.fetchSpreadsheetBuffer(this.sheetIds.recepcionSheetId, "Registros Recepción"),
        this.fetchSpreadsheetBuffer(this.sheetIds.erpSheetId, "Registros ERP VentaRD"),
        this.fetchSpreadsheetBuffer(this.sheetIds.ventasCajaSheetId, "Ventas 2025"),
        this.fetchSpreadsheetBuffer(this.sheetIds.gonzalesSheetId, "Ventas Gonzales AM"),
        this.fetchSpreadsheetBuffer(this.sheetIds.luxurySheetId, "Ventas & OATC Luxury RD"),
        this.fetchSpreadsheetBuffer(this.sheetIds.glossSheetId || "1SXuedQigLxVUF2oxn65wEZ5-HnDDiVdy7lY7HaweVC4", "Ventas & OATC Gloss Salon")
      ]);

      const wbAdmin = XLSX.read(adminBuf, { type: "buffer", cellDates: true });
      const wbRec = XLSX.read(recBuf, { type: "buffer", cellDates: true });
      const wbErp = XLSX.read(erpBuf, { type: "buffer", cellDates: true });
      const wbCaja = XLSX.read(cajaBuf, { type: "buffer", cellDates: true });
      const wbGonzales = XLSX.read(gonzalesBuf, { type: "buffer", cellDates: true });
      const wbLuxury = XLSX.read(luxuryBuf, { type: "buffer", cellDates: true });
      const wbGloss = XLSX.read(glossBuf, { type: "buffer", cellDates: true });

      const getRows = (wb: XLSX.WorkBook, sheetNameTarget: string): any[][] => {
        const found = wb.SheetNames.find(
          (name) => name.trim().toLowerCase() === sheetNameTarget.trim().toLowerCase()
        );
        if (!found) {
          console.warn(`[GoogleSheetsService] Pestaña '${sheetNameTarget}' no encontrada en el libro.`);
          return [];
        }
        const ws = wb.Sheets[found];
        const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
        return data.slice(1);
      };

      const agentesRaw = getRows(wbAdmin, "Agentes");
      const liquidacionesRaw = getRows(wbAdmin, "Pendientes_Liquidacion");
      const oatcRaw = getRows(wbRec, "OATC");
      const borradorRaw = getRows(wbRec, "Borrador");
      const asistenciaRaw = getRows(wbRec, "Asistencia");
      const kardexRaw = getRows(wbErp, "Kardex_Movimientos");
      const ticketsRaw = getRows(wbErp, "Ventas_Tickets");
      const ventasDetalleRaw = getRows(wbErp, "Ventas_Detalle");
      const productosCatalogoRaw = getRows(wbErp, "BBDD_Productos");
      const ventasCajaRaw = getRows(wbCaja, "Registro ventas caja");
      const ventasGonzalesRaw = getRows(wbGonzales, "Hoja1");
      const ventasLuxuryRaw = getRows(wbLuxury, "Ventas 2026 al 10.09");
      const oatcLuxuryRaw = getRows(wbLuxury, "OATC");
      const asistenciaLuxuryRaw = getRows(wbLuxury, "Asistencia");
      const agentesLuxuryRaw = getRows(wbLuxury, "Agentes");
      const clientesLuxuryRaw = getRows(wbLuxury, "Clientes");

      // Gloss Salon Raw Tabs
      const agentesGlossRaw = getRows(wbGloss, "Agentes");
      const clientesGlossRaw = getRows(wbGloss, "Clientes");
      const borradorGlossRaw = getRows(wbGloss, "Borrador");
      const oatcGlossRaw = getRows(wbGloss, "OATC");
      const asistenciaGlossRaw = getRows(wbGloss, "Asistencia");
      const ventasGlossRaw = getRows(wbGloss, "Ventas 2026 del 01 al 09");

      console.log(
        `[GoogleSheetsService] Parseo completado. Procesando cruce 360° con 7 fuentes: ` +
          `${agentesRaw.length} Agentes RD, ` +
          `${liquidacionesRaw.length} Liquidaciones, ` +
          `${oatcRaw.length} OATC Salón RD, ` +
          `${asistenciaRaw.length} Asistencia RD, ` +
          `${ticketsRaw.length} Tickets, ` +
          `${ventasDetalleRaw.length} Detalle, ` +
          `${productosCatalogoRaw.length} Catálogo Productos, ` +
          `${kardexRaw.length} Kardex, ` +
          `${ventasCajaRaw.length} Ventas Caja, ` +
          `${ventasGonzalesRaw.length} Ventas Gonzales AM, ` +
          `${ventasLuxuryRaw.length} Ventas Luxury RD, ` +
          `${oatcLuxuryRaw.length} OATC Luxury RD, ` +
          `${asistenciaLuxuryRaw.length} Asistencia Luxury RD, ` +
          `${agentesLuxuryRaw.length} Agentes Luxury RD, ` +
          `${clientesLuxuryRaw.length} Clientes Luxury RD, ` +
          `${agentesGlossRaw.length} Agentes Gloss, ` +
          `${oatcGlossRaw.length} OATC Gloss, ` +
          `${asistenciaGlossRaw.length} Asistencia Gloss, ` +
          `${clientesGlossRaw.length} Clientes Gloss, ` +
          `${ventasGlossRaw.length} Ventas Gloss`
      );

      const processed = CrossDataEngine.processRawSources(
        agentesRaw,
        liquidacionesRaw,
        oatcRaw,
        borradorRaw,
        asistenciaRaw,
        ticketsRaw,
        ventasDetalleRaw,
        kardexRaw,
        ventasCajaRaw,
        productosCatalogoRaw,
        ventasGonzalesRaw,
        ventasLuxuryRaw,
        oatcLuxuryRaw,
        asistenciaLuxuryRaw,
        agentesLuxuryRaw,
        clientesLuxuryRaw,
        ventasGlossRaw,
        oatcGlossRaw,
        asistenciaGlossRaw,
        agentesGlossRaw,
        clientesGlossRaw,
        borradorGlossRaw
      );

      const fullResponse: Dashboard360Response = {
        metadata: {
          title: "Dashboard Ejecutivo 360 - Unidad de Negocio",
          generatedAt: new Date().toISOString(),
          source: "google_sheets_live",
          sheetIds: this.getSheetConfig(),
          counts: {
            agentes: agentesRaw.length,
            liquidaciones: liquidacionesRaw.length,
            oatc: oatcRaw.length,
            asistencia: asistenciaRaw.length,
            tickets: ticketsRaw.length,
            ventasDetalle: ventasDetalleRaw.length,
            kardex: kardexRaw.length,
            ventasCaja: ventasCajaRaw.length,
            bbddProductos: productosCatalogoRaw.length,
            gonzalesVentas: ventasGonzalesRaw.length,
            luxuryVentas: ventasLuxuryRaw.length,
            luxuryOatc: oatcLuxuryRaw.length,
            luxuryAsistencia: asistenciaLuxuryRaw.length,
            luxuryAgentes: agentesLuxuryRaw.length,
            luxuryClientes: clientesLuxuryRaw.length,
            glossVentas: ventasGlossRaw.length,
            glossOatc: oatcGlossRaw.length,
            glossAsistencia: asistenciaGlossRaw.length,
            glossAgentes: agentesGlossRaw.length,
            glossClientes: clientesGlossRaw.length
          }
        },
        executiveKPIs: processed.executiveKPIs,
        agents: processed.agents,
        staff360: processed.staff360,
        productRankings: processed.productRankings,
        serviceCategoryRankings: processed.serviceCategoryRankings,
        oatcCategoryMetrics: processed.oatcCategoryMetrics,
        specificPortfolioRankings: processed.specificPortfolioRankings,
        clients: processed.clients,
        orders: processed.orders,
        attendance: processed.attendance,
        tickets: processed.tickets,
        ticketDetails: processed.ticketDetails,
        kardex: processed.kardex,
        settlements: processed.settlements,
        cashServiceSales: processed.cashServiceSales,
        brandPortfolioMetrics: processed.brandPortfolioMetrics,
        multiBranchBenchmark: processed.multiBranchBenchmark,
        gonzalesSales: processed.gonzalesSales,
        luxurySales: processed.luxurySales,
        glossSales: processed.glossSales
      };

      this.cachedResponse = { data: fullResponse, timestamp: now };
      return fullResponse;
    } catch (err: any) {
      console.error("[GoogleSheetsService] Error durante sincronización en vivo:", err.message);
      if (this.cachedResponse) {
        console.warn("[GoogleSheetsService] Retornando caché previo debido a error de conexión.");
        return this.cachedResponse.data;
      }
      console.warn("[GoogleSheetsService] Retornando fallback mock para mantener operabilidad.");
      return getFallbackMockData(this.getSheetConfig());
    }
  }

  public async fetchSuppliesData(forceRefresh = false): Promise<SuppliesDashboardResponse> {
    const now = Date.now();
    if (!forceRefresh && this.cachedSuppliesResponse && now - this.cachedSuppliesResponse.timestamp < this.suppliesCacheTtlMs) {
      console.log("[GoogleSheetsService] Retornando datos de insumos desde caché.");
      return this.cachedSuppliesResponse.data;
    }

    const sheetId = this.sheetIds.despachosSheetId || "1Rj1eexlnPcTPScIAoyew4vvFgs3DhiTt97iHL7S45_M";
    try {
      console.log(`[GoogleSheetsService] Sincronizando datos de insumos desde Google Sheets (${sheetId})...`);
      const buffer = await this.fetchSpreadsheetBuffer(sheetId, "Despacho de Insumos y Laboratorio");
      const wb = XLSX.read(buffer, { type: "buffer", cellDates: true });

      const found = wb.SheetNames.find(
        (name) => name.trim().toLowerCase() === "despacho de insumos" || name.toLowerCase().includes("despacho")
      ) || wb.SheetNames[0];

      if (!found) {
        throw new Error("No se encontró la pestaña de despacho de insumos en el libro.");
      }

      const ws = wb.Sheets[found];
      const rawRows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
      console.log(`[GoogleSheetsService] Parseadas ${rawRows.length} filas brutas de despacho de insumos.`);

      const processed = processSuppliesData(rawRows, sheetId);
      this.cachedSuppliesResponse = { data: processed, timestamp: now };
      return processed;
    } catch (err: any) {
      console.error("[GoogleSheetsService] Error al obtener datos de insumos:", err.message);
      if (this.cachedSuppliesResponse) {
        console.warn("[GoogleSheetsService] Retornando caché previo de insumos debido a error.");
        return this.cachedSuppliesResponse.data;
      }
      throw err;
    }
  }
}
