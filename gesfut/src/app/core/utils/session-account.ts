export const SESSION_ACCOUNT_KEY = 'gesfut.sessionAccount';

export type SessionAccount = {
  email?: string | null;
  name?: string | null;
  lastName?: string | null;
};

export function sessionAccountFingerprint(user: SessionAccount | null | undefined): string {
  if (!user) return '';
  const email = String(user.email ?? '').trim().toLowerCase();
  const name = String(user.name ?? '').trim();
  const lastName = String(user.lastName ?? '').trim();
  if (!email && !name && !lastName) return '';
  return email + '\n' + name + '\n' + lastName;
}

export function readSessionAccount(storage: Pick<Storage, 'getItem'> | null | undefined): string {
  if (!storage) return '';
  try { return storage.getItem(SESSION_ACCOUNT_KEY) ?? ''; } catch { return ''; }
}

export function writeSessionAccount(storage: Pick<Storage, 'setItem' | 'removeItem'> | null | undefined, fingerprint: string): void {
  if (!storage) return;
  try {
    if (!fingerprint) storage.removeItem(SESSION_ACCOUNT_KEY);
    else storage.setItem(SESSION_ACCOUNT_KEY, fingerprint);
  } catch { /* sin storage */ }
}

/** True solo si hay una cuenta distinta en el storage compartido (otra pestaña inicio sesion). */
export function sessionAccountChanged(uiFingerprint: string, sharedFingerprint: string): boolean {
  return !!uiFingerprint && !!sharedFingerprint && uiFingerprint !== sharedFingerprint;
}

/** Reconstruye email/nombre desde la huella compartida (para Recargar). */
export function parseSessionAccount(fingerprint: string): SessionAccount | null {
  if (!fingerprint) return null;
  const parts = fingerprint.split('\n');
  if (parts.length < 3) return null;
  return { email: parts[0], name: parts[1], lastName: parts.slice(2).join('\n') };
}
