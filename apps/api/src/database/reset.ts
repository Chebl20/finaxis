import { sql, closeDatabase } from './connection.js';
import { logger } from '../utils/logger.js';

export async function reset() {
  try {
    logger.info('Resetting database...');

    await sql`DROP TABLE IF EXISTS audit_logs CASCADE;`;
    await sql`DROP TABLE IF EXISTS support_tickets CASCADE;`;
    await sql`DROP TABLE IF EXISTS rules CASCADE;`;
    await sql`DROP TABLE IF EXISTS transactions CASCADE;`;
    await sql`DROP TABLE IF EXISTS categories CASCADE;`;
    await sql`DROP TABLE IF EXISTS accounts CASCADE;`;
    await sql`DROP TABLE IF EXISTS memberships CASCADE;`;
    await sql`DROP TABLE IF EXISTS tenants CASCADE;`;
    await sql`DROP TABLE IF EXISTS users CASCADE;`;

    logger.info('Database reset completed');
    await closeDatabase();
  } catch (error) {
    logger.error('Reset failed:', error);
    await closeDatabase();
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  reset().then(() => process.exit(0)).catch(() => process.exit(1));
}
