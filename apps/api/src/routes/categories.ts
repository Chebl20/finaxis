import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { createCategorySchema } from '../utils/validation.js';
import { 
  createCategory, 
  getTenantCategories, 
  getCategoryById, 
  updateCategory, 
  deleteCategory, 
  Category, 
  CategoryType 
} from '../modules/categories.js';
import { handleErrorResponse, NotFoundError } from '../utils/errors.js';

// Type definitions for request bodies and parameters
type CreateCategoryBody = {
  name: string;
  type: CategoryType;
  color?: string | null;
  icon?: string | null;
};

type UpdateCategoryBody = Partial<Omit<Category, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>>;

export async function categoryRoutes(fastify: FastifyInstance) {
  fastify.post<{ 
    Body: CreateCategoryBody; 
    Params: { tenantId: string } 
  }>(
    '/tenants/:tenantId/categories',
    { 
      onRequest: [fastify.authenticate],
      schema: {
        body: {
          type: 'object',
          required: ['name', 'type'],
          additionalProperties: false,
          properties: {
            name: { type: 'string', minLength: 2, maxLength: 100 },
            type: { type: 'string', enum: ['income', 'expense'] },
            color: { type: 'string', pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$' },
            icon: { type: 'string', maxLength: 50 },
            parentId: { type: 'string', format: 'uuid' },
            isActive: { type: 'boolean' }
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
        const { name, type, color, icon } = createCategorySchema.parse(request.body);

        const categories = await createCategory(
          tenantId,
          name,
          type,
          color,
          icon,
        );

        reply.send({
          category: categories[0],
        });
      } catch (error) {
        handleErrorResponse(error, reply);
      }
    },
  );

  fastify.get<{ 
    Params: { tenantId: string }; 
    Querystring: { type?: CategoryType } 
  }>(
    '/tenants/:tenantId/categories',
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
            type: { type: 'string', enum: ['income', 'expense'] }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const { tenantId } = request.params as { tenantId: string };
        const { type } = request.query as { type?: 'income' | 'expense' };

        const categories = await getTenantCategories(tenantId, type);

        reply.send({
          categories,
        });
      } catch (error) {
        handleErrorResponse(error, reply);
      }
    },
  );

  fastify.get<{ 
    Params: { 
      tenantId: string; 
      categoryId: string 
    } 
  }>(
    '/tenants/:tenantId/categories/:categoryId',
    { 
      onRequest: [fastify.authenticate],
      schema: {
        params: {
          type: 'object',
          required: ['tenantId', 'categoryId'],
          properties: {
            tenantId: { type: 'string', format: 'uuid' },
            categoryId: { type: 'string', format: 'uuid' }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const { categoryId } = request.params as { categoryId: string };

        const category = await getCategoryById(categoryId);
        if (!category) {
          throw new NotFoundError('Category not found');
        }

        reply.send({
          category,
        });
      } catch (error) {
        handleErrorResponse(error, reply);
      }
    },
  );

  fastify.put<{ 
    Body: UpdateCategoryBody; 
    Params: { 
      tenantId: string; 
      categoryId: string 
    } 
  }>(
    '/tenants/:tenantId/categories/:categoryId',
    { 
      onRequest: [fastify.authenticate],
      schema: {
        params: {
          type: 'object',
          required: ['tenantId', 'categoryId'],
          properties: {
            tenantId: { type: 'string', format: 'uuid' },
            categoryId: { type: 'string', format: 'uuid' }
          }
        },
        body: {
          type: 'object',
          additionalProperties: false,
          properties: {
            name: { type: 'string', minLength: 2, maxLength: 100 },
            type: { type: 'string', enum: ['income', 'expense'] },
            color: { type: 'string', pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$' },
            icon: { type: 'string', maxLength: 50 },
            parentId: { type: 'string', format: 'uuid' },
            isActive: { type: 'boolean' }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const { categoryId } = request.params as { categoryId: string };

        const categories = await updateCategory(categoryId, request.body);

        reply.send({
          category: categories[0],
        });
      } catch (error) {
        handleErrorResponse(error, reply);
      }
    },
  );

  fastify.delete<{ 
    Params: { 
      tenantId: string; 
      categoryId: string 
    } 
  }>(
    '/tenants/:tenantId/categories/:categoryId',
    { 
      onRequest: [fastify.authenticate],
      schema: {
        params: {
          type: 'object',
          required: ['tenantId', 'categoryId'],
          properties: {
            tenantId: { type: 'string', format: 'uuid' },
            categoryId: { type: 'string', format: 'uuid' }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const { categoryId } = request.params as { categoryId: string };

        await deleteCategory(categoryId);

        reply.send({
          message: 'Category deleted successfully',
        });
      } catch (error) {
        handleErrorResponse(error, reply);
      }
    },
  );
}
