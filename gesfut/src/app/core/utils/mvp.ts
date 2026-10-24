/** Regla del MVP de la fecha: se elige entre los MVP cargados en los resultados de cada partido de esa fecha.
 * Si ningun partido tiene MVP, no hay a quien elegir y la fecha se cierra sin MVP (con confirmacion). */
export function mvpCandidates(matches: ReadonlyArray<{ mvpPlayer?: string | null }> | null | undefined): string[] {
  const out: string[] = [];
  for (const m of matches ?? []) { const p = (m?.mvpPlayer ?? '').trim(); if (p && !out.includes(p)) out.push(p); }
  return out;
}
