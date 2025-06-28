import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1751128337971 implements MigrationInterface {
    name = 'InitialSchema1751128337971'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('OWNER', 'SITTER', 'VET', 'SHELTER', 'ADMIN')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "username" character varying NOT NULL, "displayName" character varying, "email" character varying NOT NULL, "password" character varying, "phone" character varying, "location" character varying, "role" "public"."users_role_enum" NOT NULL DEFAULT 'OWNER', "profileImage" character varying, "isVerified" boolean NOT NULL DEFAULT false, "googleId" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."pets_gender_enum" AS ENUM('MALE', 'FEMALE')`);
        await queryRunner.query(`CREATE TABLE "pets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "breed" character varying NOT NULL, "age" integer NOT NULL, "gender" "public"."pets_gender_enum" NOT NULL, "vaccinated" boolean NOT NULL DEFAULT false, "description" text, "imageUrl" text, "location" character varying, "isAvailableForMatch" boolean NOT NULL DEFAULT false, "isAvailableForBoarding" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "ownerId" uuid NOT NULL, CONSTRAINT "PK_d01e9e7b4ada753c826720bee8b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."matches_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED')`);
        await queryRunner.query(`CREATE TABLE "matches" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."matches_status_enum" NOT NULL DEFAULT 'PENDING', "message" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "requester_id" uuid, "recipient_id" uuid, "requester_pet_id" uuid, "recipient_pet_id" uuid, CONSTRAINT "PK_8a22c7b2e0828988d51256117f4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "pets" ADD CONSTRAINT "FK_275e1bb3fdeea68f8356d8e1ebb" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "matches" ADD CONSTRAINT "FK_5bba7c6d8304e132d56d41da66c" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "matches" ADD CONSTRAINT "FK_158937fad2656c04df4b2a60f03" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "matches" ADD CONSTRAINT "FK_7cf858773d39d769f46fdfe935c" FOREIGN KEY ("requester_pet_id") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "matches" ADD CONSTRAINT "FK_e16044cc5322d9825b32d479519" FOREIGN KEY ("recipient_pet_id") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "matches" DROP CONSTRAINT "FK_e16044cc5322d9825b32d479519"`);
        await queryRunner.query(`ALTER TABLE "matches" DROP CONSTRAINT "FK_7cf858773d39d769f46fdfe935c"`);
        await queryRunner.query(`ALTER TABLE "matches" DROP CONSTRAINT "FK_158937fad2656c04df4b2a60f03"`);
        await queryRunner.query(`ALTER TABLE "matches" DROP CONSTRAINT "FK_5bba7c6d8304e132d56d41da66c"`);
        await queryRunner.query(`ALTER TABLE "pets" DROP CONSTRAINT "FK_275e1bb3fdeea68f8356d8e1ebb"`);
        await queryRunner.query(`DROP TABLE "matches"`);
        await queryRunner.query(`DROP TYPE "public"."matches_status_enum"`);
        await queryRunner.query(`DROP TABLE "pets"`);
        await queryRunner.query(`DROP TYPE "public"."pets_gender_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }

}
