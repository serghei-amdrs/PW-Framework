/**
 * Custom API Error Classes
 *
 * Provides structured error handling for API operations with
 * detailed error information and type safety.
 */

import { ErrorResponse, ValidationErrors } from '../types';

/**
 * Base class for all API errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly endpoint: string,
    public readonly method: string,
    public readonly responseBody?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /**
   * Format error for logging
   */
  toLogString(): string {
    return `[${this.name}] ${this.method} ${this.endpoint} - ${this.status}: ${this.message}`;
  }
}

/**
 * Error for validation failures (422 status)
 */
export class ValidationError extends ApiError {
  public readonly validationErrors: ValidationErrors;

  constructor(endpoint: string, method: string, errors: ErrorResponse, status: number = 422) {
    const errorMessages = Object.entries(errors.errors)
      .map(([field, messages]) => `${field}: ${messages?.join(', ')}`)
      .join('; ');

    super(`Validation failed: ${errorMessages}`, status, endpoint, method, errors);
    this.name = 'ValidationError';
    this.validationErrors = errors.errors;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  /**
   * Check if a specific field has errors
   */
  hasFieldError(field: keyof ValidationErrors): boolean {
    return !!this.validationErrors[field]?.length;
  }

  /**
   * Get errors for a specific field
   */
  getFieldErrors(field: keyof ValidationErrors): string[] {
    return this.validationErrors[field] || [];
  }
}

/**
 * Error for authentication failures (401 status)
 */
export class AuthenticationError extends ApiError {
  constructor(endpoint: string, method: string, message: string = 'Authentication required') {
    super(message, 401, endpoint, method);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Error for authorization failures (403 status)
 */
export class AuthorizationError extends ApiError {
  constructor(endpoint: string, method: string, message: string = 'Access forbidden') {
    super(message, 403, endpoint, method);
    this.name = 'AuthorizationError';
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

/**
 * Error for resource not found (404 status)
 */
export class NotFoundError extends ApiError {
  constructor(endpoint: string, method: string, resource: string = 'Resource') {
    super(`${resource} not found`, 404, endpoint, method);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Error for server errors (5xx status)
 */
export class ServerError extends ApiError {
  constructor(endpoint: string, method: string, status: number, message: string = 'Server error') {
    super(message, status, endpoint, method);
    this.name = 'ServerError';
    Object.setPrototypeOf(this, ServerError.prototype);
  }
}

/**
 * Error for schema validation failures
 */
export class SchemaValidationError extends Error {
  constructor(
    message: string,
    public readonly schemaName: string,
    public readonly validationIssues: unknown[]
  ) {
    super(message);
    this.name = 'SchemaValidationError';
    Object.setPrototypeOf(this, SchemaValidationError.prototype);
  }

  toLogString(): string {
    return `[${this.name}] Schema '${this.schemaName}' validation failed: ${this.message}`;
  }
}

/**
 * Error for network/connection issues
 */
export class NetworkError extends Error {
  constructor(
    message: string,
    public readonly endpoint: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * Factory function to create appropriate error based on status code
 */
export function createApiError(
  status: number,
  endpoint: string,
  method: string,
  responseBody?: unknown
): ApiError {
  switch (status) {
    case 401:
      return new AuthenticationError(endpoint, method);
    case 403:
      return new AuthorizationError(endpoint, method);
    case 404:
      return new NotFoundError(endpoint, method);
    case 422:
      if (isValidationErrorResponse(responseBody)) {
        return new ValidationError(endpoint, method, responseBody);
      }
      return new ApiError('Validation error', status, endpoint, method, responseBody);
    default:
      if (status >= 500) {
        return new ServerError(endpoint, method, status, `Server error: ${status}`);
      }
      return new ApiError(
        `Request failed with status ${status}`,
        status,
        endpoint,
        method,
        responseBody
      );
  }
}

/**
 * Type guard for validation error response
 */
function isValidationErrorResponse(body: unknown): body is ErrorResponse {
  return (
    typeof body === 'object' &&
    body !== null &&
    'errors' in body &&
    typeof (body as ErrorResponse).errors === 'object'
  );
}
