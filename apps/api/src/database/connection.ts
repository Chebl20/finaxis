import 'dotenv/config.js';
import postgres from 'postgres';
import { logger } from '../utils/logger.js';

const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/finaxis_dev';

export const sql = postgres(connectionString, {
  ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
  transform: {
    undefined: null,
  },
});

export async function connectDatabase() {
  try {
    await sql`SELECT 1`;
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error('Database connection failed:', error);
    process.exit(1);
  }
}

export async function closeDatabase() {
  await sql.end();
  logger.info('Database connection closed');
}
