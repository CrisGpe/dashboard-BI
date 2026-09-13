export function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return "S/. 0.00";
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
    .format(amount)
    .replace("PEN", "S/.");
}

export function formatNumber(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val)) return "0";
  return new Intl.NumberFormat("es-PE").format(val);
}

export function formatPercent(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val)) return "0%";
  return `${(val || 0).toFixed(1)}%`;
}

export function formatDate(isoDate: string | undefined | null): string {
  if (!isoDate) return "-";
  const parts = isoDate.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return isoDate;
}

export function getWhatsAppUrl(phone: string | undefined, clientName: string): string | null {
  if (!phone) return null;
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  if (cleanPhone.length < 9) return null;

  // Add country code 51 if not present
  const fullPhone = cleanPhone.startsWith("51") ? cleanPhone : `51${cleanPhone}`;
  const firstName = clientName.split(" ")[0] || "estimad@";
  const message = encodeURIComponent(
    `¡Hola ${firstName}! Te saludamos cordialmente de SaS Vaikuntha. ¿Cómo podemos ayudarte el día de hoy?`
  );
  return `https://wa.me/${fullPhone}?text=${message}`;
}
