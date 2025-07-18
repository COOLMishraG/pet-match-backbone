import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSitterSpecTable1752235981724 implements MigrationInterface {
    name = 'CreateSitterSpecTable1752235981724'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "sitter_spec" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userName" character varying NOT NULL, "price" integer, "rating" integer, "available" boolean, "description" character varying, "specialties" text array, "petSatCount" integer NOT NULL DEFAULT '0', "experience" integer NOT NULL DEFAULT '0', "responseTime" character varying, CONSTRAINT "PK_93607b3b798a04891a0f6e19b89" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "sitter_spec"`);
    }

}
