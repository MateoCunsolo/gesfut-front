// Regresiones de la auditoria 22/10. Ejecutar: node tools/test-auditoria-22-10.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const src=p=>readFileSync(new URL('../src/app/'+p,import.meta.url),'utf8');
test('#5 sin localhost:8080 fijo en servicios',()=>{ assert.doesNotMatch(src('core/services/tournament/tournament.service.ts'),/localhost:8080/); });
test('#6 crear torneo bloquea doble envio',()=>{ assert.match(src('admin/create-tournament/create-tournament.component.ts'),/if \(this\.isloding\) return;/); assert.match(src('admin/create-tournament/create-tournament.component.html'),/invalid \|\| isloding/); });
test('#10 h1 en acceso y ayuda',()=>{ for(const f of ['auth/login/login.component.html','auth/register/register.component.html','auth/register/verify-email/verify-email.component.ts','auth/reset-password/recive-email.component.ts','auth/reset-password/reset-password.component.ts','admin/faq/faq.component.html']){ const t=src(f); assert.match(t,/<h1 class="title">/,f); assert.doesNotMatch(t,/<h2 class="title">/,f);} });
test('#11 verificar no muestra "Token invalido"',()=>{ const t=src('auth/register/verify-email/verify-email.component.ts'); assert.match(t,/\/token\/i\.test\(reason\) \? '' : reason/); assert.match(t,/te mandamos uno nuevo/); });
test('#21 registro sin placeholder truncado en contrasena',()=>{ assert.doesNotMatch(src('auth/register/register.component.html'),/nimo 8 caracteres"/); });
test('#9 playoffs sin IDs internos',()=>{ assert.doesNotMatch(src('admin/match-day/list-match-days/list-match-days.component.html'),/\{\{match\.id\}\}/); });
test('#12 admin ** muestra pagina no encontrada',()=>{ assert.match(src('admin/admin.routes.ts'),/NotFoundComponent/); });
test('#19/#24 alt del clima y tilde del footer',()=>{ assert.match(src('guest/recap/weather-card/weather-card.component.ts'),/\[alt\]=/); assert.match(src('shared/footer/footer.component.html'),/Gestión de torneos/); });

test('#15 bundle: subset de Font Awesome, tema Material diferido y sweetalert2 lazy',()=>{ const a=readFileSync(new URL('../angular.json',import.meta.url),'utf8'); assert.match(a,/src\/styles\/fa-subset\.css/); assert.doesNotMatch(a,/all\.min\.css/); assert.match(a,/"bundleName": "material-theme", "inject": false/); assert.match(src('core/services/alert.service.ts'),/import\('sweetalert2'\)/); assert.doesNotMatch(src('shared/user/user.component.ts'),/from 'sweetalert2'/); });
test('#22 tabla: ellipsis con nombre completo accesible',()=>{ assert.match(src('admin/leaderboard/leaderboard.component.html'),/\[title\]="team\.name"/); assert.match(src('admin/leaderboard/leaderboard.component.scss'),/text-overflow:ellipsis/); });
test('#14 ayuda: aria-expanded, h1 a la izquierda y solo tokens',()=>{ assert.match(src('admin/faq/faq.component.html'),/aria-expanded/); const s=src('admin/faq/faq.component.scss'); assert.doesNotMatch(s,/#[0-9a-f]{3,6}\b|white/i); });
test('#20 landing: acceso por codigo y preview SVG con tokens',()=>{ assert.match(src('guest/landing/landing.component.html'),/id="tournament-code"/); assert.match(src('guest/landing/landing.component.ts'),/viewTournament/); assert.doesNotMatch(src('guest/landing/landing.component.scss'),/#[0-9a-f]{3,6}\b/i); });
