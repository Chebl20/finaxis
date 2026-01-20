import 'dotenv/config.js';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!, {
  ssl: false,
  transform: {
    undefined: null,
  },
});

async function test() {
  try {
    const userId = '550e8400-e29b-41d4-a716-446655440001';
    
    console.log('Testing query...');
    console.log('DB URL:', process.env.DATABASE_URL);
    
    const result = await sql`
      SELECT 
        u.id, u.email, u.name, u.avatar_url, 
        u.created_at, u.updated_at, u.email_verified, u.status,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', t.id, 
                'name', t.name, 
                'slug', t.slug, 
                'role', m.role
              )
            )
            FROM memberships m
            JOIN tenants t ON m.tenant_id = t.id
            WHERE m.user_id = u.id
          ), 
          '[]'::json
        ) as tenants
      FROM users u
      WHERE u.id = ${userId}
      LIMIT 1;
    `;
    
    console.log('Result:', JSON.stringify(result, null, 2));
    console.log('Tenants type:', typeof result[0].tenants);
    console.log('Tenants value:', result[0].tenants);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sql.end();
  }
}

test();
