# API Contracts

Base URL: `/api`. Auth: `Authorization: Bearer <accessToken>` (excepto `@public`).

## Auth

### `POST /auth/login` (public)
Body: `{ correo: string, password: string }`
Respuesta: `{ accessToken, refreshToken, user: { id, nombre, correo, rol } }`

### `POST /auth/refresh` (public)
Body: `{ refreshToken: string }`
Respuesta: `{ accessToken, refreshToken }`

### `POST /auth/change-password`
Body: `{ currentPassword: string, newPassword: string }`

## Usuarios (solo `administrador`)

### `GET /users`
Respuesta: `UserDto[]` (id, nombre, correo, rol, activo)

### `POST /users`
Body: `{ nombre, correo, password, rol }` → `UserDto`

### `PATCH /users/:id`
Body parcial: `{ nombre?, correo?, activo?, rol? }` → `UserDto`

### `POST /users/:id/reset-password`
Body: `{ password }`

## Registros de horas

### `GET /registros?fechaDesde&fechaHasta`
- `facturador`: solo sus registros en el rango.
- `administrador`: puede pasar `usuarioId` opcional para filtrar.
Respuesta: `RegistroHoraDto[]`

### `POST /registros`
Body: `{ fecha: 'YYYY-MM-DD', horaInicio: 'HH:mm', horaFin: 'HH:mm', observaciones? }`
- Crea el bloque para el usuario autenticado (facturador) o para `usuarioId` (administrador).
Respuesta: `RegistroHoraDto` (incluye `horasTotales`).

### `PATCH /registros/:id`
Body parcial: `{ horaInicio?, horaFin?, observaciones? }`
- Solo el dueño (facturador) o un administrador.

### `DELETE /registros/:id`
- Solo el dueño o un administrador.

## Reportes (solo `administrador`)

### `GET /reportes/mensual?year=2026&month=9`
Respuesta: `{ year, month, filas: [{ usuarioId, nombre, correo, horasTotales, diasRegistrados }] }`

### `GET /reportes/detalle?year=2026&month=9`
Respuesta: `{ year, month, filas: [{ usuarioId, nombre, fecha, horaInicio, horaFin, horasTotales, observaciones }] }`
