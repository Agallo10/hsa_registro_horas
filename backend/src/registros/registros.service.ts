import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { RegistroHora } from './registro-hora.entity.js';
import {
  CreateRegistroDto,
  QueryRegistroDto,
  UpdateRegistroDto,
} from './dto/registro.dto.js';

const MAX_PERSONAS_POR_DIA = 4;

export interface RegistroDto {
  id: string;
  personaId: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  horasTotales: number;
  observaciones: string | null;
}

export const toRegistroDto = (r: RegistroHora): RegistroDto => ({
  id: r.id,
  personaId: r.personaId,
  fecha: r.fecha,
  horaInicio: r.horaInicio.slice(0, 5),
  horaFin: r.horaFin.slice(0, 5),
  horasTotales: Number(r.horasTotales),
  observaciones: r.observaciones,
});

export const timeToMinutes = (time: string): number => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

export const computeHoras = (horaInicio: string, horaFin: string): number => {
  const minutes = timeToMinutes(horaFin) - timeToMinutes(horaInicio);
  return Math.round((minutes / 60) * 100) / 100;
};

export const overlaps = (
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
): boolean => aStart < bEnd && bStart < aEnd;

@Injectable()
export class RegistrosService {
  constructor(
    @InjectRepository(RegistroHora)
    private readonly registrosRepository: Repository<RegistroHora>,
  ) {}

  async findAll(query: QueryRegistroDto): Promise<RegistroHora[]> {
    const where: Record<string, unknown> = {};

    if (query.personaId) {
      where.personaId = query.personaId;
    }

    if (query.fechaDesde || query.fechaHasta) {
      if (query.fechaDesde && query.fechaHasta) {
        where.fecha = Between(query.fechaDesde, query.fechaHasta);
      } else if (query.fechaDesde) {
        where.fecha = MoreThanOrEqual(query.fechaDesde);
      } else {
        where.fecha = LessThanOrEqual(query.fechaHasta!);
      }
    }

    return this.registrosRepository.find({
      where,
      order: { fecha: 'ASC', horaInicio: 'ASC' },
    });
  }

  async findById(id: string): Promise<RegistroHora | null> {
    return this.registrosRepository.findOne({ where: { id } });
  }

  async create(dto: CreateRegistroDto): Promise<RegistroHora> {
    await this.assertNoOverlap(dto.personaId, dto.fecha, dto.horaInicio, dto.horaFin);
    await this.assertMaxPersonasPorDia(dto.personaId, dto.fecha);

    const registro = this.registrosRepository.create({
      personaId: dto.personaId,
      fecha: dto.fecha,
      horaInicio: dto.horaInicio,
      horaFin: dto.horaFin,
      horasTotales: computeHoras(dto.horaInicio, dto.horaFin),
      observaciones: dto.observaciones ?? null,
    });
    return this.registrosRepository.save(registro);
  }

  async update(id: string, dto: UpdateRegistroDto): Promise<RegistroHora> {
    const registro = await this.findById(id);
    if (!registro) {
      throw new NotFoundException('Registro no encontrado');
    }

    const horaInicio = dto.horaInicio ?? registro.horaInicio;
    const horaFin = dto.horaFin ?? registro.horaFin;

    await this.assertNoOverlap(registro.personaId, registro.fecha, horaInicio, horaFin, id);

    registro.horaInicio = horaInicio;
    registro.horaFin = horaFin;
    registro.horasTotales = computeHoras(horaInicio, horaFin);
    if (dto.observaciones !== undefined) {
      registro.observaciones = dto.observaciones;
    }
    return this.registrosRepository.save(registro);
  }

  async remove(id: string): Promise<void> {
    const registro = await this.findById(id);
    if (!registro) {
      throw new NotFoundException('Registro no encontrado');
    }
    await this.registrosRepository.delete(id);
  }

  private async assertNoOverlap(
    personaId: string,
    fecha: string,
    horaInicio: string,
    horaFin: string,
    excludeId?: string,
  ): Promise<void> {
    const start = timeToMinutes(horaInicio);
    const end = timeToMinutes(horaFin);
    if (end <= start) {
      throw new ConflictException('La hora de fin debe ser mayor a la de inicio');
    }

    const existing = await this.registrosRepository.find({
      where: { personaId, fecha },
    });

    const conflicto = existing.some(
      (r) =>
        r.id !== excludeId &&
        overlaps(start, end, timeToMinutes(r.horaInicio), timeToMinutes(r.horaFin)),
    );

    if (conflicto) {
      throw new ConflictException('El horario se solapa con otro registro del día');
    }
  }

  private async assertMaxPersonasPorDia(
    personaId: string,
    fecha: string,
  ): Promise<void> {
    const rows: Array<{ persona_id: string }> = await this.registrosRepository.manager.query(
      `SELECT DISTINCT persona_id FROM registro_hora WHERE fecha = $1`,
      [fecha],
    );
    const personas = new Set(rows.map((r) => r.persona_id));

    if (personas.size >= MAX_PERSONAS_POR_DIA && !personas.has(personaId)) {
      throw new ConflictException(
        `Máximo ${MAX_PERSONAS_POR_DIA} personas por día`,
      );
    }
  }
}
