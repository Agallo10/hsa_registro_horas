import {
  ConflictException,
  ForbiddenException,
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
import { AuthUser } from '../common/auth-user.interface.js';
import { Role } from '../common/role.enum.js';

export interface RegistroDto {
  id: string;
  usuarioId: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  horasTotales: number;
  observaciones: string | null;
}

export const toRegistroDto = (r: RegistroHora): RegistroDto => ({
  id: r.id,
  usuarioId: r.usuarioId,
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

  async findAll(query: QueryRegistroDto, user: AuthUser): Promise<RegistroHora[]> {
    const where: Record<string, unknown> = {};

    if (user.role === Role.Administrador && query.usuarioId) {
      where.usuarioId = query.usuarioId;
    } else {
      where.usuarioId = user.userId;
    }

    if (query.fechaDesde || query.fechaHasta) {
      const fecha = (() => {
        if (query.fechaDesde && query.fechaHasta) {
          return Between(query.fechaDesde, query.fechaHasta);
        }
        if (query.fechaDesde) {
          return MoreThanOrEqual(query.fechaDesde);
        }
        return LessThanOrEqual(query.fechaHasta!);
      })();
      where.fecha = fecha;
    }

    return this.registrosRepository.find({
      where,
      order: { fecha: 'ASC', horaInicio: 'ASC' },
    });
  }

  async findById(id: string): Promise<RegistroHora | null> {
    return this.registrosRepository.findOne({ where: { id } });
  }

  async create(dto: CreateRegistroDto, user: AuthUser): Promise<RegistroHora> {
    const usuarioId =
      user.role === Role.Administrador && dto.usuarioId
        ? dto.usuarioId
        : user.userId;

    await this.assertNoOverlap(usuarioId, dto.fecha, dto.horaInicio, dto.horaFin);

    const registro = this.registrosRepository.create({
      usuarioId,
      fecha: dto.fecha,
      horaInicio: dto.horaInicio,
      horaFin: dto.horaFin,
      horasTotales: computeHoras(dto.horaInicio, dto.horaFin),
      observaciones: dto.observaciones ?? null,
    });
    return this.registrosRepository.save(registro);
  }

  async update(
    id: string,
    dto: UpdateRegistroDto,
    user: AuthUser,
  ): Promise<RegistroHora> {
    const registro = await this.findById(id);
    if (!registro) {
      throw new NotFoundException('Registro no encontrado');
    }
    if (user.role !== Role.Administrador && registro.usuarioId !== user.userId) {
      throw new ForbiddenException('No puede modificar registros de otros');
    }

    const horaInicio = dto.horaInicio ?? registro.horaInicio;
    const horaFin = dto.horaFin ?? registro.horaFin;

    await this.assertNoOverlap(registro.usuarioId, registro.fecha, horaInicio, horaFin, id);

    registro.horaInicio = horaInicio;
    registro.horaFin = horaFin;
    registro.horasTotales = computeHoras(horaInicio, horaFin);
    if (dto.observaciones !== undefined) {
      registro.observaciones = dto.observaciones;
    }
    return this.registrosRepository.save(registro);
  }

  async remove(id: string, user: AuthUser): Promise<void> {
    const registro = await this.findById(id);
    if (!registro) {
      throw new NotFoundException('Registro no encontrado');
    }
    if (user.role !== Role.Administrador && registro.usuarioId !== user.userId) {
      throw new ForbiddenException('No puede eliminar registros de otros');
    }
    await this.registrosRepository.delete(id);
  }

  private async assertNoOverlap(
    usuarioId: string,
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
      where: { usuarioId, fecha },
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
}
