import { MigrationInterface, QueryRunner } from "typeorm";

export class FixNullUsernames1703582400000 implements MigrationInterface {
    
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Update users with null usernames to use their email prefix or a generated username
        await queryRunner.query(`
            UPDATE users 
            SET username = CASE 
                WHEN username IS NULL AND email IS NOT NULL THEN 
                    CONCAT(SPLIT_PART(email, '@', 1), '_', EXTRACT(EPOCH FROM NOW())::INTEGER)
                WHEN username IS NULL THEN 
                    CONCAT('user_', id)
                ELSE username 
            END
            WHERE username IS NULL;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // This migration cannot be reverted as we don't know the original null values
    }
}
