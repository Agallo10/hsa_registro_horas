import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ReporteQueryDto } from './dto/reporte-query.dto.js';

export interface ResumenFila {
  personaId: string;
  nombre: string;
  documento: string;
  correo: string | null;
  activo: boolean;
  horasTotales: number;
  diasRegistrados: number;
}

export interface DetalleFila {
  personaId: string;
  nombre: string;
  documento: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  horasTotales: number;
  observaciones: string | null;
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

  async resumenMensual(dto: ReporteQueryDto): Promise<ResumenFila[]> {
    const { desde, hasta } = this.rango(dto);
    const rows: Array<{
      personaId: string;
      nombre: string;
      documento: string;
      correo: string | null;
      activo: boolean;
      horasTotales: string | null;
      diasRegistrados: string;
    }> = await this.dataSource.query(
      `
      SELECT
        p.id AS "personaId",
        p.nombre AS "nombre",
        p.documento AS "documento",
        p.correo AS "correo",
        p.activo AS "activo",
        COALESCE(SUM(r.horas_totales), 0) AS "horasTotales",
        COUNT(DISTINCT r.fecha) AS "diasRegistrados"
      FROM persona p
      LEFT JOIN registro_hora r
        ON r.persona_id = p.id AND r.fecha >= $1 AND r.fecha <= $2
      GROUP BY p.id, p.nombre, p.documento, p.correo, p.activo
      ORDER BY p.nombre ASC
      `,
      [desde, hasta],
    );

    return rows.map((r) => ({
      personaId: r.personaId,
      nombre: r.nombre,
      documento: r.documento,
      correo: r.correo,
      activo: r.activo,
      horasTotales: Number(r.horasTotales),
      diasRegistrados: Number(r.diasRegistrados),
    }));
  }

  async detalleMensual(dto: ReporteQueryDto): Promise<DetalleFila[]> {
    const { desde, hasta } = this.rango(dto);
    const rows: Array<{
      personaId: string;
      nombre: string;
      documento: string;
      fecha: string;
      horaInicio: string;
      horaFin: string;
      horasTotales: string;
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
        r.horas_totales AS "horasTotales",
        r.observaciones AS "observaciones"
      FROM registro_hora r
      INNER JOIN persona p ON p.id = r.persona_id
      WHERE r.fecha >= $1 AND r.fecha <= $2
      ORDER BY p.nombre ASC, r.fecha ASC, r.hora_inicio ASC
      `,
      [desde, hasta],
    );

    return rows.map((r) => ({
      personaId: r.personaId,
      nombre: r.nombre,
      documento: r.documento,
      fecha: r.fecha,
      horaInicio: r.horaInicio,
      horaFin: r.horaFin,
      horasTotales: Number(r.horasTotales),
      observaciones: r.observaciones,
    }));
  }
}
