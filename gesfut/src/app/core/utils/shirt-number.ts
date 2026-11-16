import { AbstractControl, ValidationErrors } from '@angular/forms';

export const SHIRT_MAX = 99;
export const SHIRT_RANGE_MESSAGE = 'El dorsal debe estar entre 0 y 99.';
export const SHIRT_REQUIRED_MESSAGE = 'Falta ingresar el número de camiseta.';

/** Entero 0-99, o null si falta o está fuera de rango. */
export function parseShirtNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'boolean') return null;
  const s = typeof value === 'number' && Number.isInteger(value) ? String(value) : String(value).trim();
  if (!s) return null;
  if (!/^-?\d+$/.test(s)) return null;
  const n = Number(s);
  if (!Number.isInteger(n) || n < 0 || n > SHIRT_MAX) return null;
  return n;
}

export function shirtNumberError(value: unknown): string {
  if (value === null || value === undefined || value === '' || (typeof value === 'string' && value.trim() === '')) {
    return SHIRT_REQUIRED_MESSAGE;
  }
  return parseShirtNumber(value) === null ? SHIRT_RANGE_MESSAGE : '';
}

export function shirtNumberValidator(control: AbstractControl): ValidationErrors | null {
  const message = shirtNumberError(control.value);
  if (!message) return null;
  return message === SHIRT_REQUIRED_MESSAGE ? { required: true } : { shirtRange: true };
}
