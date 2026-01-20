import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { createTransactionSchema } from '../utils/validation.js';
import { 
  createTransaction, 
  getTenantTransactions, 
  getTransactionById, 
  updateTransaction, 
  deleteTransaction, 
  getDashboardSummary,
  Transaction,
  TransactionType,
  TransactionFilters
} from '../modules/transactions.js';
import { handleErrorResponse, NotFoundError } from '../utils/errors.js';

// Type definitions for request bodies and parameters
type CreateTransactionBody = {
  accountId: string;
  categoryId: string;
  type: TransactionType;
  amount: number;
  description?: string | null;
  transactionDate?: string | Date;
  tags?: string | null;
};

type UpdateTransactionBody = Partial<Omit<Transaction, 'id' | 'tenant_id' | 'created_at' | 'created_by' | 'updated_at'>>;

type TransactionQueryParams = {
  accountId?: string;
  categoryId?: string;
  type?: TransactionType;
  startDate?: string;
  endDate?: string;
  limit?: string;
  offset?: string;
};

export async function transactionRoutes(fastify: FastifyInstance) {
  fastify.post<{ 
    Body: CreateTransactionBody; 
    Params: { tenantId: string } 
  }>(
    '/tenants/:tenantId/transactions',
    { 
      onRequest: [fastify.authenticate],
      schema: {
        body: {
          type: 'object',
          required: ['accountId', 'categoryId', 'type', 'amount'],
          additionalProperties: false,
          properties: {
            accountId: { type: 'string', format: 'uuid' },
            categoryId: { type: 'string', format: 'uuid' },
            type: { type: 'string', enum: ['income', 'expense', 'transfer'] },
            amount: { type: 'number', minimum: 0 },
            description: { type: 'string' },
            transactionDate: { type: 'string', format: 'date-time' },
            tags: { type: 'string' }
          }
        },
        params: {
          type: 'object',
          required: ['tenantId'],
          properties: {
            tenantId: { type: 'string', format: 'uuid' }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const { tenantId } = request.params as { tenantId: string };

        if (!request.user) {
          throw new Error('User not authenticated');
        }

        const {
          accountId,
          categoryId,
          type,
          amount,
          description,
          transactionDate,
          tags,
        } = createTransactionSchema.parse(request.body);

        const transaction = await createTransaction(
          tenantId,
          accountId,
          categoryId,
          type,
          amount,
          request.user.userId,
          description,
          transactionDate ? new Date(transactionDate) : undefined,
          tags ? JSON.stringify(tags) : null,
        );

        reply.send({
          transaction,
        });
      } catch (error) {
        handleErrorResponse(error, reply);
      }
    },
  );

  fastify.get<{
    Params: { tenantId: string };
    Querystring: TransactionQueryParams;
  }>(
    '/tenants/:tenantId/transactions',
    { 
      onRequest: [fastify.authenticate],
      schema: {
        params: {
          type: 'object',
          required: ['tenantId'],
          properties: {
            tenantId: { type: 'string', format: 'uuid' }
          }
        },
        querystring: {
          type: 'object',
          additionalProperties: false,
          properties: {
            accountId: { type: 'string', format: 'uuid' },
            categoryId: { type: 'string', format: 'uuid' },
            type: { type: 'string', enum: ['income', 'expense', 'transfer'] },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            limit: { type: 'string', pattern: '^\\d+$' },
            offset: { type: 'string', pattern: '^\\d+$' }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const { tenantId } = request.params;
        const { 
          accountId, 
          categoryId, 
          type, 
          startDate, 
          endDate, 
          limit, 
          offset 
        } = request.query;

        const filters: TransactionFilters = {
          ...(accountId && { accountId }),
          ...(categoryId && { categoryId }),
          ...(type && { type }),
          ...(startDate && { startDate: new Date(startDate) }),
          ...(endDate && { endDate: new Date(endDate) }),
          ...(limit && { limit: parseInt(limit, 10) }),
          ...(offset && { offset: parseInt(offset, 10) })
        };

        const transactions = await getTenantTransactions(tenantId, filters);

        reply.send({
          transactions,
        });
      } catch (error) {
        handleErrorResponse(error, reply);
      }
    },
  );

  fastify.get<{ 
    Params: { 
      tenantId: string; 
      transactionId: string 
    } 
  }>(
    '/tenants/:tenantId/transactions/:transactionId',
    { 
      onRequest: [fastify.authenticate],
      schema: {
        params: {
          type: 'object',
          required: ['tenantId', 'transactionId'],
          properties: {
            tenantId: { type: 'string', format: 'uuid' },
            transactionId: { type: 'string', format: 'uuid' }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const { transactionId } = request.params as { transactionId: string };

        const transaction = await getTransactionById(transactionId);
        if (!transaction) {
          throw new NotFoundError('Transaction not found');
        }

        reply.send({
          transaction,
        });
      } catch (error) {
        handleErrorResponse(error, reply);
      }
    },
  );

  fastify.put<{ 
    Body: UpdateTransactionBody; 
    Params: { 
      tenantId: string; 
      transactionId: string 
    } 
  }>(
    '/tenants/:tenantId/transactions/:transactionId',
    { 
      onRequest: [fastify.authenticate],
      schema: {
        params: {
          type: 'object',
          required: ['tenantId', 'transactionId'],
          properties: {
            tenantId: { type: 'string', format: 'uuid' },
            transactionId: { type: 'string', format: 'uuid' }
          }
        },
        body: {
          type: 'object',
          additionalProperties: false,
          properties: {
            accountId: { type: 'string', format: 'uuid' },
            categoryId: { type: 'string', format: 'uuid' },
            type: { type: 'string', enum: ['income', 'expense', 'transfer'] },
            amount: { type: 'number', minimum: 0 },
            description: { type: 'string' },
            transactionDate: { type: 'string', format: 'date-time' },
            tags: { type: 'string' }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const { transactionId } = request.params as { transactionId: string };

        const transactions = await updateTransaction(transactionId, request.body);

        reply.send({
          transaction: transactions[0],
        });
      } catch (error) {
        handleErrorResponse(error, reply);
      }
    },
  );

  fastify.delete<{ 
    Params: { 
      tenantId: string; 
      transactionId: string 
    } 
  }>(
    '/tenants/:tenantId/transactions/:transactionId',
    { 
      onRequest: [fastify.authenticate],
      schema: {
        params: {
          type: 'object',
          required: ['tenantId', 'transactionId'],
          properties: {
            tenantId: { type: 'string', format: 'uuid' },
            transactionId: { type: 'string', format: 'uuid' }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const { transactionId } = request.params as { transactionId: string };

        await deleteTransaction(transactionId);

        reply.send({
          message: 'Transaction deleted successfully',
        });
      } catch (error) {
        handleErrorResponse(error, reply);
      }
    },
  );

  fastify.get<{ Params: { tenantId: string } }>(
    '/tenants/:tenantId/dashboard/summary',
    { onRequest: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { tenantId } = request.params as { tenantId: string };

        const summary = await getDashboardSummary(tenantId);

        reply.send({
          summary,
        });
      } catch (error) {
        handleErrorResponse(error, reply);
      }
    },
  );
}
