import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ForbiddenError } from '../utils/errors.js';

// Extend the FastifyRequest type to include our custom params
type TenantRequest = FastifyRequest<{
  Params: {
    tenantId: string;
  };
}>;

export async function tenantMiddleware(
  _fastify: FastifyInstance,
  request: TenantRequest,
  _reply: FastifyReply,
): Promise<void> {
  const { tenantId } = request.params;

  if (!request.user) {
    throw new ForbiddenError('User not authenticated');
  }

  if (request.user.tenantId !== tenantId) {
    throw new ForbiddenError('Access denied to this tenant');
  }
}
