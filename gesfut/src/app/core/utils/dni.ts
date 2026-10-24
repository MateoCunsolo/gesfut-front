/** DNI opcional: '' o null = sin DNI; si no, 7 u 8 dígitos (se aceptan puntos). */
export function normalizeDni(value: string | null | undefined): string | null {
  const digits = (value ?? '').replace(/\D/g, '');
  return digits.length ? digits : null;
}
export function isValidDni(value: string | null | undefined): boolean {
  const d = normalizeDni(value);
  return d === null || (d.length >= 7 && d.length <= 8);
}
