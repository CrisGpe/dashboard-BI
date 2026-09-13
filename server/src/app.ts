import express, { Request, Response } from "express";
import cors from "cors";
import { GoogleSheetsService } from "./services/googleSheetsService.js";

export function createApp() {
  const app = express();
  const sheetsService = new GoogleSheetsService();

  app.use(cors({ origin: "*" }));
  app.use(express.json());

  // Health check
  app.get(["/api/health", "/health"], (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      server: "Business Analytics 360",
      timestamp: new Date().toISOString()
    });
  });

  // Get full 360 dashboard data
  app.get(["/api/dashboard", "/dashboard"], async (req: Request, res: Response) => {
    try {
      const forceRefresh = req.query.refresh === "true";
      const data = await sheetsService.fetchDashboard360Data(forceRefresh);
      res.json(data);
    } catch (err: any) {
      console.error("[API Error /api/dashboard]:", err);
      res.status(500).json({
        error: "Error al procesar los datos de las hojas de cálculo",
        message: err.message
      });
    }
  });

  // Force refresh
  app.post(["/api/refresh", "/refresh"], async (_req: Request, res: Response) => {
    try {
      const data = await sheetsService.fetchDashboard360Data(true);
      res.json({
        success: true,
        message: "Datos actualizados en vivo exitosamente",
        data
      });
    } catch (err: any) {
      console.error("[API Error /api/refresh]:", err);
      res.status(500).json({
        success: false,
        error: "Error al forzar actualización",
        message: err.message
      });
    }
  });

  // Supplies and laboratory analytics endpoint
  app.get(["/api/supplies", "/supplies"], async (req: Request, res: Response) => {
    try {
      const forceRefresh = req.query.refresh === "true";
      const data = await sheetsService.fetchSuppliesData(forceRefresh);
      res.json(data);
    } catch (err: any) {
      console.error("[API Error /api/supplies]:", err);
      res.status(500).json({
        error: "Error al procesar los datos de despacho de insumos",
        message: err.message
      });
    }
  });

  // Get sheet settings
  app.get(["/api/settings", "/settings"], (_req: Request, res: Response) => {
    res.json({
      success: true,
      sheetIds: sheetsService.getSheetConfig()
    });
  });

  // Update sheet settings
  app.post(["/api/settings", "/settings"], async (req: Request, res: Response) => {
    try {
      const {
        adminSheetId,
        recepcionSheetId,
        erpSheetId,
        ventasCajaSheetId,
        gonzalesSheetId,
        luxurySheetId,
        glossSheetId,
        despachosSheetId
      } = req.body || {};
      const updated = sheetsService.updateSheetConfig({
        adminSheetId,
        recepcionSheetId,
        erpSheetId,
        ventasCajaSheetId,
        gonzalesSheetId,
        luxurySheetId,
        glossSheetId,
        despachosSheetId
      });

      // Attempt to load with new config
      const data = await sheetsService.fetchDashboard360Data(true);

      res.json({
        success: true,
        message: "Configuración de Google Sheets actualizada correctamente",
        sheetIds: updated,
        data
      });
    } catch (err: any) {
      console.error("[API Error /api/settings]:", err);
      res.status(500).json({
        success: false,
        error: "Error al actualizar configuración de hojas",
        message: err.message
      });
    }
  });

  return app;
}
