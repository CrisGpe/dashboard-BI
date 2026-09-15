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

  // 1. Retail Products: Identified by volume (ML / ml) or weight/size (GR, G, OZ, LT)
  // in the "Producto / Servicio" column (e.g. "SHAMPOO ALL SOFT 1000 ML", "MASQUE OLEO RELAX 200 ML")
  if (
    /\b\d*\s*ml\b/i.test(rawName) ||
    /\bml\b/i.test(rawName) ||
    /\b\d+\s*(gr|g|oz|kg|lt|l)\b/i.test(rawName)
  ) {
    return "Otros Servicios / Retail";
  }

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
    text.includes("manos") ||
    text.includes("podolog")
  ) {
    return "Manicure & Pedicure";
  }
  if (
    text.includes("tratamiento") ||
    text.includes("botox") ||
    text.includes("keratina") ||
    text.includes("alisado") ||
    text.includes("laceado") ||
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
    text.includes("lifting") ||
    text.includes("microblading") ||
    text.includes("hilo")
  ) {
    return "Estética Facial & Mirada";
  }
  return "Otros Servicios / Retail";
}

export type MacroCategory = "ESTILISMO" | "COSMIATRIA" | "RETAIL";

export function classifyMacroCategory(rawName: string, subCat?: string): MacroCategory {
  const std = classifyStandardCategory(rawName, subCat);
  const text = `${rawName || ""} ${subCat || ""}`.toLowerCase();

  // If identified as Retail product
  if (
    std === "Otros Servicios / Retail" &&
    (/\b\d*\s*ml\b/i.test(rawName) ||
      /\bml\b/i.test(rawName) ||
      /\b\d+\s*(gr|g|oz|kg|lt|l)\b/i.test(rawName))
  ) {
    return "RETAIL";
  }

  // Maquillaje, novias, peinado, paquetes specifically belong to Estilismo as aligned in /grill-me
  if (
    text.includes("maquillaje") ||
    text.includes("makeup") ||
    text.includes("make up") ||
    text.includes("novia") ||
    text.includes("paquete") ||
    text.includes("peinado")
  ) {
    return "ESTILISMO";
  }

  // Estilismo: Hair categories
  if (
    std === "Colorimetría & Balayage" ||
    std === "Corte & Estilismo" ||
    std === "Tratamientos Capilares" ||
    std === "Lavado & Cuidado Capilar"
  ) {
    return "ESTILISMO";
  }

  // Cosmiatría / Estética: Nails, feet, facials, lashes, brows, waxing
  if (
    std === "Manicure & Pedicure" ||
    std === "Estética Facial & Mirada"
  ) {
    return "COSMIATRIA";
  }

  // Fallback: If contains cosmetic keywords
  if (
    text.includes("facial") ||
    text.includes("pestañ") ||
    text.includes("lash") ||
    text.includes("ceja") ||
    text.includes("depila") ||
    text.includes("mani") ||
    text.includes("pedi") ||
    text.includes("podolog") ||
    text.includes("lifting")
  ) {
    return "COSMIATRIA";
  }

  return "ESTILISMO";
}

