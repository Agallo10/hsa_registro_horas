# Data Model: Registro de Horas

## Entidades

### `usuario`
| columna | tipo | constraints |
|---|---|---|
| id | uuid | PK, `gen_random_uuid()` |
| nombre | varchar(120) | not null |
| correo | varchar(160) | unique, not null |
| password_hash | varchar(255) | not null |
| rol | enum `facturador`, `administrador` | default `facturador` |
| activo | boolean | default true |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

### `registro_hora`
| columna | tipo | constraints |
|---|---|---|
| id | uuid | PK |
| usuario_id | uuid | FK → `usuario.id` ON DELETE CASCADE, index |
| fecha | date | not null |
| hora_inicio | time | not null |
| hora_fin | time | not null, CHECK `hora_fin > hora_inicio` |
| horas_totales | numeric(4,2) | not null (calculado en backend) |
| observaciones | text | null |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

Índice compuesto: `(usuario_id, fecha)` para lecturas del calendario y validación de solapamiento.

## Relaciones

- `Usuario` 1 — N `RegistroHora` (un facturador, muchos bloques).
- Un día (fecha) puede tener N `RegistroHora` para el mismo usuario (turno partido).

## Reglas de negocio

- `horas_totales = (hora_fin - hora_inicio)` en horas decimales, redondeado a 2 decimales.
- No se permite `hora_fin <= hora_inicio`.
- No se permiten bloques solapados para el mismo usuario y fecha:
  solapamiento si `inicioA < finB AND inicioB < finA` (los bordes se tocan → permitido).
- El cliente no envía `horas_totales`; el backend lo calcula y descarta cualquier valor recibido.
