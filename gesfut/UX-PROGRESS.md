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
