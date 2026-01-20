import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fastifyJwt from '@fastify/jwt';
import { UnauthorizedError } from '../utils/errors.js';

export interface AuthPayload {
  userId: string;
  email: string;
  tenantId: string;
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: AuthPayload;
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
  interface FastifyRequest {
    user: AuthPayload;
  }
}

export async function setupAuth(fastify: FastifyInstance): Promise<void> {
  // Register JWT plugin with proper types
  await fastify.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    sign: {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    },
  });

  // Add authenticate decorator
  fastify.decorate('authenticate', async function (request: FastifyRequest, _reply: FastifyReply) {
    try {
      await request.jwtVerify();
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired token');
    }
  });
}

export function generateToken(
  fastify: FastifyInstance,
  payload: AuthPayload,
): string {
  return fastify.jwt.sign(payload);
}
