import { FastifyRequest as OriginalFastifyRequest } from 'fastify';
import { AuthPayload } from '../middleware/auth.js';

declare module 'fastify' {
  interface FastifyRequest extends OriginalFastifyRequest {
    user?: AuthPayload;
  }
}

// Extend NodeJS.Process interface to include getLoadAvg
declare global {
  namespace NodeJS {
    interface Process {
      getLoadAvg?(): number[];
    }
  }
}
