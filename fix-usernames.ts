import { AppDataSource } from './src/data-source';

async function fixNullUsernames() {
    try {
        // Initialize the data source
        await AppDataSource.initialize();
        
        console.log('🔧 Fixing null usernames...');
        
        // Update users with null usernames
        const result = await AppDataSource.query(`
            UPDATE users 
            SET username = CASE 
                WHEN username IS NULL AND email IS NOT NULL THEN 
                    CONCAT('user_', REPLACE(SPLIT_PART(email, '@', 1), '.', '_'))
                WHEN username IS NULL THEN 
                    CONCAT('user_', SUBSTRING(id::text, 1, 8))
                ELSE username 
            END
            WHERE username IS NULL;
        `);
        
        console.log('✅ Fixed usernames for', result.affectedRows || 'unknown number of', 'users');
        
        // Close the connection
        await AppDataSource.destroy();
        
    } catch (error) {
        console.error('❌ Error fixing usernames:', error);
        process.exit(1);
    }
}

// Run the fix
fixNullUsernames();
