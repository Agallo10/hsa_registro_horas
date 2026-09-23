import { api } from './client';
import type {
  DetalleFila,
  LoginResponse,
  Registro,
  ResumenFila,
  Usuario,
} from '../types';

export interface AuthApi {
  login(correo: string, password: string): Promise<LoginResponse>;
  changePassword(currentPassword: string, newPassword: string): Promise<void>;
}

export const authApi: AuthApi = {
  async login(correo, password) {
    const { data } = await api.post<LoginResponse>('/auth/login', {
      correo,
      password,
    });
    return data;
  },
  async changePassword(currentPassword, newPassword) {
    await api.post('/auth/change-password', { currentPassword, newPassword });
  },
};

export interface RegistroInput {
  fecha: string;
  horaInicio: string;
  horaFin: string;
  observaciones?: string;
}

export const registrosApi = {
  async list(fechaDesde: string, fechaHasta: string): Promise<Registro[]> {
    const { data } = await api.get<Registro[]>('/registros', {
      params: { fechaDesde, fechaHasta },
    });
    return data;
  },
  async create(input: RegistroInput): Promise<Registro> {
    const { data } = await api.post<Registro>('/registros', input);
    return data;
  },
  async update(id: string, input: Partial<RegistroInput>): Promise<Registro> {
    const { data } = await api.patch<Registro>(`/registros/${id}`, input);
    return data;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/registros/${id}`);
  },
};

export const reportesApi = {
  async mensual(year: number, month: number): Promise<ResumenFila[]> {
    const { data } = await api.get<{ filas: ResumenFila[] }>(
      '/reportes/mensual',
      { params: { year, month } },
    );
    return data.filas;
  },
  async detalle(year: number, month: number): Promise<DetalleFila[]> {
    const { data } = await api.get<{ filas: DetalleFila[] }>(
      '/reportes/detalle',
      { params: { year, month } },
    );
    return data.filas;
  },
};

export const usersApi = {
  async list(): Promise<Usuario[]> {
    const { data } = await api.get<Usuario[]>('/users');
    return data;
  },
  async create(input: {
    nombre: string;
    correo: string;
    password: string;
    rol: string;
  }): Promise<Usuario> {
    const { data } = await api.post<Usuario>('/users', input);
    return data;
  },
  async update(id: string, input: Partial<Usuario>): Promise<Usuario> {
    const { data } = await api.patch<Usuario>(`/users/${id}`, input);
    return data;
  },
  async resetPassword(id: string, password: string): Promise<void> {
    await api.post(`/users/${id}/reset-password`, { password });
  },
};
