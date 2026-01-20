import { sql } from './database/connection.js';

async function test() {
  try {
    const userId = '550e8400-e29b-41d4-a716-446655440001';
    
    console.log('Testing query...');
    
    const result = await sql`
      SELECT 
        u.id, u.email, u.name, u.avatar_url, 
        u.created_at, u.updated_at,
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
    if (result && result.length > 0) {
      console.log('Tenants type:', typeof result[0].tenants);
      console.log('Tenants value:', result[0].tenants);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

test();
