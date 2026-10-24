import test from 'node:test';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import assert from 'node:assert/strict';
import { getLastTournament, setLastTournament, forgetLastTournament, rememberIfMine, sessionSnapshot } from '../src/app/core/utils/last-tournament';
import { showPreparingState } from '../src/app/core/utils/recap-state';
import { reconcileSelection, sameTeamName, matchesSearch } from '../src/app/core/utils/team-selection';
import { mvpCandidates } from '../src/app/core/utils/mvp';
import { httpErrorMessage } from '../src/app/core/utils/http-error';
import { parseDmyTime } from '../src/app/core/utils/date-input';
import { tournamentPublicLink, whatsappShareUrl } from '../src/app/core/utils/share-tournament';

function mem() { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => { m.set(k, v); }, removeItem: (k: string) => { m.delete(k); } }; }
/** Simula una pestaña: login guarda el email (minúsculas, como auth.service) y logout lo quita (como session.service). */
function tab() { return mem(); }
function login(s: ReturnType<typeof mem>, email: string) { s.setItem('email', email.trim().toLowerCase()); }
function logout(s: ReturnType<typeof mem>) { s.removeItem('email'); s.removeItem('name'); s.removeItem('lastName'); }

test('guardar -> logout -> login mismo email: sigue; otro email: no lo ve', () => {
  const local = mem(); const t = tab();
  login(t, 'Ana@X.com'); setLastTournament('code-ana', 'Liga', local, t);
  logout(t);
  assert.equal(getLastTournament(local, t), null, 'sin sesion no se muestra');
  assert.equal(local.getItem('lastTournament:ana@x.com'), 'code-ana', 'el logout no borra la clave');
  login(t, '  ANA@x.com '); assert.deepEqual(getLastTournament(local, t), { code: 'code-ana', name: '' });
  logout(t); login(t, 'beto@x.com'); assert.equal(getLastTournament(local, t), null, 'otro email no lo ve');
  setLastTournament('code-beto', '', local, t);
  logout(t); login(t, 'ana@x.com'); assert.equal(getLastTournament(local, t)?.code, 'code-ana');
});

test('solo se guarda el codigo; formato viejo {code,name} se migra a codigo', () => {
  const local = mem(); const t = tab(); login(t, 'a@x.com');
  setLastTournament('c1', 'Nombre secreto', local, t);
  assert.equal(local.getItem('lastTournament:a@x.com'), 'c1');
  local.setItem('lastTournament:a@x.com', JSON.stringify({ code: 'c2', name: 'n' }));
  assert.equal(getLastTournament(local, t)?.code, 'c2');
  assert.equal(local.getItem('lastTournament:a@x.com'), 'c2');
  local.setItem('lastTournament:a@x.com', '{no json');
  assert.equal(getLastTournament(local, t), null);
});

test('olvidar (torneo ajeno segun el servidor) borra solo la clave de ese email', () => {
  const local = mem(); const a = tab(); login(a, 'a@x.com'); const b = tab(); login(b, 'b@x.com');
  setLastTournament('ca', '', local, a); setLastTournament('cb', '', local, b);
  forgetLastTournament(local, a);
  assert.equal(getLastTournament(local, a), null);
  assert.equal(getLastTournament(local, b)?.code, 'cb');
});

test('sin email en la sesion no se guarda ni se muestra nada', () => {
  const local = mem(); const t = tab(); t.setItem('name', 'Ana'); t.setItem('lastName', 'Uno');
  setLastTournament('c', '', local, t);
  assert.equal(getLastTournament(local, t), null);
});

test('claves globales viejas: se borran sin adoptarse y no tocan la clave por email', () => {
  const local = mem(); const t = tab(); login(t, 'a@x.com');
  setLastTournament('mio', '', local, t);
  local.setItem('lastTournamentClicked', 'viejo'); local.setItem('lastTournamentClickedName', 'Liga vieja');
  assert.equal(getLastTournament(local, t)?.code, 'mio');
  assert.equal(local.getItem('lastTournamentClicked'), null);
  assert.equal(local.getItem('lastTournamentClickedName'), null);
  logout(t); login(t, 'nuevo@x.com');
  local.setItem('lastTournamentClicked', 'viejo');
  assert.equal(getLastTournament(local, t), null);
  assert.equal(local.getItem('lastTournamentClicked'), null);
});

test('httpErrorMessage muestra el mensaje del servidor (400 y 429) y si no, el generico', () => {
  assert.equal(httpErrorMessage({ status: 400, error: { error: 'El DNI 123 ya está en el equipo X' } }, 'gen'), 'El DNI 123 ya está en el equipo X');
  assert.equal(httpErrorMessage({ status: 429, error: { error: 'Demasiados intentos. Esperá unos minutos.' } }, 'gen'), 'Demasiados intentos. Esperá unos minutos.');
  assert.equal(httpErrorMessage({ status: 400, error: { message: 'm' } }, 'gen'), 'm');
  assert.equal(httpErrorMessage({ status: 500, error: null }, 'gen'), 'gen');
});

test('link de compartir usa el codigo', () => {
  assert.equal(tournamentPublicLink('abc-1', 'https://x.test'), 'https://x.test/abc-1');
});

test('fecha de playoffs dd/mm/aaaa', () => {
  assert.equal(parseDmyTime('05/11/2026', '20:30'), '2026-11-05T20:30:00');
  assert.equal(parseDmyTime('31/02/2026', '20:00'), null);
  assert.equal(parseDmyTime('11/05/26', '20:00'), null);
  assert.equal(parseDmyTime('05/11/2026', '25:00'), null);
});

test('WhatsApp: wa.me con texto y link publico codificados', () => {
  const u = whatsappShareUrl('abc-1', 'Liga & Copa', 'https://x.test');
  assert.ok(u.startsWith('https://wa.me/?text='));
  const text = decodeURIComponent(u.slice('https://wa.me/?text='.length));
  assert.ok(text.includes('Liga & Copa') && text.endsWith('https://x.test/abc-1'));
  assert.ok(!u.slice(20).includes('&'), 'texto codificado');
});

test('MVP de la fecha: candidatos = MVP cargados en los partidos (sin vacios ni repetidos)', () => {
  assert.deepEqual(mvpCandidates([{ mvpPlayer: 'Ana' }, { mvpPlayer: '' }, { mvpPlayer: null }, { mvpPlayer: ' Ana ' }, { mvpPlayer: 'Beto' }]), ['Ana', 'Beto']);
  assert.deepEqual(mvpCandidates([{ mvpPlayer: null }, {}]), [], 'sin MVP cargado no hay selector');
  assert.deepEqual(mvpCandidates(undefined), []);
});

/** Flujo real (cableado de los componentes): login escribe el email ANTES de avisar la sesion; abrir el torneo guarda;
 *  logout no borra; el dashboard lee con el mismo email. Se verifica el codigo fuente que lo arma. */
const src = (p: string) => readFileSync(new URL('../src/app/' + p, import.meta.url), 'utf8');
test('flujo real: login -> abrir torneo -> logout -> login -> dashboard', () => {
  const auth = src('core/services/manager/auth.service.ts');
  const iEmail = auth.indexOf("sessionStorage.setItem('email'"), iSession = auth.indexOf('this.sessionService.setUserSession(response)');
  assert.ok(iEmail > 0 && iSession > iEmail, 'el email se guarda antes de setUserSession');
  assert.match(auth, /setItem\('email', String\(credentials\.email \?\? ''\)\.trim\(\)\.toLowerCase\(\)\)/);
  const session = src('core/services/manager/session.service.ts');
  const clear = session.slice(session.indexOf('clearUserSession(): void'), session.indexOf('clearUserSession(): void') + 600);
  assert.ok(!/forgetLastTournament\(/.test(clear), 'el logout no borra el Retomar');
  assert.match(src('pages/admin-tournament-page/admin-tournament-page.component.ts'), /isMyTournament\(opened\)[\s\S]{0,120}rememberIfMine\(opened, !!mine/, 'abrir el torneo lo guarda solo si es mio');
  assert.match(src('admin/dashboard/dashboard.component.ts'), /getLastTournament\(\)/);
  // y con esos pasos, en el mismo navegador:
  const local = mem(); const t = mem();
  t.setItem('email', ' Ana@X.com '.trim().toLowerCase()); setLastTournament('abc', 'Liga', local, t); // login + abrir
  t.removeItem('email');                                                                              // logout
  t.setItem('email', 'ANA@x.com'.trim().toLowerCase());                                                 // login
  assert.equal(getLastTournament(local, t)?.code, 'abc');                                             // dashboard
});

test('cerrar fecha: pide datos frescos antes del dialogo y codifica el MVP en la URL', () => {
  const list = src('admin/match-day/list-match-days/list-match-days.component.ts');
  assert.match(list, /getTournamentFull\(code, true\)[\s\S]{0,200}closeMatchDayWithData/);
  assert.match(src('core/services/tournament/match-days.service.ts'), /playerMvp=\$\{encodeURIComponent\(/);
});

test('abrir el link de admin de otro organizador (o un archivado) no pisa mi Retomar', () => {
  const local = mem(); const t = mem(); t.setItem('email', 'ana@x.com');
  assert.equal(rememberIfMine('mio', true, true, local, t), true);
  assert.equal(rememberIfMine('ajeno', false, true, local, t), false);
  assert.equal(rememberIfMine('archivado', true, false, local, t), false);
  assert.equal(getLastTournament(local, t)?.code, 'mio');
  assert.equal(rememberIfMine('otro-mio', true, undefined, local, t), true);
  assert.equal(getLastTournament(local, t)?.code, 'otro-mio');
});


test('reabrir fecha: sin dialogo de MVP y botones bloqueados hasta refrescar', () => {
  const list = src('admin/match-day/list-match-days/list-match-days.component.ts');
  assert.match(list, /if \(result\.isConfirmed\) this\.sendClose\(false, ''\)/);
  assert.match(list, /getTournamentFull\(this\.tournament\.code, true\)\.subscribe\(\{\s*next: \(\) => \{[^}]*this\.closing = false/);
  const html = src('admin/match-day/list-match-days/list-match-days.component.html');
  assert.ok(!html.includes('[disabled]="closing"') && (html.match(/\[disabled\]="busy"/g) ?? []).length >= 5);
});

test('sin console.<metodo>() en la app (.ts y .html), ignorando comentarios y strings simples', () => {
  const root = decodeURIComponent(new URL('../src/app/', import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1');
  const strip = (code: string) => code
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/<!--[\s\S]*?-->/g, '')
    .replace(/(^|[^:\\])\/\/[^\n]*/g, '$1')
    .replace(/'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"/g, "''");
  const hits: string[] = [];
  const walk = (dir: string) => { for (const n of readdirSync(dir)) { const p = dir + '/' + n; if (statSync(p).isDirectory()) walk(p); else if ((p.endsWith('.ts') && !p.endsWith('.spec.ts')) || p.endsWith('.html')) { if (/\bconsole\s*\.\s*[A-Za-z_$][\w$]*\s*\(/.test(strip(readFileSync(p, 'utf8')))) hits.push(p); } } };
  walk(root);
  assert.deepEqual(hits, []);
  // el detector si ve los metodos menos comunes
  for (const m of ['trace', 'table', 'debug', 'dir', 'group']) assert.ok(/\bconsole\s*\.\s*[A-Za-z_$][\w$]*\s*\(/.test(strip('x(); console.' + m + '(a);')), m);
  assert.ok(!/\bconsole\s*\.\s*[A-Za-z_$][\w$]*\s*\(/.test(strip("// console.log(a)\nconst s = 'console.log(x)';")), 'ignora comentarios y strings');
});

test('toggleMatchDayStatus: chequea busy antes de confirmar', () => {
  const list = src('admin/match-day/list-match-days/list-match-days.component.ts');
  const i = list.indexOf('async toggleMatchDayStatus(status: boolean) {');
  assert.match(list.slice(i, i + 120), /if \(this\.busy\) return;/);
});

test('Retomar guarda con el email del inicio de la request', () => {
  const local = mem(); const t = mem(); t.setItem('email', 'ana@x.com');
  const who = sessionSnapshot(t);
  t.setItem('email', 'beto@x.com'); // cambio de sesion antes de la respuesta
  rememberIfMine('c-ana', true, true, local, who);
  assert.equal(local.getItem('lastTournament:ana@x.com'), 'c-ana');
  assert.equal(local.getItem('lastTournament:beto@x.com'), null);
  assert.match(src('pages/admin-tournament-page/admin-tournament-page.component.ts'), /const who = sessionSnapshot\(\);[\s\S]{0,200}rememberIfMine\(opened, !!mine, full\.isActive, undefined, who\)/);
  assert.ok(!src('pages/admin-tournament-page/admin-tournament-page.component.ts').includes('as any'));
});

test('Mis equipos: filtrar mantiene un solo equipo coherente (o ninguno)', () => {
  const all = [{ id: 1, name: 'AC Milan' }, { id: 2, name: 'QA Alfa' }, { id: 3, name: 'QA Bravo' }];
  const f = (q: string) => all.filter(t => t.name.toLowerCase().includes(q.toLowerCase()));
  assert.equal(reconcileSelection(f('QA Alfa'), 1), 2, 'AC Milan ya no esta visible: pasa al primer resultado');
  assert.equal(reconcileSelection(f('QA'), 3), 3, 'si sigue visible se mantiene');
  assert.equal(reconcileSelection(f('zzz'), 1), 0, 'sin resultados: ninguno');
  const names = src('admin/list-teams/names-teams.component.ts');
  assert.match(names, /reconcileSelection\(this\.teamsGlobalesInputFilter, this\.idSelected\)/);
  assert.match(names, /this\.colorSelected = this\.teamsGlobales\.find\(\(team\) => team\.id === id\)/);
  assert.match(src('admin/list-teams/names-teams.component.html'), /\[headerName\]="nameClicked"/);
  assert.match(src('admin/list-team-tournaments/list-teams-tournaments.component.ts'), /reconcileSelection\(/);
});

test('Eliminar equipo: la accion va al id del equipo seleccionado y se frena si la pantalla muestra otro', () => {
  assert.equal(sameTeamName('QA ALFA', 'QA Alfa'), true);
  for (const empty of ['', '   ', null, undefined]) assert.equal(sameTeamName(empty as any, 'AC Milan'), false, 'sin nombre visible se bloquea');
  assert.equal(sameTeamName('QA Alfa', 'AC Milan'), false);
  const players = src('admin/list-teams/components/players/players.component.ts');
  assert.match(players, /this\.teamRemoval\.remove\(id, this\.headerName\)/);
  assert.match(players, /if \(this\.removing\) return;/);
  const removal = src('core/services/tournament/team-removal.service.ts');
  const i = removal.indexOf('previewDeleteTeam(teamId)'), j = removal.indexOf('sameTeamName(shownName, preview.teamName)'), k = removal.indexOf('this.teams.deleteTeam(teamId)');
  assert.ok(i > 0 && j > i && k > j, 'preview -> chequeo de nombre -> borrar el mismo teamId');
  assert.match(src('admin/list-teams/components/players/players.component.html'), /\[disabled\]="removing"/);
});

test('campeon: no se muestra antes de finalizar o jugar la final; reabrir muestra progreso', () => {
  assert.match(src('shared/champions/champions.component.ts'), /if \(!t\.isFinished && !t\.championOfPlayoffsId\) return \[\];/);
  assert.match(src('admin/match-day/list-match-days/list-match-days.component.html'), /progressLabel \|\| 'Reabrir fecha'/);
  assert.match(src('core/services/alert.service.ts'), /showDenyButton: true,[\s\S]{0,120}cancelButtonText: 'Cancelar'/);
});

test('remove exige el nombre visible (sin default) y lo bloquea vacio; Equipos del torneo pasa el nombre y bloquea doble clic', () => {
  const removal = src('core/services/tournament/team-removal.service.ts');
  assert.match(removal, /async remove\(teamId: number, shownName: string\)/, 'sin valor por defecto: falla al compilar si falta');
  const i = removal.indexOf('async remove('), guard = removal.indexOf("if (!String(shownName ?? '').trim())", i), preview = removal.indexOf('previewDeleteTeam(teamId)', i);
  assert.ok(guard > i && guard < preview, 'con nombre vacio no se pide nada al servidor');
  const pt = src('admin/list-team-tournaments/players-tournament/players-tournament.component.ts');
  assert.match(pt, /teamRemoval\.remove\(this\.teamParticipant\.idTeam, this\.teamParticipant\.name\)/);
  assert.match(pt, /if \(this\.removing\) return;[\s\S]{0,200}finally \{ this\.removing = false; \}/);
  assert.match(src('admin/list-team-tournaments/players-tournament/players-tournament.component.html'), /\[disabled\]="removing"[\s\S]{0,120}Cargando/);
});

test('busqueda de equipos sin distinguir mayusculas ni espacios', () => {
  assert.equal(matchesSearch('qa alfa', 'QA'), true);
  assert.equal(matchesSearch('QA Alfa', '  qa al '), true);
  assert.equal(matchesSearch('AC Milan', 'qa'), false);
  assert.match(src('admin/list-team-tournaments/list-teams-tournaments.component.ts'), /matchesSearch\(team\.name, this\.inputText\)/);
});

test('Mis equipos: respuestas tardias de otro equipo se descartan', () => {
  const p = src('admin/list-teams/components/players/players.component.ts');
  assert.match(p, /if \(!this\.isCurrent\(seq\) \|\| idTeam !== this\.idTeam\) return;/);
  assert.match(p, /if \(!this\.isCurrent\(seq\) \|\| idParticipant !== this\.participantId\) return;/);
  assert.match(src('admin/list-teams/components/names-tournaments/names-tournaments.component.ts'), /if \(seq !== this\.loadSeq \|\| id !== this\.id\) return;/);
});

test('vista publica: "se esta preparando" nunca con torneo finalizado/campeon ni mientras carga', () => {
  const t = { code: 'ABC', isFinished: false, championOfLeagueId: null, championOfPlayoffsId: null };
  assert.equal(showPreparingState(false, t, 'ABC'), false, 'cargando: no flashea');
  assert.equal(showPreparingState(true, { code: 'INIT' } as any, 'ABC'), false, 'torneo aun no cargado (valor inicial)');
  assert.equal(showPreparingState(true, { ...t, isFinished: true }, 'ABC'), false);
  assert.equal(showPreparingState(true, { ...t, championOfLeagueId: 7 }, 'ABC'), false);
  assert.equal(showPreparingState(true, { ...t, championOfPlayoffsId: 7 }, 'ABC'), false);
  assert.equal(showPreparingState(true, t, 'ABC'), true, 'torneo nuevo sin fechas: si');
  const html = src('guest/recap/recap.component.html');
  assert.match(html, /@else if \(showPreparing\(\)\) \{ <div class="empty-state"><h3>El torneo/);
  assert.doesNotMatch(html, /\} @else \{ <div class="empty-state"><h3>El torneo/);
});

test('toasts de error con role=alert y aria-live (sin tocar estilos)', () => {
  const a = src('core/services/alert.service.ts');
  const err = a.slice(a.indexOf('errorAlert('), a.indexOf('infoAlertTop('));
  assert.match(err, /setAttribute\('role', 'alert'\)/);
  assert.match(err, /setAttribute\('aria-live', 'assertive'\)/);
});

test('Mis equipos: borrar la busqueda de golpe vuelve a mostrar equipo (no queda "No hay equipos con ese nombre.")', () => {
  const teams = [{ id: 3, name: 'QA Alfa' }, { id: 5, name: 'QA Beta' }];
  // escribir algo sin resultados limpia la seleccion
  let selected = reconcileSelection(teams.filter(t => matchesSearch(t.name, 'zzz')), 3);
  assert.equal(selected, 0);
  // borrar todo de una vez: lista completa y se vuelve a elegir un equipo visible
  selected = reconcileSelection(teams.filter(t => matchesSearch(t.name, '')), selected);
  assert.equal(selected, 3);
  const nt = src('admin/list-teams/names-teams.component.ts');
  assert.match(nt, /if \(next === 0\) this\.clearSelection\(\);\s*else if \(next !== this\.idSelected\) this\.showParticipants\(next\);/);
  // la busqueda es local (sin pedido al servidor) y las respuestas tardias del detalle se descartan
  assert.doesNotMatch(nt.slice(nt.indexOf('searchTeams('), nt.indexOf('onCodeTournament(')), /subscribe\(/);
  assert.match(src('admin/list-teams/components/players/players.component.ts'), /if \(!this\.isCurrent\(seq\) \|\| idTeam !== this\.idTeam\) return;/);
});

test('Retomar: nombre en paralelo con la verificacion, visible solo si es propio', () => {
  const d = src('admin/dashboard/dashboard.component.ts');
  const body = d.slice(d.indexOf('isMyTournament(code: string)'), d.indexOf('private forgetLastTournament'));
  assert.ok(body.indexOf('getTournamentShort(code)') < body.indexOf('isMyTournament(code).subscribe'), 'no encadenado');
  assert.match(src('admin/dashboard/dashboard.component.html'), /@if\(flagIsMyTournament\(\)\)/);
});
