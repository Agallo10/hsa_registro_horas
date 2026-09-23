import { Controller, Get, Query } from '@nestjs/common';
import { ReportesService } from './reportes.service.js';
import { ReporteQueryDto } from './dto/reporte-query.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../common/role.enum.js';

@Controller('reportes')
@Roles(Role.Administrador)
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('mensual')
  async mensual(@Query() query: ReporteQueryDto) {
    const filas = await this.reportesService.resumenMensual(query);
    return { year: query.year, month: query.month, filas };
  }

  @Get('detalle')
  async detalle(@Query() query: ReporteQueryDto) {
    const filas = await this.reportesService.detalleMensual(query);
    return { year: query.year, month: query.month, filas };
  }
}
