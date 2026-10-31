/** Lista + buscador + detalle: el detalle siempre muestra un equipo VISIBLE en la lista filtrada.
 *  Si el seleccionado quedo fuera del filtro se pasa al primer resultado; sin resultados, ninguno (0). */
export function reconcileSelection(filtered: ReadonlyArray<{ id: number }>, selectedId: number): number {
  if (filtered.some(t => t.id === selectedId)) return selectedId;
  return filtered.length ? filtered[0].id : 0;
}

/** La accion (eliminar/deshabilitar) solo sigue si el equipo que confirma el servidor es el que muestra la pantalla. */
export function sameTeamName(shown: string | null | undefined, actual: string | null | undefined): boolean {
  const n = (v: string | null | undefined) => String(v ?? '').trim().toLowerCase();
  if (!n(shown)) return false; // sin nombre visible no se sabe sobre que equipo se actua: se bloquea
  return n(shown) === n(actual);
}

/** Posicion del equipo (por id) dentro de la lista que se muestra (filtrada); -1 si no esta. */
export function indexInShownList(shown: ReadonlyArray<{ idParticipant: number }>, idParticipant: number): number {
  return shown.findIndex(p => p.idParticipant === idParticipant);
}

/** Busqueda de equipos: sin distinguir mayusculas ni espacios de los extremos. */
export function matchesSearch(name: string | null | undefined, query: string | null | undefined): boolean {
  return String(name ?? '').toLowerCase().includes(String(query ?? '').trim().toLowerCase());
}
