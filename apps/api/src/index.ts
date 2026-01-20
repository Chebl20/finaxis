import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import fastifySensible from '@fastify/sensible';
import { randomUUID } from 'crypto';
import { connectDatabase, closeDatabase, sql } from './database/connection.js';
import { setupAuth } from './middleware/auth.js';
import { authRoutes } from './routes/auth.js';
import { tenantRoutes } from './routes/tenants.js';
import { accountRoutes } from './routes/accounts.js';
import { categoryRoutes } from './routes/categories.js';
import { transactionRoutes } from './routes/transactions.js';
import { ticketRoutes } from './routes/tickets.js';
import { logger } from './utils/logger.js';
import { handleErrorResponse } from './utils/errors.js';

// Import type declarations
// Type augmentations are provided by src/types/fastify.d.ts and picked up by TS automatically.
// No runtime import is needed (and .js file does not exist).

// Configuration
const PORT = parseInt(process.env.API_PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = NODE_ENV === 'production';

async function startServer() {
  try {
    // Connect to database
    await connectDatabase();

    // Create Fastify instance with Winston logger
    const fastify = Fastify({
      logger: false, // Disable Fastify's default Pino logger
      genReqId: () => randomUUID(),
      disableRequestLogging: true, // We'll handle logging ourselves
      trustProxy: IS_PRODUCTION, // Trust proxy in production
    });

    // Add request ID to all requests
    fastify.addHook('onRequest', (request, _reply, done) => {
      request.id = randomUUID();
      done();
    });

    // Request logging
    fastify.addHook('onRequest', (request, _reply, done) => {
      const { method, url, id, ip, headers } = request;
      
      logger.http('Incoming request', {
        requestId: id,
        method,
        url,
        ip,
        userAgent: headers['user-agent'],
        timestamp: new Date().toISOString(),
      });
      
      done();
    });

    // Response logging
    fastify.addHook('onResponse', (request, reply, done) => {
      const { method, url, id } = request;
      const { statusCode, elapsedTime } = reply;
      
      logger.http('Request completed', {
        requestId: id,
        method,
        url,
        statusCode,
        responseTime: `${elapsedTime.toFixed(2)}ms`,
        timestamp: new Date().toISOString(),
      });
      
      done();
    });

    // Error logging
    fastify.setErrorHandler((error, request, reply) => {
      const { id, method, url } = request;
      
      logger.error('Request error', {
        requestId: id,
        method,
        url,
        error: {
          message: error.message,
          name: error.name,
          stack: IS_PRODUCTION ? undefined : error.stack,
          ...(error as any).details && { details: (error as any).details },
        },
        timestamp: new Date().toISOString(),
      });
      
      handleErrorResponse(error, reply, { id, url, method });
    });

    // Handle 404s
    fastify.setNotFoundHandler((request, reply) => {
      const { id, method, url } = request;
      
      logger.warn('Route not found', {
        requestId: id,
        method,
        url,
        timestamp: new Date().toISOString(),
      });
      
      reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: `Route ${method}:${url} not found`,
        requestId: id,
      });
    });

    // Register plugins
    await fastify.register(helmet, {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'"],
          imgSrc: ["'self'"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      hsts: IS_PRODUCTION ? { maxAge: 31536000, includeSubDomains: true } : false,
      hidePoweredBy: true,
      xssFilter: true,
      noSniff: true,
      ieNoOpen: true,
      frameguard: { action: 'deny' },
    });

    // Configure CORS
    await fastify.register(cors, {
      origin: IS_PRODUCTION 
        ? (origin, cb) => {
            const defaultOrigins = [
              'http://localhost:5173',
              'http://localhost:5174',
              'http://localhost:5175',
              'http://localhost:5176',
              'http://127.0.0.1:5173',
              'http://127.0.0.1:5174',
              'http://127.0.0.1:5175',
              'http://127.0.0.1:5176',
              // Coolify/Vite frontends calling this API domain
              'http://pwc8840044048gw80sowc88w.168.231.92.172.sslip.io',
              'https://pwc8840044048gw80sowc88w.168.231.92.172.sslip.io',
            ];
            const allowedOriginsEnv = (process.env.CORS_ORIGINS || '')
              .split(',')
              .map(o => o.trim())
              .filter(Boolean);
            const allowedOrigins = allowedOriginsEnv.length > 0 ? allowedOriginsEnv : defaultOrigins;

            if (!origin) {
              // Non-browser or same-origin requests
              cb(null, true);
              return;
            }

            if (allowedOrigins.includes(origin)) {
              cb(null, true);
            } else {
              cb(new Error(`Not allowed by CORS: ${origin}`), false);
            }
          }
        : true, // Allow all in development
      credentials: true,
      methods: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'X-Request-Id',
      ],
      exposedHeaders: ['X-Request-Id'],
      maxAge: 86400, // 24 hours
    });

    // Rate limiting configuration
    const rateLimitOptions = {
      max: 100, // limit each IP to 100 requests per windowMs
      timeWindow: '1 minute',
      allowList: ['127.0.0.1'],
      keyGenerator: (req: FastifyRequest) => req.ip,
      errorResponseBuilder: (_req: FastifyRequest, context: { after: string }) => ({
        statusCode: 429,
        error: 'Too Many Requests',
        message: `Rate limit exceeded, retry in ${context.after}`,
        code: 'RATE_LIMIT_EXCEEDED',
      }),
    };

    // Apply rate limiting globally
    await fastify.register(rateLimit, rateLimitOptions);

    // Add sensible defaults (error handling, etc.)
    await fastify.register(fastifySensible);

    // Setup authentication
    await setupAuth(fastify);

    // Root route
    fastify.get('/', async () => {
      return { 
        status: 'running',
        message: 'Finaxis API is running',
        version: process.env.npm_package_version || '0.1.0',
        environment: NODE_ENV,
        timestamp: new Date().toISOString(),
        documentation: 'https://docs.finaxis.com',
        endpoints: [
          { path: '/health', methods: ['GET'], description: 'Health check endpoint' },
          { path: '/auth', methods: ['POST'], description: 'Authentication endpoints' },
          { path: '/tenants', methods: ['GET', 'POST'], description: 'Tenant management' },
          { path: '/accounts', methods: ['GET', 'POST'], description: 'Account management' },
          { path: '/categories', methods: ['GET', 'POST'], description: 'Category management' },
          { path: '/transactions', methods: ['GET', 'POST'], description: 'Transaction management' },
          { path: '/tickets', methods: ['GET', 'POST'], description: 'Support tickets' },
        ],
      };
    });

    // Register routes with proper typing
    const registerRoutes = async (fastify: FastifyInstance, routes: (fastify: FastifyInstance) => Promise<void> | void): Promise<void> => {
      await routes(fastify);
    };
    
    // Register all routes
    await Promise.all([
      registerRoutes(fastify, authRoutes),
      registerRoutes(fastify, tenantRoutes),
      registerRoutes(fastify, accountRoutes),
      registerRoutes(fastify, categoryRoutes),
      registerRoutes(fastify, transactionRoutes),
      registerRoutes(fastify, ticketRoutes)
    ]);

    // Health check endpoint
    fastify.get('/health', {
      schema: {
        tags: ['System'],
        description: 'Health check endpoint',
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              timestamp: { type: 'string', format: 'date-time' },
              uptime: { type: 'number' },
              database: { type: 'string' },
              memory: { 
                type: 'object',
                properties: {
                  rss: { type: 'string' },
                  heapTotal: { type: 'string' },
                  heapUsed: { type: 'string' },
                  external: { type: 'string' },
                  arrayBuffers: { type: 'string' },
                }
              },
              loadavg: { type: 'array', items: { type: 'number' } },
              cpu: { 
                type: 'object',
                properties: {
                  user: { type: 'number' },
                  system: { type: 'number' },
                }
              }
            }
          },
          500: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              error: { type: 'string' },
              timestamp: { type: 'string', format: 'date-time' },
            }
          }
        }
      }
    }, async (_request: FastifyRequest, reply: FastifyReply) => {
      const start = process.hrtime();
      
      try {
        // Check database connection
        const dbConnected = await isDatabaseConnected();
        
        if (!dbConnected) {
          throw new Error('Database connection failed');
        }
        
        // Get memory usage
        const memory = process.memoryUsage();
        const formatMemory = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;
        
        // Get CPU usage
        const cpu = process.cpuUsage();
        const formatCpu = (microseconds: number) => (microseconds / 1000000).toFixed(2);
        
        const response = { 
          status: 'ok', 
          timestamp: new Date().toISOString(),
          uptime: Math.floor(process.uptime()),
          database: 'connected',
          memory: {
            rss: formatMemory(memory.rss),
            heapTotal: formatMemory(memory.heapTotal),
            heapUsed: formatMemory(memory.heapUsed),
            external: formatMemory(memory.external || 0),
            arrayBuffers: formatMemory((memory as any).arrayBuffers || 0),
          },
          loadavg: typeof process.getLoadAvg === 'function' ? process.getLoadAvg() : [0, 0, 0],
          cpu: {
            user: parseFloat(formatCpu(cpu.user)),
            system: parseFloat(formatCpu(cpu.system)),
          },
          responseTime: null as number | null
        };
        
        // Calculate response time
        const [seconds, nanoseconds] = process.hrtime(start);
        response.responseTime = parseFloat((seconds * 1000 + nanoseconds / 1e6).toFixed(2));
        
        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Health check failed', { error: errorMessage });
        
        reply.status(500);
        return {
          status: 'error',
          error: errorMessage,
          timestamp: new Date().toISOString(),
        };
      }
    });
    
    // Helper function to check database connection
    async function isDatabaseConnected(): Promise<boolean> {
      try {
        // The sql client is already connected when the server starts
        // Just execute a simple query to verify the connection
        const result = await sql`SELECT 1 as test`;
        return result[0]?.test === 1;
      } catch (error) {
        logger.error('Database health check failed', { error });
        return false;
      }
    }

    // Start server
    try {
      await fastify.listen({ port: PORT, host: HOST });
      
      const serverUrl = `http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`;
      
      logger.info(`🚀 Server running in ${NODE_ENV} mode at ${serverUrl}`, {
        port: PORT,
        host: HOST,
        environment: NODE_ENV,
        nodeVersion: process.version,
        platform: process.platform,
        memory: process.memoryUsage().rss,
        pid: process.pid,
        uptime: process.uptime(),
      });
      
      // Log unhandled rejections
      process.on('unhandledRejection', (reason, promise) => {
        logger.error('Unhandled Rejection at:', { promise, reason });
      });
      
      // Log uncaught exceptions
      process.on('uncaughtException', (error) => {
        logger.error('Uncaught Exception:', error);
        // Don't crash on uncaught exceptions in production
        if (!IS_PRODUCTION) process.exit(1);
      });
      
      // Log process warnings
      process.on('warning', (warning) => {
        logger.warn('Process warning:', warning);
      });
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  } catch (error) {
    logger.error('Fatal error during server startup:', error);
    process.exit(1);
  }
}

// Graceful shutdown handler
async function handleShutdown(signal: string) {
  logger.info(`${signal} signal received: starting graceful shutdown`);
  
  try {
    // Close database connection
    await closeDatabase();
    
    // Add any other cleanup tasks here
    
    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
}

// Handle various shutdown signals
['SIGTERM', 'SIGINT', 'SIGQUIT', 'SIGHUP'].forEach((signal) => {
  process.on(signal, () => handleShutdown(signal));
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  // Don't crash on uncaught exceptions in production
  if (!IS_PRODUCTION) process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
  // Consider whether to exit the process on unhandled rejections
  // process.exit(1);
});

// Handle process warnings
process.on('warning', (warning) => {
  logger.warn('Process warning:', warning);
});

startServer();
