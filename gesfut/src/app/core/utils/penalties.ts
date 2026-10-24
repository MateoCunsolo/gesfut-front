/** Revisión crítica #9: texto de la tanda de penales, o null si no hubo. */
export function penaltiesLabel(match: { penaltiesHome?: number | null; penaltiesAway?: number | null } | null | undefined): string | null {
  if (!match || match.penaltiesHome == null || match.penaltiesAway == null) return null;
  return `Definido por penales (${match.penaltiesHome}-${match.penaltiesAway})`;
}
