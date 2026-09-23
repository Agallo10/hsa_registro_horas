import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Role } from '../common/role.enum.js';
import { AuthUser } from '../common/auth-user.interface.js';

export interface JwtPayload {
  sub: string;
  correo: string;
  role: Role;
  type: 'access' | 'refresh';
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    const secret = config.get<string>('JWT_ACCESS_SECRET');
    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET no está configurado');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  validate(payload: JwtPayload): AuthUser {
    if (payload.type !== 'access') {
      throw new Error('Token inválido para este recurso');
    }
    return {
      userId: payload.sub,
      correo: payload.correo,
      role: payload.role,
    };
  }
}
