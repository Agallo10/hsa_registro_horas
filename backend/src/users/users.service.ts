import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from './usuario.entity.js';
import { CreateUserDto, ResetPasswordDto, UpdateUserDto } from './dto/user.dto.js';

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

  async findAll(): Promise<Usuario[]> {
    return this.usersRepository.find({ order: { nombre: 'ASC' } });
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

  async update(id: string, dto: UpdateUserDto): Promise<Usuario> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    if (dto.nombre !== undefined) user.nombre = dto.nombre;
    if (dto.correo !== undefined) {
      const existing = await this.findByCorreo(dto.correo);
      if (existing && existing.id !== id) {
        throw new ConflictException('El correo ya está registrado');
      }
      user.correo = dto.correo;
    }
    if (dto.rol !== undefined) user.rol = dto.rol;
    if (dto.activo !== undefined) user.activo = dto.activo;
    return this.usersRepository.save(user);
  }

  async resetPassword(id: string, dto: ResetPasswordDto): Promise<Usuario> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    user.passwordHash = await bcrypt.hash(dto.password, 10);
    return this.usersRepository.save(user);
  }

  async setPasswordHash(id: string, passwordHash: string): Promise<void> {
    await this.usersRepository.update(id, { passwordHash });
  }
}
