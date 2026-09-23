import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Usuario } from './users/usuario.entity.js';
import { RegistroHora } from './registros/registro-hora.entity.js';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: Number(process.env.DATABASE_PORT ?? 5432),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD ?? '',
  database: process.env.DATABASE_NAME ?? 'registro_horas',
  entities: [Usuario, RegistroHora],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
