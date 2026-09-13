import { OatcRecord, CancellationMacroCategory, CancellationSubCategory, AgentMaster } from "../../types.js";
import { parseExcelDateToIso, parseExcelTime, getDayOfWeek } from "../parsers/dataParsers.js";

export function classifyCancellation(
  rawMotivo: string,
  rawHoraResol: string,
  rawTipo: string
): {
  isCancelled: boolean;
  horaCancelacion?: string;
  motivoLimpio?: string;
  macroCategoria?: CancellationMacroCategory;
  subCategoria?: CancellationSubCategory;
} {
  const resolLower = String(rawHoraResol || "").toLowerCase();
  const motivoLower = String(rawMotivo || "").toLowerCase();
  const tipoLower = String(rawTipo || "").toLowerCase();

  const isCancelled =
    resolLower.includes("cancel") ||
    resolLower.includes("anul") ||
    motivoLower.includes("cancel") ||
    motivoLower.includes("anul") ||
    motivoLower.includes("el motivo fue") ||
    motivoLower.startsWith("motivo:") ||
    tipoLower.includes("cancel");

  if (!isCancelled) {
    return { isCancelled: false };
  }

  // Extract clean cancellation hour (e.g. from "Cancelado a las: 19/11/2025 10:40 AM" -> "10:40 AM")
  let horaCancelacion: string | undefined = undefined;
  const timeMatch = String(rawHoraResol || "").match(/(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i);
  if (timeMatch) {
    horaCancelacion = timeMatch[1].trim();
  }

  // Clean motivo text (remove "el motivo fue:", "Motivo:", etc.)
  let motivoLimpio = String(rawMotivo || "")
    .replace(/^el motivo fue:\s*/i, "")
    .replace(/^motivo:\s*/i, "")
    .trim();

  if (!motivoLimpio && (resolLower.includes("cancel") || tipoLower.includes("cancel"))) {
    motivoLimpio = "Cancelado sin motivo detallado";
  }

  const combinedText = `${motivoLimpio} ${rawMotivo} ${rawHoraResol}`.toLowerCase();

  let macroCategoria: CancellationMacroCategory = "RECHAZO_CLIENTE";
  let subCategoria: CancellationSubCategory = "OTRO";

  // Check administrative / duplicate errors
  if (
    combinedText.includes("duplicad") ||
    combinedText.includes("error") ||
    combinedText.includes("doble") ||
    combinedText.includes("prueba") ||
    combinedText.includes("actualizacion") ||
    combinedText.includes("actualización") ||
    combinedText.includes("equivoc") ||
    combinedText.includes("sistema") ||
    combinedText.includes("correc")
  ) {
    macroCategoria = "ERROR_REGISTRO";
    subCategoria = "ADMINISTRATIVO";
  } else if (
    combinedText.includes("caro") ||
    combinedText.includes("precio") ||
    combinedText.includes("costo") ||
    combinedText.includes("dinero") ||
    combinedText.includes("presupuesto") ||
    combinedText.includes("presio") ||
    combinedText.includes("plata")
  ) {
    macroCategoria = "RECHAZO_CLIENTE";
    subCategoria = "PRECIO";
  } else if (
    combinedText.includes("espera") ||
    combinedText.includes("demora") ||
    combinedText.includes("tiempo") ||
    combinedText.includes("cola") ||
    combinedText.includes("tarda") ||
    combinedText.includes("apurad")
  ) {
    macroCategoria = "RECHAZO_CLIENTE";
    subCategoria = "ESPERA";
  } else if (
    combinedText.includes("insumo") ||
    combinedText.includes("stock") ||
    combinedText.includes("peluca") ||
    combinedText.includes("producto") ||
    combinedText.includes("material") ||
    combinedText.includes("no habia") ||
    combinedText.includes("no había") ||
    combinedText.includes("no tenia") ||
    combinedText.includes("no tenía")
  ) {
    macroCategoria = "RECHAZO_CLIENTE";
    subCategoria = "INSUMO";
  } else if (
    combinedText.includes("cambio de") ||
    combinedText.includes("cosmiatra") ||
    combinedText.includes("estilista") ||
    combinedText.includes("profesional") ||
    combinedText.includes("con otra") ||
    combinedText.includes("con otro")
  ) {
    macroCategoria = "RECHAZO_CLIENTE";
    subCategoria = "PREFERENCIA";
  } else if (
    combinedText.includes("convenc") ||
    combinedText.includes("pensar") ||
    combinedText.includes("volvera") ||
    combinedText.includes("volverá") ||
    combinedText.includes("otro momento") ||
    combinedText.includes("no se atendio") ||
    combinedText.includes("no se atendió") ||
    combinedText.includes("consulta") ||
    combinedText.includes("desist") ||
    combinedText.includes("cita")
  ) {
    macroCategoria = "RECHAZO_CLIENTE";
    subCategoria = "DESISTIMIENTO";
  } else {
    macroCategoria = "RECHAZO_CLIENTE";
    subCategoria = "OTRO";
  }

  return {
    isCancelled: true,
    horaCancelacion,
    motivoLimpio: motivoLimpio || "Cancelación sin especificar",
    macroCategoria,
    subCategoria
  };
}

export function processOrdersAndCancellations(
  oatcRaw: any[][] = [],
  borradorRaw: any[][] = [],
  oatcLuxuryRaw: any[][] = [],
  oatcGlossRaw: any[][] = [],
  borradorGlossRaw: any[][] = [],
  agentByCanonical: Map<string, AgentMaster>,
  resolveAgentName: (rawName: string) => string
): OatcRecord[] {
  const orders: OatcRecord[] = [];
  const seenOrderKeys = new Set<string>();

  // 1. Process Salón RD OATC
  oatcRaw.forEach((row, idx) => {
    const rawTipo = String(row[2] || "").trim();
    if (!rawTipo || rawTipo === "Tipo OATC") return;

    const fechaIso = parseExcelDateToIso(row[3]);
    const hrRegistro = parseExcelTime(row[0]);
    const numOatc = row[1] || idx + 1;
    const clienteRaw = String(row[4] || "Cliente Casual").trim();
    const tipoCliente = String(row[5] || "Turno").trim();
    const agenteRaw = String(row[6] || "").trim();
    const agente = resolveAgentName(agenteRaw);
    const hrResol = parseExcelTime(row[7]);
    const motivo = String(row[8] || "").trim();

    const uniqueKey = `OATC-${fechaIso}-${numOatc}-${agente}`;
    if (seenOrderKeys.has(uniqueKey)) return;
    seenOrderKeys.add(uniqueKey);

    const cancelInfo = classifyCancellation(motivo, hrResol, rawTipo);
    const diaSemana = getDayOfWeek(fechaIso);
    const masterAgent = agentByCanonical.get(agente);
    const sede = masterAgent?.salon || "RD";

    orders.push({
      id: `OATC-${idx + 1}`,
      hrRegistro,
      numeroOatc: numOatc,
      tipoOatc: rawTipo,
      fechaRegistro: fechaIso,
      clienteNombre: clienteRaw,
      tipoCliente,
      agente,
      sede,
      diaSemana,
      horaResolucion: hrResol || undefined,
      motivo: motivo || undefined,
      motivoLimpio: cancelInfo.motivoLimpio,
      isCancelled: cancelInfo.isCancelled,
      horaCancelacion: cancelInfo.horaCancelacion,
      macroCategoria: cancelInfo.macroCategoria,
      subCategoria: cancelInfo.subCategoria,
      source: "OATC"
    });
  });

  // 2. Process Salón RD Borrador
  borradorRaw.forEach((row, idx) => {
    const rawTipo = String(row[15] || "").trim();
    if (!rawTipo || rawTipo === "Tipo OATC") return;

    const fechaIso = parseExcelDateToIso(row[16]);
    const numOatc = row[14] || `B-${idx}`;
    const agente = resolveAgentName(String(row[19] || ""));

    const uniqueKey = `BORRADOR-${fechaIso}-${numOatc}-${agente}`;
    if (seenOrderKeys.has(uniqueKey)) return;
    seenOrderKeys.add(uniqueKey);

    const hrResol = parseExcelTime(row[20]);
    const motivo = String(row[21] || "").trim();
    const cancelInfo = classifyCancellation(motivo, hrResol, rawTipo);
    const diaSemana = getDayOfWeek(fechaIso);
    const masterAgent = agentByCanonical.get(agente);
    const sede = masterAgent?.salon || "RD";

    orders.push({
      id: `BORRADOR-${idx + 1}`,
      hrRegistro: parseExcelTime(row[13]),
      numeroOatc: numOatc,
      tipoOatc: rawTipo,
      fechaRegistro: fechaIso,
      clienteNombre: String(row[17] || "Cliente Casual").trim(),
      tipoCliente: String(row[18] || "Turno").trim(),
      agente,
      sede,
      diaSemana,
      horaResolucion: hrResol || undefined,
      motivo: motivo || undefined,
      motivoLimpio: cancelInfo.motivoLimpio,
      isCancelled: cancelInfo.isCancelled,
      horaCancelacion: cancelInfo.horaCancelacion,
      macroCategoria: cancelInfo.macroCategoria,
      subCategoria: cancelInfo.subCategoria,
      source: "Borrador"
    });
  });

  // 3. Process Luxury RD OATC (6,676 Check-ins & 155 Canceled with Motivo)
  oatcLuxuryRaw.forEach((row, idx) => {
    const rawTipo = String(row[2] || "").trim();
    if (!rawTipo || rawTipo === "Tipo OATC" || rawTipo === "Tipo OATC 7") return;

    const fechaIso = parseExcelDateToIso(row[3]);
    const hrRegistro = parseExcelTime(row[0]);
    const numOatc = row[1] || `LX-${idx + 1}`;
    const clienteRaw = String(row[4] || "Cliente Casual").trim();
    const tipoCliente = String(row[5] || "Turno").trim();
    const agenteRaw = String(row[6] || "").trim();
    const agente = resolveAgentName(agenteRaw);
    const hrResol = parseExcelTime(row[7]);
    const motivo = String(row[8] || "").trim();

    const uniqueKey = `OATC-LUX-${fechaIso}-${numOatc}-${agente}`;
    if (seenOrderKeys.has(uniqueKey)) return;
    seenOrderKeys.add(uniqueKey);

    const cancelInfo = classifyCancellation(motivo, hrResol, rawTipo);
    const diaSemana = getDayOfWeek(fechaIso);

    orders.push({
      id: `OATC-LUX-${idx + 1}`,
      hrRegistro,
      numeroOatc: numOatc,
      tipoOatc: rawTipo,
      fechaRegistro: fechaIso,
      clienteNombre: clienteRaw,
      tipoCliente,
      agente,
      sede: "Luxury RD",
      diaSemana,
      horaResolucion: hrResol || undefined,
      motivo: motivo || undefined,
      motivoLimpio: cancelInfo.motivoLimpio,
      isCancelled: cancelInfo.isCancelled,
      horaCancelacion: cancelInfo.horaCancelacion,
      macroCategoria: cancelInfo.macroCategoria,
      subCategoria: cancelInfo.subCategoria,
      source: "OATC"
    });
  });

  // 4. Process Gloss Salon OATC (6,636 Check-ins & Canceled with Motivo)
  oatcGlossRaw.forEach((row, idx) => {
    const rawTipo = String(row[2] || "").trim();
    if (!rawTipo || rawTipo === "Tipo OATC" || rawTipo === "Tipo OATC 7") return;

    const fechaIso = parseExcelDateToIso(row[3]);
    const hrRegistro = parseExcelTime(row[0]);
    const numOatc = row[1] || `GLS-${idx + 1}`;
    const clienteRaw = String(row[4] || "Cliente Casual").trim();
    const tipoCliente = String(row[5] || "Turno").trim();
    const agenteRaw = String(row[6] || "").trim();
    const agente = resolveAgentName(agenteRaw);
    const hrResol = parseExcelTime(row[7]);
    const motivo = String(row[8] || "").trim();

    const uniqueKey = `OATC-GLS-${fechaIso}-${numOatc}-${agente}`;
    if (seenOrderKeys.has(uniqueKey)) return;
    seenOrderKeys.add(uniqueKey);

    const cancelInfo = classifyCancellation(motivo, hrResol, rawTipo);
    const diaSemana = getDayOfWeek(fechaIso);

    orders.push({
      id: `OATC-GLS-${idx + 1}`,
      hrRegistro,
      numeroOatc: numOatc,
      tipoOatc: rawTipo,
      fechaRegistro: fechaIso,
      clienteNombre: clienteRaw,
      tipoCliente,
      agente,
      sede: "Gloss Salon",
      diaSemana,
      horaResolucion: hrResol || undefined,
      motivo: motivo || undefined,
      motivoLimpio: cancelInfo.motivoLimpio,
      isCancelled: cancelInfo.isCancelled,
      horaCancelacion: cancelInfo.horaCancelacion,
      macroCategoria: cancelInfo.macroCategoria,
      subCategoria: cancelInfo.subCategoria,
      source: "OATC"
    });
  });

  // 5. Process Gloss Salon Borrador (if any)
  borradorGlossRaw.forEach((row, idx) => {
    const rawTipo = String(row[15] || "").trim();
    if (!rawTipo || rawTipo === "Tipo OATC") return;

    const fechaIso = parseExcelDateToIso(row[16]);
    const hrResol = parseExcelTime(row[20]);
    const motivo = String(row[21] || "").trim();
    const cancelInfo = classifyCancellation(motivo, hrResol, rawTipo);

    const numOatc = row[14] || `GLS-BORR-${idx + 1}`;
    const agente = resolveAgentName(String(row[19] || ""));

    const uniqueKey = `GLS-BORR-${fechaIso}-${numOatc}-${agente}`;
    if (seenOrderKeys.has(uniqueKey)) return;
    seenOrderKeys.add(uniqueKey);

    const diaSemana = getDayOfWeek(fechaIso);

    orders.push({
      id: `GLS-BORRADOR-${idx + 1}`,
      hrRegistro: parseExcelTime(row[13]),
      numeroOatc: numOatc,
      tipoOatc: rawTipo,
      fechaRegistro: fechaIso,
      clienteNombre: String(row[17] || "Cliente Casual").trim(),
      tipoCliente: String(row[18] || "Turno").trim(),
      agente,
      sede: "Gloss Salon",
      diaSemana,
      horaResolucion: hrResol || undefined,
      motivo: motivo || undefined,
      motivoLimpio: cancelInfo.motivoLimpio,
      isCancelled: cancelInfo.isCancelled,
      horaCancelacion: cancelInfo.horaCancelacion,
      macroCategoria: cancelInfo.macroCategoria,
      subCategoria: cancelInfo.subCategoria,
      source: "Borrador"
    });
  });

  return orders;
}
