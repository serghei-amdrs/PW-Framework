/**
 * API Response Validation Helpers
 *
 * Utility functions for validating API responses and providing
 * detailed assertion helpers for tests.
 */

import { expect } from '@playwright/test';
import { z } from 'zod';
import {
  ArticleResponseSchema,
  ArticlesResponseSchema,
  UserResponseSchema,
  ErrorResponseSchema,
  CommentResponseSchema,
  CommentsResponseSchema,
  ProfileResponseSchema,
  TagsResponseSchema,
} from '../schemas/api-schemas';

/**
 * Validation result with detailed error information
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: {
    path: string;
    message: string;
    expected?: string;
    received?: string;
  }[];
}

/**
 * Validate data against a Zod schema with detailed error reporting
 */
export function validateSchema<T>(data: unknown, schema: z.ZodType<T>): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    errors: result.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
      expected: 'expected' in issue ? String(issue.expected) : undefined,
      received: 'received' in issue ? String(issue.received) : undefined,
    })),
  };
}

/**
 * Assert that a response matches a schema, with detailed error messages
 */
export function assertSchema<T>(
  data: unknown,
  schema: z.ZodType<T>,
  schemaName: string = 'Response'
): asserts data is T {
  const result = validateSchema(data, schema);

  if (!result.success) {
    const errorDetails = result.errors
      ?.map((e) => `  - ${e.path || 'root'}: ${e.message}`)
      .join('\n');

    throw new Error(`${schemaName} schema validation failed:\n${errorDetails}`);
  }
}

// ==================== Pre-built Validators ====================

/**
 * Validate article response
 */
export function validateArticleResponse(
  body: unknown
): ValidationResult<z.infer<typeof ArticleResponseSchema>> {
  return validateSchema(body, ArticleResponseSchema);
}

/**
 * Assert article response is valid
 */
export function assertArticleResponse(
  body: unknown
): asserts body is z.infer<typeof ArticleResponseSchema> {
  assertSchema(body, ArticleResponseSchema, 'ArticleResponse');
}

/**
 * Validate articles list response
 */
export function validateArticlesResponse(
  body: unknown
): ValidationResult<z.infer<typeof ArticlesResponseSchema>> {
  return validateSchema(body, ArticlesResponseSchema);
}

/**
 * Assert articles list response is valid
 */
export function assertArticlesResponse(
  body: unknown
): asserts body is z.infer<typeof ArticlesResponseSchema> {
  assertSchema(body, ArticlesResponseSchema, 'ArticlesResponse');
}

/**
 * Validate user response
 */
export function validateUserResponse(
  body: unknown
): ValidationResult<z.infer<typeof UserResponseSchema>> {
  return validateSchema(body, UserResponseSchema);
}

/**
 * Assert user response is valid
 */
export function assertUserResponse(
  body: unknown
): asserts body is z.infer<typeof UserResponseSchema> {
  assertSchema(body, UserResponseSchema, 'UserResponse');
}

/**
 * Validate error response
 */
export function validateErrorResponse(
  body: unknown
): ValidationResult<z.infer<typeof ErrorResponseSchema>> {
  return validateSchema(body, ErrorResponseSchema);
}

/**
 * Assert error response is valid
 */
export function assertErrorResponse(
  body: unknown
): asserts body is z.infer<typeof ErrorResponseSchema> {
  assertSchema(body, ErrorResponseSchema, 'ErrorResponse');
}

/**
 * Validate comment response
 */
export function validateCommentResponse(
  body: unknown
): ValidationResult<z.infer<typeof CommentResponseSchema>> {
  return validateSchema(body, CommentResponseSchema);
}

/**
 * Validate comments list response
 */
export function validateCommentsResponse(
  body: unknown
): ValidationResult<z.infer<typeof CommentsResponseSchema>> {
  return validateSchema(body, CommentsResponseSchema);
}

/**
 * Validate profile response
 */
export function validateProfileResponse(
  body: unknown
): ValidationResult<z.infer<typeof ProfileResponseSchema>> {
  return validateSchema(body, ProfileResponseSchema);
}

/**
 * Validate tags response
 */
export function validateTagsResponse(
  body: unknown
): ValidationResult<z.infer<typeof TagsResponseSchema>> {
  return validateSchema(body, TagsResponseSchema);
}

// ==================== Assertion Helpers ====================

/**
 * Assert that the API response has a specific status code
 */
export function assertStatus(actual: number, expected: number, message?: string): void {
  expect(actual, message || `Expected status ${expected}, got ${actual}`).toBe(expected);
}

/**
 * Assert that the response contains expected error fields
 */
export function assertHasErrorField(body: unknown, field: string): void {
  assertErrorResponse(body);
  expect(
    body.errors[field as keyof typeof body.errors],
    `Expected error for field '${field}'`
  ).toBeDefined();
}

/**
 * Assert that the response contains a specific error message
 */
export function assertErrorContains(body: unknown, field: string, expectedMessage: string): void {
  assertErrorResponse(body);
  const fieldErrors = body.errors[field as keyof typeof body.errors];
  expect(fieldErrors, `Expected errors for field '${field}'`).toBeDefined();
  expect(
    fieldErrors?.some((msg: string) => msg.toLowerCase().includes(expectedMessage.toLowerCase())),
    `Expected error message containing '${expectedMessage}' for field '${field}'`
  ).toBeTruthy();
}

/**
 * Assert article has expected properties
 */
export function assertArticleProperties(
  article: z.infer<typeof ArticleResponseSchema>['article'],
  expected: Partial<{
    title: string;
    description: string;
    body: string;
    tagList: string[];
    authorUsername: string;
  }>
): void {
  if (expected.title !== undefined) {
    expect(article.title).toBe(expected.title);
  }
  if (expected.description !== undefined) {
    expect(article.description).toBe(expected.description);
  }
  if (expected.body !== undefined) {
    expect(article.body).toBe(expected.body);
  }
  if (expected.tagList !== undefined) {
    expect(article.tagList).toEqual(expect.arrayContaining(expected.tagList));
  }
  if (expected.authorUsername !== undefined) {
    expect(article.author.username).toBe(expected.authorUsername);
  }
}

/**
 * Assert user has expected properties
 */
export function assertUserProperties(
  user: z.infer<typeof UserResponseSchema>['user'],
  expected: Partial<{
    email: string;
    username: string;
    hasToken: boolean;
  }>
): void {
  if (expected.email !== undefined) {
    expect(user.email).toBe(expected.email);
  }
  if (expected.username !== undefined) {
    expect(user.username).toBe(expected.username);
  }
  if (expected.hasToken) {
    expect(user.token).toBeTruthy();
    expect(user.token.length).toBeGreaterThan(0);
  }
}
