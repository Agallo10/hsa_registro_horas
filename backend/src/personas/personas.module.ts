import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Persona } from './persona.entity.js';
import { PersonasService } from './personas.service.js';
import { PersonasController } from './personas.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Persona])],
  providers: [PersonasService],
  controllers: [PersonasController],
  exports: [PersonasService],
})
export class PersonasModule {}
