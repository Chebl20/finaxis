import { v4 as uuidv4 } from 'uuid';
import { sql } from '../database/connection.js';

export type CategoryType = 'income' | 'expense';

export interface Category {
  id: string;
  tenant_id: string;
  name: string;
  type: CategoryType;
  color: string | null;
  icon: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export async function createCategory(
  tenantId: string,
  name: string,
  type: CategoryType,
  color?: string | null,
  icon?: string | null,
): Promise<Category[]> {
  const id = uuidv4();

  return sql<Category[]>`
    INSERT INTO categories (id, tenant_id, name, type, color, icon)
    VALUES (${id}, ${tenantId}, ${name}, ${type}, ${color || null}, ${icon || null})
    RETURNING *;
  `;
}

export async function getTenantCategories(
  tenantId: string, 
  type?: CategoryType
): Promise<Category[]> {
  if (type) {
    return sql<Category[]>`
      SELECT * FROM categories
      WHERE tenant_id = ${tenantId} AND type = ${type} AND is_active = true
      ORDER BY name;
    `;
  }

  return sql<Category[]>`
    SELECT * FROM categories
    WHERE tenant_id = ${tenantId} AND is_active = true
    ORDER BY name;
  `;
}

export async function getCategoryById(categoryId: string): Promise<Category | null> {
  const result = await sql<Category[]>`
    SELECT * FROM categories WHERE id = ${categoryId};
  `;
  return result[0] || null;
}

export async function updateCategory(
  categoryId: string,
  updates: Partial<Omit<Category, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>>
): Promise<Category[]> {
  const { name, type, color, icon, is_active } = updates;
  
  // Handle undefined values by not including them in the update
  const updatesList = [];
  const values: any[] = [];
  
  if (name !== undefined) {
    updatesList.push(`name = $${updatesList.length + 1}`);
    values.push(name);
  }
  
  if (type !== undefined) {
    updatesList.push(`type = $${updatesList.length + 1}::category_type`);
    values.push(type);
  }
  
  if (color !== undefined) {
    updatesList.push(`color = $${updatesList.length + 1}`);
    values.push(color);
  }
  
  if (icon !== undefined) {
    updatesList.push(`icon = $${updatesList.length + 1}`);
    values.push(icon);
  }
  
  if (is_active !== undefined) {
    updatesList.push(`is_active = $${updatesList.length + 1}`);
    values.push(is_active);
  }
  
  if (updatesList.length === 0) {
    // No updates to make, return the current category
    const result = await sql<Category[]>`
      SELECT * FROM categories WHERE id = ${categoryId};
    `;
    return result;
  }
  
  // Add updated_at to updates
  updatesList.push(`updated_at = CURRENT_TIMESTAMP`);
  
  // Add categoryId to values for the WHERE clause
  values.push(categoryId);
  
  // Build and execute the query using sql.unsafe
  const query = sql.unsafe<Category[]>(
    `UPDATE categories SET ${updatesList.join(', ')} WHERE id = $${values.length} RETURNING *`,
    [...values]
  );
  
  return query;
}

export async function deleteCategory(categoryId: string): Promise<unknown> {
  return sql`
    DELETE FROM categories WHERE id = ${categoryId};
  `;
}
