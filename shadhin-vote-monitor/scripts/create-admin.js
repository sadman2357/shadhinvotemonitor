const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function createAdmin() {
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const question = (query) => new Promise((resolve) => readline.question(query, resolve));

    try {
        console.log('\n=== Create Admin User ===\n');

        const username = await question('Enter admin username: ');
        const password = await question('Enter admin password: ');
        const confirmPassword = await question('Confirm password: ');

        if (password !== confirmPassword) {
            console.error('❌ Passwords do not match!');
            process.exit(1);
        }

        if (password.length < 8) {
            console.error('❌ Password must be at least 8 characters!');
            process.exit(1);
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Insert admin
        await pool.query(
            `INSERT INTO admins (username, password_hash, role) 
       VALUES ($1, $2, 'admin')
       ON CONFLICT (username) DO UPDATE 
       SET password_hash = $2`,
            [username, passwordHash]
        );

        console.log('\n✅ Admin user created successfully!');
        console.log(`Username: ${username}`);
        console.log('\n⚠️  Please store these credentials securely!\n');

    } catch (error) {
        console.error('❌ Error creating admin:', error.message);
    } finally {
        readline.close();
        pool.end();
    }
}

createAdmin();
