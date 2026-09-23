import {
  Body,
  Controller,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshDto } from './dto/refresh.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { Public } from '../common/decorators/public.decorator.js';
import { toUserDto } from '../users/users.service.js';
import { AuthUser } from '../common/auth-user.interface.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(dto.correo, dto.password);
    if (!user) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }
    const { accessToken, refreshToken } = await this.authService.login(user);
    return { accessToken, refreshToken, user: toUserDto(user) };
  }

  @Public()
  @Post('refresh')
  async refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('change-password')
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @Req() req: { user: AuthUser },
  ) {
    await this.authService.changePassword(
      req.user.userId,
      dto.currentPassword,
      dto.newPassword,
    );
    return { message: 'Contraseña actualizada' };
  }
}
