import { Role } from './role.enum.js';

export interface AuthUser {
  userId: string;
  correo: string;
  role: Role;
}
