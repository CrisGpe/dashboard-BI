/**
 * Category Classifier: taxonomía canónica para homologar procedimientos y
 * servicios de las diferentes sedes (RD, Luxury, Gonzales, Gloss) a las
 * 7 macro-categorías estándar de la empresa.
 */

export const STANDARD_CATEGORIES = [
  "Colorimetría & Balayage",
  "Corte & Estilismo",
  "Manicure & Pedicure",
  "Tratamientos Capilares",
  "Lavado & Cuidado Capilar",
  "Estética Facial & Mirada",
  "Otros Servicios / Retail"
] as const;

export type StandardCategoryName = (typeof STANDARD_CATEGORIES)[number];

export function classifyStandardCategory(rawName: string, subCat?: string): string {
  const text = `${rawName || ""} ${subCat || ""}`.toLowerCase();
  if (
    text.includes("color") ||
    text.includes("tinte") ||
    text.includes("balayage") ||
    text.includes("mechas") ||
    text.includes("decolor") ||
    text.includes("iluminacion") ||
    text.includes("babylight") ||
    text.includes("matiz") ||
    text.includes("tonalizante")
  ) {
    return "Colorimetría & Balayage";
  }
  if (
    text.includes("corte") ||
    text.includes("cepillado") ||
    text.includes("peinado") ||
    text.includes("planchado") ||
    text.includes("ondas") ||
    text.includes("trenza") ||
    text.includes("barber") ||
    text.includes("barba")
  ) {
    return "Corte & Estilismo";
  }
  if (
    text.includes("manicur") ||
    text.includes("pedicur") ||
    text.includes("uña") ||
    text.includes("acrilic") ||
    text.includes("esmalte") ||
    text.includes("gel") ||
    text.includes("polygel") ||
    text.includes("acripie") ||
    text.includes("pies") ||
    text.includes("manos")
  ) {
    return "Manicure & Pedicure";
  }
  if (
    text.includes("tratamiento") ||
    text.includes("botox") ||
    text.includes("keratina") ||
    text.includes("alisado") ||
    text.includes("hidratac") ||
    text.includes("nutric") ||
    text.includes("ampolla") ||
    text.includes("cirugia capilar") ||
    text.includes("mascarilla") ||
    text.includes("cauteriz")
  ) {
    return "Tratamientos Capilares";
  }
  if (text.includes("lavado") || text.includes("shampoo") || text.includes("acondicionador")) {
    return "Lavado & Cuidado Capilar";
  }
  if (
    text.includes("depilac") ||
    text.includes("ceja") ||
    text.includes("pestaña") ||
    text.includes("maquillaje") ||
    text.includes("facial") ||
    text.includes("lash") ||
    text.includes("microblading")
  ) {
    return "Estética Facial & Mirada";
  }
  return "Otros Servicios / Retail";
}
