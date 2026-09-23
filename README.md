# Registro de Horas — Facturadores

Sistema web para que los facturadores de un hospital registren las horas trabajadas cada
día y el coordinador genere un reporte mensual consolidado, exportable a Excel.

## Stack

- **Backend**: NestJS 12 + TypeORM + PostgreSQL (JWT access + refresh)
- **Frontend**: React + Vite + Mantine (`@mantine/core`, `@mantine/dates`, `@mantine/modals`)
- **Exportación**: `exceljs` (Excel en el cliente)
- **Despliegue**: IIS (Windows Server) con `iisnode` + `@nestjs/serve-static`

## Roles

| Rol | Permisos |
|-----|----------|
| `facturador` | Ve y edita **solo sus** horas en el calendario |
| `administrador` | Gestiona usuarios y ve/exporta el reporte de todos (coordinador) |

## Estructura

```
hsa_registro_horas/
├── backend/            API NestJS (+ web.config para IIS)
├── frontend/           SPA React + Mantine
├── specs/001-registro-horas/   Especificación (Spec Kit)
└── .specify/           Constitución y flujo Spec Kit
```

## Requisitos

- Node.js ≥ 20 (probado con Node 25)
- PostgreSQL ≥ 14 (probado con PostgreSQL 18 / Postgres.app)

## Desarrollo local

### 1. Base de datos

```bash
createdb registro_horas
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env      # ajustar DATABASE_*, JWT_* si hace falta
npm run seed              # crea el administrador y un facturador de prueba
npm run start:dev         # http://localhost:3000/api
```

Credenciales iniciales (cámbialas tras el primer acceso):

| Correo | Contraseña | Rol |
|--------|------------|-----|
| `admin@hospital.local` | `admin123` | administrador |
| `facturador@hospital.local` | `facturador123` | facturador |

### 3. Frontend (otra terminal)

```bash
cd frontend
npm install
npm run dev               # http://localhost:5173 (proxy /api -> :3000)
```

## Migraciones

En desarrollo el esquema se crea con `DB_SYNCHRONIZE=true` (por defecto). Para producción
se usa el esquema gestionado por migraciones:

```bash
cd backend

# Generar una migración a partir de cambios en las entidades
npm run migration:generate -- src/migrations/<Nombre>

# Aplicar migraciones
npm run migration:run

# Revertir la última
npm run migration:revert
```

La migración inicial (`src/migrations/1758556800000-Init.ts`) crea las tablas
`usuario` y `registro_hora`, el enum `usuario_rol_enum` y el índice compuesto
`(usuario_id, fecha)`.

## Modelo de datos

- **`usuario`**: id (uuid), nombre, correo (único), password_hash (bcrypt), rol
  (`facturador`/`administrador`), activo, timestamps.
- **`registro_hora`**: un bloque de horas. id (uuid), usuario_id (FK), fecha (date),
  hora_inicio (time), hora_fin (time), horas_totales (numeric(4,2), calculado), observaciones,
  timestamps. Un día puede tener varios bloques (turno partido).

Reglas de negocio (en el backend):

- `horas_totales = (hora_fin - hora_inicio)` en horas decimales.
- No se permite `hora_fin <= hora_inicio`.
- No se permiten bloques solapados el mismo día (los bordes se tocan → permitido).

## API (prefijo `/api`)

- `POST /auth/login`, `POST /auth/refresh`, `POST /auth/change-password`
- `GET|POST|PATCH /users`, `POST /users/:id/reset-password` (administrador)
- `GET|POST /registros`, `GET|PATCH|DELETE /registros/:id`
- `GET /reportes/mensual?year=&month=`, `GET /reportes/detalle?year=&month=` (administrador)

Contrato completo en `specs/001-registro-horas/contracts/api.md`.

## Verificación

```bash
cd backend  && npm run lint && npm run typecheck && npm test && npm run build
cd frontend && npm run lint && npm run typecheck && npm run build
```

## Build de producción

```bash
cd backend  && npm run build       # -> dist/
cd frontend && npm run build       # -> frontend/dist/
```

## Despliegue en IIS (Windows Server)

### Requisitos en el servidor

1. Instalar **Node.js LTS**.
2. Instalar **iisnode** (https://github.com/Azure/iisnode) y el módulo **URL Rewrite**
   de IIS (https://www.iis.net/downloads/microsoft/url-rewrite).
3. Crear un **Application Pool** con `.NET CLR Version` = **No Managed Code**.

### Pasos

1. Crear la carpeta del sitio, por ejemplo `C:\inetpub\registro-horas`.
2. Copiar el backend:
   - `backend/package.json`, `backend/web.config`, `backend/dist/`, `backend/.env.example`.
   - `npm install --omit=dev` dentro de esa carpeta (genera `node_modules`).
3. Copiar el build del frontend en `frontend/dist/` (el backend lo sirve con
   `@nestjs/serve-static`):
   ```
   C:\inetpub\registro-horas\
   ├── web.config
   ├── package.json
   ├── node_modules\
   ├── dist\main.js
   ├── dist\migrations\
   └── frontend\dist\index.html
   ```
4. Crear `.env` en la raíz con la configuración de producción:

   ```env
   NODE_ENV=production
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_USER=...
   DATABASE_PASSWORD=...
   DATABASE_NAME=registro_horas
   DB_SYNCHRONIZE=false
   JWT_ACCESS_SECRET=<secreto-largo>
   JWT_ACCESS_TTL=15m
   JWT_REFRESH_SECRET=<secreto-largo>
   JWT_REFRESH_TTL=7d
   ```

5. En IIS: **Agregar sitio** apuntando a `C:\inetpub\registro-horas`, puerto 80/443,
   y asociarlo al Application Pool creado (No Managed Code).
6. Asegurar que la cuenta del pool tenga permiso de escritura sobre la carpeta del sitio
   (iisnode escribe logs) y sobre la carpeta de logs (`iisnode/`).
7. Aplicar migraciones una vez antes de arrancar (o dejar `migrationsRun` en producción):

   ```bash
   npm run migration:run
   npm run seed
   ```

   Con `DB_SYNCHRONIZE=false`, el backend ejecuta automáticamente las migraciones pendientes
   al arrancar (`migrationsRun: true`).

### Notas de iisnode

- `web.config` reescribe todo el tráfico a `dist/main.js`. El backend sirve la SPA en `/`
  y la API en `/api/*` (excluida del estático).
- iisnode asigna `process.env.PORT` a una named pipe; `main.ts` lo respeta (no fuerza
  puerto numérico), por lo que **no** debes fijar `PORT` en el `.env` de producción.

## Notas de seguridad

- Las contraseñas se guardan con bcrypt.
- Autorización en el backend (guards); el frontend solo oculta opciones.
- Cambia los secretos JWT y las contraseñas de seed antes de producción.
- No subas `.env` al repositorio (está en `.gitignore`).
