import React, { useMemo } from "react";
import { Dashboard360Response, ActiveTab, SalonFilter, SalonContribution } from "../../types";
import { ExecutiveSpotlightBanner } from "./ExecutiveSpotlightBanner";
import { ExecutiveSalonBreakdown } from "./ExecutiveSalonBreakdown";
import { ExecutiveKpiCards } from "./ExecutiveKpiCards";
import { ExecutiveCharts } from "./ExecutiveCharts";
import { ExecutiveRankings } from "./ExecutiveRankings";
import { DataAvailabilityNotice } from "../common/DataAvailabilityNotice";

interface ExecutiveViewProps {
  data: Dashboard360Response;
  dynamicKPIs: {
    facturacionGlobal: number;
    totalServiciosFacturado: number;
    totalComisionesServicios: number;
    totalRetail: number;
    margenBrutoGlobal: number;
    margenBrutoGlobalPct: number;
    ticketsCount: number;
    avgTicket: number;
    totalServicios: number;
    cancelados: number;
    cancelRate: number;
    comisionesPagadas: number;
    comisionesPendientes: number;
    totalHoras: number;
  };
  selectedSalon?: SalonFilter;
  salonBreakdown?: SalonContribution[];
  onSelectSalon?: (salon: SalonFilter) => void;
  onNavigateTab: (tab: ActiveTab) => void;
  onSelectAgent: (agent: string) => void;
}

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4"];

export const ExecutiveView: React.FC<ExecutiveViewProps> = ({
  data,
  dynamicKPIs,
  selectedSalon = "ALL",
  salonBreakdown,
  onSelectSalon,
  onNavigateTab,
  onSelectAgent
}) => {
  // Monthly Evolution Trends: Services Cash vs Retail
  const trendData = useMemo(() => {
    const map = new Map<string, { period: string; serviciosFact: number; retailFact: number }>();

    (data.cashServiceSales || []).forEach((cs) => {
      if (!cs.fecha) return;
      const period = cs.fecha.substring(0, 7);
      const cur = map.get(period) || { period, serviciosFact: 0, retailFact: 0 };
      cur.serviciosFact += cs.montoFinal;
      map.set(period, cur);
    });

    data.tickets.forEach((t) => {
      if (t.estado === "ANULADO" || !t.fecha) return;
      const period = t.fecha.substring(0, 7);
      const cur = map.get(period) || { period, serviciosFact: 0, retailFact: 0 };
      cur.retailFact += t.total;
      map.set(period, cur);
    });

    return Array.from(map.values())
      .sort((a, b) => a.period.localeCompare(b.period))
      .slice(-6);
  }, [data]);

  // Payment Breakdown for Services
  const servicePaymentBreakdown = useMemo(() => {
    const tarjeta = data.executiveKPIs.pagoServiciosTarjeta || 0;
    const efectivo = data.executiveKPIs.pagoServiciosEfectivo || 0;
    const deposito = data.executiveKPIs.pagoServiciosDeposito || 0;
    const total = tarjeta + efectivo + deposito || 1;

    return [
      { name: "Tarjeta (POS)", value: tarjeta, pct: Math.round((tarjeta / total) * 100) },
      { name: "Efectivo", value: efectivo, pct: Math.round((efectivo / total) * 100) },
      { name: "Depósito / Transferencia", value: deposito, pct: Math.round((deposito / total) * 100) }
    ];
  }, [data]);

  const topStaff = useMemo(() => {
    return data.staff360.slice(0, 5);
  }, [data]);

  const topCategories = useMemo(() => {
    return (data.serviceCategoryRankings || []).slice(0, 5);
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Contextual Notices for specific salons */}
      {selectedSalon === "GLOSS_SALON" && (
        <DataAvailabilityNotice
          tipo="PENDIENTE_CARGA"
          modulo="Ventas & Caja POS"
          salonNombre="Gloss Salon"
          titulo="Ventas de Caja 2026 Pendientes de Carga en Google Sheets"
          mensaje="El salón Gloss Salon tiene activas sus recepciones de atención (OATC: 6,636 registros) y control de asistencia, pero la pestaña 'Ventas 2026 del 01 al 09' se encuentra actualmente vacía en la hoja de cálculo. En cuanto se agreguen los registros de caja, los ingresos y márgenes se consolidarán automáticamente en tiempo real."
          accionSugerida="Para consultar su flujo de clientes visite la pestaña 'Operaciones OATC' o 'Benchmark Multi-Sede'."
          actionText="Ver Operaciones"
          onActionClick={() => onNavigateTab("operations")}
        />
      )}

      {selectedSalon === "GONZALES_AM" && (
        <DataAvailabilityNotice
          tipo="NO_IMPLEMENTADO"
          modulo="Recepción Digital OATC"
          salonNombre="Gonzales AM"
          titulo="Sede Operando Exclusivamente con Facturación POS"
          mensaje="Gonzales AM no registra check-ins en el módulo de recepción digital OATC ni control de asistencia. El análisis financiero se alimenta al 100% de las 7,279 ventas emitidas en caja POS (S/. 796,502.90)."
          accionSugerida="Para comparar su distribución de afluencia horaria y mix de servicios, consulte el modelo bayesiano en la pestaña 'Benchmark Multi-Sede'."
          actionText="Ver Benchmark"
          onActionClick={() => onNavigateTab("benchmark")}
        />
      )}

      {/* 1. Spotlight Master Banner */}
      <ExecutiveSpotlightBanner
        facturacionGlobal={dynamicKPIs.facturacionGlobal}
        totalServiciosFacturado={dynamicKPIs.totalServiciosFacturado}
        totalComisionesServicios={dynamicKPIs.totalComisionesServicios}
        totalRetail={dynamicKPIs.totalRetail}
        ticketsCount={dynamicKPIs.ticketsCount}
        margenBrutoGlobal={dynamicKPIs.margenBrutoGlobal}
        margenBrutoGlobalPct={dynamicKPIs.margenBrutoGlobalPct}
        selectedSalon={selectedSalon}
      />

      {/* 1.5 Multi-Sede Contribution Breakdown (only in Consolidated mode) */}
      {selectedSalon === "ALL" && salonBreakdown && (
        <ExecutiveSalonBreakdown
          breakdown={salonBreakdown}
          onSelectSalon={onSelectSalon}
        />
      )}

      {/* 2. KPI Cards Grid */}
      <ExecutiveKpiCards
        totalServiciosFacturado={dynamicKPIs.totalServiciosFacturado}
        totalComisionesServicios={dynamicKPIs.totalComisionesServicios}
        totalRetail={dynamicKPIs.totalRetail}
        ticketsCount={dynamicKPIs.ticketsCount}
        avgTicket={dynamicKPIs.avgTicket}
        margenBrutoGlobal={dynamicKPIs.margenBrutoGlobal}
        margenBrutoGlobalPct={dynamicKPIs.margenBrutoGlobalPct}
        tasaConversionCrossSell={data.executiveKPIs.tasaConversionCrossSell}
        totalServicios={dynamicKPIs.totalServicios}
        totalHoras={dynamicKPIs.totalHoras}
        totalClientesUnicos={data.executiveKPIs.totalClientesUnicos}
      />

      {/* 3. Charts Section */}
      <ExecutiveCharts
        trendData={trendData}
        servicePaymentBreakdown={servicePaymentBreakdown}
        colors={COLORS}
      />

      {/* 4. Leaderboard & Rankings */}
      <ExecutiveRankings
        topStaff={topStaff}
        topCategories={topCategories}
        oatcCategoryMetrics={data.oatcCategoryMetrics || []}
        specificPortfolioRankings={data.specificPortfolioRankings || []}
        onNavigateTab={onNavigateTab}
        onSelectAgent={onSelectAgent}
      />
    </div>
  );
};
