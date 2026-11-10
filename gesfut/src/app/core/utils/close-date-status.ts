export type CloseDateMatch = {
  id?: number;
  isFinished?: boolean;
  isBye?: boolean;
  homeTeam?: string;
  awayTeam?: string;
  dateTime?: string | null;
  canLoadResult?: boolean;
};

export function pendingCloseMatches(matches: CloseDateMatch[] | null | undefined): CloseDateMatch[] {
  return (matches ?? []).filter((m) => !m.isFinished && !m.isBye);
}

function formatWhen(dateTime: string): string {
  const raw = String(dateTime).trim();
  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
  if (m) return `${Number(m[3])}/${Number(m[2])} ${m[4]}:${m[5]}`;
  return raw;
}

export function closeDateStatus(opts: {
  isFinished?: boolean;
  numberOfMatchDay?: number;
  matches?: CloseDateMatch[] | null;
}): { text: string; canClose: boolean; firstPending?: CloseDateMatch } {
  const n = (opts.numberOfMatchDay ?? 0) + 1;
  if (opts.isFinished) {
    return { text: `La fecha ${n} est\u00e1 cerrada. Pod\u00e9s corregir resultados, pero no cargar partidos nuevos.`, canClose: false };
  }
  const pending = pendingCloseMatches(opts.matches);
  if (!pending.length) {
    return { text: 'Todos los partidos tienen resultado. Ya pod\u00e9s cerrar la fecha.', canClose: true };
  }
  const first = pending[0];
  const vs = `${first.homeTeam ?? ''} vs ${first.awayTeam ?? ''}`.trim();
  if (pending.length > 1) {
    return { text: `Para cerrar la fecha falta cargar el resultado de ${pending.length} partidos.`, canClose: false, firstPending: first };
  }
  if (first.canLoadResult === false && first.dateTime) {
    return { text: `Falta jugar: ${vs} (${formatWhen(String(first.dateTime))}). El resultado se carga desde ese d\u00eda.`, canClose: false, firstPending: first };
  }
  if (!first.dateTime) {
    return { text: `${vs} todav\u00eda no tiene horario ni resultado.`, canClose: false, firstPending: first };
  }
  return { text: `Falta cargar el resultado de ${vs}. Cargalo antes de cerrar.`, canClose: false, firstPending: first };
}
