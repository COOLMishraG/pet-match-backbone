import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGoogleIdAndProfileImageToUsers1717532900001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN IF NOT EXISTS "googleId" character varying NULL,
      ADD COLUMN IF NOT EXISTS "profileImage" character varying NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP COLUMN IF EXISTS "googleId",
      DROP COLUMN IF EXISTS "profileImage";
    `);
  }
}
