import { MigrationInterface, QueryRunner } from 'typeorm';

export class IntroducePersona1758787200000 implements MigrationInterface {
  name = 'IntroducePersona1758787200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "persona" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "nombre" character varying(120) NOT NULL,
        "documento" character varying(30) NOT NULL,
        "correo" character varying(160),
        "activo" boolean NOT NULL DEFAULT true,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_persona" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_persona_documento" UNIQUE ("documento"),
        CONSTRAINT "UQ_persona_correo" UNIQUE ("correo")
      )
    `);

    await queryRunner.query(`DROP TABLE "registro_hora"`);

    await queryRunner.query(`
      CREATE TABLE "registro_hora" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "persona_id" uuid NOT NULL,
        "fecha" date NOT NULL,
        "hora_inicio" time NOT NULL,
        "hora_fin" time NOT NULL,
        "horas_totales" numeric(4,2) NOT NULL,
        "observaciones" text,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_registro_hora" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_registro_hora_horas" CHECK ("hora_fin" > "hora_inicio"),
        CONSTRAINT "FK_registro_hora_persona" FOREIGN KEY ("persona_id")
          REFERENCES "persona"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_registro_hora_persona_fecha" ON "registro_hora" ("persona_id", "fecha")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_registro_hora_persona_fecha"`);
    await queryRunner.query(`DROP TABLE "registro_hora"`);
    await queryRunner.query(`DROP TABLE "persona"`);

    await queryRunner.query(`
      CREATE TABLE "registro_hora" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "usuario_id" uuid NOT NULL,
        "fecha" date NOT NULL,
        "hora_inicio" time NOT NULL,
        "hora_fin" time NOT NULL,
        "horas_totales" numeric(4,2) NOT NULL,
        "observaciones" text,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_registro_hora" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_registro_hora_horas" CHECK ("hora_fin" > "hora_inicio"),
        CONSTRAINT "FK_registro_hora_usuario" FOREIGN KEY ("usuario_id")
          REFERENCES "usuario"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_registro_hora_usuario_fecha" ON "registro_hora" ("usuario_id", "fecha")`,
    );
  }
}
