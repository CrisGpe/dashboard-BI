import { UnifiedClient, OatcRecord, TicketRecord } from "../../types.js";
import { parseExcelDateToIso } from "../parsers/dataParsers.js";

export function processUnifiedClients(
  orders: OatcRecord[] = [],
  tickets: TicketRecord[] = [],
  clientesLuxuryRaw: any[][] = [],
  clientesGlossRaw: any[][] = []
): UnifiedClient[] {
  const clientMap = new Map<
    string,
    {
      nombre: string;
      dni?: string;
      celular?: string;
      email?: string;
      cumpleanos?: string;
      sede?: string;
      servicios: number;
      retailCompras: number;
      gastoTotal: number;
      ultimaVisita: string;
      fechasServicio: Set<string>;
      fechasRetail: Set<string>;
    }
  >();

  const getClientKey = (nombre: string, dni?: string, cel?: string) => {
    if (dni && dni.length >= 8) return `dni_${dni}`;
    if (cel && cel.length >= 9) return `cel_${cel}`;
    return `name_${nombre.toLowerCase().trim()}`;
  };

  // 1. Ingest Orders (Salón RD, Luxury RD, Gloss Salon)
  orders.forEach((o) => {
    if (o.isCancelled) return;
    const key = getClientKey(o.clienteNombre);
    const cur = clientMap.get(key) || {
      nombre: o.clienteNombre,
      servicios: 0,
      retailCompras: 0,
      gastoTotal: 0,
      ultimaVisita: "",
      sede: o.sede || "Salón RD",
      fechasServicio: new Set(),
      fechasRetail: new Set()
    };
    cur.servicios++;
    if (o.fechaRegistro) {
      cur.fechasServicio.add(o.fechaRegistro);
      if (!cur.ultimaVisita || o.fechaRegistro > cur.ultimaVisita) {
        cur.ultimaVisita = o.fechaRegistro;
      }
    }
    clientMap.set(key, cur);
  });

  // 2. Ingest Tickets ERP (Salón RD)
  tickets.forEach((t) => {
    if (t.estado === "ANULADO") return;
    const key = getClientKey(t.clienteNombreLimpio, t.clienteDni, t.clienteCelular);
    const cur = clientMap.get(key) || {
      nombre: t.clienteNombreLimpio,
      dni: t.clienteDni,
      celular: t.clienteCelular,
      servicios: 0,
      retailCompras: 0,
      gastoTotal: 0,
      ultimaVisita: "",
      sede: "Salón RD",
      fechasServicio: new Set(),
      fechasRetail: new Set()
    };

    cur.retailCompras++;
    cur.gastoTotal += t.total;
    if (!cur.dni && t.clienteDni) cur.dni = t.clienteDni;
    if (!cur.celular && t.clienteCelular) cur.celular = t.clienteCelular;
    if (t.fecha) {
      cur.fechasRetail.add(t.fecha);
      if (!cur.ultimaVisita || t.fecha > cur.ultimaVisita) {
        cur.ultimaVisita = t.fecha;
      }
    }
    clientMap.set(key, cur);
  });

  // 3. Ingest Luxury RD Registered Clients
  clientesLuxuryRaw.forEach((row) => {
    const nombre = String(row[1] || "").trim();
    const apellido = String(row[2] || "").trim();
    const fullName = `${nombre} ${apellido}`.trim();
    if (!fullName || fullName.toLowerCase().includes("nombre")) return;

    const dni = row[3] ? String(row[3]).trim() : undefined;
    const cumpleanos = row[4] ? parseExcelDateToIso(row[4]) || String(row[4]).trim() : undefined;
    const celular = row[5] ? String(row[5]).trim() : undefined;
    const email = row[6] ? String(row[6]).trim() : undefined;
    const ultimaVisita = parseExcelDateToIso(row[7]) || parseExcelDateToIso(row[0]);

    const key = getClientKey(fullName, dni, celular);
    const cur = clientMap.get(key) || {
      nombre: fullName,
      dni,
      celular,
      email,
      cumpleanos,
      sede: "Luxury RD",
      servicios: 0,
      retailCompras: 0,
      gastoTotal: 0,
      ultimaVisita: ultimaVisita || "",
      fechasServicio: new Set(),
      fechasRetail: new Set()
    };

    if (!cur.dni && dni) cur.dni = dni;
    if (!cur.celular && celular) cur.celular = celular;
    if (!cur.email && email) cur.email = email;
    if (!cur.cumpleanos && cumpleanos) cur.cumpleanos = cumpleanos;
    if (!cur.sede) cur.sede = "Luxury RD";
    if (ultimaVisita && (!cur.ultimaVisita || ultimaVisita > cur.ultimaVisita)) {
      cur.ultimaVisita = ultimaVisita;
    }
    clientMap.set(key, cur);
  });

  // 4. Ingest Gloss Salon Registered Clients
  clientesGlossRaw.forEach((row) => {
    const nombre = String(row[1] || "").trim();
    const apellido = String(row[2] || "").trim();
    const fullName = `${nombre} ${apellido}`.trim();
    if (!fullName || fullName.toLowerCase().includes("nombre")) return;

    const dni = row[3] ? String(row[3]).trim() : undefined;
    const cumpleanos = row[4] ? parseExcelDateToIso(row[4]) || String(row[4]).trim() : undefined;
    const celular = row[5] ? String(row[5]).trim() : undefined;
    const email = row[6] ? String(row[6]).trim() : undefined;
    const ultimaVisita = parseExcelDateToIso(row[7]) || parseExcelDateToIso(row[0]);

    const key = getClientKey(fullName, dni, celular);
    const cur = clientMap.get(key) || {
      nombre: fullName,
      dni,
      celular,
      email,
      cumpleanos,
      sede: "Gloss Salon",
      servicios: 0,
      retailCompras: 0,
      gastoTotal: 0,
      ultimaVisita: ultimaVisita || "",
      fechasServicio: new Set(),
      fechasRetail: new Set()
    };

    if (!cur.dni && dni) cur.dni = dni;
    if (!cur.celular && celular) cur.celular = celular;
    if (!cur.email && email) cur.email = email;
    if (!cur.cumpleanos && cumpleanos) cur.cumpleanos = cumpleanos;
    if (!cur.sede) cur.sede = "Gloss Salon";
    if (ultimaVisita && (!cur.ultimaVisita || ultimaVisita > cur.ultimaVisita)) {
      cur.ultimaVisita = ultimaVisita;
    }
    clientMap.set(key, cur);
  });

  return Array.from(clientMap.entries())
    .map(([id, c]) => {
      let isCrossBuyer = false;
      c.fechasServicio.forEach((f) => {
        if (c.fechasRetail.has(f)) isCrossBuyer = true;
      });

      return {
        id,
        nombre: c.nombre,
        dni: c.dni,
        celular: c.celular,
        email: c.email,
        cumpleanos: c.cumpleanos,
        sede: c.sede || "Salón RD",
        totalServicios: c.servicios,
        totalComprasRetail: c.retailCompras,
        montoTotalGastado: Math.round(c.gastoTotal * 100) / 100,
        ultimaVisita: c.ultimaVisita,
        esCrossBuyer: isCrossBuyer || (c.servicios > 0 && c.retailCompras > 0)
      };
    })
    .sort((a, b) => b.totalServicios + b.totalComprasRetail - (a.totalServicios + a.totalComprasRetail));
}
