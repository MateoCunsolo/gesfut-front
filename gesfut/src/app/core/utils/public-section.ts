/** Secciones de la vista publica: /<codigo>/<seccion>. /<codigo> a secas es Inicio. */
export const PUBLIC_SECTION_SLUGS: Record<string, string> = {
  recap: '',
  'list-teams-tournament': 'equipos',
  leaderboard: 'tabla',
  'match-days': 'partidos',
  prizes: 'premios',
  'lasts-matches': 'ultimos',
};

const PUBLIC_SLUG_TO_COMPONENT: Record<string, string> = {
  '': 'recap',
  inicio: 'recap',
  equipos: 'list-teams-tournament',
  tabla: 'leaderboard',
  partidos: 'match-days',
  premios: 'prizes',
  ultimos: 'lasts-matches',
};

export function publicSectionComponent(slug: string | null | undefined): string {
  const key = String(slug ?? '').trim().toLowerCase();
  return PUBLIC_SLUG_TO_COMPONENT[key] ?? 'recap';
}

export function publicTournamentCommands(code: string, component: string): string[] {
  const slug = PUBLIC_SECTION_SLUGS[component];
  if (!slug) return ['/', code];
  return ['/', code, slug];
}
