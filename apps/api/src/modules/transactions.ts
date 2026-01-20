import { v4 as uuidv4 } from 'uuid';
import { sql } from '../database/connection.js';
import { NotFoundError } from '../utils/errors.js';

export type TransactionType = 'income' | 'expense' | 'transfer';
export type TransactionStatus = 'confirmed' | 'pending';

export interface Transaction {
  id: string;
  tenant_id: string;
  account_id: string;
  category_id: string;
  type: TransactionType;
  amount: number;
  description: string | null;
  transaction_date: Date;
  status: TransactionStatus;
  tags: string | null;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface TransactionFilters {
  accountId?: string;
  categoryId?: string;
  type?: TransactionType;
  status?: TransactionStatus;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export async function createTransaction(
  tenantId: string,
  accountId: string,
  categoryId: string,
  type: TransactionType,
  amount: number,
  createdBy: string,
  description: string | null = null,
  transactionDate: Date = new Date(),
  tags: string | null = null,
): Promise<Transaction> {
  const id = uuidv4();
  const txDate = transactionDate;

  const result = await sql<Transaction[]>`
    INSERT INTO transactions (
      id, tenant_id, account_id, category_id, type, amount,
      description, transaction_date, tags, created_by
    )
    VALUES (
      ${id}, ${tenantId}, ${accountId}, ${categoryId}, ${type}, ${amount},
      ${description || null}, ${txDate}, ${tags || null}, ${createdBy}
    )
    RETURNING *;
  `;

  try {
    // Update account balance
    const operation = type === 'income' ? '+' : '-';
    await sql`
      UPDATE accounts
      SET balance = balance ${sql.unsafe(operation)} ${amount}
      WHERE id = ${accountId};
    `;

    return result[0];
  } catch (error) {
    // Re-throw with more context
    throw new Error(`Failed to create transaction: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function getTenantTransactions(
  tenantId: string,
  filters: TransactionFilters = {}
): Promise<Transaction[]> {
  let query = sql<Transaction[]>`
    SELECT * FROM transactions
    WHERE tenant_id = ${tenantId}
  `;

  if (filters?.accountId) {
    query = sql`${query} AND account_id = ${filters.accountId}`;
  }

  if (filters?.categoryId) {
    query = sql`${query} AND category_id = ${filters.categoryId}`;
  }

  if (filters?.type) {
    query = sql`${query} AND type = ${filters.type}`;
  }

  if (filters?.startDate) {
    query = sql`${query} AND transaction_date >= ${filters.startDate}`;
  }

  if (filters?.endDate) {
    query = sql`${query} AND transaction_date <= ${filters.endDate}`;
  }

  query = sql`${query} ORDER BY transaction_date DESC`;

  if (filters?.limit) {
    query = sql`${query} LIMIT ${filters.limit}`;
  }

  if (filters?.offset) {
    query = sql`${query} OFFSET ${filters.offset}`;
  }

  return query;
}

export async function getTransactionById(transactionId: string): Promise<Transaction | null> {
  const result = await sql<Transaction[]>`
    SELECT * FROM transactions WHERE id = ${transactionId};
  `;
  return result[0] || null;
}

export async function updateTransaction(
  transactionId: string,
  updates: Partial<Omit<Transaction, 'id' | 'tenant_id' | 'created_at' | 'created_by'>>
): Promise<Transaction[]> {
  const { amount, description, status, tags, transaction_date } = updates;
  
  // Handle undefined values by not including them in the update
  const updatesList: string[] = [];
  const values: any[] = [];
  
  if (amount !== undefined) {
    updatesList.push(`amount = $${updatesList.length + 1}`);
    values.push(amount);
  }
  
  if (description !== undefined) {
    updatesList.push(`description = $${updatesList.length + 1}`);
    values.push(description);
  }
  
  if (status !== undefined) {
    updatesList.push(`status = $${updatesList.length + 1}::transaction_status`);
    values.push(status);
  }
  
  if (tags !== undefined) {
    updatesList.push(`tags = $${updatesList.length + 1}`);
    values.push(tags);
  }
  
  if (transaction_date !== undefined) {
    updatesList.push(`transaction_date = $${updatesList.length + 1}`);
    values.push(transaction_date);
  }
  
  if (updatesList.length === 0) {
    // No updates to make, return the current transaction
    const result = await sql<Transaction[]>`
      SELECT * FROM transactions WHERE id = ${transactionId};
    `;
    return result;
  }
  
  // Add updated_at to updates
  updatesList.push(`updated_at = CURRENT_TIMESTAMP`);
  
  // Add transactionId to values for the WHERE clause
  values.push(transactionId);
  
  // Build and execute the query using sql.unsafe
  const query = sql.unsafe<Transaction[]>(
    `UPDATE transactions SET ${updatesList.join(', ')} WHERE id = $${values.length} RETURNING *`,
    [...values]
  );
  
  return query;
}

export async function deleteTransaction(transactionId: string): Promise<unknown> {
  // Get transaction to reverse balance
  const transaction = await getTransactionById(transactionId);
  if (!transaction) {
    throw new NotFoundError('Transaction not found');
  }

  // Reverse balance
  const operation = transaction.type === 'income' ? '-' : '+';
  await sql`
    UPDATE accounts
    SET balance = balance ${sql.unsafe(operation)} ${transaction.amount}
    WHERE id = ${transaction.account_id};
  `;

  return sql`
    DELETE FROM transactions WHERE id = ${transactionId};
  `;
}

export async function getDashboardSummary(tenantId: string) {
  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalIncome,
    totalExpense,
    totalBalance,
    topCategories,
    monthComparison,
  ] = await Promise.all([
    // Current month income
    sql`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM transactions
      WHERE tenant_id = ${tenantId} AND type = 'income'
      AND transaction_date >= ${currentMonth}
      AND transaction_date < ${new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)};
    `,
    // Current month expense
    sql`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM transactions
      WHERE tenant_id = ${tenantId} AND type = 'expense'
      AND transaction_date >= ${currentMonth}
      AND transaction_date < ${new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)};
    `,
    // Total balance
    sql`
      SELECT COALESCE(SUM(balance), 0) as total
      FROM accounts
      WHERE tenant_id = ${tenantId};
    `,
    // Top categories
    sql`
      SELECT c.name, c.type, COUNT(*) as count, SUM(t.amount) as total
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.tenant_id = ${tenantId}
      AND t.transaction_date >= ${new Date(new Date().getFullYear(), new Date().getMonth(), 1)}
      GROUP BY c.id, c.name, c.type
      ORDER BY total DESC
      LIMIT 5;
    `,
    // Last month for comparison
    sql`
      SELECT type, COALESCE(SUM(amount), 0) as total
      FROM transactions
      WHERE tenant_id = ${tenantId}
      AND transaction_date >= ${lastMonth}
      AND transaction_date <= ${lastMonthEnd}
      GROUP BY type;
    `,
  ]);

  return {
    currentMonth: {
      income: totalIncome[0]?.total || 0,
      expense: totalExpense[0]?.total || 0,
    },
    totalBalance: totalBalance[0]?.total || 0,
    topCategories: topCategories || [],
    lastMonthComparison: monthComparison || [],
  };
}
