import { test, expect } from '../../fixtures/pom/page-object-fixture';
import { faker } from '@faker-js/faker';

test.describe('Article CRUD Operations', { tag: ['@UI', '@Regression'] }, () => {
  const randomArticleTitle = faker.lorem.words(3);
  const randomArticleDescription = faker.lorem.sentence();
  const randomArticleBody = faker.lorem.paragraphs(2);
  const randomArticleTag = faker.lorem.word();

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
        randomArticleTitle,
        randomArticleDescription,
        randomArticleBody,
        randomArticleTag
      );

      const response = await responsePromise;
      const responseBody = (await response.json()) as { article: { slug: string } };
      articleSlug = responseBody.article.slug;
    });

    await test.step('Edit the article', async () => {
      await articleViewPage.clickEditArticle();

      await expect(articleEditorPage.titleInput).toHaveValue(randomArticleTitle);

      await articleEditorPage.updateArticle(
        `Updated ${randomArticleTitle}`,
        `Updated ${randomArticleDescription}`,
        `Updated ${randomArticleBody}`
      );
    });

    await test.step('Delete the article', async () => {
      await articleViewPage.deleteArticle();
    });
  });
});
