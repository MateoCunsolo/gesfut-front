/** Lista + buscador + detalle: el detalle siempre muestra un equipo VISIBLE en la lista filtrada.
 *  Si el seleccionado quedo fuera del filtro se pasa al primer resultado; sin resultados, ninguno (0). */
export function reconcileSelection(filtered: ReadonlyArray<{ id: number }>, selectedId: number): number {
  if (filtered.some(t => t.id === selectedId)) return selectedId;
  return filtered.length ? filtered[0].id : 0;
}

/** La accion (eliminar/deshabilitar) solo sigue si el equipo que confirma el servidor es el que muestra la pantalla. */
export function sameTeamName(shown: string | null | undefined, actual: string | null | undefined): boolean {
  const n = (v: string | null | undefined) => String(v ?? '').trim().toLowerCase();
  return !n(shown) || n(shown) === n(actual);
}
