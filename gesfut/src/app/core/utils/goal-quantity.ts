export const GOAL_MAX = 99;

/** Mensaje visible para una cantidad de goles fuera de 0-99 (o no entera). Vacio si es valida. */
export function goalQuantityError(value: unknown): string {
  if (value === null || value === undefined || value === '') return 'Indic\u00e1 los goles (0 a 99).';
  const n = Number(value);
  if (!Number.isFinite(n) || !Number.isInteger(n)) return 'Los goles tienen que ser un n\u00famero entero entre 0 y 99.';
  if (n < 0) return 'Los goles no pueden ser un n\u00famero negativo.';
  if (n > GOAL_MAX) return 'Los goles van de 0 a 99.';
  return '';
}
