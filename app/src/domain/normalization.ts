export function normalizeDocument(value: string): string {
  return value.replace(/\D/g, "");
}

export function normalizeWhatsapp(value: string): string {
  return value.replace(/\D/g, "");
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizeInternalCode(value: string): string {
  return value.trim();
}
