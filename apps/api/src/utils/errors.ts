import { FastifyReply } from 'fastify';
import { ZodError } from 'zod';
import { logger } from './logger.js';

/**
 * Base error interface for all API errors
 */
export interface ApiError extends Error {
  statusCode: number;
  code?: string;
  details?: unknown;
  timestamp: string;
}

/**
 * Standard error response format
 */
export interface ErrorResponse {
  statusCode: number;
  error: string;
  message: string;
  code?: string;
  details?: unknown;
  timestamp: string;
  path?: string;
}

/**
 * Creates a standardized error response object
 */
export function createErrorResponse(
  statusCode: number,
  message: string,
  options: {
    code?: string;
    details?: unknown;
    path?: string;
  } = {}
): ErrorResponse {
  const { code, details, path } = options;
  const error = {
    statusCode,
    error: getStatusText(statusCode),
    message,
    code,
    details,
    timestamp: new Date().toISOString(),
    path,
  };

  // Remove undefined fields
  Object.keys(error).forEach(
    (key) => error[key as keyof typeof error] === undefined && delete error[key as keyof typeof error]
  );

  return error as ErrorResponse;
}

/**
 * Maps HTTP status codes to their default messages
 */
function getStatusText(statusCode: number): string {
  const statusTexts: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
  };

  return statusTexts[statusCode] || 'Internal Server Error';
}

/**
 * Handles errors and sends an appropriate response
 */
export function handleErrorResponse(
  error: unknown,
  reply: FastifyReply,
  request?: { url?: string; method?: string; id?: string }
): void {
  const path = request?.url || reply.request?.url;
  const requestId = request?.id || (reply.request?.id as string | undefined);

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const validationError = new ValidationError('Validation failed', {
      issues: error.issues,
    });
    sendErrorResponse(validationError, reply, path, requestId);
    return;
  }

  // Handle custom AppError instances
  if (error instanceof AppError) {
    sendErrorResponse(error, reply, path, requestId);
    return;
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    const appError = new AppError(error.message, 500, {
      code: 'INTERNAL_ERROR',
      details: {
        name: error.name,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      }
    });
    sendErrorResponse(appError, reply, path, requestId);
    return;
  }

  // Handle non-Error objects
  const unknownError = new AppError('An unknown error occurred', 500, {
    code: 'UNKNOWN_ERROR',
    details: {
      error: String(error)
    }
  });
  sendErrorResponse(unknownError, reply, path, requestId);
}

/**
 * Sends the error response to the client
 */
function sendErrorResponse(
  error: AppError,
  reply: FastifyReply,
  path?: string,
  requestId?: string
): void {
  const { statusCode, message, code, details } = error;
  const response = createErrorResponse(statusCode, message, {
    code,
    details,
    path,
  });

  // Add request ID to response if available
  if (requestId) {
    (response as any).requestId = requestId;
  }

  // Log the error
  const logContext = {
    statusCode,
    code,
    path,
    requestId,
    details,
    stack: error.stack,
  };

  if (statusCode >= 500) {
    logger.error(message, logContext);
  } else if (statusCode >= 400) {
    logger.warn(message, logContext);
  } else {
    logger.info(message, logContext);
  }

  // Send the response
  reply.status(statusCode).send(response);
}

/**
 * Base class for all application errors
 */
export class AppError extends Error implements ApiError {
  statusCode: number;
  code?: string;
  details?: unknown;
  timestamp: string;

  constructor(
    message: string,
    statusCode: number = 500,
    options: {
      code?: string;
      details?: unknown;
      cause?: unknown;
    } = {}
  ) {
    // Some TS/target environments don't support Error(message, { cause })
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = options.code;
    this.details = options.details;
    this.timestamp = new Date().toISOString();

    // Set cause manually when provided to preserve context
    if (options.cause !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this as any).cause = options.cause;
    }

    // Maintain proper stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON(): ErrorResponse {
    return createErrorResponse(this.statusCode, this.message, {
      code: this.code,
      details: this.details,
    });
  }
}

/**
 * 400 Bad Request - The request could not be understood or was missing required parameters.
 */
export class BadRequestError extends AppError {
  constructor(message = 'Bad Request', details?: unknown) {
    super(message, 400, { code: 'BAD_REQUEST', details });
  }
}

/**
 * 401 Unauthorized - Authentication failed or user doesn't have permissions for the requested operation.
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', details?: unknown) {
    super(message, 401, { code: 'UNAUTHORIZED', details });
  }
}

/**
 * 403 Forbidden - Authentication succeeded but the user doesn't have permission to access the requested resource.
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', details?: unknown) {
    super(message, 403, { code: 'FORBIDDEN', details });
  }
}

/**
 * 404 Not Found - The requested resource could not be found.
 */
export class NotFoundError extends AppError {
  constructor(resource?: string, details?: unknown) {
    const message = resource ? `${resource} not found` : 'Resource not found';
    super(message, 404, { code: 'NOT_FOUND', details });
  }
}

/**
 * 409 Conflict - Request could not be processed because of conflict in the current state of the resource.
 */
export class ConflictError extends AppError {
  constructor(message = 'Conflict', details?: unknown) {
    super(message, 409, { code: 'CONFLICT', details });
  }
}

/**
 * 422 Unprocessable Entity - The request was well-formed but was unable to be followed due to semantic errors.
 */
export class UnprocessableEntityError extends AppError {
  constructor(message = 'Unprocessable Entity', details?: unknown) {
    super(message, 422, { code: 'UNPROCESSABLE_ENTITY', details });
  }
}

/**
 * 429 Too Many Requests - The user has sent too many requests in a given amount of time.
 */
export class TooManyRequestsError extends AppError {
  constructor(message = 'Too Many Requests', details?: unknown) {
    super(message, 429, { code: 'TOO_MANY_REQUESTS', details });
  }
}

/**
 * 500 Internal Server Error - A generic error message, given when an unexpected condition was encountered.
 */
export class InternalServerError extends AppError {
  constructor(message = 'Internal Server Error', details?: unknown) {
    super(message, 500, { code: 'INTERNAL_SERVER_ERROR', details });
  }
}

/**
 * 503 Service Unavailable - The server is currently unavailable (because it is overloaded or down for maintenance).
 */
export class ServiceUnavailableError extends AppError {
  constructor(message = 'Service Unavailable', details?: unknown) {
    super(message, 503, { code: 'SERVICE_UNAVAILABLE', details });
  }
}

/**
 * 400 Validation Error - The request data is invalid.
 */
export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details?: unknown) {
    super(message, 400, { code: 'VALIDATION_ERROR', details });
  }
}

/**
 * 401 Invalid Credentials - The provided credentials are invalid.
 */
export class InvalidCredentialsError extends UnauthorizedError {
  constructor(message = 'Invalid email or password') {
    super(message, { code: 'INVALID_CREDENTIALS' });
  }
}

/**
 * 403 Insufficient Permissions - The user doesn't have the required permissions.
 */
export class InsufficientPermissionsError extends ForbiddenError {
  constructor(permission?: string) {
    const message = permission
      ? `Insufficient permissions: ${permission}`
      : 'Insufficient permissions';
    super(message, { code: 'INSUFFICIENT_PERMISSIONS' });
  }
}

/**
 * 404 Route Not Found - The requested route does not exist.
 */
export class RouteNotFoundError extends NotFoundError {
  constructor(path?: string) {
    super(path ? `Route '${path}' not found` : 'Route not found', {
      code: 'ROUTE_NOT_FOUND',
    });
  }
}
