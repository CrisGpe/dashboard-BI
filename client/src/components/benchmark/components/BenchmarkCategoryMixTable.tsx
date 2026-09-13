import React from "react";
import { Layers } from "lucide-react";

export interface BenchmarkCategoryMixTableProps {
  activeMix: {
    categoria: string;
    rdPct: number;
    luxuryPct: number;
    gonzalesPct: number;
    glossPct?: number;
  }[];
  is2026: boolean;
}

export const BenchmarkCategoryMixTable: React.FC<BenchmarkCategoryMixTableProps> = ({
  activeMix,
  is2026
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-black text-slate-900">
            Comparativa de Mix de Categorías (% de Atenciones por Especialidad)
          </h3>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {is2026 ? "Ventana 2026 Homogénea" : "Histórico Acumulado"}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <th className="py-3 px-4">Categoría de Servicio</th>
              <th className="py-3 px-4 text-center">Salón RD (Share %)</th>
              <th className="py-3 px-4 text-center">Luxury RD (Share %)</th>
              <th className="py-3 px-4 text-center bg-amber-50/50">Gonzales AM (Share %)</th>
              <th className="py-3 px-4 text-center bg-pink-50/50">Gloss Salon (Share %)</th>
              <th className="py-3 px-4 text-left">Diagnóstico Estratégico</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {activeMix.map((row) => {
              let insight = "Comportamiento estándar de salón";
              if (row.categoria.includes("Color")) {
                insight = "Pilar supremo de facturación (~40% de ingresos en Gonzales AM). Servicio de alta duración (2-3 hrs).";
              } else if (row.categoria.includes("Corte")) {
                insight = "Mayor peso en rotación rápida y generación de tráfico diario continuo.";
              } else if (row.categoria.includes("Manicure")) {
                insight = "Servicio de entrada; oportunidad clave de cross-selling hacia coloración y tratamientos capilares.";
              } else if (row.categoria.includes("Tratamientos")) {
                insight = "Ticket alto y margen elevado; oportunidad de elevar penetración mediante diagnóstico de salud capilar.";
              } else if (row.categoria.includes("Peinados")) {
                insight = "Concentrado fuertemente en fines de semana (viernes/sábado) por eventos sociales.";
              }

              return (
                <tr key={row.categoria} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-800">{row.categoria}</td>
                  <td className="py-3 px-4 text-center font-semibold text-indigo-700">{row.rdPct}%</td>
                  <td className="py-3 px-4 text-center font-semibold text-emerald-700">{row.luxuryPct}%</td>
                  <td className="py-3 px-4 text-center font-bold text-amber-700 bg-amber-50/30">
                    {row.gonzalesPct}%
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-pink-700 bg-pink-50/30">
                    {row.glossPct ?? 0}%
                  </td>
                  <td className="py-3 px-4 text-slate-600 text-[11px]">{insight}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
