import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { UsersService } from './users/users.service.js';
import { PersonasService } from './personas/personas.service.js';
import { Role } from './common/role.enum.js';

const DEMO_PERSONAS: Array<{
  nombre: string;
  documento: string;
  correo?: string;
}> = [
  { nombre: 'Ana Gómez', documento: '12345678', correo: 'ana@hospital.local' },
  { nombre: 'Luis Pérez', documento: '23456789', correo: 'luis@hospital.local' },
  { nombre: 'María Ríos', documento: '34567890' },
];

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  const usersService = app.get(UsersService);
  const personasService = app.get(PersonasService);

  const adminCorreo = process.env.SEED_ADMIN_CORREO ?? 'admin@hospital.local';
  const existingAdmin = await usersService.findByCorreo(adminCorreo);
  if (!existingAdmin) {
    await usersService.create({
      nombre: process.env.SEED_ADMIN_NOMBRE ?? 'Administrador',
      correo: adminCorreo,
      password: process.env.SEED_ADMIN_PASSWORD ?? 'admin123',
      rol: Role.Administrador,
    });
    console.log(`Supervisor "${adminCorreo}" creado.`);
  } else {
    console.log(`Supervisor "${adminCorreo}" ya existe.`);
  }

  const personas = await personasService.findAll();
  if (personas.length === 0) {
    for (const p of DEMO_PERSONAS) {
      await personasService.create(p);
    }
    console.log('Personas de prueba creadas.');
  } else {
    console.log('Ya existen personas; se omitió el seed de personas.');
  }

  await app.close();
}

await run();
