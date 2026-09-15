import { CashServiceSaleRecord, GonzalesSaleRecord, TicketRecord, TicketDetailRecord } from "../types";

export function isRetailItem(item: string, categoria: string): boolean {
  if (categoria !== "Otros Servicios / Retail") return false;
  const itemLower = (item || "").toLowerCase();
  return (
    itemLower.includes("shampoo") ||
    itemLower.includes("mascarilla") ||
    itemLower.includes("masque") ||
    itemLower.includes("oleo") ||
    itemLower.includes("óleo") ||
    itemLower.includes("serum") ||
    itemLower.includes("tratamiento en casa") ||
    itemLower.includes("crema") ||
    itemLower.includes("termo") ||
    itemLower.includes("balsam") ||
    itemLower.includes("ampolla") ||
    itemLower.includes("pack") ||
    itemLower.includes("caja") ||
    itemLower.includes("acondicionador") ||
    itemLower.includes("conditioner") ||
    itemLower.includes("spray") ||
    itemLower.includes("gel") ||
    itemLower.includes("mousse") ||
    itemLower.includes("cera") ||
    itemLower.includes("gotas") ||
    itemLower.includes("locion") ||
    itemLower.includes("loción") ||
    itemLower.includes("bain") ||
    itemLower.includes("fluido") ||
    itemLower.includes("aceite")
  );
}

export function detectBrandFromItem(item: string): string {
  const it = (item || "").toLowerCase();
  if (it.includes("therapiste") || it.includes("oleo relax") || it.includes("bain") || it.includes("soleil") || it.includes("kerastase") || it.includes("kérastase") || it.includes("genesis") || it.includes("chronologiste") || it.includes("nutritive") || it.includes("densifique")) return "KÉRASTASE";
  if (it.includes("baor")) return "BAOR PROFESSIONAL";
  if (it.includes("fusion") || it.includes("wella") || it.includes("invigo") || it.includes("oil reflections") || it.includes("elements")) return "WELLA PROFESSIONALS";
  if (it.includes("nioxin") || it.includes("diaboost")) return "NIOXIN";
  if (it.includes("loreal") || it.includes("l'oréal") || it.includes("abs rep") || it.includes("metal detox") || it.includes("vitamino")) return "L'ORÉAL PROFESSIONNEL";
  if (it.includes("moroccanoil")) return "MOROCCANOIL";
  if (it.includes("opi")) return "OPI";
  if (it.includes("schwarzkopf") || it.includes("bonacure") || it.includes("osir")) return "SCHWARZKOPF";
  if (it.includes("alfaparf") || it.includes("semi di lino")) return "ALFAPARF";
  if (it.includes("redken")) return "REDKEN";
  if (it.includes("salerm")) return "SALERM";
  if (it.includes("sebastian")) return "SEBASTIAN";
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
