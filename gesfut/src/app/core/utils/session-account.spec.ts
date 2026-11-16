import { sha256HexUtf8 } from './sha256';
import {
  SESSION_ACCOUNT_KEY,
  SESSION_ACCOUNT_HASH_RE,
  adminReloadWouldBounce,
  adminRouteAllowed,
  applyAccountSwitchReload,
  readSessionAccount,
  sessionAccountHash,
  writeSessionAccount,
} from './session-account';

describe('session-account', () => {
  function memStorage(initial: Record<string, string> = {}) {
    const mem = new Map<string, string>(Object.entries(initial));
    return {
      mem,
      storage: {
        getItem: (k: string) => mem.get(k) ?? null,
        setItem: (k: string, v: string) => { mem.set(k, v); },
        removeItem: (k: string) => { mem.delete(k); },
      },
    };
  }

  it('tiene un fallback SHA-256 sincrono igual a crypto.subtle', async () => {
    expect(sha256HexUtf8('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    expect(sha256HexUtf8('qa.a@example.test')).toBe(await sessionAccountHash('qa.a@example.test'));
    expect(await sessionAccountHash('qa.a@example.test')).toMatch(SESSION_ACCOUNT_HASH_RE);
  });

  it('al leer la huella borra valores que no son un SHA-256 hex de 64 caracteres', () => {
    const { mem, storage } = memStorage({ [SESSION_ACCOUNT_KEY]: 'qa.viejo@example.test' });
    expect(readSessionAccount(storage)).toBe('');
    expect(mem.has(SESSION_ACCOUNT_KEY)).toBeFalse();
  });

  it('Recargar con /me 200 refresca identidad y huella sin guardar el role en la huella', async () => {
    const session = memStorage({ email: 'viejo@example.test', name: 'Viejo', lastName: 'Uno', role: 'MANAGER', token: 'cookie' });
    const local = memStorage();
    const me = { email: 'nuevo@example.test', name: 'Nueva', lastName: 'Dos', role: 'MANAGER' };
    const outcome = await applyAccountSwitchReload({
      fetchMe: async () => ({ status: 200, body: me }),
      session: session.storage,
      local: local.storage,
    });
    expect(outcome).toBe('updated');
    expect(session.mem.get('email')).toBe('nuevo@example.test');
    expect(session.mem.get('role')).toBe('MANAGER');
    const hash = await sessionAccountHash('nuevo@example.test');
    expect(readSessionAccount(local.storage)).toBe(hash);
    expect(hash.includes('MANAGER')).toBeFalse();
  });

  it('Recargar en /admin no rebota entre adminAuthGuard e isAuthGuard', async () => {
    const session = memStorage({ email: 'viejo@example.test', role: 'MANAGER', token: 'cookie' });
    const local = memStorage();
    await applyAccountSwitchReload({
      fetchMe: async () => ({ status: 200, body: { email: 'nuevo@example.test', name: 'Nueva', lastName: 'Dos', role: 'MANAGER' } }),
      session: session.storage,
      local: local.storage,
    });
    expect(adminRouteAllowed(true, session.mem.get('role') ?? '')).toBeTrue();
    expect(adminReloadWouldBounce(true, session.mem.get('role') ?? '')).toBeFalse();
    expect(adminReloadWouldBounce(true, '')).toBeTrue();
  });

  it('no escribe en la huella un valor que no sea hash de 64 hex', () => {
    const { mem, storage } = memStorage();
    writeSessionAccount(storage, 'texto-en-claro');
    expect(mem.has(SESSION_ACCOUNT_KEY)).toBeFalse();
  });
});
