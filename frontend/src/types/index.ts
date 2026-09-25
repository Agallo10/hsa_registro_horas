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
  area: string | null;
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
  area: string | null;
  activo: boolean;
  diasRegistrados: number;
  recargoOrdinarioDiurno: number;
  recargoOrdinarioNocturno: number;
  recargoFestivoDiurno: number;
  recargoFestivoNocturno: number;
  horasExtraordinarias: number;
  totalHoras: number;
}

export interface DetalleFila {
  personaId: string;
  nombre: string;
  documento: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  observaciones: string | null;
  recargoOrdinarioDiurno: number;
  recargoOrdinarioNocturno: number;
  recargoFestivoDiurno: number;
  recargoFestivoNocturno: number;
  horasExtraordinarias: number;
}
