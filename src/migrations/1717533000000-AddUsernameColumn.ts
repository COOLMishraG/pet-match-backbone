import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUsernameColumn1717533000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // First check if username column exists
        const hasUsernameColumn = await queryRunner.hasColumn('users', 'username');
        if (!hasUsernameColumn) {
            // Add username column
            await queryRunner.query(`ALTER TABLE "users" ADD "username" character varying NOT NULL DEFAULT ''`);
            // Make it unique
            await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username")`);
            
            // Set default values for existing users based on email
            await queryRunner.query(`
                UPDATE "users"
                SET "username" = SUBSTRING(email FROM 1 FOR POSITION('@' IN email) - 1)
                WHERE "username" = ''
            `);
        }

        // Check if displayName column exists
        const hasDisplayNameColumn = await queryRunner.hasColumn('users', 'displayName');
        if (!hasDisplayNameColumn) {
            // Add displayName column
            await queryRunner.query(`ALTER TABLE "users" ADD "displayName" character varying`);
            
            // Set default displayName based on email for existing users
            await queryRunner.query(`
                UPDATE "users"
                SET "displayName" = SUBSTRING(email FROM 1 FOR POSITION('@' IN email) - 1)
                WHERE "displayName" IS NULL
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Don't drop these columns in down migration as it could cause data loss
        // Just log that this needs manual intervention
        console.log('Manual intervention required to reverse these changes');
    }
}