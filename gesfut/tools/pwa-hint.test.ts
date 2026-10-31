import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PWA_HINT_DISMISSED_KEY, dismissPwaHint, isPwaHintDismissed } from '../src/app/shared/pwa-status/pwa-hint';
const mem = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => { m.set(k, v); }, m }; };
test('cerrar guarda la clave y despues queda oculto', () => {
  const s = mem(); assert.equal(isPwaHintDismissed(s), false);
  dismissPwaHint(s); assert.equal(PWA_HINT_DISMISSED_KEY, 'gesfut.pwaHintDismissed'); assert.equal(s.m.get(PWA_HINT_DISMISSED_KEY), '1'); assert.equal(isPwaHintDismissed(s), true);
});
test('localStorage no disponible no rompe', () => {
  const bad = { getItem: () => { throw new Error('x'); }, setItem: () => { throw new Error('x'); } };
  assert.equal(isPwaHintDismissed(bad), false); assert.doesNotThrow(() => dismissPwaHint(bad)); assert.equal(isPwaHintDismissed(null), false);
});
test('template: boton Cerrar aviso y no se renderiza con la clave', () => {
  const c = readFileSync(new URL('../src/app/shared/pwa-status/pwa-status.component.ts', import.meta.url), 'utf8');
  assert.match(c, /@if \(showIosHint\(\)\) \{ <p>Para instalar Gesfut en iPhone[^]*?<button type="button" aria-label="Cerrar aviso" \(click\)="closeIosHint\(\)">&times;<\/button> \}/);
  assert.match(c, /showIosHint\(\): boolean \{ return this\.pwa\.iosInstallHelp\(\) && !this\.iosHintDismissed\(\); \}/);
  assert.match(c, /signal\(isPwaHintDismissed\(\)\)/);
  assert.doesNotMatch(c, /@if \(pwa\.iosInstallHelp\(\)\)/);
});
