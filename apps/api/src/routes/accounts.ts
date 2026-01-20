import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { createAccountSchema } from '../utils/validation.js';
import { createAccount, getTenantAccounts, getAccountById, updateAccount, deleteAccount, Account } from '../modules/accounts.js';
import { handleErrorResponse, NotFoundError } from '../utils/errors.js';

// Type definitions for request bodies and parameters
type CreateAccountBody = {
  name: string;
  type: 'bank' | 'cash' | 'credit_card' | 'investment' | 'savings';
  initialBalance?: number;
};

type UpdateAccountBody = Partial<Omit<Account, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>>;

export async function accountRoutes(fastify: FastifyInstance) {
  fastify.post<{ 
    Body: CreateAccountBody; 
    Params: { tenantId: string } 
  }>(
    '/tenants/:tenantId/accounts',
    { 
      onRequest: [fastify.authenticate],
      schema: {
        body: {
          type: 'object',
          required: ['name', 'type'],
          additionalProperties: false,
          properties: {
            name: { type: 'string', minLength: 2, maxLength: 100 },
            type: { type: 'string', enum: ['bank', 'cash', 'credit_card', 'investment', 'savings'] },
            initialBalance: { type: 'number', minimum: 0 },
            currency: { type: 'string', pattern: '^[A-Z]{3}$' },
            description: { type: 'string', maxLength: 500 }
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
        const { name, type, initialBalance } = createAccountSchema.parse(request.body);

        const accounts = await createAccount(
          tenantId,
          name,
          type,
          initialBalance || 0,
        );

        reply.send({
          account: accounts[0],
        });
      } catch (error) {
        handleErrorResponse(error, reply);
      }
    },
  );

  fastify.get<{ 
    Params: { tenantId: string } 
  }>(
    '/tenants/:tenantId/accounts',
    { 
      onRequest: [fastify.authenticate],
      schema: {
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

        const accounts = await getTenantAccounts(tenantId);

        reply.send({
          accounts,
        });
      } catch (error) {
        handleErrorResponse(error, reply);
      }
    },
  );

  fastify.get<{ 
    Params: { 
      tenantId: string; 
      accountId: string;
    } 
  }>(
    '/tenants/:tenantId/accounts/:accountId',
    { 
      onRequest: [fastify.authenticate],
      schema: {
        params: {
          type: 'object',
          required: ['tenantId', 'accountId'],
          properties: {
            tenantId: { type: 'string', format: 'uuid' },
            accountId: { type: 'string', format: 'uuid' }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const { accountId } = request.params as { accountId: string };

        const account = await getAccountById(accountId);
        if (!account) {
          throw new NotFoundError('Account not found');
        }

        reply.send({
          account,
        });
      } catch (error) {
        handleErrorResponse(error, reply);
      }
    },
  );

  fastify.put<{ 
    Body: UpdateAccountBody; 
    Params: { 
      tenantId: string; 
      accountId: string;
    } 
  }>(
    '/tenants/:tenantId/accounts/:accountId',
    { 
      onRequest: [fastify.authenticate],
      schema: {
        params: {
          type: 'object',
          required: ['tenantId', 'accountId'],
          properties: {
            tenantId: { type: 'string', format: 'uuid' },
            accountId: { type: 'string', format: 'uuid' }
          }
        },
        body: {
          type: 'object',
          additionalProperties: false,
          properties: {
            name: { type: 'string', minLength: 2, maxLength: 100 },
            type: { type: 'string', enum: ['bank', 'cash', 'credit_card', 'investment', 'savings'] },
            initialBalance: { type: 'number', minimum: 0 },
            currency: { type: 'string', pattern: '^[A-Z]{3}$' },
            description: { type: 'string', maxLength: 500 }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const { accountId } = request.params as { accountId: string };

        const accounts = await updateAccount(accountId, request.body);

        reply.send({
          account: accounts[0],
        });
      } catch (error) {
        handleErrorResponse(error, reply);
      }
    },
  );

  fastify.delete<{ 
    Params: { 
      tenantId: string; 
      accountId: string;
    } 
  }>(
    '/tenants/:tenantId/accounts/:accountId',
    { 
      onRequest: [fastify.authenticate],
      schema: {
        params: {
          type: 'object',
          required: ['tenantId', 'accountId'],
          properties: {
            tenantId: { type: 'string', format: 'uuid' },
            accountId: { type: 'string', format: 'uuid' }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const { accountId } = request.params as { accountId: string };

        await deleteAccount(accountId);

        reply.send({
          message: 'Account deleted successfully',
        });
      } catch (error) {
        handleErrorResponse(error, reply);
      }
    },
  );
}
