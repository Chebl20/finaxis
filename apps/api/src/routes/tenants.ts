import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  createTenantSchema,
  inviteUserSchema,
} from '../utils/validation.js';
import {
  createTenant,
  getTenantById,
  getUserTenants,
  inviteUserToTenant,
} from '../modules/tenants.js';
import { handleErrorResponse } from '../utils/errors.js';

export async function tenantRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: any }>(
    '/tenants',
    { onRequest: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { name, slug } = createTenantSchema.parse(request.body);

        if (!request.user) {
          throw new Error('User not authenticated');
        }

        const tenant = await createTenant(request.user.userId, name, slug);

        reply.send({
          tenant,
        });
      } catch (error) {
        handleErrorResponse(error, reply);
      }
    },
  );

  fastify.get(
    '/tenants',
    { onRequest: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user) {
          throw new Error('User not authenticated');
        }

        const tenants = await getUserTenants(request.user.userId);

        reply.send({
          tenants,
        });
      } catch (error) {
        handleErrorResponse(error, reply);
      }
    },
  );

  fastify.get<{ Params: { tenantId: string } }>(
    '/tenants/:tenantId',
    { onRequest: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { tenantId } = request.params as { tenantId: string };

        const tenant = await getTenantById(tenantId);

        reply.send({
          tenant,
        });
      } catch (error) {
        handleErrorResponse(error, reply);
      }
    },
  );

  fastify.post<{ Body: any; Params: { tenantId: string } }>(
    '/tenants/:tenantId/invite',
    { onRequest: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { tenantId } = request.params as { tenantId: string };
        const { email, role } = inviteUserSchema.parse(request.body);

        await inviteUserToTenant(tenantId, email, role || 'member');

        reply.send({
          message: 'User invited successfully',
        });
      } catch (error) {
        handleErrorResponse(error, reply);
      }
    },
  );
}
