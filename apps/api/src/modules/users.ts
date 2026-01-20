import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { sql } from '../database/connection.js';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

// Type for user data that can be safely returned (without password)
export type SafeUser = Omit<User, 'password_hash'>;

export interface User {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  avatar_url: string | null;
  created_at: Date;
  updated_at: Date;
}

export async function createUser(
  email: string, 
  password: string, 
  name: string
): Promise<SafeUser> {
  const id = uuidv4();
  const passwordHash = await bcrypt.hash(password, 10);
  const now = new Date();

  try {
    const [user] = await sql<[User]>`
      INSERT INTO users (
        id, email, password_hash, name, 
        created_at, updated_at, email_verified, status
      )
      VALUES (
        ${id}, ${email}, ${passwordHash}, ${name}, 
        ${now}, ${now}, false, 'active'::user_status
      )
      RETURNING *;
    `;
    
    // Remove password_hash before returning
    const { password_hash, ...safeUser } = user;
    return safeUser;
  } catch (error: unknown) {
    if (error instanceof Error && error.message?.includes('unique constraint')) {
      throw new AppError('Email already registered', 400);
    }
    throw error;
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const [user] = await sql<[User] | []>`
    SELECT * FROM users WHERE email = ${email} LIMIT 1;
  `;
  return user || null;
}

export async function getUserById(id: string): Promise<User | null> {
  const [user] = await sql<[User] | []>`
    SELECT * FROM users WHERE id = ${id} LIMIT 1;
  `;
  return user || null;
}

export async function validatePassword(hash: string, password: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Interface para o objeto de tenant retornado na consulta
interface TenantInfo {
  id: string;
  name: string;
  slug: string;
  role: string;
}

// Interface para o resultado da consulta de usuário com tenants
interface UserWithTenants extends Omit<User, 'password_hash'> {
  tenants: TenantInfo[];
}

/**
 * Obtém um usuário com suas informações de tenants associadas
 * @param userId ID do usuário
 * @returns Objeto com informações do usuário e array de tenants
 */
export async function getUserWithTenants(userId: string): Promise<UserWithTenants | null> {
  try {
    const [result] = await sql<[UserWithTenants] | []>`
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
    
    return result || null;
  } catch (error) {
    logger.error('Error fetching user with tenants:', error);
    throw new AppError('Error fetching user data', 500);
  }
}
