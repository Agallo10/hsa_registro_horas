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
- [x] `users/`: CRUD administrador + reset-password.
- [x] `registros/`: CRUD + validación de solapamiento + cálculo de horas.
- [x] `reportes/`: agregación mensual + detalle.

## Fase 3 — Frontend
- [x] Config: `package.json`, `vite.config`, `theme.ts`, `main.tsx`, `App.tsx`.
- [x] `api/`: cliente axios + interceptores JWT + endpoints.
- [x] `auth/`: `AuthContext`, `LoginView`, `ProtectedRoute`.
- [x] `calendario/`: vista mensual con badges por día.
- [x] `registro/`: modal de bloques (crear/editar/eliminar, validación).
- [x] `reporte/`: selector mes/año + tabla + export Excel.
- [x] `usuarios/`: gestión de usuarios (admin).

## Fase 4 — Despliegue
- [x] Build producción backend y frontend.
- [x] `web.config` (iisnode) + `ServeStaticModule` (SPA fallback).
- [x] README con instalación y despliegue IIS.

## Fase 5 — Verificación
- [x] `npm install` en backend y frontend.
- [x] Backend: `lint` + `typecheck` + `test` + `build`.
- [x] Frontend: `lint` + `typecheck` + `build`.
- [x] Smoke test end-to-end contra PostgreSQL (login, registros, solapamiento 409, reportes, static serving).
