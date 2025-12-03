/**
 * Main fixtures entry point
 *
 * Exports different fixture combinations based on test needs:
 *
 * 1. test (unified) - Full framework with page objects, API, and cleanup
 *    Best for: Comprehensive tests that need everything
 *
 * 2. pageObjectTest - Page objects only
 *    Best for: Simple UI tests without API interactions
 *
 * 3. apiTest - API request function only
 *    Best for: Pure API tests with manual request building
 *
 * @example
 * // Full framework
 * import { test, expect } from './fixtures';
 *
 * // Page objects only
 * import { pageObjectTest, expect } from './fixtures';
 *
 * // API only
 * import { apiTest, expect } from './fixtures';
 */

// Unified test with all fixtures (recommended)
export { test, expect } from './unified';

// Individual fixture exports for selective use
export { test as pageObjectTest } from './pom/page-object-fixture';
export { test as apiTest } from './api/api-request-fixture';
export { test as cleanupTest } from './test-hooks/cleanup.fixture';

// Type exports
export type { PageFixtures } from './pom/page-object-fixture';
export type { CleanupFixtures, TestArticle } from './test-hooks/cleanup.fixture';
export type { ApiRequestMethods } from './api/types-guards';

// Re-export services for direct use
export { ArticleApiService } from './api/services/article-api.service';
export { UserApiService } from './api/services/user-api.service';
export { CleanupManager } from './test-hooks/cleanup.fixture';
