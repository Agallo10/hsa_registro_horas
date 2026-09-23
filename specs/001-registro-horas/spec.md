# Feature Specification: Registro de Horas de Facturadores

**Feature Branch**: `001-registro-horas`

**Created**: 2026-09-22

**Status**: Approved

**Input**: Sistema de registro de horas para facturadores de un hospital. Cada facturador
marca las horas trabajadas por día; al final de mes se genera un reporte consolidado.

## User Scenarios & Testing

### User Story 1 - Login y acceso por roles (Priority: P1)

Un facturador o administrador inicia sesión con su correo y contraseña y es redirigido
según su rol: el facturador a su calendario personal; el administrador puede además acceder
al reporte y a la gestión de usuarios.

**Why this priority**: Sin autenticación no existe aislamiento de datos ni se puede desplegar.

**Independent Test**: Crear un usuario `facturador` y uno `administrador` vía seed, hacer login
con ambos y verificar que cada uno ve solo lo que le corresponde.

**Acceptance Scenarios**:
1. **Given** credenciales válidas, **When** el usuario envía el formulario, **Then** recibe tokens y entra a su vista.
2. **Given** credenciales inválidas, **When** envía el formulario, **Then** recibe un error 401 sin revelar qué campo falló.
3. **Given** un facturador autenticado, **When** intenta acceder a `/reporte` o `/usuarios`, **Then** se le niega (403).

### User Story 2 - Calendario mensual con indicadores (Priority: P1)

El facturador ve un calendario del mes actual. Los días con horas registradas muestran un
indicador (total de horas diarias). Al hacer clic en un día se abre el modal de registro.

**Why this priority**: Es la pantalla principal de uso diario; determina la velocidad de marcado.

**Independent Test**: Con registros previos cargados para un usuario, verificar que los días
correspondientes muestran el total correcto.

**Acceptance Scenarios**:
1. **Given** un facturador autenticado, **When** abre la app, **Then** ve el calendario del mes actual.
2. **Given** un día con N bloques, **When** se renderiza, **Then** el día muestra la suma de horas (ej. `7.50`).
3. **Given** un día sin registros, **When** se renderiza, **Then** no muestra indicador.

### User Story 3 - Registro, edición y borrado de bloques de horas (Priority: P1)

Al hacer clic en un día, el modal permite agregar uno o varios bloques (hora inicio/hora fin),
con observación opcional. Valida que no haya solapamiento entre bloques del mismo día.
Permite editar y eliminar registros existentes.

**Why this priority**: Es la funcionalidad núcleo del sistema.

**Independent Test**: Crear un bloque, editarlo, agregar un segundo bloque solapado (debe fallar)
y eliminar un bloque; verificar persistencia.

**Acceptance Scenarios**:
1. **Given** un bloque 08:00–12:00, **When** agrego 13:00–17:00, **Then** ambos se guardan (turno partido).
2. **Given** un bloque 08:00–12:00, **When** agrego 11:00–14:00, **Then** se rechaza con error de solapamiento.
3. **Given** un bloque con `hora_fin <= hora_inicio`, **When** se guarda, **Then** se rechaza.
4. **Given** un bloque existente, **When** lo edito o elimino, **Then** se actualiza/elimina.

### User Story 4 - Reporte mensual y exportación (Priority: P2)

El administrador selecciona mes/año y ve una tabla con cada facturador y su total de horas.
Puede exportar a Excel un resumen (una fila por facturador) o un detalle día por día.

**Why this priority**: Es el entregable de cierre de mes; puede construirse tras el núcleo.

**Independent Test**: Con datos de varios usuarios en un mes, verificar totales y generar el .xlsx.

**Acceptance Scenarios**:
1. **Given** un administrador, **When** selecciona mes/año, **Then** ve el total por facturador.
2. **Given** un administrador, **When** exporta resumen, **Then** descarga un .xlsx con una fila por facturador.
3. **Given** un administrador, **When** exporta detalle, **Then** descarga un .xlsx con una fila por bloque (fecha, inicio, fin, horas).

### User Story 5 - Gestión de usuarios (Priority: P2)

El administrador crea facturadores, los activa/desactiva y resetea contraseñas.

**Why this priority**: Necesario para operar el sistema en producción.

**Independent Test**: Crear un facturador, iniciar sesión con él, desactivarlo y verificar que ya no puede entrar.

**Acceptance Scenarios**:
1. **Given** un administrador, **When** crea un usuario, **Then** puede iniciar sesión.
2. **Given** un usuario desactivado, **When** intenta login, **Then** se le niega.

### Edge Cases

- Bloque que cruza la medianoche: NO permitido (se asume jornada dentro del mismo día).
- Día sin bloques: el modal muestra lista vacía y permite crear el primero.
- Solapamiento exacto (fin == inicio de otro bloque): permitido.
- Múltiples bloques idénticos: rechazado por solapamiento.
- Usuario desactivado con token vigente: se valida `activo` en cada request vía JWT strategy.

## Requirements

### Functional Requirements

- **FR-001**: El sistema permite login por correo/contraseña con JWT (access + refresh).
- **FR-002**: El sistema restringe por rol: `facturador` solo accede a sus horas; `administrador` a todo.
- **FR-003**: El sistema muestra un calendario mensual con el total de horas por día.
- **FR-004**: El sistema permite crear/editar/eliminar bloques de horas por día con validación de solapamiento.
- **FR-005**: El sistema calcula `horas_totales` en el backend (decimal, ej. `4.50`).
- **FR-006**: El sistema agrega horas por usuario en un rango de fechas (mes/año).
- **FR-007**: El sistema exporta el reporte a Excel (resumen por facturador y detalle diario).
- **FR-008**: El administrador gestiona usuarios (crear, activar/desactivar, reset password).

### Key Entities

- **Usuario**: facturador o administrador; identidad, credenciales y rol.
- **RegistroHora**: un bloque de horas (inicio/fin) en una fecha, perteneciente a un usuario.
  Un día puede tener varios bloques (turno partido). `horas_totales` derivado del bloque.

## Success Criteria

- **SC-001**: Un facturador marca sus horas del día en menos de 10 segundos.
- **SC-002**: El total diario y mensual coincide con el cálculo manual en todos los casos.
- **SC-003**: Los reportes exportados se abren en Excel sin errores.
- **SC-004**: Ningún facturador puede leer ni modificar registros de otro facturador.

## Assumptions

- El login usa el `correo` como identificador único.
- `horas_totales` se expresa en horas decimales (ej. `4.50`), no en `hh:mm`.
- No se soporta cruce de medianoche en un bloque.
- `administrador` es el rol de coordinación (equivale a "coordinador").
- Despliegue objetivo: IIS en Windows Server (iisnode + ServeStatic).
