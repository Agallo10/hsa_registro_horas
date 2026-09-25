import { api } from './client';
import type {
  DetalleFila,
  LoginResponse,
  Persona,
  Registro,
  ResumenFila,
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

export const personasApi = {
  async list(): Promise<Persona[]> {
    const { data } = await api.get<Persona[]>('/personas');
    return data;
  },
  async findById(id: string): Promise<Persona> {
    const { data } = await api.get<Persona>(`/personas/${id}`);
    return data;
  },
  async create(input: {
    nombre: string;
    documento: string;
    correo?: string;
  }): Promise<Persona> {
    const { data } = await api.post<Persona>('/personas', input);
    return data;
  },
  async update(id: string, input: Partial<Persona>): Promise<Persona> {
    const { data } = await api.patch<Persona>(`/personas/${id}`, input);
    return data;
  },
};

export interface RegistroInput {
  personaId: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  observaciones?: string;
}

export const registrosApi = {
  async list(params: {
    personaId?: string;
    fechaDesde?: string;
    fechaHasta?: string;
  }): Promise<Registro[]> {
    const { data } = await api.get<Registro[]>('/registros', { params });
    return data;
  },
  async create(input: RegistroInput): Promise<Registro> {
    const { data } = await api.post<Registro>('/registros', input);
    return data;
  },
  async update(
    id: string,
    input: Partial<Omit<RegistroInput, 'personaId' | 'fecha'>>,
  ): Promise<Registro> {
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
