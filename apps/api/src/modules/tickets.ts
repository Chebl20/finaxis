import { v4 as uuidv4 } from 'uuid';
import { sql } from '../database/connection.js';

export interface SupportTicket {
  id: string;
  tenant_id: string;
  user_id: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: string;
  created_at: Date;
  updated_at: Date;
}

export async function createTicket(
  tenantId: string,
  userId: string,
  subject: string,
  description: string,
  priority: string = 'normal',
) {
  const id = uuidv4();

  return sql<SupportTicket[]>`
    INSERT INTO support_tickets (id, tenant_id, user_id, subject, description, priority)
    VALUES (${id}, ${tenantId}, ${userId}, ${subject}, ${description}, ${priority})
    RETURNING *;
  `;
}

export async function getTenantTickets(tenantId: string) {
  return sql<SupportTicket[]>`
    SELECT * FROM support_tickets
    WHERE tenant_id = ${tenantId}
    ORDER BY created_at DESC;
  `;
}

export async function getTicketById(ticketId: string) {
  const result = await sql<SupportTicket[]>`
    SELECT * FROM support_tickets WHERE id = ${ticketId};
  `;
  return result[0] || null;
}

export async function updateTicketStatus(ticketId: string, status: string) {
  return sql<SupportTicket[]>`
    UPDATE support_tickets
    SET status = ${status}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${ticketId}
    RETURNING *;
  `;
}
