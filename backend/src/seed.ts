import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { UsersService } from './users/users.service.js';
import { Role } from './common/role.enum.js';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  const usersService = app.get(UsersService);

  const adminCorreo = process.env.SEED_ADMIN_CORREO ?? 'admin@hospital.local';
  const existingAdmin = await usersService.findByCorreo(adminCorreo);
  if (!existingAdmin) {
    await usersService.create({
      nombre: process.env.SEED_ADMIN_NOMBRE ?? 'Administrador',
      correo: adminCorreo,
      password: process.env.SEED_ADMIN_PASSWORD ?? 'admin123',
      rol: Role.Administrador,
    });
    console.log(`Administrador "${adminCorreo}" creado.`);
  } else {
    console.log(`Administrador "${adminCorreo}" ya existe.`);
  }

  const demoFacturador = await usersService.findByCorreo(
    'facturador@hospital.local',
  );
  if (!demoFacturador) {
    await usersService.create({
      nombre: 'Facturador Demo',
      correo: 'facturador@hospital.local',
      password: 'facturador123',
      rol: Role.Facturador,
    });
    console.log('Facturador demo creado.');
  }

  await app.close();
}

await run();
