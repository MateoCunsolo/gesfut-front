/** Aviso de instalacion en iPhone/iPad: se puede cerrar y se recuerda en localStorage. */
export const PWA_HINT_DISMISSED_KEY = 'gesfut.pwaHintDismissed';
type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;
const defaultStorage = (): StorageLike | null => { try { return typeof localStorage !== 'undefined' ? localStorage : null; } catch { return null; } };
export function isPwaHintDismissed(storage: StorageLike | null = defaultStorage()): boolean {
  try { return storage?.getItem(PWA_HINT_DISMISSED_KEY) === '1'; } catch { return false; }
}
export function dismissPwaHint(storage: StorageLike | null = defaultStorage()): void {
  try { storage?.setItem(PWA_HINT_DISMISSED_KEY, '1'); } catch { /* sin localStorage: se oculta solo en esta sesion */ }
}
