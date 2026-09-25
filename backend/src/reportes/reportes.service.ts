import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Persona } from '../personas/persona.entity.js';
import { ReporteQueryDto } from './dto/reporte-query.dto.js';
import { festivosColombia } from './festivos.js';
import {
  Clasificacion,
  CLASIFICACION_VACIA,
  clasificarBloque,
} from './clasificacion.js';

export interface ResumenFila extends Clasificacion {
  personaId: string;
  nombre: string;
  documento: string;
  correo: string | null;
  area: string | null;
  activo: boolean;
  diasRegistrados: number;
  totalHoras: number;
}

export interface DetalleFila extends Clasificacion {
  personaId: string;
  nombre: string;
  documento: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  observaciones: string | null;
}

interface RegistroFila {
  personaId: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  observaciones?: string | null;
}

@Injectable()
export class ReportesService {
  constructor(private readonly dataSource: DataSource) {}

  private rango(dto: ReporteQueryDto): { desde: string; hasta: string } {
    const month = String(dto.month).padStart(2, '0');
    const desde = `${dto.year}-${month}-01`;
    const lastDay = new Date(Date.UTC(dto.year, dto.month, 0)).getUTCDate();
    const hasta = `${dto.year}-${month}-${String(lastDay).padStart(2, '0')}`;
    return { desde, hasta };
  }

  private async cargarRegistros(
    desde: string,
    hasta: string,
  ): Promise<RegistroFila[]> {
    const rows: Array<{
      personaId: string;
      fecha: string;
      horaInicio: string;
      horaFin: string;
      observaciones: string | null;
    }> = await this.dataSource.query(
      `
      SELECT
        persona_id AS "personaId",
        fecha::text AS "fecha",
        to_char(hora_inicio, 'HH24:MI') AS "horaInicio",
        to_char(hora_fin, 'HH24:MI') AS "horaFin",
        observaciones AS "observaciones"
      FROM registro_hora
      WHERE fecha >= $1 AND fecha <= $2
      ORDER BY fecha ASC, hora_inicio ASC
      `,
      [desde, hasta],
    );
    return rows;
  }

  async resumenMensual(dto: ReporteQueryDto): Promise<ResumenFila[]> {
    const { desde, hasta } = this.rango(dto);
    const personas = await this.dataSource
      .getRepository(Persona)
      .find({ order: { nombre: 'ASC' } });
    const registros = await this.cargarRegistros(desde, hasta);
    const festivos = festivosColombia(dto.year);

    const acumulado = new Map<string, Clasificacion & { dias: Set<string> }>();
    for (const p of personas) {
      acumulado.set(p.id, { ...CLASIFICACION_VACIA, dias: new Set<string>() });
    }

    for (const r of registros) {
      const bucket = acumulado.get(r.personaId);
      if (!bucket) {
        continue;
      }
      const c = clasificarBloque(r.fecha, r.horaInicio, r.horaFin, festivos);
      bucket.recargoOrdinarioDiurno += c.recargoOrdinarioDiurno;
      bucket.recargoOrdinarioNocturno += c.recargoOrdinarioNocturno;
      bucket.recargoFestivoDiurno += c.recargoFestivoDiurno;
      bucket.recargoFestivoNocturno += c.recargoFestivoNocturno;
      bucket.horasExtraordinarias += c.horasExtraordinarias;
      bucket.dias.add(r.fecha);
    }

    return personas.map((p) => {
      const bucket = acumulado.get(p.id)!;
      const fila: ResumenFila = {
        personaId: p.id,
        nombre: p.nombre,
        documento: p.documento,
        correo: p.correo,
        area: p.area,
        activo: p.activo,
        diasRegistrados: bucket.dias.size,
        recargoOrdinarioDiurno: redondear(bucket.recargoOrdinarioDiurno),
        recargoOrdinarioNocturno: redondear(bucket.recargoOrdinarioNocturno),
        recargoFestivoDiurno: redondear(bucket.recargoFestivoDiurno),
        recargoFestivoNocturno: redondear(bucket.recargoFestivoNocturno),
        horasExtraordinarias: redondear(bucket.horasExtraordinarias),
        totalHoras: 0,
      };
      fila.totalHoras = redondear(
        fila.recargoOrdinarioDiurno +
          fila.recargoOrdinarioNocturno +
          fila.recargoFestivoDiurno +
          fila.recargoFestivoNocturno +
          fila.horasExtraordinarias,
      );
      return fila;
    });
  }

  async detalleMensual(dto: ReporteQueryDto): Promise<DetalleFila[]> {
    const { desde, hasta } = this.rango(dto);
    const festivos = festivosColombia(dto.year);

    const rows: Array<{
      personaId: string;
      nombre: string;
      documento: string;
      fecha: string;
      horaInicio: string;
      horaFin: string;
      observaciones: string | null;
    }> = await this.dataSource.query(
      `
      SELECT
        p.id AS "personaId",
        p.nombre AS "nombre",
        p.documento AS "documento",
        r.fecha::text AS "fecha",
        to_char(r.hora_inicio, 'HH24:MI') AS "horaInicio",
        to_char(r.hora_fin, 'HH24:MI') AS "horaFin",
        r.observaciones AS "observaciones"
      FROM registro_hora r
      INNER JOIN persona p ON p.id = r.persona_id
      WHERE r.fecha >= $1 AND r.fecha <= $2
      ORDER BY p.nombre ASC, r.fecha ASC, r.hora_inicio ASC
      `,
      [desde, hasta],
    );

    return rows.map((r) => {
      const c = clasificarBloque(r.fecha, r.horaInicio, r.horaFin, festivos);
      return {
        personaId: r.personaId,
        nombre: r.nombre,
        documento: r.documento,
        fecha: r.fecha,
        horaInicio: r.horaInicio,
        horaFin: r.horaFin,
        observaciones: r.observaciones,
        ...c,
      };
    });
  }
}

function redondear(n: number): number {
  return Math.round(n * 100) / 100;
}
