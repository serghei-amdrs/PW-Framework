import { ErrorResponseSchema } from '../../fixtures/api/schemas';
import { ErrorResponse } from '../../fixtures/api/types-guards';
import { test, expect } from '../../fixtures/pom/test-options';
import {
  INVALID_EMAILS,
  INVALID_PASSWORDS,
  INVALID_USERNAMES,
  HTTP_STATUS,
  API_ENDPOINTS,
} from '../../test-data/constants';

test.describe('Authentication API Validation', () => {
  test(
    'should reject login with invalid credentials',
    { tag: ['@Api', '@Sanity'] },
    async ({ apiRequest }) => {
      const { status, body } = await apiRequest<ErrorResponse>({
        method: 'POST',
        url: API_ENDPOINTS.users.login,
        baseUrl: process.env.API_URL,
        body: {
          user: {
            email: INVALID_EMAILS[0],
            password: INVALID_PASSWORDS[0],
          },
        },
      });

      expect(status).toBe(HTTP_STATUS.FORBIDDEN);
      expect(ErrorResponseSchema.parse(body)).toBeTruthy();
    }
  );

  test(
    'should validate registration input',
    { tag: ['@Api', '@Smoke'] },
    async ({ apiRequest }) => {
      await test.step('Reject invalid emails', async () => {
        for (const invalidEmail of INVALID_EMAILS) {
          const { status, body } = await apiRequest<ErrorResponse>({
            method: 'POST',
            url: API_ENDPOINTS.users.register,
            baseUrl: process.env.API_URL,
            body: {
              user: {
                email: invalidEmail,
                password: '8charact',
                username: 'testuser',
              },
            },
          });

          expect(status).toBe(HTTP_STATUS.UNPROCESSABLE_ENTITY);
          expect(ErrorResponseSchema.parse(body)).toBeTruthy();
        }
      });

      await test.step('Reject invalid passwords', async () => {
        for (const invalidPassword of INVALID_PASSWORDS) {
          const { status, body } = await apiRequest<ErrorResponse>({
            method: 'POST',
            url: API_ENDPOINTS.users.register,
            baseUrl: process.env.API_URL,
            body: {
              user: {
                email: 'validEmail@test.com',
                password: invalidPassword,
                username: 'testuser',
              },
            },
          });

          expect(status).toBe(HTTP_STATUS.UNPROCESSABLE_ENTITY);
          expect(ErrorResponseSchema.parse(body)).toBeTruthy();
        }
      });

      await test.step('Reject invalid usernames', async () => {
        for (const invalidUsername of INVALID_USERNAMES) {
          const { status, body } = await apiRequest<ErrorResponse>({
            method: 'POST',
            url: API_ENDPOINTS.users.register,
            baseUrl: process.env.API_URL,
            body: {
              user: {
                email: 'validEmail@test.com',
                password: '8charact',
                username: invalidUsername,
              },
            },
          });

          expect(status).toBe(HTTP_STATUS.UNPROCESSABLE_ENTITY);
          expect(ErrorResponseSchema.parse(body)).toBeTruthy();
        }
      });
    }
  );
});
