import { AttendanceRecord } from "../../types.js";
import { parseExcelDateToIso, parseExcelTime, parseSafeNumber } from "../parsers/dataParsers.js";

function parseTimeMinutes(timeStr: string): number | null {
  const m = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const ampm = m[3] ? m[3].toUpperCase() : null;
  if (ampm === "PM" && h < 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return h * 60 + min;
}

export function processAttendance(
  asistenciaRaw: any[][] = [],
  asistenciaLuxuryRaw: any[][] = [],
  asistenciaGlossRaw: any[][] = [],
  resolveAgentName: (rawName: string) => string
): AttendanceRecord[] {
  const attendance: AttendanceRecord[] = [];

  // 1. Process Salón RD Attendance
  asistenciaRaw.forEach((row, idx) => {
    const dependienteRaw = String(row[1] || "").trim();
    if (!dependienteRaw || dependienteRaw === "Dependiente 1") return;

    const fechaIso = parseExcelDateToIso(row[0]);
    const dependiente = resolveAgentName(dependienteRaw);
    const entrada = parseExcelTime(row[2]);
    const refI = parseExcelTime(row[3]);
    const refT = parseExcelTime(row[4]);
    const salida = parseExcelTime(row[5]);

    const turnos = parseSafeNumber(row[6]);
    const clientes = parseSafeNumber(row[7]);
    const totalAtenciones = parseSafeNumber(row[8]) || turnos + clientes;

    let horasTrabajadas = 8;
    if (entrada && salida) {
      try {
        const minEntrada = parseTimeMinutes(entrada);
        const minSalida = parseTimeMinutes(salida);
        if (minEntrada !== null && minSalida !== null && minSalida > minEntrada) {
          horasTrabajadas = Math.round(((minSalida - minEntrada) / 60) * 10) / 10;
        }
      } catch {
        horasTrabajadas = 8;
      }
    }

    attendance.push({
      id: `ATT-${idx + 1}`,
      fecha: fechaIso,
      dependiente,
      entrada,
      refI: refI || undefined,
      refT: refT || undefined,
      salida: salida || undefined,
      turnos,
      clientes,
      totalAtenciones,
      horasTrabajadas,
      sede: "Salón RD"
    });
  });

  // 2. Process Luxury RD Attendance
  asistenciaLuxuryRaw.forEach((row, idx) => {
    const dependienteRaw = String(row[1] || "").trim();
    if (!dependienteRaw || dependienteRaw === "Dependiente 1") return;

    const fechaIso = parseExcelDateToIso(row[0]);
    const dependiente = resolveAgentName(dependienteRaw);
    const entrada = parseExcelTime(row[2]);
    const refI = parseExcelTime(row[3]);
    const refT = parseExcelTime(row[4]);
    const salida = parseExcelTime(row[5]);

    const turnos = parseSafeNumber(row[6]);
    const clientes = parseSafeNumber(row[7]);
    const totalAtenciones = parseSafeNumber(row[8]) || turnos + clientes;

    let horasTrabajadas = 8;
    if (entrada && salida) {
      try {
        const minEntrada = parseTimeMinutes(entrada);
        const minSalida = parseTimeMinutes(salida);
        if (minEntrada !== null && minSalida !== null && minSalida > minEntrada) {
          let totalMins = minSalida - minEntrada;
          const minRefI = refI ? parseTimeMinutes(refI) : null;
          const minRefT = refT ? parseTimeMinutes(refT) : null;
          if (minRefI !== null && minRefT !== null && minRefT > minRefI) {
            totalMins -= (minRefT - minRefI);
          }
          horasTrabajadas = Math.round((totalMins / 60) * 10) / 10;
        }
      } catch {
        horasTrabajadas = 8;
      }
    }

    attendance.push({
      id: `ATT-LUX-${idx + 1}`,
      fecha: fechaIso,
      dependiente,
      entrada: entrada || "10:30 am",
      refI: refI || undefined,
      refT: refT || undefined,
      salida: salida || "8:00 pm",
      turnos,
      clientes,
      totalAtenciones,
      horasTrabajadas,
      sede: "Luxury RD"
    });
  });

  // 3. Process Gloss Salon Attendance
  asistenciaGlossRaw.forEach((row, idx) => {
    const dependienteRaw = String(row[1] || "").trim();
    if (!dependienteRaw || dependienteRaw === "Dependiente 1") return;

    const fechaIso = parseExcelDateToIso(row[0]);
    const dependiente = resolveAgentName(dependienteRaw);
    const entrada = parseExcelTime(row[2]);
    const refI = parseExcelTime(row[3]);
    const refT = parseExcelTime(row[4]);
    const salida = parseExcelTime(row[5]);

    const turnos = parseSafeNumber(row[6]);
    const clientes = parseSafeNumber(row[7]);
    const totalAtenciones = parseSafeNumber(row[8]) || turnos + clientes;

    let horasTrabajadas = 8;
    if (entrada && salida) {
      try {
        const minEntrada = parseTimeMinutes(entrada);
        const minSalida = parseTimeMinutes(salida);
        if (minEntrada !== null && minSalida !== null && minSalida > minEntrada) {
          let totalMins = minSalida - minEntrada;
          const minRefI = refI ? parseTimeMinutes(refI) : null;
          const minRefT = refT ? parseTimeMinutes(refT) : null;
          if (minRefI !== null && minRefT !== null && minRefT > minRefI) {
            totalMins -= (minRefT - minRefI);
          }
          horasTrabajadas = Math.round((totalMins / 60) * 10) / 10;
        }
      } catch {
        horasTrabajadas = 8;
      }
    }

    attendance.push({
      id: `ATT-GLS-${idx + 1}`,
      fecha: fechaIso,
      dependiente,
      entrada: entrada || "10:00 am",
      refI: refI || undefined,
      refT: refT || undefined,
      salida: salida || "8:00 pm",
      turnos,
      clientes,
      totalAtenciones,
      horasTrabajadas,
      sede: "Gloss Salon"
    });
  });

  return attendance;
}
