import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { RegistrosService, toRegistroDto } from './registros.service.js';
import {
  CreateRegistroDto,
  QueryRegistroDto,
  UpdateRegistroDto,
} from './dto/registro.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../common/role.enum.js';

@Controller('registros')
@Roles(Role.Administrador)
export class RegistrosController {
  constructor(private readonly registrosService: RegistrosService) {}

  @Get()
  async findAll(@Query() query: QueryRegistroDto) {
    const registros = await this.registrosService.findAll(query);
    return registros.map(toRegistroDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const registro = await this.registrosService.findById(id);
    if (!registro) {
      throw new NotFoundException('Registro no encontrado');
    }
    return toRegistroDto(registro);
  }

  @Post()
  async create(@Body() dto: CreateRegistroDto) {
    const registro = await this.registrosService.create(dto);
    return toRegistroDto(registro);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateRegistroDto) {
    const registro = await this.registrosService.update(id, dto);
    return toRegistroDto(registro);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.registrosService.remove(id);
    return { message: 'Registro eliminado' };
  }
}
