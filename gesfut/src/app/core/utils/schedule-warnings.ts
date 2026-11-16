import { normalizeVenue, sameKickoff } from './can-load-result';

export type ScheduleMatchLike = {
  id?: number | null;
  dateTime?: string | null;
  description?: string | null;
  isBye?: boolean | null;
};

export type ScheduleDayLike = {
  numberOfMatchDay: number;
  isFinished?: boolean | null;
  isPlayOff?: boolean | null;
  matches?: ScheduleMatchLike[] | null;
};

export const VENUE_CLASH_MESSAGE = 'Ya hay otro partido a esa hora en esta cancha.';

export function previousDayOpenMessage(previousDisplayNumber: number): string {
  return 'La Fecha ' + previousDisplayNumber + ' todav\u00eda no est\u00e1 cerrada.';
}

/** Choque: misma fecha, misma hora y misma cancha en el mismo torneo, sin ventana de tolerancia. */
export function hasVenueClash(
  chosen: Date,
  venue: string | null | undefined,
  matches: ScheduleMatchLike[] | null | undefined,
  ignoreIds: Iterable<number> = [],
): boolean {
  const ignore = new Set(Array.from(ignoreIds));
  const venueKey = normalizeVenue(venue);
  for (const match of matches ?? []) {
    if (match.isBye) continue;
    if (match.id != null && ignore.has(match.id)) continue;
    if (normalizeVenue(match.description) !== venueKey) continue;
    if (sameKickoff(match.dateTime, chosen)) return true;
  }
  return false;
}

/** Si se programa la Fecha N y la N-1 no est\u00e1 cerrada, avisa con el n\u00famero real (1-based). */
export function previousDayStillOpen(days: ScheduleDayLike[] | null | undefined, currentNumberOfMatchDay: number): string | null {
  if (currentNumberOfMatchDay < 1) return null;
  const previous = (days ?? []).find((d) => d.numberOfMatchDay === currentNumberOfMatchDay - 1);
  if (!previous || previous.isFinished) return null;
  return previousDayOpenMessage(previous.numberOfMatchDay + 1);
}

export function collectScheduleWarnings(opts: {
  chosen: Date;
  venue?: string | null;
  allMatches: ScheduleMatchLike[];
  ignoreIds?: Iterable<number>;
  extraChosen?: { time: Date; venue?: string | null }[];
  days: ScheduleDayLike[];
  currentNumberOfMatchDay: number;
}): string[] {
  const messages: string[] = [];
  const ignore = opts.ignoreIds ?? [];
  const clash =
    hasVenueClash(opts.chosen, opts.venue, opts.allMatches, ignore) ||
    (opts.extraChosen ?? []).some((item) => hasVenueClash(item.time, item.venue, opts.allMatches, ignore));
  if (clash) messages.push(VENUE_CLASH_MESSAGE);
  const prev = previousDayStillOpen(opts.days, opts.currentNumberOfMatchDay);
  if (prev) messages.push(prev);
  return messages;
}
