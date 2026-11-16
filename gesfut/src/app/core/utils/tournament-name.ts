/** El nombre no puede incluir < ni > (la validación anterior solo recortaba espacios de borde). */
export const TOURNAMENT_NAME_FORBIDDEN_MESSAGE = 'El nombre del torneo no puede contener los caracteres < o >.';

export function tournamentNameHasForbiddenChars(name: string | null | undefined): boolean {
  return /[<>]/.test(String(name ?? ''));
}
