# Data Model: Registro de Horas

## Entidades

### `usuario` (login del supervisor)
| columna | tipo | constraints |
|---|---|---|
| id | uuid | PK |
| nombre | varchar(120) | not null |
| correo | varchar(160) | unique, not null |
| password_hash | varchar(255) | not null |
| rol | enum `administrador` | default `administrador` |
| activo | boolean | default true |
| created_at / updated_at | timestamptz | |

### `persona` (facturador/a; no inicia sesión)
| columna | tipo | constraints |
|---|---|---|
| id | uuid | PK |
| nombre | varchar(120) | not null |
| documento | varchar(30) | unique, not null |
| correo | varchar(160) | null, unique |
| activo | boolean | default true |
| created_at / updated_at | timestamptz | |

### `registro_hora`
| columna | tipo | constraints |
|---|---|---|
| id | uuid | PK |
| persona_id | uuid | FK → `persona.id` ON DELETE CASCADE, index |
| fecha | date | not null |
| hora_inicio | time | not null |
| hora_fin | time | not null, CHECK `hora_fin > hora_inicio` |
| horas_totales | numeric(4,2) | not null (calculado) |
| observaciones | text | null |
| created_at / updated_at | timestamptz | |

Índice compuesto: `(persona_id, fecha)`.

## Relaciones

- `Persona` 1 — N `RegistroHora`.
- Un día puede tener N bloques de una misma persona (turno partido).

## Reglas de negocio

- `horas_totales = (hora_fin - hora_inicio)` en horas decimales.
- No se permite `hora_fin <= hora_inicio`.
- No se permiten bloques solapados para la misma persona y fecha.
- **Máximo 4 personas distintas** con horas en un mismo día (validado al crear).
- El cliente no envía `horas_totales`; se calcula y descarta en el backend.
