/**
 * Invalid test data for validation testing
 */
export const INVALID_EMAILS = [
  'plainaddress',
  '@missingusername.com',
  'username@.com',
  'username@domain..com',
  'username@domain,com',
  'username@domain@domain.com',
  'username@domain',
  '',
  '   ',
] as const;

export const INVALID_PASSWORDS = ['123', '7charac', 'verylongpassword21cha', '', '     '] as const;

export const INVALID_USERNAMES = ['', 'us', 'verylongpassword21cha', '   '] as const;

/**
 * Valid test data boundaries
 */
export const VALIDATION_RULES = {
  password: {
    minLength: 8,
    maxLength: 20,
  },
  username: {
    minLength: 3,
    maxLength: 20,
  },
  article: {
    title: {
      minLength: 1,
      maxLength: 100,
    },
    description: {
      minLength: 1,
      maxLength: 500,
    },
  },
} as const;

/**
 * HTTP Status codes for assertions
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  users: {
    login: 'api/users/login',
    register: 'api/users',
    current: 'api/user',
  },
  articles: {
    base: 'api/articles',
    bySlug: (slug: string) => `api/articles/${slug}`,
    feed: 'api/articles/feed',
    favorite: (slug: string) => `api/articles/${slug}/favorite`,
    comments: (slug: string) => `api/articles/${slug}/comments`,
  },
  profiles: {
    byUsername: (username: string) => `api/profiles/${username}`,
    follow: (username: string) => `api/profiles/${username}/follow`,
  },
  tags: 'api/tags',
} as const;

/**
 * Test tags for categorization
 */
export const TEST_TAGS = {
  SMOKE: '@Smoke',
  SANITY: '@Sanity',
  REGRESSION: '@Regression',
  API: '@Api',
  UI: '@UI',
  NEGATIVE: '@Negative',
  FLAKY: '@Flaky',
} as const;
