import { sql } from './db';

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

async function main() {
  console.log('Attempting to create database tables...');
  await createTables();
  console.log('Database tables created successfully.');
  process.exit(0);
}

// Check if the script is run directly
if (require.main === module) {
  main().catch((err) => {
    console.error('An error occurred during database initialization:', err);
    process.exit(1);
  });
}
