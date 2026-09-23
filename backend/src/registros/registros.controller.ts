import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  toRegistroDto,
  RegistrosService,
} from './registros.service.js';
import {
  CreateRegistroDto,
  QueryRegistroDto,
  UpdateRegistroDto,
} from './dto/registro.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthUser } from '../common/auth-user.interface.js';
import { Role } from '../common/role.enum.js';

@Controller('registros')
export class RegistrosController {
  constructor(private readonly registrosService: RegistrosService) {}

  @Get()
  async findAll(@Query() query: QueryRegistroDto, @CurrentUser() user: AuthUser) {
    const registros = await this.registrosService.findAll(query, user);
    return registros.map(toRegistroDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    const registro = await this.registrosService.findById(id);
    if (!registro) {
      throw new NotFoundException('Registro no encontrado');
    }
    if (user.role !== Role.Administrador && registro.usuarioId !== user.userId) {
      throw new ForbiddenException('No puede ver registros de otros');
    }
    return toRegistroDto(registro);
  }

  @Post()
  async create(@Body() dto: CreateRegistroDto, @CurrentUser() user: AuthUser) {
    const registro = await this.registrosService.create(dto, user);
    return toRegistroDto(registro);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateRegistroDto,
    @CurrentUser() user: AuthUser,
  ) {
    const registro = await this.registrosService.update(id, dto, user);
    return toRegistroDto(registro);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    await this.registrosService.remove(id, user);
    return { message: 'Registro eliminado' };
  }
}
