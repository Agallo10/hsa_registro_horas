import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from '../common/role.enum.js';
import { Usuario } from '../users/usuario.entity.js';
import { UsersService } from '../users/users.service.js';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async validateUser(correo: string, password: string): Promise<Usuario | null> {
    const user = await this.usersService.findByCorreo(correo);
    if (!user || !user.activo) {
      return null;
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return null;
    }
    return user;
  }

  async login(user: Usuario): Promise<TokenPair & { user: Usuario }> {
    const tokens = this.signTokens(user);
    return { ...tokens, user };
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    let payload: {
      sub: string;
      correo: string;
      role: Role;
      type: string;
    };
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Sesión inválida o expirada');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Token inválido');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.activo) {
      throw new UnauthorizedException('Usuario no válido');
    }

    return this.signTokens(user);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('La contraseña actual es incorrecta');
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.usersService.setPasswordHash(user.id, passwordHash);
  }

  private signTokens(user: Usuario): TokenPair {
    const base = { sub: user.id, correo: user.correo, role: user.rol };

    const accessToken = this.jwtService.sign(
      { ...base, type: 'access' },
      {
        secret: this.config.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: (this.config.get<string>('JWT_ACCESS_TTL') ??
          '15m') as JwtSignOptions['expiresIn'],
      },
    );

    const refreshToken = this.jwtService.sign(
      { ...base, type: 'refresh' },
      {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: (this.config.get<string>('JWT_REFRESH_TTL') ??
          '7d') as JwtSignOptions['expiresIn'],
      },
    );

    return { accessToken, refreshToken };
  }
}
