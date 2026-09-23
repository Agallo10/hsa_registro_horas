import { Module } from '@nestjs/common';
import { ReportesService } from './reportes.service.js';
import { ReportesController } from './reportes.controller.js';

@Module({
  providers: [ReportesService],
  controllers: [ReportesController],
})
export class ReportesModule {}
