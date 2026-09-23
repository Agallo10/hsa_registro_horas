import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistroHora } from './registro-hora.entity.js';
import { RegistrosService } from './registros.service.js';
import { RegistrosController } from './registros.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([RegistroHora])],
  providers: [RegistrosService],
  controllers: [RegistrosController],
  exports: [RegistrosService],
})
export class RegistrosModule {}
