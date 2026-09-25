import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Persona } from './persona.entity.js';
import { CreatePersonaDto, UpdatePersonaDto } from './dto/persona.dto.js';

export interface PersonaDto {
  id: string;
  nombre: string;
  documento: string;
  correo: string | null;
  activo: boolean;
}

export const toPersonaDto = (p: Persona): PersonaDto => ({
  id: p.id,
  nombre: p.nombre,
  documento: p.documento,
  correo: p.correo,
  activo: p.activo,
});

@Injectable()
export class PersonasService {
  constructor(
    @InjectRepository(Persona)
    private readonly personasRepository: Repository<Persona>,
  ) {}

  async findAll(): Promise<Persona[]> {
    return this.personasRepository.find({ order: { nombre: 'ASC' } });
  }

  async findById(id: string): Promise<Persona | null> {
    return this.personasRepository.findOne({ where: { id } });
  }

  async create(dto: CreatePersonaDto): Promise<Persona> {
    await this.assertDocumentoUnico(dto.documento);
    const persona = this.personasRepository.create({
      nombre: dto.nombre,
      documento: dto.documento,
      correo: dto.correo ?? null,
      activo: true,
    });
    return this.personasRepository.save(persona);
  }

  async update(id: string, dto: UpdatePersonaDto): Promise<Persona> {
    const persona = await this.findById(id);
    if (!persona) {
      throw new NotFoundException('Persona no encontrada');
    }
    if (dto.nombre !== undefined) persona.nombre = dto.nombre;
    if (dto.documento !== undefined && dto.documento !== persona.documento) {
      await this.assertDocumentoUnico(dto.documento);
      persona.documento = dto.documento;
    }
    if (dto.correo !== undefined) persona.correo = dto.correo;
    if (dto.activo !== undefined) persona.activo = dto.activo;
    return this.personasRepository.save(persona);
  }

  private async assertDocumentoUnico(documento: string): Promise<void> {
    const existing = await this.personasRepository.findOne({
      where: { documento },
    });
    if (existing) {
      throw new ConflictException('El documento ya está registrado');
    }
  }
}
