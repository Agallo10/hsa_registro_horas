import {
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from './usuario.entity.js';
import { CreateUserDto } from './dto/user.dto.js';

export interface UserDto {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  activo: boolean;
}

export const toUserDto = (user: Usuario): UserDto => ({
  id: user.id,
  nombre: user.nombre,
  correo: user.correo,
  rol: user.rol,
  activo: user.activo,
});

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usersRepository: Repository<Usuario>,
  ) {}

  findByCorreo(correo: string): Promise<Usuario | null> {
    return this.usersRepository.findOne({ where: { correo } });
  }

  findById(id: string): Promise<Usuario | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async create(dto: CreateUserDto): Promise<Usuario> {
    const existing = await this.findByCorreo(dto.correo);
    if (existing) {
      throw new ConflictException('El correo ya está registrado');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepository.create({
      nombre: dto.nombre,
      correo: dto.correo,
      passwordHash,
      rol: dto.rol,
      activo: true,
    });
    return this.usersRepository.save(user);
  }

  async setPasswordHash(id: string, passwordHash: string): Promise<void> {
    await this.usersRepository.update(id, { passwordHash });
  }
}
