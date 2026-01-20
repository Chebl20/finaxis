import { sql } from './connection.js';
import { logger } from '../utils/logger.js';
import crypto from 'crypto';

// Helper to generate UUIDs
function generateUUID(): string {
  return crypto.randomUUID();
}

export async function seed() {
  try {
    logger.info('Starting seed...');

    // Clear existing data (development only!)
    await sql`DELETE FROM memberships;`;
    await sql`DELETE FROM users;`;
    await sql`DELETE FROM tenants;`;

    // Password hash for "123456"
    const userPassword = '$2a$10$1qfGZT4DjBCtKLIquRoFs.M8Zkc8piAAqHHf8Dp19qJNImvzBwY8W';

    // Create multiple test users
    const users = [
      { id: '550e8400-e29b-41d4-a716-446655440001', email: 'demo@finaxis.com', name: 'Demo User' },
      { id: '550e8400-e29b-41d4-a716-446655440003', email: 'admin@finaxis.com', name: 'Admin User' },
      { id: generateUUID(), email: 'manager1@company1.com', name: 'Gerente da Empresa 1' },
      { id: generateUUID(), email: 'manager2@company2.com', name: 'Gerente da Empresa 2' },
      { id: generateUUID(), email: 'manager3@company3.com', name: 'Gerente da Empresa 3' },
      { id: generateUUID(), email: 'accountant@company1.com', name: 'Contador Empresa 1' },
    ];

    for (const user of users) {
      await sql`
        INSERT INTO users (id, email, name, password_hash)
        VALUES (${user.id}, ${user.email}, ${user.name}, ${userPassword})
        ON CONFLICT (email) DO NOTHING;
      `;
    }

    // Create multiple tenants (companies)
    const tenants = [
      { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Demo Company', slug: 'demo-company' },
      { id: generateUUID(), name: 'Tech Solutions Ltda', slug: 'tech-solutions' },
      { id: generateUUID(), name: 'Comércio e Distribuição', slug: 'comercio-dist' },
      { id: generateUUID(), name: 'Consultoria Empresarial', slug: 'consultoria-emp' },
      { id: generateUUID(), name: 'Serviços de TI', slug: 'servicos-ti' },
      { id: generateUUID(), name: 'Varejo Premium', slug: 'varejo-premium' },
    ];

    for (const tenant of tenants) {
      await sql`
        INSERT INTO tenants (id, name, slug)
        VALUES (${tenant.id}, ${tenant.name}, ${tenant.slug})
        ON CONFLICT (slug) DO NOTHING;
      `;
    }

    // Create memberships
    const memberships = [
      { userId: users[0].id, tenantId: tenants[0].id, role: 'owner' },
      { userId: users[1].id, tenantId: tenants[0].id, role: 'admin' },
      { userId: users[2].id, tenantId: tenants[1].id, role: 'owner' },
      { userId: users[3].id, tenantId: tenants[2].id, role: 'owner' },
      { userId: users[4].id, tenantId: tenants[3].id, role: 'owner' },
      { userId: users[0].id, tenantId: tenants[1].id, role: 'member' },
      { userId: users[5].id, tenantId: tenants[0].id, role: 'member' },
    ];

    for (const membership of memberships) {
      await sql`
        INSERT INTO memberships (user_id, tenant_id, role)
        VALUES (${membership.userId}, ${membership.tenantId}, ${membership.role})
        ON CONFLICT (user_id, tenant_id) DO NOTHING;
      `;
    }

    // Create accounts for each tenant
    const accountsPerTenant = [
      { name: 'Caixa', type: 'cash', initialBalance: 1000 },
      { name: 'Banco Principal', type: 'bank', initialBalance: 5000 },
      { name: 'Banco Secundário', type: 'bank', initialBalance: 2500 },
      { name: 'Cartão de Crédito', type: 'credit_card', initialBalance: 0 },
      { name: 'Poupança', type: 'bank', initialBalance: 10000 },
    ];

    for (const tenant of tenants) {
      for (const account of accountsPerTenant) {
        await sql`
          INSERT INTO accounts (tenant_id, name, type, balance, initial_balance)
          VALUES (${tenant.id}, ${account.name}, ${account.type}, ${account.initialBalance}, ${account.initialBalance})
          ON CONFLICT DO NOTHING;
        `;
      }
    }

    // Create default categories for all tenants
    const categories = [
      { name: 'Venda de Produtos', type: 'income', color: '#10b981', icon: 'trending-up' },
      { name: 'Serviços Prestados', type: 'income', color: '#10b981', icon: 'briefcase' },
      { name: 'Consultoria', type: 'income', color: '#059669', icon: 'lightbulb' },
      { name: 'Royalties', type: 'income', color: '#047857', icon: 'award' },
      { name: 'Aluguel', type: 'expense', color: '#ef4444', icon: 'home' },
      { name: 'Salários', type: 'expense', color: '#ef4444', icon: 'users' },
      { name: 'Utilidades', type: 'expense', color: '#ef4444', icon: 'zap' },
      { name: 'Materiais e Suprimentos', type: 'expense', color: '#ef4444', icon: 'box' },
      { name: 'Marketing', type: 'expense', color: '#f59e0b', icon: 'megaphone' },
      { name: 'Viagens', type: 'expense', color: '#f59e0b', icon: 'plane' },
      { name: 'Manutenção', type: 'expense', color: '#f97316', icon: 'wrench' },
      { name: 'Impostos', type: 'expense', color: '#dc2626', icon: 'receipt' },
      { name: 'Juros e Taxas', type: 'expense', color: '#991b1b', icon: 'trending-down' },
      { name: 'Outros', type: 'expense', color: '#6b7280', icon: 'more-horizontal' },
    ];

    for (const tenant of tenants) {
      for (const category of categories) {
        await sql`
          INSERT INTO categories (tenant_id, name, type, color, icon)
          VALUES (${tenant.id}, ${category.name}, ${category.type}, ${category.color}, ${category.icon})
          ON CONFLICT (tenant_id, name, type) DO NOTHING;
        `;
      }
    }

    // Seed sample transactions for Demo Company
    const demoTenantId = tenants[0].id;
    const demoUserId = users[0].id;
    const transactionDescriptions = {
      income: [
        'Venda de produto A',
        'Venda de produto B',
        'Venda de produto C',
        'Serviço consultoria cliente X',
        'Serviço consultoria cliente Y',
        'Royalties do mês',
        'Reembolso de cliente',
        'Venda em lote',
        'Contrato anual',
        'Projeto de desenvolvimento',
      ],
      expense: [
        'Aluguel do mês',
        'Salário funcionário 1',
        'Salário funcionário 2',
        'Conta de luz',
        'Conta de água',
        'Conta de telefone',
        'Compra de materiais',
        'Compra de estoque',
        'Campanha marketing Google',
        'Campanha marketing Facebook',
        'Viagem cliente',
        'Manutenção equipamento',
        'Juros empréstimo',
        'Taxa bancária',
      ],
    };

    // Generate transactions for the past 90 days
    const today = new Date();
    for (let i = 0; i < 50; i++) {
      const daysAgo = Math.floor(Math.random() * 90);
      const transactionDate = new Date(today);
      transactionDate.setDate(transactionDate.getDate() - daysAgo);

      const isIncome = Math.random() > 0.6;
      const descriptions = isIncome ? transactionDescriptions.income : transactionDescriptions.expense;
      const description = descriptions[Math.floor(Math.random() * descriptions.length)];

      const amount = isIncome
        ? (Math.random() * 5000 + 500).toFixed(2) // Income: 500-5500
        : (Math.random() * 3000 + 100).toFixed(2); // Expense: 100-3100

      const incomeCategoryId = await sql`SELECT id FROM categories WHERE tenant_id = ${demoTenantId} AND type = 'income' LIMIT 1`;
      const expenseCategoryId = await sql`SELECT id FROM categories WHERE tenant_id = ${demoTenantId} AND type = 'expense' LIMIT 1`;

      const categoryId = isIncome && incomeCategoryId.length > 0 ? incomeCategoryId[0].id : expenseCategoryId.length > 0 ? expenseCategoryId[0].id : null;

      if (categoryId) {
        const accountId = await sql`SELECT id FROM accounts WHERE tenant_id = ${demoTenantId} LIMIT 1`;
        if (accountId.length > 0) {
          await sql`
            INSERT INTO transactions (tenant_id, account_id, category_id, description, type, amount, transaction_date, created_by)
            VALUES (${demoTenantId}, ${accountId[0].id}, ${categoryId}, ${description}, ${isIncome ? 'income' : 'expense'}, ${parseFloat(amount)}, ${transactionDate.toISOString().split('T')[0]}, ${demoUserId})
          `;
        }
      }
    }

    logger.info('Seed completed successfully');
  } catch (error) {
    logger.error('Seed failed:', error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seed().then(() => process.exit(0)).catch(() => process.exit(1));
}
