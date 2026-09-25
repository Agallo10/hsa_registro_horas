# Feature Specification: Registro de Horas de Facturadores

**Feature Branch**: `001-registro-horas`

**Created**: 2026-09-22

**Status**: Approved (v2 — modelo supervisor + personas)

**Input**: Sistema de registro de horas para facturadores de un hospital. El supervisor
(único usuario) gestiona personas y registra las horas trabajadas por cada una; al final
de mes se genera un reporte consolidado.

## User Scenarios & Testing

### User Story 1 - Login del supervisor (Priority: P1)

El supervisor (administrador) inicia sesión con su correo y contraseña. Es el único rol
que inicia sesión; los facturadores (personas) no acceden a la aplicación.

**Why this priority**: Sin autenticación no existe la aplicación ni el aislamiento del sistema.

**Independent Test**: Hacer login con las credenciales del supervisor y entrar a la lista de personas.

**Acceptance Scenarios**:
1. **Given** credenciales válidas, **When** el supervisor envía el formulario, **Then** recibe tokens y entra a la lista de personas.
2. **Given** credenciales inválidas, **When** envía el formulario, **Then** recibe un error 401 sin revelar qué campo falló.
3. **Given** una persona (facturador), **When** intenta iniciar sesión, **Then** no existe como usuario de login.

### User Story 2 - Gestión de personas (Priority: P1)

Al entrar, el supervisor ve una lista de personas (nombre, documento, correo, estado).
Puede crear, editar y desactivar personas. El documento es único.

**Why this priority**: Es la pantalla inicial y el punto de partida del flujo de registro.

**Independent Test**: Crear, editar y desactivar una persona; verificar persistencia y unicidad del documento.

**Acceptance Scenarios**:
1. **Given** el supervisor autenticado, **When** entra, **Then** ve la lista de personas.
2. **Given** un documento ya existente, **When** crea/edita con ese documento, **Then** se rechaza.
3. **Given** una persona desactivada, **When** se lista, **Then** aparece marcada como inactiva y no se puede seleccionar para registrar.

### User Story 3 - Registro de horas por persona (Priority: P1)

Al hacer clic en una persona, se habilita el calendario de esa persona. El supervisor
selecciona un día y registra uno o varios bloques de horas (inicio/fin), con observación
opcional. Un día puede tener como máximo **4 personas distintas** con horas registradas.

**Why this priority**: Es el núcleo del sistema (registrar horas).

**Independent Test**: Registrar horas para una persona, validar solapamiento y la regla de 4 personas/día.

**Acceptance Scenarios**:
1. **Given** una persona seleccionada, **When** hago clic en un día, **Then** se abre el modal con los bloques de esa persona.
2. **Given** un bloque 08:00–12:00, **When** agrego 11:00–14:00, **Then** se rechaza por solapamiento.
3. **Given** 4 personas distintas con horas el día X, **When** registro horas a una 5ª persona el día X, **Then** se rechaza con error "máximo 4 personas por día".
4. **Given** una persona con horas, **When** edito o elimino un bloque, **Then** se actualiza/elimina.

### User Story 4 - Reporte mensual y exportación (Priority: P2)

El supervisor selecciona mes/año y ve una tabla con cada persona y su total de horas.
Puede exportar a Excel un resumen (una fila por persona) o un detalle día por día.

**Why this priority**: Entregable de cierre de mes; puede construirse tras el núcleo.

**Independent Test**: Con datos de varias personas en un mes, verificar totales y generar el .xlsx.

**Acceptance Scenarios**:
1. **Given** el supervisor, **When** selecciona mes/año, **Then** ve el total por persona.
2. **Given** el supervisor, **When** exporta resumen, **Then** descarga un .xlsx con una fila por persona.
3. **Given** el supervisor, **When** exporta detalle, **Then** descarga un .xlsx con una fila por bloque.

### Edge Cases

- Bloque que cruza la medianoche: NO permitido.
- Solapamiento exacto (fin == inicio de otro bloque): permitido.
- La regla de 4 personas/día cuenta personas **distintas** con horas ese día (independiente de bloques).
- Persona desactivada: sus horas históricas se conservan y aparecen en el reporte.
- Día sin bloques: el modal permite crear el primero.

## Requirements

### Functional Requirements

- **FR-001**: Login por correo/contraseña con JWT (solo rol `administrador`).
- **FR-002**: CRUD de personas (nombre, documento único, correo opcional, activo).
- **FR-003**: Calendario mensual por persona con total de horas por día.
- **FR-004**: CRUD de bloques de horas con validación de solapamiento.
- **FR-005**: Máximo 4 personas distintas con horas en un mismo día.
- **FR-006**: `horas_totales` calculado en el backend (decimal).
- **FR-007**: Reporte mensual (resumen por persona + detalle diario).
- **FR-008**: Exportación a Excel (resumen y detalle).

### Key Entities

- **Usuario**: cuenta de login del supervisor (solo `administrador`).
- **Persona**: facturador/a cuyas horas se registran (no inicia sesión). nombre, documento (único), correo (opcional), activo.
- **RegistroHora**: bloque de horas (inicio/fin) de una persona en una fecha. Varios bloques por día.

## Success Criteria

- **SC-001**: El supervisor registra las horas de una persona en menos de 10 segundos.
- **SC-002**: El total diario y mensual coincide con el cálculo manual.
- **SC-003**: La regla de 4 personas/día se cumple siempre.
- **SC-004**: Los reportes exportados se abren en Excel sin errores.

## Assumptions

- Solo el rol `administrador` (supervisor) inicia sesión; puede ampliarse en el futuro.
- El login usa `correo` como identificador del usuario.
- `horas_totales` en horas decimales; sin cruce de medianoche.
- Despliegue objetivo: IIS (iisnode + ServeStatic).
