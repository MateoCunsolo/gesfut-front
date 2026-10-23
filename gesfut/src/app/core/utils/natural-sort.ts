/** Plan 22/10 #12: orden natural de nombres con números ("Fecha 2" antes que "Fecha 10"), sin distinguir mayúsculas ni acentos. */
const collator = new Intl.Collator('es', { numeric: true, sensitivity: 'base' });
export function naturalCompare(a: string | null | undefined, b: string | null | undefined): number {
  return collator.compare(a ?? '', b ?? '');
}
