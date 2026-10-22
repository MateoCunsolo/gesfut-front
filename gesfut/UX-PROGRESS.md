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
