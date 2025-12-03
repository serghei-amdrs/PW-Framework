/**
 * Base API Client
 *
 * Abstract base class for all API services providing:
 * - Common HTTP methods (GET, POST, PUT, DELETE)
 * - Request/response logging
 * - Error handling with typed errors
 * - Response schema validation
 * - Authentication token management
 */

import { APIRequestContext, APIResponse } from '@playwright/test';
import { z } from 'zod';
import { ApiError, createApiError, SchemaValidationError } from '../errors';
import { ApiResponse } from '../types';

export interface RequestOptions {
  /** Request body (will be JSON stringified) */
  body?: Record<string, unknown>;
  /** Additional headers */
  headers?: Record<string, string>;
  /** Query parameters */
  params?: Record<string, string | number | boolean>;
  /** Skip authentication header */
  skipAuth?: boolean;
  /** Fail silently on error (return null instead of throwing) */
  failSilently?: boolean;
}

export interface LogEntry {
  timestamp: string;
  method: string;
  url: string;
  status?: number;
  duration?: number;
  error?: string;
}

/**
 * Abstract base class for API services
 */
export abstract class BaseApiClient {
  protected readonly request: APIRequestContext;
  protected readonly baseUrl: string;
  protected token?: string;
  protected logs: LogEntry[] = [];
  protected enableLogging: boolean = true;

  constructor(request: APIRequestContext, baseUrl: string, token?: string) {
    this.request = request;
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    this.token = token;
  }

  /**
   * Set authentication token
   */
  setToken(token: string): void {
    this.token = token;
  }

  /**
   * Get current token
   */
  getToken(): string | undefined {
    return this.token;
  }

  /**
   * Enable or disable logging
   */
  setLogging(enabled: boolean): void {
    this.enableLogging = enabled;
  }

  /**
   * Get all logged requests
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Clear logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Build request headers
   */
  protected buildHeaders(options?: RequestOptions): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options?.headers,
    };

    if (this.token && !options?.skipAuth) {
      headers['Authorization'] = `Token ${this.token}`;
    }

    return headers;
  }

  /**
   * Build full URL with query parameters
   */
  protected buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const url = endpoint.startsWith('/')
      ? `${this.baseUrl}${endpoint}`
      : `${this.baseUrl}/${endpoint}`;

    if (!params || Object.keys(params).length === 0) {
      return url;
    }

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });

    return `${url}?${searchParams.toString()}`;
  }

  /**
   * Log a request
   */
  protected log(entry: Omit<LogEntry, 'timestamp'>): void {
    if (this.enableLogging) {
      this.logs.push({
        ...entry,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Perform a GET request
   */
  protected async get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('GET', endpoint, options);
  }

  /**
   * Perform a POST request
   */
  protected async post<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('POST', endpoint, options);
  }

  /**
   * Perform a PUT request
   */
  protected async put<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('PUT', endpoint, options);
  }

  /**
   * Perform a DELETE request
   */
  protected async delete<T = void>(
    endpoint: string,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('DELETE', endpoint, options);
  }

  /**
   * Perform a PATCH request
   */
  protected async patch<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('PATCH', endpoint, options);
  }

  /**
   * Make HTTP request with error handling
   */
  private async makeRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    endpoint: string,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint, options?.params);
    const headers = this.buildHeaders(options);
    const startTime = Date.now();

    let response: APIResponse;

    try {
      const requestOptions: { headers: Record<string, string>; data?: Record<string, unknown> } = {
        headers,
      };

      if (options?.body) {
        requestOptions.data = options.body;
      }

      switch (method) {
        case 'GET':
          response = await this.request.get(url, requestOptions);
          break;
        case 'POST':
          response = await this.request.post(url, requestOptions);
          break;
        case 'PUT':
          response = await this.request.put(url, requestOptions);
          break;
        case 'DELETE':
          response = await this.request.delete(url, requestOptions);
          break;
        case 'PATCH':
          response = await this.request.patch(url, requestOptions);
          break;
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.log({
        method,
        url,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }

    const duration = Date.now() - startTime;
    const status = response.status();

    this.log({
      method,
      url,
      status,
      duration,
    });

    // Parse response body
    const body = await this.parseResponseBody<T>(response);

    // Check for error status codes
    if (status >= 400) {
      if (options?.failSilently) {
        return { status, body: body as T };
      }
      throw createApiError(status, endpoint, method, body);
    }

    return { status, body: body as T };
  }

  /**
   * Parse response body based on content type
   */
  private async parseResponseBody<T>(response: APIResponse): Promise<T | null> {
    const contentType = response.headers()['content-type'] || '';

    try {
      if (contentType.includes('application/json')) {
        return (await response.json()) as T;
      }
      if (contentType.includes('text/')) {
        return (await response.text()) as unknown as T;
      }
      // No content (e.g., 204 responses)
      if (response.status() === 204) {
        return null as T;
      }
      // Try JSON parsing as default
      const text = await response.text();
      if (text) {
        return JSON.parse(text) as T;
      }
      return null as T;
    } catch {
      return null as T;
    }
  }

  /**
   * Validate response against a Zod schema
   */
  protected validateResponse<T>(data: unknown, schema: z.ZodType<T>, schemaName: string): T {
    const result = schema.safeParse(data);

    if (!result.success) {
      const issues = result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));

      throw new SchemaValidationError(
        `Response validation failed: ${issues.map((i) => `${i.path}: ${i.message}`).join('; ')}`,
        schemaName,
        result.error.issues
      );
    }

    return result.data;
  }

  /**
   * Validate response and return both status and validated data
   */
  protected async getValidated<T>(
    endpoint: string,
    schema: z.ZodType<T>,
    schemaName: string,
    options?: RequestOptions
  ): Promise<{ status: number; data: T }> {
    const response = await this.get<T>(endpoint, options);
    const data = this.validateResponse(response.body, schema, schemaName);
    return { status: response.status, data };
  }

  /**
   * Post and validate response
   */
  protected async postValidated<T>(
    endpoint: string,
    schema: z.ZodType<T>,
    schemaName: string,
    options?: RequestOptions
  ): Promise<{ status: number; data: T }> {
    const response = await this.post<T>(endpoint, options);
    const data = this.validateResponse(response.body, schema, schemaName);
    return { status: response.status, data };
  }

  /**
   * Put and validate response
   */
  protected async putValidated<T>(
    endpoint: string,
    schema: z.ZodType<T>,
    schemaName: string,
    options?: RequestOptions
  ): Promise<{ status: number; data: T }> {
    const response = await this.put<T>(endpoint, options);
    const data = this.validateResponse(response.body, schema, schemaName);
    return { status: response.status, data };
  }
}
