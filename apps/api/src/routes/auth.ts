import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import {
  registerSchema,
  loginSchema,
} from '../utils/validation.js';
import {
  createUser,
  getUserByEmail,
  validatePassword,
  getUserWithTenants
} from '../modules/users.js';
import { generateToken, type AuthPayload } from '../middleware/auth.js';
import { handleErrorResponse, AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

// Define request body types for better type safety
type RegisterRequest = FastifyRequest<{
  Body: z.infer<typeof registerSchema>;
}>;

type LoginRequest = FastifyRequest<{
  Body: z.infer<typeof loginSchema>;
}>;


export async function authRoutes(fastify: FastifyInstance) {
  /**
   * Register a new user
   * @route POST /auth/register
   * @body {object} - User registration data
   * @returns {object} - User data and authentication token
   */
  fastify.post<{ 
    Body: z.infer<typeof registerSchema> 
  }>(
    '/auth/register',
    {
      schema: {
        body: {
          type: 'object',
          required: ['email', 'password', 'name'],
          additionalProperties: false,
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8, maxLength: 100 },
            name: { type: 'string', minLength: 2, maxLength: 100 },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  email: { type: 'string', format: 'email' },
                  name: { type: 'string' }
                }
              },
              token: { type: 'string' }
            }
          },
          400: { 
            type: 'object',
            properties: {
              statusCode: { type: 'number' },
              error: { type: 'string' },
              message: { type: 'string' }
            }
          },
          500: { 
            type: 'object',
            properties: {
              statusCode: { type: 'number' },
              error: { type: 'string' },
              message: { type: 'string' }
            }
          }
        }
      }
    },
    async (request: RegisterRequest, reply: FastifyReply) => {
      try {
        logger.info(`Registration attempt for email: ${request.body.email}`);
        
        const { email, password, name } = registerSchema.parse(request.body);
        const user = await createUser(email, password, name);

        const payload: AuthPayload = {
          userId: user.id,
          email: user.email,
          tenantId: '', // Will be set when user selects/creates a tenant
        };

        const token = generateToken(fastify, payload);
        logger.info(`User registered successfully: ${user.id}`);

        return {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
          token,
        };
      } catch (error) {
        logger.error('Registration error:', error);
        return handleErrorResponse(error, reply);
      }
    },
  );

  /**
   * Login user
   * @route POST /auth/login
   * @body {object} - User login credentials
   * @returns {object} - User data, tenants and authentication token
   */
  fastify.post<{ 
    Body: z.infer<typeof loginSchema>
  }>(
    '/auth/login',
    {
      schema: {
        body: {
          type: 'object',
          required: ['email', 'password'],
          additionalProperties: false,
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 1 },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  email: { type: 'string', format: 'email' },
                  name: { type: 'string' }
                }
              },
              tenants: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    name: { type: 'string' },
                    slug: { type: 'string' },
                    role: { type: 'string' }
                  }
                }
              },
              token: { type: 'string' }
            }
          },
          400: { 
            type: 'object',
            properties: {
              statusCode: { type: 'number' },
              error: { type: 'string' },
              message: { type: 'string' }
            }
          },
          401: { 
            type: 'object',
            properties: {
              statusCode: { type: 'number' },
              error: { type: 'string' },
              message: { type: 'string' }
            }
          },
          500: { 
            type: 'object',
            properties: {
              statusCode: { type: 'number' },
              error: { type: 'string' },
              message: { type: 'string' }
            }
          }
        }
      }
    },
    async (request: LoginRequest, reply: FastifyReply) => {
      try {
        logger.info(`Login attempt for email: ${request.body.email}`);
        
        const { email, password } = loginSchema.parse(request.body);

        const user = await getUserByEmail(email);
        if (!user) {
          logger.warn(`Login failed: User not found - ${email}`);
          throw new AppError('Invalid email or password', 401);
        }

        const isPasswordValid = await validatePassword(user.password_hash, password);
        if (!isPasswordValid) {
          logger.warn(`Login failed: Invalid password for user - ${user.id}`);
          throw new AppError('Invalid email or password', 401);
        }

        const userWithTenants = await getUserWithTenants(user.id);
        const defaultTenant = userWithTenants?.tenants[0];

        const payload: AuthPayload = {
          userId: user.id,
          email: user.email,
          tenantId: defaultTenant?.id || '',
        };

        const token = generateToken(fastify, payload);
        logger.info(`User logged in successfully: ${user.id}`);

        return {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
          tenants: userWithTenants?.tenants || [],
          token,
        };
      } catch (error) {
        logger.error('Login error:', error);
        return handleErrorResponse(error, reply);
      }
    },
  );

  /**
   * Get current user info
   * @route GET /auth/me
   * @returns {object} - Current user data
   */
  fastify.get<{
    Reply: {
      user: {
        id: string;
        email: string;
        name: string;
        tenantId: string;
      };
    }
  }>(
    '/auth/me',
    {
      onRequest: [fastify.authenticate],
      schema: {
        response: {
          200: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  email: { type: 'string', format: 'email' },
                  name: { type: 'string' },
                  tenantId: { type: 'string', format: 'uuid' }
                }
              }
            }
          },
          401: { 
            type: 'object',
            properties: {
              statusCode: { type: 'number' },
              error: { type: 'string' },
              message: { type: 'string' }
            }
          },
          500: { 
            type: 'object',
            properties: {
              statusCode: { type: 'number' },
              error: { type: 'string' },
              message: { type: 'string' }
            }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        if (!request.user) {
          throw new Error('User not authenticated');
        }

        const user = {
          id: request.user.userId,
          email: request.user.email,
          name: (request.user as any).name || '',
          tenantId: request.user.tenantId || ''
        };
        
        return { user };
      } catch (error) {
        logger.error('Error fetching user data:', error);
        return handleErrorResponse(error, reply);
      }
    },
  );
}
