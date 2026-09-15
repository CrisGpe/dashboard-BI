import { CashServiceSaleRecord, GonzalesSaleRecord, TicketRecord, TicketDetailRecord } from "../types";

export function isRetailItem(item: string, categoria?: string): boolean {
  if (!item) return false;
  const it = item.trim();

  // 1. Primary Rule: Presentation by volume (ML / ml) indicates physical retail product
  if (/\b\d*\s*ml\b/i.test(it) || /\bml\b/i.test(it)) {
    return true;
  }

  // 2. Weight and size presentations (GR, G, OZ, LT)
  if (/\b\d+\s*(gr|g|oz|kg|lt|l)\b/i.test(it)) {
    return true;
  }

  // 3. Explicit product indicator in text (e.g., "PRODUCTO PARA LLEVAR", "RETAIL")
  const itLower = it.toLowerCase();
  if (itLower.startsWith("retail") || itLower.includes("para llevar")) {
    return true;
  }

  return false;
}

export function detectBrandFromItem(item: string): string {
  const it = (item || "").toLowerCase();
  if (
    it.includes("therapiste") ||
    it.includes("oleo relax") ||
    it.includes("bain") ||
    it.includes("soleil") ||
    it.includes("kerastase") ||
    it.includes("kérastase") ||
    it.includes("genesis") ||
    it.includes("chronologiste") ||
    it.includes("nutritive") ||
    it.includes("densifique") ||
    it.includes("fondant") ||
    it.includes("ciment") ||
    it.includes("nectar") ||
    it.includes("elixir") ||
    it.includes("8h magic") ||
    it.includes("anti chute") ||
    it.includes("divalent") ||
    it.includes("fluidealiste") ||
    it.includes("hydra fortifiant") ||
    it.includes("premiere") ||
    it.includes("maskeratine") ||
    it.includes("discipline")
  ) {
    return "KÉRASTASE";
  }
  if (it.includes("equave") || it.includes("proyou") || it.includes("revlon")) return "REVLON PROFESSIONAL";
  if (it.includes("small talk") || it.includes("bed head") || it.includes("tigi")) return "TIGI BED HEAD";
  if (it.includes("energizing") || it.includes("davines")) return "DAVINES";
  if (it.includes("baor")) return "BAOR PROFESSIONAL";
  if (
    it.includes("fusion") ||
    it.includes("wella") ||
    it.includes("invigo") ||
    it.includes("oil reflections") ||
    it.includes("elements") ||
    it.includes("luxe oil") ||
    it.includes("luxeoil") ||
    it.includes("sebastian")
  ) {
    return "WELLA PROFESSIONALS";
  }
  if (it.includes("nioxin") || it.includes("diaboost")) return "NIOXIN";
  if (
    it.includes("loreal") ||
    it.includes("l'oréal") ||
    it.includes("abs rep") ||
    it.includes("metal detox") ||
    it.includes("vitamino") ||
    it.includes("absolut repair") ||
    it.includes("liss unlimited") ||
    it.includes("silver")
  ) {
    return "L'ORÉAL PROFESSIONNEL";
  }
  if (it.includes("moroccanoil")) return "MOROCCANOIL";
  if (
    it.includes("opi") ||
    it.includes("alpine snow") ||
    it.includes("big apple red") ||
    it.includes("lacquer") ||
    it.includes("gelcolor") ||
    it.includes("bubble bath")
  ) {
    return "OPI";
  }
  if (it.includes("schwarzkopf") || it.includes("bonacure") || it.includes("osir")) return "SCHWARZKOPF";
  if (it.includes("alfaparf") || it.includes("semi di lino") || it.includes("il salone")) return "ALFAPARF";
  if (
    it.includes("redken") ||
    it.includes("all soft") ||
    it.includes("frizz dismiss") ||
    it.includes("extreme") ||
    it.includes("acidic")
  ) {
    return "REDKEN";
  }
  if (it.includes("salerm")) return "SALERM";
  return "OTRAS MARCAS RETAIL";
}

export function normalizeSaleToCashRecord(
  sale: GonzalesSaleRecord,
  sede: string
): CashServiceSaleRecord {
  const isRetail = isRetailItem(sale.item, sale.categoria);
  const comision = isRetail ? 0 : Math.round(sale.importe * 0.40 * 100) / 100;
  const boleta = `${sale.docTipo || "BOL"} ${sale.docNumero || ""}`.trim();
  const ticketId = sale.docNumero ? `${sale.docTipo || "BOL"}-${sale.docNumero}` : sale.id;

  return {
    id: sale.id,
    fecha: sale.fecha,
    diaSemana: sale.diaSemana,
    ticketId,
    idOatc: 0,
    cliente: sale.cliente || "CLIENTES VARIOS",
    agente: sale.estilista,
    servicioOriginal: sale.item,
    servicioFinal: sale.item,
    servicioSubCategoria: sale.categoria,
    servicioCategoria: sale.categoria,
    montoEfectivo: 0,
    montoTarjeta: sale.importe,
    montoDeposito: 0,
    montoFinal: sale.importe,
    comision,
    estado: "Cobrado",
    ruc: sale.razonSocial || sede,
    boleta,
    mes: sale.fecha ? sale.fecha.substring(5, 7) : "",
    anio: sale.fecha ? sale.fecha.substring(0, 4) : "2026",
    sede
  };
}

export function normalizeSaleToTicket(
  sale: GonzalesSaleRecord,
  sede: string = "Salón"
): TicketRecord {
  const nro = sale.docNumero || sale.id;
  const ticket = sale.docNumero ? `${sale.docTipo || "BOL"}-${sale.docNumero}` : sale.id;

  return {
    ticket,
    fecha: sale.fecha,
    diaSemana: sale.diaSemana,
    cliente: sale.cliente || "CLIENTES VARIOS",
    clienteNombreLimpio: sale.cliente || "CLIENTES VARIOS",
    asesor: sale.estilista,
    subtotal: sale.importe,
    total: sale.importe,
    estado: "CERRADO",
    metodoPago: "TARJETA",
    tipoDoc: sale.docTipo || "BOL",
    nroDoc: nro,
    sede,
    item: sale.item,
    cantidad: sale.cantidad || 1
  };
}

export function normalizeSaleToTicketDetail(
  sale: GonzalesSaleRecord
): TicketDetailRecord {
  const ticket = sale.docNumero ? `${sale.docTipo || "BOL"}-${sale.docNumero}` : sale.id;
  const cant = sale.cantidad && sale.cantidad > 0 ? sale.cantidad : 1;
  const precioUnitario = Math.round((sale.importe / cant) * 100) / 100;

  return {
    id: `DET-${sale.id}`,
    ticket,
    fecha: sale.fecha,
    diaSemana: sale.diaSemana,
    sku: `RET-${sale.id}`,
    producto: sale.item,
    cantidad: cant,
    precioUnitario,
    subtotal: sale.importe
  };
}
