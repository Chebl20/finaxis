import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  createTicketSchema,
} from '../utils/validation.js';
import {
  createTicket,
  getTenantTickets,
  getTicketById,
  updateTicketStatus,
} from '../modules/tickets.js';
import { handleErrorResponse, NotFoundError } from '../utils/errors.js';

export async function ticketRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: any; Params: { tenantId: string } }>(
    '/tenants/:tenantId/tickets',
    { onRequest: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { tenantId } = request.params as { tenantId: string };

        if (!request.user) {
          throw new Error('User not authenticated');
        }

        const { subject, description, priority } = createTicketSchema.parse(request.body);

        const tickets = await createTicket(
          tenantId,
          request.user.userId,
          subject,
          description,
          priority,
        );

        reply.send({
          ticket: tickets[0],
        });
      } catch (error) {
        handleErrorResponse(error, reply);
      }
    },
  );

  fastify.get<{ Params: { tenantId: string } }>(
    '/tenants/:tenantId/tickets',
    { onRequest: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { tenantId } = request.params as { tenantId: string };

        const tickets = await getTenantTickets(tenantId);

        reply.send({
          tickets,
        });
      } catch (error) {
        handleErrorResponse(error, reply);
      }
    },
  );

  fastify.get<{ Params: { tenantId: string; ticketId: string } }>(
    '/tenants/:tenantId/tickets/:ticketId',
    { onRequest: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { ticketId } = request.params as { ticketId: string };

        const ticket = await getTicketById(ticketId);
        if (!ticket) {
          throw new NotFoundError('Ticket not found');
        }

        reply.send({
          ticket,
        });
      } catch (error) {
        handleErrorResponse(error, reply);
      }
    },
  );

  fastify.put<{
    Body: { status: string };
    Params: { tenantId: string; ticketId: string };
  }>(
    '/tenants/:tenantId/tickets/:ticketId',
    { onRequest: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { ticketId } = request.params as { ticketId: string };
        const { status } = request.body as { status: string };

        const tickets = await updateTicketStatus(ticketId, status);

        reply.send({
          ticket: tickets[0],
        });
      } catch (error) {
        handleErrorResponse(error, reply);
      }
    },
  );
}
