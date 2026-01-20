import { v4 as uuidv4 } from 'uuid';
import { sql } from '../database/connection.js';
import { AppError } from '../utils/errors.js';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  created_at: Date;
  updated_at: Date;
}

export async function createTenant(userId: string, name: string, slug: string) {
  const id = uuidv4();

  try {
    const tenantResult = await sql<Tenant[]>`
      INSERT INTO tenants (id, name, slug)
      VALUES (${id}, ${name}, ${slug})
      RETURNING *;
    `;

    const tenant = tenantResult[0];

    // Add creator as owner
    await sql`
      INSERT INTO memberships (user_id, tenant_id, role)
      VALUES (${userId}, ${tenant.id}, 'owner');
    `;

    return tenant;
  } catch (error: any) {
    if (error.message?.includes('unique constraint')) {
      throw new AppError('Slug already in use', 400);
    }
    throw error;
  }
}

export async function getTenantById(id: string) {
  const result = await sql<Tenant[]>`
    SELECT * FROM tenants WHERE id = ${id};
  `;
  return result[0] || null;
}

export async function getUserTenants(userId: string) {
  return sql`
    SELECT t.*, m.role
    FROM tenants t
    JOIN memberships m ON t.id = m.tenant_id
    WHERE m.user_id = ${userId};
  `;
}

export async function inviteUserToTenant(
  tenantId: string,
  email: string,
  role: string = 'member',
) {
  // Find or create user (simplified for MVP)
  let user = await sql<any[]>`
    SELECT id FROM users WHERE email = ${email};
  `;

  if (!user.length) {
    throw new AppError('User not found. Invite them to create an account first.', 404);
  }

  const userId = user[0].id;

  // Check if already a member
  const existing = await sql<any[]>`
    SELECT id FROM memberships WHERE user_id = ${userId} AND tenant_id = ${tenantId};
  `;

  if (existing.length > 0) {
    throw new AppError('User is already a member of this tenant', 400);
  }

  // Add membership
  return sql`
    INSERT INTO memberships (user_id, tenant_id, role)
    VALUES (${userId}, ${tenantId}, ${role});
  `;
}
