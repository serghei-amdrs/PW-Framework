/**
 * Article API Tests - Using New API Client Infrastructure
 *
 * Demonstrates:
 * 1. ArticleApiClient with type-safe methods
 * 2. Schema validation with Zod
 * 3. Validation helpers for assertions
 * 4. Proper error handling
 */
import { test, expect } from '@playwright/test';
import { ArticleApiClient } from '../../fixtures/api/client';
import { UserApiClient } from '../../fixtures/api/client';
import {
  assertArticleProperties,
  assertStatus,
  validateArticleResponse,
} from '../../fixtures/api/helpers';
import { ArticleBuilder } from '../../test-data/builders';
import { HTTP_STATUS } from '../../test-data/constants';

test.describe('Article API with New Infrastructure', () => {
  test(
    'should create article with type-safe client',
    { tag: ['@API', '@Smoke'] },
    async ({ request }) => {
      const articleClient = new ArticleApiClient(
        request,
        process.env.API_URL || '',
        process.env.ACCESS_TOKEN
      );

      // Build test data
      const articleData = new ArticleBuilder()
        .withTimestampPrefix()
        .withTags(['test', 'automation'])
        .build();

      // Create article using type-safe client
      const article = await articleClient.createArticle({
        article: articleData,
      });

      // Assert with validation helper
      expect(article.slug).toBeTruthy();
      expect(article.title).toBe(articleData.title);
      expect(article.description).toBe(articleData.description);
      // Note: API may capitalize tags, so we compare case-insensitively
      expect(article.tagList.map((t) => t.toLowerCase())).toEqual(
        expect.arrayContaining(articleData.tagList.map((t) => t.toLowerCase()))
      );

      // Cleanup
      await articleClient.deleteArticle(article.slug);
    }
  );

  test(
    'should validate article response schema',
    { tag: ['@API', '@Regression'] },
    async ({ request }) => {
      const articleClient = new ArticleApiClient(
        request,
        process.env.API_URL || '',
        process.env.ACCESS_TOKEN
      );

      // Build and create article
      const articleData = new ArticleBuilder().withTimestampPrefix().build();
      const article = await articleClient.createArticle({ article: articleData });

      try {
        // Get article and validate response
        const fetchedArticle = await articleClient.getArticle(article.slug);

        // Schema validation
        const response = { article: fetchedArticle };
        const validationResult = validateArticleResponse(response);
        expect(validationResult.success).toBe(true);

        // Property assertions using helper
        assertArticleProperties(fetchedArticle!, {
          title: articleData.title,
          description: articleData.description,
        });
      } finally {
        // Cleanup
        await articleClient.deleteArticle(article.slug);
      }
    }
  );

  test(
    'should handle article update with new slug',
    { tag: ['@API', '@Regression'] },
    async ({ request }) => {
      const articleClient = new ArticleApiClient(
        request,
        process.env.API_URL || '',
        process.env.ACCESS_TOKEN
      );

      // Create article
      const originalData = new ArticleBuilder()
        .withTitle('Original Title')
        .withTimestampPrefix()
        .build();
      const article = await articleClient.createArticle({ article: originalData });
      let currentSlug = article.slug;

      try {
        // Update article
        const updateData = new ArticleBuilder()
          .withTitle('Updated Title')
          .withTimestampPrefix()
          .build();
        const updatedArticle = await articleClient.updateArticle(currentSlug, {
          article: updateData,
        });

        // Slug may change after update
        currentSlug = updatedArticle.slug;

        // Assert update was successful
        expect(updatedArticle.title).toBe(updateData.title);
      } finally {
        // Cleanup with potentially new slug
        await articleClient.deleteArticleIfExists(currentSlug);
      }
    }
  );

  test(
    'should return null for non-existent article',
    { tag: ['@API', '@Negative'] },
    async ({ request }) => {
      const articleClient = new ArticleApiClient(
        request,
        process.env.API_URL || '',
        process.env.ACCESS_TOKEN
      );

      const nonExistentSlug = 'this-article-does-not-exist-12345';
      const article = await articleClient.getArticle(nonExistentSlug);

      expect(article).toBeNull();
    }
  );

  test(
    'should get article with status code',
    { tag: ['@API', '@Regression'] },
    async ({ request }) => {
      const articleClient = new ArticleApiClient(
        request,
        process.env.API_URL || '',
        process.env.ACCESS_TOKEN
      );

      // Create article
      const articleData = new ArticleBuilder().withTimestampPrefix().build();
      const created = await articleClient.createArticle({ article: articleData });

      try {
        // Get with status
        const response = await articleClient.getArticleResponse(created.slug);

        assertStatus(response.status, HTTP_STATUS.OK);
        expect(response.article).not.toBeNull();
        expect(response.article?.title).toBe(articleData.title);
      } finally {
        await articleClient.deleteArticle(created.slug);
      }
    }
  );

  test(
    'should list articles with filters',
    { tag: ['@API', '@Regression'] },
    async ({ request }) => {
      const articleClient = new ArticleApiClient(
        request,
        process.env.API_URL || '',
        process.env.ACCESS_TOKEN
      );

      // Create article with specific tag
      const tag = `test-tag-${Date.now()}`;
      const articleData = new ArticleBuilder().withTimestampPrefix().withTags([tag]).build();
      const article = await articleClient.createArticle({ article: articleData });

      try {
        // List with tag filter
        const articlesResponse = await articleClient.listArticles({
          tag,
          limit: 10,
        });

        expect(articlesResponse.articles).toBeDefined();
        expect(articlesResponse.articlesCount).toBeGreaterThanOrEqual(1);

        // Find our article in the list
        const foundArticle = articlesResponse.articles.find((a) => a.slug === article.slug);
        expect(foundArticle).toBeDefined();
      } finally {
        await articleClient.deleteArticle(article.slug);
      }
    }
  );

  test.describe('Comments', () => {
    test(
      'should add and retrieve comments',
      { tag: ['@API', '@Regression'] },
      async ({ request }) => {
        const articleClient = new ArticleApiClient(
          request,
          process.env.API_URL || '',
          process.env.ACCESS_TOKEN
        );

        // Create article
        const articleData = new ArticleBuilder().withTimestampPrefix().build();
        const article = await articleClient.createArticle({ article: articleData });

        try {
          // Add comment
          const commentBody = 'This is a test comment';
          const comment = await articleClient.addComment(article.slug, {
            comment: { body: commentBody },
          });

          expect(comment.body).toBe(commentBody);
          expect(comment.id).toBeDefined();

          // Get comments
          const comments = await articleClient.getComments(article.slug);

          expect(comments.length).toBeGreaterThanOrEqual(1);
          expect(comments.some((c) => c.id === comment.id)).toBeTruthy();

          // Delete comment
          const deleted = await articleClient.deleteComment(article.slug, comment.id);
          expect(deleted).toBeTruthy();
        } finally {
          await articleClient.deleteArticle(article.slug);
        }
      }
    );
  });
});

test.describe('User API with New Infrastructure', () => {
  test('should login with valid credentials', { tag: ['@API', '@Smoke'] }, async ({ request }) => {
    const userClient = new UserApiClient(request, process.env.API_URL || '');

    const user = await userClient.login(process.env.EMAIL || '', process.env.PASSWORD || '');

    expect(user.email).toBe(process.env.EMAIL);
    expect(user.token).toBeTruthy();

    // Token is auto-set on client
    expect(userClient.getToken()).toBe(user.token);
  });

  test(
    'should handle login failure gracefully',
    { tag: ['@API', '@Negative'] },
    async ({ request }) => {
      const userClient = new UserApiClient(request, process.env.API_URL || '');

      const response = await userClient.loginWithResponse('invalid@email.com', 'wrongpassword');

      assertStatus(response.status, HTTP_STATUS.FORBIDDEN);
    }
  );

  test('should get current user profile', { tag: ['@API', '@Regression'] }, async ({ request }) => {
    const userClient = new UserApiClient(request, process.env.API_URL || '');

    // First login to get token
    await userClient.login(process.env.EMAIL || '', process.env.PASSWORD || '');

    // Get current user
    const user = await userClient.getCurrentUser();

    expect(user.email).toBe(process.env.EMAIL);
    expect(user.username).toBeTruthy();
  });

  test(
    'should get user profile by username',
    { tag: ['@API', '@Regression'] },
    async ({ request }) => {
      const userClient = new UserApiClient(request, process.env.API_URL || '');

      // Login first
      const user = await userClient.login(process.env.EMAIL || '', process.env.PASSWORD || '');

      // Get profile
      const profile = await userClient.getProfile(user.username);

      expect(profile.username).toBe(user.username);
      expect(profile).toHaveProperty('bio');
      expect(profile).toHaveProperty('image');
      expect(profile).toHaveProperty('following');
    }
  );
});
