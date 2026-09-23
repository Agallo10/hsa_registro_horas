import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { toUserDto, UsersService } from './users.service.js';
import {
  CreateUserDto,
  ResetPasswordDto,
  UpdateUserDto,
} from './dto/user.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../common/role.enum.js';
import { AuthUser } from '../common/auth-user.interface.js';

@Controller('users')
@Roles(Role.Administrador)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map(toUserDto);
  }

  @Post()
  async create(@Body() dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    return toUserDto(user);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Req() req: { user: AuthUser },
  ) {
    if (id === req.user.userId && dto.activo === false) {
      throw new ForbiddenException('No puede desactivarse a sí mismo');
    }
    if (id === req.user.userId && dto.rol && dto.rol !== req.user.role) {
      throw new ForbiddenException('No puede cambiar su propio rol');
    }
    const user = await this.usersService.update(id, dto);
    return toUserDto(user);
  }

  @Post(':id/reset-password')
  async resetPassword(
    @Param('id') id: string,
    @Body() dto: ResetPasswordDto,
  ) {
    const user = await this.usersService.resetPassword(id, dto);
    return toUserDto(user);
  }
}
