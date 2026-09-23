import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ReporteQueryDto } from './dto/reporte-query.dto.js';

export interface ResumenFila {
  usuarioId: string;
  nombre: string;
  correo: string;
  horasTotales: number;
  diasRegistrados: number;
}

export interface DetalleFila {
  usuarioId: string;
  nombre: string;
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
      usuarioId: string;
      nombre: string;
      correo: string;
      horasTotales: string | null;
      diasRegistrados: string;
    }> = await this.dataSource.query(
      `
      SELECT
        u.id AS "usuarioId",
        u.nombre AS "nombre",
        u.correo AS "correo",
        COALESCE(SUM(r.horas_totales), 0) AS "horasTotales",
        COUNT(DISTINCT r.fecha) AS "diasRegistrados"
      FROM usuario u
      LEFT JOIN registro_hora r
        ON r.usuario_id = u.id AND r.fecha >= $1 AND r.fecha <= $2
      WHERE u.rol = 'facturador' AND u.activo = true
      GROUP BY u.id, u.nombre, u.correo
      ORDER BY u.nombre ASC
      `,
      [desde, hasta],
    );

    return rows.map((r) => ({
      usuarioId: r.usuarioId,
      nombre: r.nombre,
      correo: r.correo,
      horasTotales: Number(r.horasTotales),
      diasRegistrados: Number(r.diasRegistrados),
    }));
  }

  async detalleMensual(dto: ReporteQueryDto): Promise<DetalleFila[]> {
    const { desde, hasta } = this.rango(dto);
    const rows: Array<{
      usuarioId: string;
      nombre: string;
      fecha: string;
      horaInicio: string;
      horaFin: string;
      horasTotales: string;
      observaciones: string | null;
    }> = await this.dataSource.query(
      `
      SELECT
        u.id AS "usuarioId",
        u.nombre AS "nombre",
        r.fecha::text AS "fecha",
        to_char(r.hora_inicio, 'HH24:MI') AS "horaInicio",
        to_char(r.hora_fin, 'HH24:MI') AS "horaFin",
        r.horas_totales AS "horasTotales",
        r.observaciones AS "observaciones"
      FROM registro_hora r
      INNER JOIN usuario u ON u.id = r.usuario_id
      WHERE r.fecha >= $1 AND r.fecha <= $2 AND u.rol = 'facturador'
      ORDER BY u.nombre ASC, r.fecha ASC, r.hora_inicio ASC
      `,
      [desde, hasta],
    );

    return rows.map((r) => ({
      usuarioId: r.usuarioId,
      nombre: r.nombre,
      fecha: r.fecha,
      horaInicio: r.horaInicio,
      horaFin: r.horaFin,
      horasTotales: Number(r.horasTotales),
      observaciones: r.observaciones,
    }));
  }
}
