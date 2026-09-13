/**
 * Data Parsers: utilidades puras para formateo, extracción y saneamiento
 * de datos brutos provenientes de Google Sheets / Excel.
 */

export function parseExcelDateToIso(val: unknown): string {
  if (val === null || val === undefined || val === "") return "";
  if (val instanceof Date) {
    if (!isNaN(val.getTime())) {
      const y = val.getFullYear();
      const m = String(val.getMonth() + 1).padStart(2, "0");
      const d = String(val.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }
    return "";
  }
  if (typeof val === "number") {
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    if (!isNaN(date.getTime())) {
      const y = date.getUTCFullYear();
      const m = String(date.getUTCMonth() + 1).padStart(2, "0");
      const d = String(date.getUTCDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }
    return "";
  }
  if (typeof val === "string") {
    const trimmed = val.trim();
    const slashMatch = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (slashMatch) {
      const day = slashMatch[1].padStart(2, "0");
      const month = slashMatch[2].padStart(2, "0");
      const year = slashMatch[3];
      return `${year}-${month}-${day}`;
    }
    const isoMatch = trimmed.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
    if (isoMatch) {
      const year = isoMatch[1];
      const month = isoMatch[2].padStart(2, "0");
      const day = isoMatch[3].padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, "0");
      const d = String(parsed.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }
  }
  return "";
}

export function extractHourFromRawDate(val: unknown): number {
  if (val === null || val === undefined || val === "") return 12;
  if (val instanceof Date) {
    if (!isNaN(val.getTime())) {
      return val.getHours();
    }
    return 12;
  }
  if (typeof val === "number") {
    const frac = val - Math.floor(val);
    const totalSeconds = Math.round(frac * 86400);
    return Math.floor(totalSeconds / 3600) % 24;
  }
  if (typeof val === "string") {
    const trimmed = val.trim();
    const timeMatch = trimmed.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?/i);
    if (timeMatch) {
      let h = parseInt(timeMatch[1], 10);
      const isPm = timeMatch[4] && timeMatch[4].toLowerCase() === "pm";
      const isAm = timeMatch[4] && timeMatch[4].toLowerCase() === "am";
      if (isPm && h < 12) h += 12;
      if (isAm && h === 12) h = 0;
      return Math.max(0, Math.min(23, h));
    }
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      return d.getHours();
    }
  }
  return 12;
}

export function parseExcelTime(val: unknown): string {
  if (val === null || val === undefined) return "";
  if (typeof val === "number") {
    const totalSeconds = Math.round(val * 86400);
    const hours = Math.floor(totalSeconds / 3600) % 24;
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const ampm = hours >= 12 ? "PM" : "AM";
    const h12 = hours % 12 || 12;
    return `${h12}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  }
  if (typeof val === "string") {
    return val.trim();
  }
  return "";
}

export function parseSafeNumber(val: unknown): number {
  if (typeof val === "number") return isNaN(val) ? 0 : val;
  if (!val) return 0;
  if (typeof val === "string") {
    const cleaned = val.replace(/[^0-9.-]/g, "");
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }
  return 0;
}

export function cleanAgentName(name: string): string {
  if (!name) return "Sin asignar";
  return name.trim().replace(/\s+/g, " ");
}

export function cleanClientName(raw: string): string {
  if (!raw) return "Cliente Casual / Mostrador";
  let clean = raw.trim().replace(/\s+/g, " ");
  if (clean.toLowerCase() === "cliente" || clean.toLowerCase() === "cliente desconocida") {
    return "Cliente Casual / Mostrador";
  }
  return clean;
}

export function parseClientField(raw: string): { nombre: string; dni?: string; celular?: string } {
  if (!raw) return { nombre: "Cliente no registrado" };
  const str = String(raw).trim();

  let nombre = str;
  let dni: string | undefined;
  let celular: string | undefined;

  const parts = str.split("|").map((p) => p.trim());
  if (parts.length > 1) {
    nombre = parts[0];
    parts.slice(1).forEach((part) => {
      const dniMatch = part.match(/DNI[:\s]*([0-9A-Za-z]+)/i);
      if (dniMatch) dni = dniMatch[1].trim();

      const celMatch = part.match(/Cel(?:ular)?[:\s]*([0-9+]+)/i);
      if (celMatch) celular = celMatch[1].trim();
    });
  } else {
    const celMatch = str.match(/(?:9\d{8}|\+?519\d{8})/);
    if (celMatch) celular = celMatch[0];
    const dniMatch = str.match(/\b\d{8}\b/);
    if (dniMatch && dniMatch[0] !== celular) dni = dniMatch[0];
  }

  if (nombre.toLowerCase() === "cliente" || nombre.toLowerCase() === "cliente desconocida") {
    nombre = "Cliente Casual / Mostrador";
  }

  return { nombre, dni, celular };
}

export const DAY_NAMES_ES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
export const ORDERED_DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
export const DAY_SHORT_LABELS: Record<string, string> = {
  "Lunes": "Lun",
  "Martes": "Mar",
  "Miércoles": "Mié",
  "Jueves": "Jue",
  "Viernes": "Vie",
  "Sábado": "Sáb",
  "Domingo": "Dom"
};

export function getDayOfWeek(dateIso: string): string {
  if (!dateIso) return "No registrado";
  const parts = dateIso.split("-");
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const date = new Date(Date.UTC(y, m, d, 12, 0, 0));
    if (!isNaN(date.getTime())) {
      return DAY_NAMES_ES[date.getUTCDay()];
    }
  }
  return "No registrado";
}
