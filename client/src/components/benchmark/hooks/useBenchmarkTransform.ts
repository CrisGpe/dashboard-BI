import { useState, useMemo } from "react";
import {
  MultiBranchBenchmark,
  GonzalesSaleRecord,
  DemandNormalizationMode,
  BenchmarkTimeWindow
} from "../../../types";

export interface UseBenchmarkTransformReturn {
  normalizationMode: DemandNormalizationMode;
  setNormalizationMode: (mode: DemandNormalizationMode) => void;
  timeWindow: BenchmarkTimeWindow;
  setTimeWindow: (win: BenchmarkTimeWindow) => void;
  razonFilter: string;
  setRazonFilter: (razon: string) => void;
  stylistSearch: string;
  setStylistSearch: (search: string) => void;
  is2026: boolean;
  activeBranches: MultiBranchBenchmark["branches"];
  weeklyChartData: any[];
  hourlyChartData: any[];
  weeklyMetricMode: "atenciones" | "comprobantes";
  setWeeklyMetricMode: (mode: "atenciones" | "comprobantes") => void;
  filteredGonzalesSales: GonzalesSaleRecord[];
  stylistStats: any[];
  formatChartValue: (val: number, isHourly?: boolean) => string;
  fmtMoney: (n: number) => string;
  fmtCompact: (n: number) => string;
}

export function useBenchmarkTransform(
  benchmark?: MultiBranchBenchmark,
  gonzalesSales: GonzalesSaleRecord[] = []
): UseBenchmarkTransformReturn {
  const [normalizationMode, setNormalizationMode] = useState<DemandNormalizationMode>("relative_pct");
  const [weeklyMetricMode, setWeeklyMetricMode] = useState<"atenciones" | "comprobantes">("atenciones");
  const [timeWindow, setTimeWindow] = useState<BenchmarkTimeWindow>("year_2026");
  const [razonFilter, setRazonFilter] = useState<string>("ALL");
  const [stylistSearch, setStylistSearch] = useState<string>("");

  const is2026 = timeWindow === "year_2026" && !!benchmark?.benchmark2026;
  const activeBranches = useMemo(() => {
    if (!benchmark) return {} as MultiBranchBenchmark["branches"];
    return is2026 && benchmark.benchmark2026 ? benchmark.benchmark2026.branches : benchmark.branches;
  }, [benchmark, is2026]);

  const activeWeeklyNormalizado = useMemo(() => {
    if (!benchmark) return [];
    return is2026 && benchmark.benchmark2026
      ? benchmark.benchmark2026.comparativaSemanalNormalizada
      : benchmark.comparativaSemanalNormalizada;
  }, [benchmark, is2026]);

  const activeHourlyNormalizado = useMemo(() => {
    if (!benchmark) return [];
    return is2026 && benchmark.benchmark2026
      ? benchmark.benchmark2026.comparativaHorariaNormalizada
      : benchmark.comparativaHorariaNormalizada;
  }, [benchmark, is2026]);

  const activeWeeklyComprobantes = useMemo(() => {
    if (!benchmark) return [];
    return is2026 && benchmark.benchmark2026?.comparativaSemanalComprobantes
      ? benchmark.benchmark2026.comparativaSemanalComprobantes
      : benchmark.comparativaSemanalComprobantes || [];
  }, [benchmark, is2026]);

  // Transform weekly data for Recharts according to Normalization Mode
  const weeklyChartData = useMemo(() => {
    if (!benchmark) return [];

    // If user toggled to view Comprobantes / Día
    if (weeklyMetricMode === "comprobantes" && activeWeeklyComprobantes.length > 0) {
      return activeWeeklyComprobantes.map((pt) => ({
        label: pt.label,
        key: pt.key,
        rd: pt.rd.dailyAvg,
        luxury: pt.luxury.dailyAvg,
        gonzales: pt.gonzales.dailyAvg,
        gloss: pt.gloss.dailyAvg
      }));
    }

    if (!activeWeeklyNormalizado || activeWeeklyNormalizado.length === 0) {
      return benchmark.comparativaSemanal.map((d) => ({
        label: d.label,
        rd: d.rd,
        luxury: d.luxury,
        gonzales: d.gonzales,
        gloss: d.gloss || 0
      }));
    }

    return activeWeeklyNormalizado.map((pt) => {
      let rdVal = pt.rd.relativePct;
      let luxVal = pt.luxury.relativePct;
      let gonVal = pt.gonzales.relativePct;
      let glossVal = pt.gloss?.relativePct || 0;

      if (normalizationMode === "daily_avg") {
        rdVal = pt.rd.dailyAvg;
        luxVal = pt.luxury.dailyAvg;
        gonVal = pt.gonzales.dailyAvg;
        glossVal = pt.gloss?.dailyAvg || 0;
      } else if (normalizationMode === "per_stylist") {
        rdVal = pt.rd.perStylist;
        luxVal = pt.luxury.perStylist;
        gonVal = pt.gonzales.perStylist;
        glossVal = pt.gloss?.perStylist || 0;
      } else if (normalizationMode === "absolute") {
        rdVal = pt.rd.absolute;
        luxVal = pt.luxury.absolute;
        gonVal = pt.gonzales.absolute;
        glossVal = pt.gloss?.absolute || 0;
      }

      return {
        label: pt.label,
        key: pt.key,
        rd: rdVal,
        luxury: luxVal,
        gonzales: gonVal,
        gloss: glossVal
      };
    });
  }, [activeWeeklyNormalizado, activeWeeklyComprobantes, normalizationMode, weeklyMetricMode, benchmark]);

  // Transform hourly data for Recharts according to Normalization Mode
  const hourlyChartData = useMemo(() => {
    if (!benchmark) return [];
    if (!activeHourlyNormalizado || activeHourlyNormalizado.length === 0) {
      return benchmark.comparativaHoraria.map((d) => ({
        label: d.label,
        rdReal: d.rdReal,
        luxuryReal: d.luxuryReal,
        gonzalesInferido: d.gonzalesInferido,
        glossReal: d.glossReal || 0
      }));
    }

    return activeHourlyNormalizado.map((pt) => {
      let rdVal = pt.rd.relativePct;
      let luxVal = pt.luxury.relativePct;
      let gonVal = pt.gonzales.relativePct;
      let glossVal = pt.gloss?.relativePct || 0;

      if (normalizationMode === "daily_avg") {
        rdVal = pt.rd.dailyAvg;
        luxVal = pt.luxury.dailyAvg;
        gonVal = pt.gonzales.dailyAvg;
        glossVal = pt.gloss?.dailyAvg || 0;
      } else if (normalizationMode === "per_stylist") {
        rdVal = pt.rd.perStylist;
        luxVal = pt.luxury.perStylist;
        gonVal = pt.gonzales.perStylist;
        glossVal = pt.gloss?.perStylist || 0;
      } else if (normalizationMode === "absolute") {
        rdVal = pt.rd.absolute;
        luxVal = pt.luxury.absolute;
        gonVal = pt.gonzales.absolute;
        glossVal = pt.gloss?.absolute || 0;
      }

      return {
        label: pt.label,
        key: pt.key,
        rdReal: rdVal,
        luxuryReal: luxVal,
        gonzalesInferido: gonVal,
        glossReal: glossVal
      };
    });
  }, [activeHourlyNormalizado, normalizationMode, benchmark]);

  // Format Helper for Charts Tooltip and Axis
  const formatChartValue = (val: number, isHourly?: boolean) => {
    if (!isHourly && weeklyMetricMode === "comprobantes") {
      return `${val.toFixed(1)} comp/día`;
    }
    if (normalizationMode === "relative_pct") return `${val.toFixed(1)}%`;
    if (normalizationMode === "daily_avg") return `${val.toFixed(1)} serv/día`;
    if (normalizationMode === "per_stylist") return `${val.toFixed(1)} serv/estilista`;
    return `${Math.round(val).toLocaleString()} atenciones`;
  };

  // Filtered Gonzales Sales for Stylist Table
  const filteredGonzalesSales = useMemo(() => {
    return gonzalesSales.filter((s) => {
      const matchRazon = razonFilter === "ALL" || s.razonSocial === razonFilter;
      const matchSearch =
        !stylistSearch ||
        s.estilista.toLowerCase().includes(stylistSearch.toLowerCase()) ||
        s.item.toLowerCase().includes(stylistSearch.toLowerCase()) ||
        s.cliente.toLowerCase().includes(stylistSearch.toLowerCase());
      return matchRazon && matchSearch;
    });
  }, [gonzalesSales, razonFilter, stylistSearch]);

  // Aggregate Stylists from Gonzales AM
  const stylistStats = useMemo(() => {
    const map = new Map<
      string,
      {
        estilista: string;
        atenciones: number;
        facturacion: number;
        categorias: Map<string, number>;
        razonSoc: Set<string>;
      }
    >();

    filteredGonzalesSales.forEach((s) => {
      const name = s.estilista || "Sin Asignar";
      const cur = map.get(name) || {
        estilista: name,
        atenciones: 0,
        facturacion: 0,
        categorias: new Map<string, number>(),
        razonSoc: new Set<string>()
      };
      cur.atenciones += s.cantidad;
      cur.facturacion += s.importe;
      cur.categorias.set(s.categoria, (cur.categorias.get(s.categoria) || 0) + s.cantidad);
      if (s.razonSocial) cur.razonSoc.add(s.razonSocial);
      map.set(name, cur);
    });

    const totalFact = Array.from(map.values()).reduce((a, b) => a + b.facturacion, 0) || 1;

    return Array.from(map.values())
      .map((item) => {
        let topCat = "General";
        let maxCount = -1;
        item.categorias.forEach((cnt, cat) => {
          if (cnt > maxCount) {
            maxCount = cnt;
            topCat = cat;
          }
        });

        return {
          estilista: item.estilista,
          atenciones: item.atenciones,
          facturacion: Math.round(item.facturacion * 100) / 100,
          ticketPromedio: item.atenciones > 0 ? Math.round((item.facturacion / item.atenciones) * 100) / 100 : 0,
          sharePct: Math.round((item.facturacion / totalFact) * 1000) / 10,
          categoriaTop: topCat,
          razones: Array.from(item.razonSoc).join(", ")
        };
      })
      .sort((a, b) => b.facturacion - a.facturacion);
  }, [filteredGonzalesSales]);

  // Helpers
  const fmtMoney = (n: number) =>
    `S/. ${n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const fmtCompact = (n: number) => `S/. ${(n / 1000).toFixed(1)}k`;

  return {
    normalizationMode,
    setNormalizationMode,
    weeklyMetricMode,
    setWeeklyMetricMode,
    timeWindow,
    setTimeWindow,
    razonFilter,
    setRazonFilter,
    stylistSearch,
    setStylistSearch,
    is2026,
    activeBranches,
    weeklyChartData,
    hourlyChartData,
    filteredGonzalesSales,
    stylistStats,
    formatChartValue,
    fmtMoney,
    fmtCompact
  };
}
