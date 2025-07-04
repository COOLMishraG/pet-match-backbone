import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAnimalTypeToPets1751290326343 implements MigrationInterface {
    name = 'AddAnimalTypeToPets1751290326343'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."pets_animal_enum" AS ENUM('DOG', 'CAT', 'BIRD', 'RABBIT', 'HAMSTER', 'FISH', 'REPTILE', 'OTHER')`);
        await queryRunner.query(`ALTER TABLE "pets" ADD "animal" "public"."pets_animal_enum" NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pets" DROP COLUMN "animal"`);
        await queryRunner.query(`DROP TYPE "public"."pets_animal_enum"`);
    }

}
