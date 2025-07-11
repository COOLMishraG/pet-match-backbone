import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNotificationsToUsers1752241372835 implements MigrationInterface {
    name = 'AddNotificationsToUsers1752241372835'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "notifications" text array DEFAULT '{}'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "notifications"`);
    }

}
