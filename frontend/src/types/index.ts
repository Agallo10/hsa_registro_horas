export type Rol = 'facturador' | 'administrador';

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: Rol;
  activo: boolean;
}

export interface Registro {
  id: string;
  usuarioId: string;
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
  usuarioId: string;
  nombre: string;
  correo: string;
  horasTotales: number;
  diasRegistrados: number;
}

export interface DetalleFila {
  usuarioId: string;
  nombre: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  horasTotales: number;
  observaciones: string | null;
}
