import { test as base, APIRequestContext } from '@playwright/test';
import { ArticleApiService } from '../api/services/article-api.service';
import { UserApiService } from '../api/services/user-api.service';
import { ArticleBuilder } from '../../test-data/builders';
import { ArticleData } from '../../test-data/types';

/**
 * Cleanup manager for tracking and cleaning up test resources
 */
export class CleanupManager {
  private articleSlugs: string[] = [];
  private articleService: ArticleApiService;

  constructor(request: APIRequestContext, baseUrl: string, token?: string) {
    this.articleService = new ArticleApiService(request, baseUrl, token);
  }

  /**
   * Register an article for cleanup after test
   */
  registerArticle(slug: string): void {
    if (!this.articleSlugs.includes(slug)) {
      this.articleSlugs.push(slug);
    }
  }

  /**
   * Unregister an article (use when manually deleting an article)
   */
  unregisterArticle(slug: string): void {
    this.articleSlugs = this.articleSlugs.filter((s) => s !== slug);
  }

  /**
   * Update token (useful when token is obtained during test)
   */
  setToken(token: string): void {
    this.articleService.setToken(token);
  }

  /**
   * Clean up all registered resources
   */
  async cleanup(): Promise<void> {
    // Clean up articles in reverse order (LIFO)
    for (const slug of this.articleSlugs.reverse()) {
      try {
        await this.articleService.deleteArticle(slug);
      } catch {
        // Ignore errors - article may already be deleted
      }
    }
    this.articleSlugs = [];
  }
}

/**
 * Test article data created via API for test setup
 */
export interface TestArticle {
  slug: string;
  title: string;
  description: string;
  body: string;
  tagList: string[];
}

/**
 * Cleanup fixture types
 */
export interface CleanupFixtures {
  /**
   * Cleanup manager for registering resources to be cleaned up after test
   */
  cleanup: CleanupManager;

  /**
   * Article API service for direct API operations
   */
  articleApi: ArticleApiService;

  /**
   * User API service for authentication operations
   */
  userApi: UserApiService;

  /**
   * Pre-created test article (created via API before test, deleted after)
   */
  testArticle: TestArticle;
}

export const test = base.extend<CleanupFixtures>({
  /**
   * Cleanup manager - automatically cleans up after each test
   */
  cleanup: async ({ request }, use) => {
    const cleanup = new CleanupManager(
      request,
      process.env.API_URL || '',
      process.env.ACCESS_TOKEN
    );

    await use(cleanup);

    // Automatic cleanup after test
    await cleanup.cleanup();
  },

  /**
   * Article API service with authentication
   */
  articleApi: async ({ request }, use) => {
    const service = new ArticleApiService(
      request,
      process.env.API_URL || '',
      process.env.ACCESS_TOKEN
    );
    await use(service);
  },

  /**
   * User API service
   */
  userApi: async ({ request }, use) => {
    const service = new UserApiService(request, process.env.API_URL || '');
    await use(service);
  },

  /**
   * Pre-created test article fixture
   * Creates an article via API before the test and deletes it after
   */
  testArticle: async ({ articleApi, cleanup }, use) => {
    // Create article before test
    const articleData = new ArticleBuilder().withTimestampPrefix().buildPayload();

    const { slug, article } = await articleApi.createArticle(articleData);

    // Register for cleanup
    cleanup.registerArticle(slug);

    const testArticle: TestArticle = {
      slug,
      title: article.title,
      description: article.description,
      body: article.body,
      tagList: article.tagList,
    };

    await use(testArticle);

    // Cleanup is handled by cleanup fixture
  },
});

export { expect } from '@playwright/test';
