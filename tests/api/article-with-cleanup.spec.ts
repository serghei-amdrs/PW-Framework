/**
 * Article API Tests - Demonstrating Cleanup Fixtures
 *
 * This test file shows best practices for test isolation:
 * 1. Using testArticle fixture for pre-created test data
 * 2. Using cleanup fixture for automatic resource cleanup
 * 3. Using articleApi service for API operations
 */
import { test, expect } from '../../fixtures';
import { ArticleResponseSchema } from '../../fixtures/api/schemas';
import { ArticleBuilder } from '../../test-data/builders';
import { HTTP_STATUS, API_ENDPOINTS } from '../../test-data/constants';

test.describe('Article API with Cleanup Fixtures', () => {
  /**
   * Test using testArticle fixture - article is pre-created and auto-cleaned
   */
  test(
    'should read a pre-created article',
    { tag: ['@API', '@Smoke'] },
    async ({ testArticle, apiRequest }) => {
      // testArticle is already created, use it directly
      const { status, body } = await apiRequest<{ article: typeof testArticle }>({
        method: 'GET',
        url: API_ENDPOINTS.articles.bySlug(testArticle.slug),
        baseUrl: process.env.API_URL,
      });

      expect(status).toBe(HTTP_STATUS.OK);
      expect(body.article.title).toBe(testArticle.title);
      expect(body.article.description).toBe(testArticle.description);
      // Article will be automatically deleted after test
    }
  );

  /**
   * Test using articleApi service with manual cleanup registration
   */
  test(
    'should update article using API service',
    { tag: ['@API', '@Regression'] },
    async ({ articleApi, cleanup }) => {
      // Create article using service
      const createData = new ArticleBuilder().withTimestampPrefix().build();
      const createdResult = await articleApi.createArticle({
        article: createData,
      });

      // Register for cleanup (automatic deletion after test)
      cleanup.registerArticle(createdResult.slug);

      // Update the article
      const updateData = new ArticleBuilder().withTimestampPrefix().build();
      const updatedResult = await articleApi.updateArticle(createdResult.slug, {
        article: updateData,
      });

      expect(updatedResult.article.title).toBe(updateData.title);
      expect(updatedResult.article.description).toBe(updateData.description);
      // Article will be automatically deleted after test
    }
  );

  /**
   * Test demonstrating multiple articles with cleanup
   */
  test(
    'should handle multiple articles with cleanup',
    { tag: ['@API', '@Regression'] },
    async ({ articleApi, cleanup }) => {
      const articles: string[] = [];

      // Create multiple articles
      for (let i = 0; i < 3; i++) {
        const data = new ArticleBuilder()
          .withTitle(`Test Article ${i + 1}`)
          .withTimestampPrefix()
          .build();

        const article = await articleApi.createArticle({ article: data });
        articles.push(article.slug);
        cleanup.registerArticle(article.slug);
      }

      // Verify all articles exist
      for (const slug of articles) {
        const article = await articleApi.getArticle(slug);
        expect(article).toBeDefined();
      }

      // All articles will be automatically deleted after test
    }
  );

  /**
   * Original CRUD test - kept for reference, now with improved cleanup
   */
  test(
    'should create, read, update, and delete an article via API',
    { tag: ['@API', '@Regression'] },
    async ({ apiRequest, cleanup }) => {
      const articleBuilder = new ArticleBuilder().withTimestampPrefix();
      const createPayload = articleBuilder.buildPayload();
      const updatePayload = articleBuilder.buildUpdatedPayload();

      let articleSlug: string;

      await test.step('Create an article', async () => {
        const { status, body } = await apiRequest<{ article: { slug: string; title: string } }>({
          method: 'POST',
          url: `${API_ENDPOINTS.articles.base}/`,
          baseUrl: process.env.API_URL,
          body: createPayload as unknown as Record<string, unknown>,
          headers: process.env.ACCESS_TOKEN,
        });

        expect(status).toBe(HTTP_STATUS.CREATED);
        expect(ArticleResponseSchema.parse(body)).toBeTruthy();
        expect(body.article.title).toBe(createPayload.article.title);
        articleSlug = body.article.slug;

        // Register for cleanup in case test fails before delete step
        cleanup.registerArticle(articleSlug);
      });

      await test.step('Read the article', async () => {
        const { status, body } = await apiRequest<{ article: { title: string } }>({
          method: 'GET',
          url: API_ENDPOINTS.articles.bySlug(articleSlug),
          baseUrl: process.env.API_URL,
        });

        expect(status).toBe(HTTP_STATUS.OK);
        expect(body.article.title).toBe(createPayload.article.title);
      });

      await test.step('Update the article', async () => {
        const { status, body } = await apiRequest<{ article: { slug: string; title: string } }>({
          method: 'PUT',
          url: API_ENDPOINTS.articles.bySlug(articleSlug),
          baseUrl: process.env.API_URL,
          body: updatePayload as unknown as Record<string, unknown>,
          headers: process.env.ACCESS_TOKEN,
        });

        expect(status).toBe(HTTP_STATUS.OK);
        expect(body.article.title).toBe(updatePayload.article.title);

        // Update slug if changed
        if (body.article.slug !== articleSlug) {
          cleanup.unregisterArticle(articleSlug);
          articleSlug = body.article.slug;
          cleanup.registerArticle(articleSlug);
        }
      });

      await test.step('Delete the article', async () => {
        const { status } = await apiRequest({
          method: 'DELETE',
          url: API_ENDPOINTS.articles.bySlug(articleSlug),
          baseUrl: process.env.API_URL,
          headers: process.env.ACCESS_TOKEN,
        });

        expect(status).toBe(HTTP_STATUS.NO_CONTENT);

        // Unregister since we manually deleted
        cleanup.unregisterArticle(articleSlug);
      });

      await test.step('Verify article was deleted', async () => {
        const { status } = await apiRequest({
          method: 'GET',
          url: API_ENDPOINTS.articles.bySlug(articleSlug),
          baseUrl: process.env.API_URL,
        });

        expect(status).toBe(HTTP_STATUS.NOT_FOUND);
      });
    }
  );
});
