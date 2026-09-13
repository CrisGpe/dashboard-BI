import { OatcRecord, BranchCancellationSummary } from "../../types.js";

export function buildCancellationBenchmark(
  orders: OatcRecord[],
  gonzalesSalesLength: number
): BranchCancellationSummary[] {
  const rdOrdersList = orders.filter((o) => o.sede === "Salón RD" || o.sede === "RD");
  const rdTotalAtenciones = rdOrdersList.length;
  const rdTotalCancelados = rdOrdersList.filter((o) => o.isCancelled).length;
  const rdTasaCancelacion = rdTotalAtenciones > 0 ? Math.round((rdTotalCancelados / rdTotalAtenciones) * 1000) / 10 : 0;
  const rdMotivosMap = new Map<string, number>();
  rdOrdersList.filter((o) => o.isCancelled).forEach((o) => {
    const m = o.motivoLimpio || "Cancelación sin motivo detallado";
    rdMotivosMap.set(m, (rdMotivosMap.get(m) || 0) + 1);
  });
  const rdTopMotivos = Array.from(rdMotivosMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([motivo, count]) => ({ motivo, count }));

  const luxOrdersList = orders.filter((o) => o.sede === "Luxury RD");
  const luxTotalAtenciones = luxOrdersList.length;
  const luxTotalCancelados = luxOrdersList.filter((o) => o.isCancelled).length;
  const luxTasaCancelacion = luxTotalAtenciones > 0 ? Math.round((luxTotalCancelados / luxTotalAtenciones) * 1000) / 10 : 0;
  const luxMotivosMap = new Map<string, number>();
  luxOrdersList.filter((o) => o.isCancelled).forEach((o) => {
    const m = o.motivoLimpio || "Cancelación sin motivo detallado";
    luxMotivosMap.set(m, (luxMotivosMap.get(m) || 0) + 1);
  });
  const luxTopMotivos = Array.from(luxMotivosMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([motivo, count]) => ({ motivo, count }));

  const glossOrdersList = orders.filter((o) => o.sede === "Gloss Salon");
  const glossTotalAtenciones = glossOrdersList.length;
  const glossTotalCancelados = glossOrdersList.filter((o) => o.isCancelled).length;
  const glossTasaCancelacion = glossTotalAtenciones > 0 ? Math.round((glossTotalCancelados / glossTotalAtenciones) * 1000) / 10 : 0;
  const glossMotivosMap = new Map<string, number>();
  glossOrdersList.filter((o) => o.isCancelled).forEach((o) => {
    const m = o.motivoLimpio || "Cancelación sin motivo detallado";
    glossMotivosMap.set(m, (glossMotivosMap.get(m) || 0) + 1);
  });
  const glossTopMotivos = Array.from(glossMotivosMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([motivo, count]) => ({ motivo, count }));

  return [
    {
      sedeId: "RD",
      nombre: "Salón RD",
      totalAtenciones: rdTotalAtenciones,
      totalCancelados: rdTotalCancelados,
      tasaCancelacionPct: rdTasaCancelacion,
      topMotivos: rdTopMotivos
    },
    {
      sedeId: "LUXURY_RD",
      nombre: "Luxury RD",
      totalAtenciones: luxTotalAtenciones,
      totalCancelados: luxTotalCancelados,
      tasaCancelacionPct: luxTasaCancelacion,
      topMotivos: luxTopMotivos
    },
    {
      sedeId: "GLOSS_SALON",
      nombre: "Gloss Salon",
      totalAtenciones: glossTotalAtenciones,
      totalCancelados: glossTotalCancelados,
      tasaCancelacionPct: glossTasaCancelacion,
      topMotivos: glossTopMotivos
    },
    {
      sedeId: "GONZALES_AM",
      nombre: "Gonzales AM",
      totalAtenciones: gonzalesSalesLength,
      totalCancelados: 0,
      tasaCancelacionPct: 0,
      topMotivos: [
        { motivo: "Ceguera Operativa - Sin Módulo de Recepción (Sin registro de citas ni cancelaciones)", count: 0 }
      ]
    }
  ];
}
