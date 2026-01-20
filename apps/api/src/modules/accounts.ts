import { v4 as uuidv4 } from 'uuid';
import { sql } from '../database/connection.js';

export type AccountType = 'bank' | 'cash' | 'credit_card' | 'investment' | 'savings';

export interface Account {
  id: string;
  tenant_id: string;
  name: string;
  type: AccountType;
  balance: number;
  initial_balance: number;
  currency: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export async function createAccount(
  tenantId: string,
  name: string,
  type: AccountType,
  initialBalance: number = 0,
): Promise<Account[]> {
  const id = uuidv4();

  return sql<Account[]>`
    INSERT INTO accounts (id, tenant_id, name, type, balance, initial_balance)
    VALUES (${id}, ${tenantId}, ${name}, ${type}, ${initialBalance}, ${initialBalance})
    RETURNING *;
  `;
}

export async function getTenantAccounts(tenantId: string): Promise<Account[]> {
  return sql<Account[]>`
    SELECT * FROM accounts
    WHERE tenant_id = ${tenantId}
    ORDER BY created_at DESC;
  `;
}

export async function getAccountById(accountId: string): Promise<Account | null> {
  const result = await sql<Account[]>`
    SELECT * FROM accounts WHERE id = ${accountId};
  `;
  return result[0] || null;
}

export async function updateAccount(
  accountId: string,
  updates: Partial<Omit<Account, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>>
): Promise<Account[]> {
  const { name, type, balance, is_active } = updates;
  
  // Handle undefined values by not including them in the update
  const updatesList = [];
  const values: any[] = [];
  
  if (name !== undefined) {
    updatesList.push(`name = $${updatesList.length + 1}`);
    values.push(name);
  }
  
  if (type !== undefined) {
    updatesList.push(`type = $${updatesList.length + 1}::account_type`);
    values.push(type);
  }
  
  if (balance !== undefined) {
    updatesList.push(`balance = $${updatesList.length + 1}`);
    values.push(balance);
  }
  
  if (is_active !== undefined) {
    updatesList.push(`is_active = $${updatesList.length + 1}`);
    values.push(is_active);
  }
  
  if (updatesList.length === 0) {
    // No updates to make, return the current account
    const result = await sql<Account[]>`
      SELECT * FROM accounts WHERE id = ${accountId};
    `;
    return result;
  }
  
  // Add updated_at to updates
  updatesList.push(`updated_at = CURRENT_TIMESTAMP`);
  
  // Add accountId to values for the WHERE clause
  values.push(accountId);
  
  // Build the query
  const query = sql.unsafe<Account[]>(
    `UPDATE accounts SET ${updatesList.join(', ')} WHERE id = $${values.length} RETURNING *`,
    [...values]
  );
  
  return query;
}

export async function deleteAccount(accountId: string) {
  return sql`
    DELETE FROM accounts WHERE id = ${accountId};
  `;
}
