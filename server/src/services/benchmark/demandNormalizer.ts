import { NormalizedDemandPoint } from "../../types.js";

export const ALL_BENCHMARK_CATEGORIES = [
  "Colorimetría & Balayage",
  "Corte & Estilismo",
  "Manicure & Pedicure",
  "Tratamientos Capilares",
  "Lavado & Cuidado Capilar",
  "Estética Facial & Mirada",
  "Otros Servicios / Retail"
];

export function getFranjaFromHour(h: number): string {
  if (h < 12) return "MAÑANA";
  if (h < 15) return "MEDIODIA";
  if (h < 19) return "TARDE_NOCHE";
  return "NOCHE";
}

export interface RawDemandPoint {
  key: string;
  label: string;
  rdVal: number;
  luxVal: number;
  gonzVal: number;
  glossVal?: number;
}

export function buildNormalized(
  rawPoints: RawDemandPoint[],
  rdTot: number,
  luxTot: number,
  gonzTot: number,
  glossTot: number,
  rdDays: number,
  luxDays: number,
  gonzDays: number,
  glossDays: number,
  rdStyl: number,
  luxStyl: number,
  gonzStyl: number,
  glossStyl: number
): NormalizedDemandPoint[] {
  return rawPoints.map((p) => {
    const gVal = p.glossVal || 0;
    return {
      key: p.key,
      label: p.label,
      rd: {
        absolute: Math.round(p.rdVal * 10) / 10,
        relativePct: rdTot > 0 ? Math.round((p.rdVal / rdTot) * 1000) / 10 : 0,
        dailyAvg: rdDays > 0 ? Math.round((p.rdVal / (rdDays / 7)) * 10) / 10 : 0,
        perStylist: rdStyl > 0 ? Math.round((p.rdVal / rdStyl) * 10) / 10 : 0
      },
      luxury: {
        absolute: Math.round(p.luxVal * 10) / 10,
        relativePct: luxTot > 0 ? Math.round((p.luxVal / luxTot) * 1000) / 10 : 0,
        dailyAvg: luxDays > 0 ? Math.round((p.luxVal / (luxDays / 7)) * 10) / 10 : 0,
        perStylist: luxStyl > 0 ? Math.round((p.luxVal / luxStyl) * 10) / 10 : 0
      },
      gonzales: {
        absolute: Math.round(p.gonzVal * 10) / 10,
        relativePct: gonzTot > 0 ? Math.round((p.gonzVal / gonzTot) * 1000) / 10 : 0,
        dailyAvg: gonzDays > 0 ? Math.round((p.gonzVal / (gonzDays / 7)) * 10) / 10 : 0,
        perStylist: gonzStyl > 0 ? Math.round((p.gonzVal / gonzStyl) * 10) / 10 : 0
      },
      gloss: {
        absolute: Math.round(gVal * 10) / 10,
        relativePct: glossTot > 0 ? Math.round((gVal / glossTot) * 1000) / 10 : 0,
        dailyAvg: glossDays > 0 ? Math.round((gVal / (glossDays / 7)) * 10) / 10 : 0,
        perStylist: glossStyl > 0 ? Math.round((gVal / glossStyl) * 10) / 10 : 0
      }
    };
  });
}
