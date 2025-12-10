import { loadEnvConfig } from '@next/env';
import { sql } from './db';

function ensureEnv() {
  // Load Next.js-style env files (e.g., .env.local) so the CLI script can use them.
  loadEnvConfig(process.cwd());

  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL fehlt. Bitte in .env.local setzen (Vercel Postgres Connection String).');
  }
}

async function createTables() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('Created "users" table');

    await sql`
      CREATE TABLE IF NOT EXISTS progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        level_id INTEGER NOT NULL,
        event_type VARCHAR(50), -- 'LEVEL_COMPLETE', 'REFLECTION', 'CREDITS_UPDATE', 'START_SESSION'
        payload JSONB, -- Flexible field for text answers, stats, or session details
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('Created "progress" table');

    return {
      users: true,
      progress: true,
    };
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
}

async function runMigrations() {
  try {
    // Migration: Add teacher column to users table (preserves existing data)
    await sql`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS teacher VARCHAR(255) DEFAULT NULL;
    `;
    console.log('Migration: Added "teacher" column to users table');

    return { migrations: true };
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  }
}

async function main() {
  console.log('Attempting to create database tables...');
  ensureEnv();
  await createTables();
  console.log('Database tables created successfully.');

  console.log('Running migrations...');
  await runMigrations();
  console.log('Migrations completed successfully.');

  process.exit(0);
}

// Check if the script is run directly
if (require.main === module) {
  main().catch((err) => {
    console.error('An error occurred during database initialization:', err);
    process.exit(1);
  });
}
