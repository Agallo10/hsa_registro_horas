# Tasks: Registro de Horas

## Fase 1 — Scaffolding
- [x] Crear `.specify/` (constitución, templates, workflow).
- [x] Crear `specs/001-registro-horas/` (spec, plan, research, data-model, contracts).
- [x] Crear estructura `backend/` y `frontend/`.

## Fase 2 — Backend
- [x] Config: `package.json`, `tsconfig`, `nest-cli`, `.env.example`, `main.ts`, `app.module.ts`, `data-source.ts`.
- [x] Entidades `usuario` + `registro_hora`; migración inicial; `seed.ts`.
- [x] `common/`: `role.enum`, `@Public`, `@Roles`, `@CurrentUser`, `JwtAuthGuard`, `RolesGuard`.
- [x] `auth/`: login, refresh, change-password, `jwt.strategy`.

## Fase 3 — Refactor a modelo supervisor + personas (v2)
- [x] `personas/`: entidad `Persona` + CRUD (nombre, documento único, correo opcional, activo).
- [x] `registros/`: `registro_hora.persona_id` + validación de solapamiento + **máx. 4 personas/día**.
- [x] `reportes/`: agregación por persona (resumen con documento/activo + detalle).
- [x] `users/`: reducir a cuenta del supervisor (quitar CRUD); `auth` usa `UsersService`.
- [x] Migración `IntroducePersona` + `seed.ts` (admin + personas demo).

## Fase 4 — Frontend
- [x] Config, tema, cliente axios (JWT + refresh), `AuthContext`, login.
- [x] `personas/`: lista como home, crear/editar/desactivar, navegar al calendario.
- [x] `calendario/`: calendario por persona (ruta `/persona/:id`) con badges por día.
- [x] `registro/`: modal de bloques (crear/editar/eliminar, validación) con `personaId`.
- [x] `reporte/`: selector mes/año + tabla por persona + export Excel (resumen y detalle).

## Fase 5 — Despliegue
- [x] Build producción backend y frontend.
- [x] `web.config` (iisnode) + `ServeStaticModule` (SPA fallback).
- [x] README con instalación y despliegue IIS.

## Fase 6 — Verificación
- [x] Backend: `lint` + `typecheck` + `test` + `build`.
- [x] Frontend: `lint` + `typecheck` + `build`.
- [x] Smoke test: login, personas CRUD, registros por persona, solapamiento 409, **máx. 4 personas/día 409**, reporte mensual.
