<!--
Sync Impact Report
- Version change: (initial) → 1.0.0
- Modified principles: none (initial constitution)
- Added sections: Core Principles, Security & Data Handling, Development Workflow, Governance
- Removed sections: none
- Follow-up TODOs: none
-->

# Registro de Horas — Constitución

## Core Principles

### I. Seguridad y control de acceso por roles (NO NEGOCIABLE)
Toda funcionalidad y endpoint respeta el modelo de roles `facturador` y `administrador`.
- La autorización se aplica en el backend (guards), nunca solo en el frontend.
- Las contraseñas se almacenan con bcrypt (nunca en texto plano).
- La sesión usa JWT: access token de corta duración + refresh token.
- Un `facturador` solo puede ver, crear, editar y eliminar SUS PROPIOS registros de horas.
- Un `administrador` (coordinador) puede gestionar usuarios y ver/exportar el reporte de todos.
- Ningún secreto, clave o credencial puede exponerse en logs ni commitearse al repositorio.

### II. Separación backend/frontend con contrato de API claro
El backend (NestJS) y el frontend (React SPA) se mantienen como proyectos independientes
que se comunican exclusivamente vía API REST JSON.
- Los DTOs y la validación (class-validator) definen el contrato de entrada/salida.
- Las respuestas de error siguen un formato consistente (código, mensaje, detalles).
- El frontend consume la API mediante un cliente tipado; los tipos compartidos viven en un
  módulo `types/` del frontend.

### III. Simplicidad y mantenibilidad (operador único)
El proyecto es mantenido por una sola persona, por lo que prima la simplicidad.
- Evitar abstracciones prematuras; añadir complejidad solo cuando el requisito la justifique (YAGNI).
- Un módulo de NestJS por dominio (auth, users, registros, reportes).
- El código sigue las convenciones existentes del framework y del proyecto.
- Nombres de archivos, variables y funciones descriptivos y consistentes.

### IV. Calidad y verificación
Todo cambio debe ser verificable antes de considerarse terminado.
- El backend incluye pruebas unitarias para lógica de negocio (solapamiento, cálculo de horas).
- Los endpoints críticos (login, registro de horas) tienen pruebas de integración.
- Se ejecutan lint y typecheck del backend y del frontend antes de dar por terminada una tarea.
- Las validaciones de negocio (solapamiento de horarios, horas negativas, permisos) viven en el backend.

### V. Desarrollo guiado por especificación
El trabajo se organiza mediante Spec-Driven Development (Spec Kit).
- Cada funcionalidad relevante pasa por: especificación → plan → tareas → implementación.
- Los artefactos (`specs/`) se versionan junto al código y son la fuente de verdad de requisitos.
- Durante la implementación se consulta documentación actualizada (Context7) para librerías y
  frameworks, en lugar de asumir APIs por memoria.

## Security & Data Handling

- Autenticación local (correo/contraseña) con JWT access + refresh.
- Roles: `facturador` (gestiona sus horas) y `administrador` (usuarios + reporte global).
- `horas_totales` se calcula en el backend al guardar (nunca se confía en el valor enviado por el cliente).
- Validación de solapamiento de bloques en el mismo día para el mismo usuario (en el backend).

## Development Workflow

- Stack: NestJS + TypeORM + PostgreSQL (backend); React + Vite + TypeScript + Mantine (frontend).
- Despliegue objetivo: IIS (Windows Server) con `iisnode` + URL Rewrite; el backend sirve el build
  estático del frontend mediante `@nestjs/serve-static`.
- Flujo Spec Kit: `/speckit.constitution` → `/speckit.specify` → `/speckit.plan` → `/speckit.tasks` → `/speckit.implement`.
- Antes de dar por terminada una tarea: lint + typecheck + pruebas relevantes pasan.

## Governance

- Esta constitución tiene prioridad sobre cualquier práctica de desarrollo ad-hoc.
- Las enmiendas requieren documentación y justificación explícita; siguen versionado semántico:
  MAJOR (cambio de principios), MINOR (principio nuevo), PATCH (aclaraciones).
- Todo cambio debe ser consistente con los principios aquí definidos.
- La complejidad introducida debe estar justificada por un requisito concreto.

**Version**: 1.0.0 | **Ratified**: 2026-09-22 | **Last Amended**: 2026-09-22
