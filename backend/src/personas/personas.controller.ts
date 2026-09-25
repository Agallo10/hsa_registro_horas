import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { PersonasService, toPersonaDto } from './personas.service.js';
import { CreatePersonaDto, UpdatePersonaDto } from './dto/persona.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../common/role.enum.js';

@Controller('personas')
@Roles(Role.Administrador)
export class PersonasController {
  constructor(private readonly personasService: PersonasService) {}

  @Get()
  async findAll() {
    const personas = await this.personasService.findAll();
    return personas.map(toPersonaDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const persona = await this.personasService.findById(id);
    if (!persona) {
      throw new NotFoundException('Persona no encontrada');
    }
    return toPersonaDto(persona);
  }

  @Post()
  async create(@Body() dto: CreatePersonaDto) {
    const persona = await this.personasService.create(dto);
    return toPersonaDto(persona);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePersonaDto) {
    const persona = await this.personasService.update(id, dto);
    return toPersonaDto(persona);
  }
}
