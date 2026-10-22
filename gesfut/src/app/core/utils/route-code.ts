/** Loop 1 22/10: código del torneo abierto, tomado de la URL (/admin/tournaments/:code o /:code).
 * localStorage('lastTournamentClicked') queda solo como respaldo: puede faltar (link directo) o ser de otro torneo. */
export function currentTournamentCode(): string | null {
  const path = typeof location !== 'undefined' ? location.pathname : '';
  const match = path.match(/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/);
  return match?.[1] ?? (typeof localStorage !== 'undefined' ? localStorage.getItem('lastTournamentClicked') : null);
}
