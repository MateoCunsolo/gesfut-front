/** Interpreta dateTime de un partido (texto de formatMatchDate o ISO) como instante en hora de Argentina. */
const MONTHS: Record<string, number> = {
  ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5,
  jul: 6, ago: 7, sep: 8, sept: 8, set: 8, oct: 9, nov: 10, dic: 11,
};

/** ART es UTC-3 todo el anio: el instante UTC de una hora de pared es esa hora mas 3 h. */
function wallToArtDate(year: number, monthIndex: number, day: number, hour: number, minute: number): Date {
  return new Date(Date.UTC(year, monthIndex, day, hour + 3, minute, 0, 0));
}

export function parseMatchDateTime(dateTime: string | null | undefined): Date | null {
  if (!dateTime) return null;
  const raw = String(dateTime).trim();
  if (!raw) return null;
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
  if (iso) {
    return wallToArtDate(+iso[1], +iso[2] - 1, +iso[3], +iso[4], +iso[5]);
  }
  const disp = raw.match(/(\d{1,2})\s+de\s+([A-Za-z.]+)\s+(\d{4})\s*\|\s*(\d{1,2}):(\d{2})/i);
  if (disp) {
    const mon = disp[2].toLowerCase().replace(/\./g, "");
    const monthIndex = MONTHS[mon];
    if (monthIndex == null) return null;
    return wallToArtDate(+disp[3], monthIndex, +disp[1], +disp[4], +disp[5]);
  }
  return null;
}

/** Sin horario se puede cargar. Con horario, desde el instante de inicio inclusive (hora de Argentina). */
export function canLoadResultFromDateTime(dateTime: string | null | undefined, now: Date = new Date()): boolean {
  if (!dateTime || !String(dateTime).trim()) return true;
  const kickoff = parseMatchDateTime(dateTime);
  if (!kickoff) return true;
  return now.getTime() >= kickoff.getTime();
}

export function normalizeVenue(description: string | null | undefined): string {
  const text = String(description ?? "").trim().toLowerCase();
  return text.replace(/^cancha\s+/i, "").trim();
}

export function sameKickoff(a: string | null | undefined, b: Date | string | null | undefined): boolean {
  const da = typeof a === "string" || a == null ? parseMatchDateTime(a) : a;
  const db = b instanceof Date ? b : parseMatchDateTime(b);
  return !!(da && db && da.getTime() === db.getTime());
}
