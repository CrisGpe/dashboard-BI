import { CashServiceSaleRecord, GonzalesSaleRecord, TicketRecord } from "../types";

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
    itemLower.includes("caja")
  );
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
  sale: GonzalesSaleRecord
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
    nroDoc: nro
  };
}
