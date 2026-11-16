import { AbstractControl, ValidationErrors } from '@angular/forms';

export const GOAL_MAX = 99;
export const GOAL_QUANTITY_MESSAGE = 'La cantidad debe ser un número entero entre 0 y 99.';

/** Entero 0-99, o null si falta o no es un entero en rango (rechaza 2.5, 1e2, booleanos). */
export function parseGoalQuantity(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'boolean') return null;
  const s = typeof value === 'number' && Number.isInteger(value) ? String(value) : String(value).trim();
  if (!/^-?\d+$/.test(s)) return null;
  const n = Number(s);
  if (!Number.isInteger(n) || n < 0 || n > GOAL_MAX) return null;
  return n;
}

/** Mensaje visible para una cantidad de goles que no es un entero 0-99. Vacio si es valida. */
export function goalQuantityError(value: unknown): string {
  return parseGoalQuantity(value) === null ? GOAL_QUANTITY_MESSAGE : '';
}

export function goalQuantityValidator(control: AbstractControl): ValidationErrors | null {
  return parseGoalQuantity(control.value) === null ? { goalQuantity: true } : null;
}

/** Hay algo que agregar al registro: goles > 0, alguna tarjeta o MVP. El 0 solo no suma. */
export function hasPlayerDraftStats(goals: unknown, yellow: unknown, red: unknown, mvp: unknown): boolean {
  const g = parseGoalQuantity(goals);
  const y = Number(yellow);
  const r = Number(red);
  return (g !== null && g > 0) || (Number.isFinite(y) && y > 0) || (Number.isFinite(r) && r > 0) || mvp === true;
}
