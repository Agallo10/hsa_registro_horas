import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Persona } from '../personas/persona.entity.js';

@Entity('registro_hora')
export class RegistroHora {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Persona, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'persona_id' })
  persona: Persona;

  @Column({ name: 'persona_id', type: 'uuid' })
  personaId: string;

  @Column({ name: 'fecha', type: 'date' })
  fecha: string;

  @Column({ name: 'hora_inicio', type: 'time' })
  horaInicio: string;

  @Column({ name: 'hora_fin', type: 'time' })
  horaFin: string;

  @Column({ name: 'horas_totales', type: 'numeric', precision: 4, scale: 2 })
  horasTotales: number;

  @Column({ name: 'observaciones', type: 'text', nullable: true })
  observaciones: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
