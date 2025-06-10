import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeDisplayNameNullable1717532900000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" 
      ALTER COLUMN "displayName" DROP NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" 
      ALTER COLUMN "displayName" SET NOT NULL;
    `);
  }
}
