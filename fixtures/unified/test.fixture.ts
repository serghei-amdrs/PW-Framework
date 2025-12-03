import { mergeTests } from '@playwright/test';
import { test as pageObjectFixture, expect } from '../pom/page-object-fixture';
import { test as apiRequestFixture } from '../api/api-request-fixture';
import { test as cleanupFixture } from '../test-hooks/cleanup.fixture';

/**
 * Unified test fixture that combines:
 * - Page Object fixtures (all page objects)
 * - API Request fixtures (apiRequest function)
 * - Cleanup fixtures (cleanup manager, API services, testArticle)
 *
 * Use this for tests that need the full framework capabilities.
 *
 * @example
 * import { test, expect } from '../fixtures';
 *
 * test('my test', async ({ homePage, articleApi, cleanup }) => {
 *   // Use page objects
 *   await homePage.navigateAsUser();
 *
 *   // Use API services
 *   const article = await articleApi.createArticle(data);
 *
 *   // Register for cleanup
 *   cleanup.registerArticle(article.slug);
 * });
 */
export const test = mergeTests(pageObjectFixture, apiRequestFixture, cleanupFixture);

export { expect };

// Re-export types for convenience
export type { PageFixtures } from '../pom/page-object-fixture';
export type { CleanupFixtures, TestArticle } from '../test-hooks/cleanup.fixture';
export type { ApiRequestMethods } from '../api/types-guards';
