# Implementation Plan: Registro de Horas

**Branch**: `001-registro-horas` | **Date**: 2026-09-22 | **Spec**: [spec.md](./spec.md)

## Summary

Sistema web para que los facturadores de un hospital registren sus horas diarias y el
coordinador genere un reporte mensual exportable. Backend NestJS + TypeORM + PostgreSQL,
frontend React + Mantine, autenticación JWT propia con roles `facturador`/`administrador`,
despliegue en IIS (iisnode + ServeStatic).

## Technical Context

**Language/Version**: TypeScript (Node ≥ 20)
**Primary Dependencies**: NestJS 12, TypeORM 1.x, passport-jwt, bcrypt, class-validator; React 19, Mantine ^8.3, axios, exceljs
**Storage**: PostgreSQL 18 (Postgres.app local; SQL Server no requerido)
**Testing**: Vitest (unit) + supertest (e2e)
**Target Platform**: Windows Server + IIS (desarrollo en macOS)
**Project Type**: web (backend API + SPA)
**Constraints**: sin cruce de medianoche; horas en decimal
**Scale/Scope**: decenas de facturadores; ~2 registros/día/usuario

## Constitution Check

- [x] I. Roles y autorización en backend (guards) — OK
- [x] II. Backend/frontend separados con contrato REST — OK
- [x] III. Simplicidad: un módulo por dominio — OK
- [x] IV. Tests de lógica (solapamiento, cálculo) — OK
- [x] V. Spec Kit + Context7 — OK

## Project Structure

```text
hsa_registro_horas/
├── .specify/                     # Spec Kit
├── specs/001-registro-horas/     # spec, plan, research, data-model, contracts
├── backend/                      # NestJS + TypeORM (ESM)
│   └── src/{auth,users,registros,reportes,common,data-source.ts,migrations}
└── frontend/                     # React + Vite + Mantine
    └── src/{api,auth,features/*,components,theme,types}
```

## Execution Order

1. Scaffolding + artefactos Spec Kit (hecho en esta fase).
2. Backend: config, entidades, migraciones, seed.
3. Backend: auth → users → registros → reportes.
4. Frontend: config, tema, api, auth → calendario → modal → reporte/export.
5. Build producción + IIS (`web.config`, `iisnode`) + README.
6. Verificación: lint + typecheck + build + tests.

## Complexity Tracking

Sin violaciones a la constitución.
