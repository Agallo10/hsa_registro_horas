export type Rol = 'facturador' | 'administrador';

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: Rol;
  activo: boolean;
}

export interface Persona {
  id: string;
  nombre: string;
  documento: string;
  correo: string | null;
  activo: boolean;
}

export interface Registro {
  id: string;
  personaId: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  horasTotales: number;
  observaciones: string | null;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: Usuario;
}

export interface ResumenFila {
  personaId: string;
  nombre: string;
  documento: string;
  correo: string | null;
  activo: boolean;
  horasTotales: number;
  diasRegistrados: number;
}

export interface DetalleFila {
  personaId: string;
  nombre: string;
  documento: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  horasTotales: number;
  observaciones: string | null;
}
