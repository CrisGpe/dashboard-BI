import { SettlementRecord } from "../../types.js";
import { parseExcelDateToIso, parseSafeNumber } from "../parsers/dataParsers.js";

export function processSettlements(
  liquidacionesRaw: any[][],
  resolveAgentName: (raw: string) => string
): SettlementRecord[] {
  const settlements: SettlementRecord[] = [];

  liquidacionesRaw.forEach((row, idx) => {
    const agenteRaw = String(row[2] || "").trim();
    if (!agenteRaw || agenteRaw === "Agente") return;

    const agente = resolveAgentName(agenteRaw);
    const montoPagar = parseSafeNumber(row[4]);
    const estado = String(row[5] || "Pendiente").trim();

    settlements.push({
      idAutorizacion: String(row[0] || `AUTH-${idx}`),
      fechaSolicitud: parseExcelDateToIso(row[1]),
      agente,
      rangoFechas: String(row[3] || "").trim(),
      montoPagar,
      estado: estado.toLowerCase().includes("pag") ? "Pagado" : "Pendiente",
      autorizadoPor: String(row[6] || "Admin").trim(),
      fechaPago: parseExcelDateToIso(row[7]) || undefined
    });
  });

  return settlements;
}
