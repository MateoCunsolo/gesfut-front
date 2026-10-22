# Gesfut · Progreso de implementación UX/UI

Actualizado: 22/10/2026. Leer antes de continuar para no repetir la auditoría.

## Objetivo
Implementar por prioridad Auditoria-visual/Informe-UI-UX.md. Público móvil; administrador PC y carga de partidos en celular. Mantener datos históricos, Play, verde y controles táctiles. HTTPS/dominio pendientes.

## Bloque 1 terminado
- Nombre del torneo desde el código actual, cancelación de peticiones anteriores, error y reintento.
- Recuperación de contraseña siempre visible.
- Alta de jugador enfoca el encabezado sin abrir teclado, muestra equipo y roles Capitán/Arquero.
- Enlace compartido utiliza el origen actual.
- Cerrar el diálogo de destino ya no equivale a elegir torneo.
- Build correcto. 4 pruebas de contexto, 7 de editor y 7 PWA aprobadas.
- Verificado acceso, recarga de torneo y alta de jugador en móvil/escritorio sin guardar datos.
- Evidencias: UX-bloque1-jugador-mobile.jpg y UX-bloque1-jugador-desktop.jpg.

## Bloque 2 terminado: editor y salidas
- Implementado: carga adicional plegada al editar un registro existente; abierta en partidos vacíos.
- Implementado: marcador más compacto, aviso de cambios sin guardar.
- Implementado: Volver pide confirmación si descarta estadísticas o desempate; no abandona durante guardado.
- 10 pruebas del editor aprobadas, incluidas 3 nuevas de estos comportamientos.
- Build correcto y 7 pruebas PWA aprobadas. Verificado en 390/1440: registro visible al entrar, desplegar carga adicional, aviso de cambios, cancelar salida conserva el borrador y revertir el gol limpia el aviso. No se guardaron datos de prueba. Evidencias: UX-bloque2-editor-mobile.jpg y UX-bloque2-editor-desktop.jpg.
- Salidas protegidas: guard canDeactivate en el torneo delega al editor; cubre panel central, enlaces de cuenta y Atrás dentro de la aplicación. El menú de secciones ya se oculta mientras se edita. Recargar/cerrar usa beforeunload nativo (su presentación depende del navegador, no protege cierre forzado del sistema). Cerrar sesión borra credenciales únicamente si la navegación se completa. Confirmaciones concurrentes se agrupan.
- Verificación nueva: 12 pruebas del editor, 4 de contexto y 7 PWA aprobadas, build correcto. En navegador: panel consulta, Atrás consulta y cancelar restaura ruta/borrador, cerrar sesión consulta. Evidencia UX-proteccion-salida.jpg. No se publicaron resultados de prueba.
- Próximo paso: bloque 3, inicialización de torneos.

## Siguientes bloques
3. Inicialización: selección de equipos/programación con requisitos claros.
4. Densidad de partidos, torneos y planteles; formularios/errores uniformes.
5. Acceso, ayuda, premios; pulido a 320/390/1440. En login revisar espacios verticales excesivos entre acciones secundarias.
Superfinal anual sigue pendiente: administrador elige torneos y campeón de liga/playoffs; mismo campeón juega contra subcampeón elegido por administrador.

## Ubicaciones y recuperación
Frontend: C:/Users/matec/OneDrive/Escritorio/Proyectos/Gesfut/Gesfut/gesfut-front/gesfut
Backend: gesfut-be hermano. Base original preservada.
Respaldo bloque 1: C:/Users/matec/Documents/Codex/2026-10-13/cu/work/antes-ux-bloque1
Respaldo bloque 2: C:/Users/matec/Documents/Codex/2026-10-13/cu/work/antes-ux-bloque2
Hay cambios anteriores sin commit. NO restaurar desde HEAD ni descartar modificaciones.
App: http://127.0.0.1:4200. Backend 8080. Iniciador: outputs/Iniciar-Gesfut.ps1.
Después de compilar, usar Actualizar Gesfut si la PWA mantiene una versión vieja.
No guardar partidos, crear jugadores ni resetear la base para comprobar diseño.



## Bloque 3 · Vistas 22 y 23 ajustadas
- Preparar equipos informa mínimo de 4 y fecha opcional.
- Inicializar: equipos primero, programación opcional después, resumen visible y botón deshabilitado con motivo.
- Acciones rotuladas, búsqueda persistente al quitar, sin duplicados en Quitar todos. Quitar programación limpia estado compartido.
- Build correcto y 2 nuevas pruebas de regresión aprobadas. Demostración con componentes reales y API bloqueada: validado mínimo 0/4, contador, habilitación al llegar a 4, escritorio y móvil. No se generó calendario real.
- Respaldo: work/antes-ux-bloque3. Capturas UX-22-preparar-* y UX-23-inicializar-*.
- Seguimiento detallado: outputs/Seguimiento-33-vistas.md (33 filas). No confundir correcciones compartidas con vistas completamente terminadas.
- Próximo: bloque 4, densidad de torneos/partidos/planteles; luego cerrar pendientes parciales del seguimiento.

## Bloque rendimiento (22/10/2026)
- Causa de "No pudimos cargar el torneo": cualquier error (backend caído tras suspender la PC, código inválido, etc.) mostraba el mismo mensaje. Además, un JWT vencido/inválido hacía responder 500 a cualquier endpoint.
- Backend: JwtAuthenticationFilter ignora tokens vencidos/inválidos (sigue como anónimo; protegidos responden 403). `findDetailedByCode` con EntityGraph (usuario + participantes), `hibernate.default_batch_fetch_size=100` contra N+1, `@Transactional(readOnly = true)` en lecturas. Índice único `ux_tournaments_code` en `tournaments(code)`. open-in-view sigue activo (no se pudieron verificar todos los endpoints admin).
- Front: `isAuth()` revisa `exp` del JWT; sesión vencida o 401 => limpia y va a /auth/login. `validateToken` ya no manda headers como body. Caché por código del torneo completo (shareReplay, 60 s) invalidada ante cualquier escritura exitosa. La clasificación usa el torneo ya cargado y pide goleadores/amarillas/rojas con forkJoin. takeUntilDestroyed en suscripciones que quedaban vivas.
- Errores de carga: 400/404/409 => "No encontramos este torneo" sin Reintentar; red/5xx => "No pudimos cargar el torneo" con Reintentar y reintento automático 2 s / 4 s / 8 s.
- Tiempos (torneos grandes, 3 corridas): torneo completo 142-329 ms => 66-149 ms; fechas 92-185 ms => 46-88 ms; equipos 47-74 ms => 33-53 ms.
- register-image.jpg recomprimida (531 KB => 246 KB, mismas dimensiones). Sin cambios de colores ni estilos.
- Respaldo: work/antes-perf-bloque (archivos, dist, jar y dump de la base antes del índice).

## 2026-10-22 — Bloque 4 (densidad mobile) + bugs backend

- Backend: `@Transactional(readOnly=true)` en lecturas de equipos/torneos; `spring.jpa.open-in-view=false`; `GlobalExceptionHandler` con 404 (no existe) / 400 (entrada inválida o regla de negocio) / 405 y demás errores de Spring con su status / 500 logueado como ERROR; sin `printf` de debug en `TournamentController`; `@Transactional` explícito en `updateStatusMatchDay`; eliminado `GET /tournaments` (sin uso en el front; ahora responde 405).
- Front: `match-card` con modo `compact` (recap público, fechas admin, historial); fechas admin con barra fecha+estado, acción principal + "Más" (Horario/Cancha) y "Acciones de toda la fecha"; equipos del torneo con acciones arriba y filas compactas; buscador oculto en mobile con <= 8 equipos; historial con encabezado torneo/equipo y filtro Jugados/Próximos; tablas y filas más densas; reintento automático solo en 0/502/503/504.
- Verificado: `ng build` prod OK, tests front OK, `mvn package` 19/19 OK, status 200/400/404/405 y bearer vencido en GET público = 200.
- Suite GET admin (356 filas, 3 corridas): todo 200 salvo `GET /tournaments`=405 (eliminado) y `lastPlayed` sin fechas jugadas=404 (antes 400). Torneo completo 66-134 ms en caliente.
- E2E (Tag bloque4, torneo TEST nuevo) completo en 2,3 s: resultados, edición, fechas, cierre, playoffs y premios OK.
- Regresión de open-in-view=false corregida: `GET /teams/{id}/players-stats` daba 500 (LazyInitialization); se agregó `@Transactional(readOnly=true)` a `getAllPlayerStatsByTeam` y `getTeamTournamentsParticipations`. java.log sin ERROR ni LazyInit.
- Capturas antes/después en `outputs\bloque4-despues`.

## 2026-10-22 — Vistas P1 parciales (08, 17/33, 18/32, 24, 28)

- 08 Login: labels visibles, Mostrar/Ocultar contraseña (botón 44px, aria-pressed), recuperación siempre visible, acciones secundarias en una fila sin espacio sobrante.
- 17/33 Crear equipo: labels persistentes, jugadores numerados ("Jugador N") con quitar rotulado, roles en texto; desde torneo explica que vuelve a la preparación y que el equipo queda incorporado.
- 18/32 Agregar jugador: labels persistentes, contexto "equipo · torneo", al cancelar el foco vuelve a "Agregar jugador".
- 24 Inicio privado: título de fecha 22/24px y navegación en la misma fila; goleadores y destacado más densos.
- 28 Editor: en edición el registro va primero en celular; resumen (marcador, tarjetas, MVP) y estado de cambios antes de guardar.
- Regresión de bloque 4 corregida: match-card compacto no mostraba las acciones (dos ng-content en ramas @if).
- Verificado: ng build prod, tests front (incluye nuevo tools/test-p1-parciales.mjs, 5/5), capturas 390 con login de prueba.

## Auditoría 22/10 — correcciones (backup: Documents\Codex\2026-10-13\cu\work\antes-fix-auditoria)

| # | Arreglo | Verificación |
|---|---------|--------------|
| 1 (P0) | `POST /api/email/send` solo ADMIN (`@PreAuthorize`) | sin token y con MANAGER → 403 (work\pw\verify-be.mjs) |
| 3 (P1) | Registro no devuelve 500 si falla el SMTP (log WARN); `MailException` → 503 con mensaje | sign-up → 201; resend con SMTP caído → 503 |
| 4 (P1) | Links de verificación/reset usan `app.frontend.url` o el primer origen https de `FE_URL` (antes `localhost:4200`) | revisión de código; build + 19 tests backend OK |
| 5 (P1) | `changeStatusPlayerParticipant` usa `environment.apiUrl` | tools/test-auditoria-22-10.mjs |
| 6 (P1) | Crear torneo: guard `isloding` + botón deshabilitado | tools/test-auditoria-22-10.mjs |
| 7 (P1) | `change-status-team` con `@PreAuthorize`; mover fecha ajena ya daba 403 (el 500 no se reprodujo con body válido) | U2 → 403 |
| 8 (P1) | UUID inválido → 404 "No encontramos un torneo con ese código."; sin token → 401 | GET /tournaments/no-existe-xyz → 404 |
| 9 (P2) | Playoffs: "El ganador juega contra el ganador de A – B" (sin IDs) | test-auditoria |
| 10 (P2) | h1 en login, registro, recuperar, restablecer, verificar, cambiar contraseña y ayuda | audit.mjs: h1=1 en todas |
| 11 (P2) | Verificar: texto claro en vez de "Token inválido" | captura 12-verificar despues |
| 12 (P2) | `/admin/**` → "Página no encontrada" con link al panel | captura 99-404 despues |
| 19 (P2) | alt en ícono del clima | axe: 0 violaciones |
| 21 (P3) | Sin placeholder truncado en contraseña de registro | test-auditoria |
| 23 (P3) | Doble envío de resultado → 409 "El resultado ya fue cargado" | 409 + 201 (work\pw\p23.mjs); test ResultIntegrity actualizado |
| 24 (P3) | Footer "Gestión" | test-auditoria |
| extra | Se quitó el `printf` del token de reset y un `println` de equipo en logs | revisión de código |

### Auditoría 22/10 — segunda tanda (backup: work\antes-fix-4-items)

| # | Arreglo | Verificación |
|---|---------|--------------|
| 15 | Bundle inicial 659 → 434 kB: subset de Font Awesome (`tools/build-fa-subset.mjs` → `src/styles/fa-subset.css`), tema Material como bundle diferido `material-theme.css` cargado por el selector de horario, sweetalert2 con import dinámico en `alert.service` y fuera de `user.component`. Colores sin cambios | `ng build` sin warning de presupuesto; flows.mjs: timepicker carga el tema; test-auditoria |
| 22 | Tabla ≤480px: nombre en una línea con ellipsis, nombre completo en title/aria-label | captura 02-publico-tabla-320 final |
| 16 | Crear equipo: todos los errores de validación juntos | POST inválido → 400 con nombre, color y jugadores |
| 14 | Ayuda: patrón de página (volver, h1 izquierda, bajada), acordeón compacto con aria-expanded, solo tokens | faq.mjs: abre y aria-expanded=true; captura 21-ayuda final |
| 7 (seguridad) | `anyRequest().authenticated()`; públicos solo auth, lecturas GET de torneo/fechas/premios/equipos/partidos, OPTIONS y /error | verify-sec.mjs: 11 GET públicos 200 sin token; endpoints privados y /v3/api-docs 403; login, registro, reset OK; túnel 200 |
| 18 | "Free" ya estaba oculto en Mis equipos (filtro en admin.service); sigue funcionando para fechas libres | flows.mjs: Mis equipos sin "Free" |
| 20 | Landing: preview SVG con tokens y acceso público "¿Te compartieron un torneo?" (código o link) | flows.mjs: código inválido muestra error; link → página pública |
| extra | Login con email inexistente daba 500 → 404 "El email ingresado no existe." | verify-sec.mjs |
| 17 | Cerrado sin cambio: los 0-0 son reales (confirmado por Mateo) | — |
