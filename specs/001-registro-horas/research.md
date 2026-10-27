# Research Notes: Registro de Horas

Resultados de consultar documentación actualizada vía Context7 (2026-09-22).

## Mantine (versión elegida: ^8.3)

- **v9.0.0** introduce el paquete `@mantine/schedule` (`MonthView`, `DayView`, `WeekView`,
  `YearView`), que reemplaza el `Calendar` de propósito general. Para este proyecto se fija
  **Mantine ^8.3** para mantener `Calendar` en `@mantine/dates` (requisito explícito).
- `Calendar` expone `onDayClick?: (date: DateStringValue, event) => void`, con `date` en formato
  `YYYY-MM-DD`, y permite render personalizado por día (badges de horas).
- `TimeInput` pertenece a `@mantine/dates` (no a `@mantine/core`).
- `@mantine/modals`: usar `ModalsProvider` + context modals. Apertura con `openContextModal`,
  cierre con `closeModal`, y `openConfirmModal` para confirmaciones de borrado.

## TypeORM (usado en intranet como ^1.1.1)

- Migraciones con `DataSource` en `src/data-source.ts`.
- Generar: `typeorm migration:generate -d src/data-source.ts <name>`.
- Ejecutar: `typeorm migration:run -d src/data-source.ts`.
- En proyectos ESM se usa `typeorm-ts-node-esm` (o paths `.js`) para la CLI.
- Producción: `DB_SYNCHRONIZE=false` y esquema gestionado por migraciones.

## NestJS 12 (referencia: proyecto intranet)

- `app.setGlobalPrefix('api')`, `ValidationPipe({ whitelist: true, transform: true })`.
- Guards globales vía `APP_GUARD`: `JwtAuthGuard` (global) + `RolesGuard`.
- Decorators `@Public()` y `@Roles(...)`; `passport-jwt` para la estrategia.
- JWT access + refresh firmados con secretos distintos y TTL configurables.

## Despliegue con Docker

- Tres servicios: `db` (PostgreSQL), `backend` (NestJS en Node) y `frontend` (nginx + SPA).
- nginx sirve la SPA y hace proxy de `/api` → `http://backend:${BACKEND_PORT}`, evitando CORS.
- El frontend recibe configuración en tiempo de ejecución (`config.js`) con `API_URL`.
- Puertos configurables por `.env`: `FRONTEND_PORT` (nginx) y `BACKEND_PORT` (API).
