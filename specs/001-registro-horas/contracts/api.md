# API Contracts

Base URL: `/api`. Auth: `Authorization: Bearer <accessToken>` (excepto `@public`).
Único rol que inicia sesión: `administrador`. Todos los endpoints de negocio requieren
sesión autenticada.

## Auth

### `POST /auth/login` (public)
Body: `{ correo, password }` → `{ accessToken, refreshToken, user }`

### `POST /auth/refresh` (public)
Body: `{ refreshToken }` → `{ accessToken, refreshToken }`

### `POST /auth/change-password`
Body: `{ currentPassword, newPassword }`

## Personas

### `GET /personas`
Respuesta: `PersonaDto[]` (id, nombre, documento, correo, activo)

### `GET /personas/:id`
Respuesta: `PersonaDto`

### `POST /personas`
Body: `{ nombre, documento, correo? }` → `PersonaDto`

### `PATCH /personas/:id`
Body parcial: `{ nombre?, documento?, correo?, activo? }` → `PersonaDto`

## Registros de horas

### `GET /registros?personaId&fechaDesde&fechaHasta`
Respuesta: `RegistroHoraDto[]` (id, personaId, fecha, horaInicio, horaFin, horasTotales, observaciones)

### `POST /registros`
Body: `{ personaId, fecha: 'YYYY-MM-DD', horaInicio: 'HH:mm', horaFin: 'HH:mm', observaciones? }`
- Valida solapamiento y máximo 4 personas distintas por día.
Respuesta: `RegistroHoraDto`

### `PATCH /registros/:id`
Body parcial: `{ horaInicio?, horaFin?, observaciones? }`

### `DELETE /registros/:id`

## Reportes

### `GET /reportes/mensual?year=&month=`
Respuesta: `{ year, month, filas: [{ personaId, nombre, documento, correo, activo, horasTotales, diasRegistrados }] }`

### `GET /reportes/detalle?year=&month=`
Respuesta: `{ year, month, filas: [{ personaId, nombre, documento, fecha, horaInicio, horaFin, horasTotales, observaciones }] }`
