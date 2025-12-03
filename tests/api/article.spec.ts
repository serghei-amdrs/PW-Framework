import { ArticleResponseSchema } from '../../fixtures/api/schemas';
import { ArticleResponse } from '../../fixtures/api/types-guards';
import { test, expect } from '../../fixtures/pom/test-options';
import { ArticleBuilder } from '../../test-data/builders';
import { HTTP_STATUS, API_ENDPOINTS } from '../../test-data/constants';

test.describe('Article API CRUD Operations', () => {
  test(
    'should create, read, update, and delete an article via API',
    { tag: ['@API', '@Regression'] },
    async ({ apiRequest }) => {
      // Use ArticleBuilder for test data
      const articleBuilder = new ArticleBuilder().withTimestampPrefix();
      const createPayload = articleBuilder.buildPayload();
      const updatePayload = articleBuilder.buildUpdatedPayload();

      let articleSlug: string;

      await test.step('Create an article', async () => {
        const { status, body } = await apiRequest<ArticleResponse>({
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
      });

      await test.step('Read the article', async () => {
        const { status, body } = await apiRequest<ArticleResponse>({
          method: 'GET',
          url: API_ENDPOINTS.articles.bySlug(articleSlug),
          baseUrl: process.env.API_URL,
        });

        expect(status).toBe(HTTP_STATUS.OK);
        expect(ArticleResponseSchema.parse(body)).toBeTruthy();
        expect(body.article.title).toBe(createPayload.article.title);
      });

      await test.step('Update the article', async () => {
        const { status, body } = await apiRequest<ArticleResponse>({
          method: 'PUT',
          url: API_ENDPOINTS.articles.bySlug(articleSlug),
          baseUrl: process.env.API_URL,
          body: updatePayload as unknown as Record<string, unknown>,
          headers: process.env.ACCESS_TOKEN,
        });

        expect(status).toBe(HTTP_STATUS.OK);
        expect(ArticleResponseSchema.parse(body)).toBeTruthy();
        expect(body.article.title).toBe(updatePayload.article.title);
        articleSlug = body.article.slug;
      });

      await test.step('Verify article was updated', async () => {
        const { status, body } = await apiRequest<ArticleResponse>({
          method: 'GET',
          url: API_ENDPOINTS.articles.bySlug(articleSlug),
          baseUrl: process.env.API_URL,
        });

        expect(status).toBe(HTTP_STATUS.OK);
        expect(ArticleResponseSchema.parse(body)).toBeTruthy();
        expect(body.article.title).toBe(updatePayload.article.title);
      });

      await test.step('Delete the article', async () => {
        const { status } = await apiRequest({
          method: 'DELETE',
          url: API_ENDPOINTS.articles.bySlug(articleSlug),
          baseUrl: process.env.API_URL,
          headers: process.env.ACCESS_TOKEN,
        });

        expect(status).toBe(HTTP_STATUS.NO_CONTENT);
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
