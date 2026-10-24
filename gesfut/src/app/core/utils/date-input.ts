/** Fecha escrita como dd/mm/aaaa + hora hh:mm -> 'aaaa-mm-ddThh:mm:00' (hora local). null si no es valida. */
export function parseDmyTime(dmy: string, hm: string): string | null {
  const d = (dmy ?? '').trim().match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);
  const t = (hm ?? '').trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!d || !t) return null;
  const [day, month, year, h, m] = [+d[1], +d[2], +d[3], +t[1], +t[2]];
  const date = new Date(year, month - 1, day, h, m);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day || h > 23 || m > 59) return null;
  const p = (n: number) => String(n).padStart(2, '0');
  return year + '-' + p(month) + '-' + p(day) + 'T' + p(h) + ':' + p(m) + ':00';
}
