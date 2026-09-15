import React from "react";
import { AlertTriangle } from "lucide-react";
import { MultiBranchBenchmark, GonzalesSaleRecord } from "../../types";
import { useBenchmarkTransform } from "./hooks/useBenchmarkTransform";
import { BenchmarkHeader } from "./components/BenchmarkHeader";
import { BenchmarkBranchCards } from "./components/BenchmarkBranchCards";
import { BenchmarkDemandCurves } from "./components/BenchmarkDemandCurves";
import { BenchmarkCategoryMixTable } from "./components/BenchmarkCategoryMixTable";
import { BenchmarkCancellations } from "./components/BenchmarkCancellations";
import { BenchmarkBusinessCase } from "./components/BenchmarkBusinessCase";
import { BenchmarkStylistAudit } from "./components/BenchmarkStylistAudit";

interface MultiBranchBenchmarkViewProps {
  benchmark?: MultiBranchBenchmark;
  gonzalesSales?: GonzalesSaleRecord[];
}

export const MultiBranchBenchmarkView: React.FC<MultiBranchBenchmarkViewProps> = ({
  benchmark,
  gonzalesSales = []
}) => {
  const {
    normalizationMode,
    setNormalizationMode,
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
    weeklyMetricMode,
    setWeeklyMetricMode,
    stylistStats,
    formatChartValue,
    fmtMoney,
    fmtCompact
  } = useBenchmarkTransform(benchmark, gonzalesSales);

  if (!benchmark) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">Cargando Benchmark Multi-Sede...</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          Sincronizando y ejecutando el modelo de normalización e inferencia horaria entre Salón RD, Luxury RD, Gonzales AM y Gloss Salon.
        </p>
      </div>
    );
  }

  const activeMix = is2026 && benchmark.benchmark2026
    ? benchmark.benchmark2026.comparativaMix
    : benchmark.comparativaMix;

  return (
    <div className="space-y-6">
      {/* 1. Header with Temporal & Normalization Mode Controls */}
      <BenchmarkHeader
        timeWindow={timeWindow}
        setTimeWindow={setTimeWindow}
        normalizationMode={normalizationMode}
        setNormalizationMode={setNormalizationMode}
        activeBranches={activeBranches}
      />

      {/* 2. Quad-Branch Comparative KPI Cards */}
      <BenchmarkBranchCards
        activeBranches={activeBranches}
        is2026={is2026}
        fmtMoney={fmtMoney}
        fmtCompact={fmtCompact}
      />

      {/* 3. Demand Curves Section (Weekly & Hourly Recharts) */}
      <BenchmarkDemandCurves
        weeklyChartData={weeklyChartData}
        hourlyChartData={hourlyChartData}
        normalizationMode={normalizationMode}
        weeklyMetricMode={weeklyMetricMode}
        onWeeklyMetricModeChange={setWeeklyMetricMode}
        formatChartValue={formatChartValue}
      />

      {/* 4. Service Category Mix Table */}
      <BenchmarkCategoryMixTable
        activeMix={activeMix}
        is2026={is2026}
      />

      {/* 5. Quad-Branch Cancellation & Retention Benchmark Comparison */}
      <BenchmarkCancellations
        comparativaCancelaciones={benchmark.comparativaCancelaciones}
      />

      {/* 6. Vaikuntha Business Case & Pain Points Diagnostic */}
      <BenchmarkBusinessCase
        vaikunthaBusinessCase={benchmark.vaikunthaBusinessCase}
        fmtMoney={fmtMoney}
      />

      {/* 7. Stylist Productivity & Revenue Ranking (Gonzales AM) */}
      <BenchmarkStylistAudit
        stylistStats={stylistStats}
        razonFilter={razonFilter}
        setRazonFilter={setRazonFilter}
        stylistSearch={stylistSearch}
        setStylistSearch={setStylistSearch}
        fmtMoney={fmtMoney}
      />
    </div>
  );
};
