# Registro de Horas — Facturadores

Sistema web para que el supervisor de un hospital registre las horas trabajadas por cada
persona (facturador/a) y genere un reporte mensual consolidado, exportable a Excel.

## Stack

- **Backend**: NestJS 12 + TypeORM + PostgreSQL (JWT access + refresh)
- **Frontend**: React + Vite + Mantine (`@mantine/core`, `@mantine/dates`, `@mantine/modals`)
- **Exportación**: `exceljs` (Excel en el cliente)
- **Despliegue**: Docker + Docker Compose (nginx para el frontend, Node para el backend, PostgreSQL)

## Modelo de uso

- Un único usuario inicia sesión: el **supervisor** (`administrador`).
- El supervisor gestiona **personas** (facturadores) y, al seleccionar una, registra sus
  horas en un calendario mensual.
- Las personas **no inician sesión**; son entidades gestionadas (nombre, documento único,
  correo y área opcionales). Pueden desactivarse conservando su histórico.
- Un día puede tener como máximo **4 personas distintas** con horas registradas.
- El **reporte mensual** clasifica automáticamente las horas y se exporta a Excel en el
  formato "horas extras - recargos".

## Clasificación de horas (reporte)

| Día | Regla | Columnas |
|---|---|---|
| Domingo / festivo de Colombia | todo el bloque | Recargos festivos (diurno / nocturno) |
| Sábado | todo el bloque | Recargos ordinarios (diurno / nocturno) |
| Lunes a viernes | solo después de las 16:00 | Horas extraordinarias |
| Lunes a viernes | antes de las 16:00 | Excluido del reporte |

- Nocturno: 21:00–06:00 · Diurno: 06:00–21:00.
- Los festivos de Colombia se calculan automáticamente (fijos, Emiliani y Semana Santa).

## Estructura

```
hsa_registro_horas/
├── backend/            API NestJS (+ Dockerfile)
├── frontend/           SPA React + Mantine (+ Dockerfile, nginx)
├── docker-compose.yml  db + backend + frontend
├── specs/001-registro-horas/   Especificación (Spec Kit)
└── .specify/           Constitución y flujo Spec Kit
```

## Requisitos

- Node.js ≥ 20 (probado con Node 25) — solo para desarrollo
- PostgreSQL ≥ 14 (probado con PostgreSQL 18 / Postgres.app) — o Docker
- Docker + Docker Compose (para despliegue)

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
npm run seed              # crea el supervisor y personas de prueba
npm run start:dev         # http://localhost:3000/api
```

Credencial inicial (cámbiala tras el primer acceso):

| Correo | Contraseña | Rol |
|--------|------------|-----|
| `admin@hospital.local` | `admin123` | administrador (supervisor) |

### 3. Frontend (otra terminal)

```bash
cd frontend
npm install
cp .env.example .env      # opcional: VITE_PORT, VITE_BACKEND_URL
npm run dev               # http://localhost:5173 (proxy /api -> backend)
```

Variables de entorno del frontend en desarrollo (`frontend/.env`):

| Variable | Default | Descripción |
|---|---|---|
| `VITE_PORT` | `5173` | Puerto del servidor de desarrollo (Vite) |
| `VITE_BACKEND_URL` | `http://localhost:3000` | Destino del proxy `/api` |
| `VITE_API_URL` | (vacío) | URL base de la API si se quiere fijar en build |

> `frontend/.env` es **solo para desarrollo**. En Docker no se usa: la configuración del
> frontend viene de `docker-compose.yml` (`FRONTEND_PORT`, `BACKEND_URL`, `API_URL`) y se
> inyecta en runtime mediante `config.js`.

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

Las migraciones crean las tablas `usuario`, `persona` y `registro_hora`, el enum
`usuario_rol_enum` y el índice compuesto `(persona_id, fecha)`.

## Modelo de datos

- **`usuario`**: cuenta de login del supervisor. id (uuid), nombre, correo (único),
  password_hash (bcrypt), rol (`administrador`), activo, timestamps.
- **`persona`**: facturador/a (no inicia sesión). id (uuid), nombre, documento (único),
  correo (opcional), área (opcional), activo, timestamps.
- **`registro_hora`**: un bloque de horas. id (uuid), persona_id (FK), fecha (date),
  hora_inicio (time), hora_fin (time), horas_totales (numeric(4,2), calculado), observaciones,
  timestamps. Un día puede tener varios bloques (turno partido).

Reglas de negocio (en el backend):

- `horas_totales = (hora_fin - hora_inicio)` en horas decimales.
- No se permite `hora_fin <= hora_inicio`.
- No se permiten bloques solapados el mismo día para la misma persona.
- Máximo **4 personas distintas** con horas registradas en un mismo día.

## API (prefijo `/api`)

- `POST /auth/login`, `POST /auth/refresh`, `POST /auth/change-password`
- `GET|POST|PATCH /personas`, `GET /personas/:id`
- `GET|POST /registros`, `GET|PATCH|DELETE /registros/:id`
- `GET /reportes/mensual?year=&month=`, `GET /reportes/detalle?year=&month=`

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

## Despliegue con Docker

Arquitectura: **nginx** sirve la SPA y hace proxy de `/api` → **backend** (NestJS) →
**db** (PostgreSQL). Todo en una red interna de Compose; solo el frontend se publica al host.

### 1. Configuración

```bash
cp .env.example .env
# editar .env: contraseñas de PostgreSQL, secretos JWT y puertos
```

`.env` (raíz) controla los puertos y la conexión:

| Variable | Default | Descripción |
|---|---|---|
| `FRONTEND_PORT` | `81` | Puerto del frontend (nginx lo escucha y se publica al host) |
| `BACKEND_PORT` | `3000` | Puerto interno del backend (nginx enruta `/api` aquí) |
| `API_URL` | `/api` | URL que consume la SPA. `/api` usa el proxy de nginx |
| `POSTGRES_*` | `registro` | Credenciales de PostgreSQL |
| `JWT_*` | — | Secretos y TTL de los tokens |

### 2. Levantar

```bash
docker compose up -d --build
```

- Frontend: `http://localhost:${FRONTEND_PORT}` (por defecto `http://localhost:81`).
- El backend **no** se publica al host; nginx lo alcanza por `http://backend:${BACKEND_PORT}`.

### 3. Base de datos y usuario inicial

En producción `DB_SYNCHRONIZE=false`: el backend aplica las migraciones automáticamente al
arrancar. Para crear el supervisor inicial, ejecutar el seed una vez:

```bash
docker compose exec backend node dist/seed.js
```

Credencial inicial (cámbiala tras el primer acceso):

| Correo | Contraseña | Rol |
|--------|------------|-----|
| `admin@hospital.local` | `admin123` | administrador (supervisor) |

### 4. Cambiar puertos

- **Puerto del frontend**: cambia `FRONTEND_PORT` en `.env` y `docker compose up -d`.
- **Puerto del backend**: cambia `BACKEND_PORT` en `.env`; nginx ajusta el proxy
  (`BACKEND_URL`) automáticamente vía `http://backend:${BACKEND_PORT}`.

### 5. API en otro host (opcional)

Si el frontend debe llamar a una API externa en lugar de usar el proxy de nginx:

1. Define `API_URL=http://mi-host:3000/api` en `.env` (se inyecta en tiempo de ejecución
   mediante `config.js`).
2. Define `CORS_ORIGIN=https://mi-frontend` en el backend para permitir el origen.

### Comandos útiles

```bash
docker compose logs -f backend     # logs del API
docker compose exec backend node dist/seed.js   # seed inicial
docker compose down                # detener (conserva el volumen de datos)
docker compose down -v             # detener y borrar la base de datos
```

## Notas de seguridad

- Las contraseñas se guardan con bcrypt.
- Autorización en el backend (guards); el frontend solo oculta opciones.
- Cambia los secretos JWT y las contraseñas de seed antes de producción.
- No subas `.env` al repositorio (está en `.gitignore`).
