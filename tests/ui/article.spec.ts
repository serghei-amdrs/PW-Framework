import { test, expect } from '../../fixtures/pom/page-object-fixture';
import { ArticleBuilder } from '../../test-data/builders';

test.describe('Article CRUD Operations', { tag: ['@UI', '@Regression'] }, () => {
  // Use ArticleBuilder for test data
  const articleBuilder = new ArticleBuilder();
  const articleData = articleBuilder.buildFormData();
  const updatedArticleData = articleBuilder.buildUpdated();

  test.beforeEach(async ({ homePage }) => {
    await homePage.navigateAsUser();
  });

  test('should publish, edit, and delete an article', async ({
    navigation,
    articleEditorPage,
    articleViewPage,
    page,
  }) => {
    let articleSlug: string;

    await test.step('Publish a new article', async () => {
      await navigation.clickNewArticle();

      // Wait for POST response to capture article slug
      const responsePromise = page.waitForResponse(
        (res) => res.url().includes('/api/articles') && res.request().method() === 'POST'
      );

      await articleEditorPage.publishArticle(
        articleData.title,
        articleData.description,
        articleData.body,
        articleData.tags
      );

      const response = await responsePromise;
      const responseBody = (await response.json()) as { article: { slug: string } };
      articleSlug = responseBody.article.slug;
    });

    await test.step('Edit the article', async () => {
      await articleViewPage.clickEditArticle();

      await expect(articleEditorPage.titleInput).toHaveValue(articleData.title);

      await articleEditorPage.updateArticle(
        updatedArticleData.title,
        updatedArticleData.description,
        updatedArticleData.body
      );
    });

    await test.step('Delete the article', async () => {
      await articleViewPage.deleteArticle();
    });
  });
});
