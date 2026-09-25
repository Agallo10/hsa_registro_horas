import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPersonaArea1758873600000 implements MigrationInterface {
  name = 'AddPersonaArea1758873600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "persona" ADD COLUMN "area" character varying(120)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "persona" DROP COLUMN "area"`);
  }
}
