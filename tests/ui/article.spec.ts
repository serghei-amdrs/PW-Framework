import { test, expect } from "../../fixtures/pom/page-object-fixture";
import { faker } from "@faker-js/faker";

test.describe(
  "Verify Publish/Edit/Delete an Article",
  { tag: ["@UI", "@Regression"] },
  () => {
    const randomArticleTitle = faker.lorem.words(3);
    const randomArticleDescription = faker.lorem.sentence();
    const randomArticleBody = faker.lorem.paragraphs(2);
    const randomArticleTag = faker.lorem.word();
    let articleId: string;

    test.beforeEach(async ({ homePage }) => {
      await homePage.navigateToHomePageUser();
    });

    test.afterEach(async ({ page }) => {
      await page.close();
    });

    test("Verify Publish/Edit/Delete an Article", async ({
      navPage,
      articlePage,
      page,
    }) => {
      await test.step("Verify Publish an Article", async () => {
        await navPage.newArticleButton.click();
        const response = await Promise.all([
          articlePage.publishArticle(
            randomArticleTitle,
            randomArticleDescription,
            randomArticleBody,
            randomArticleTag
          ),
          page.waitForResponse(
            (res) =>
              res.url() === `${process.env.API_URL}api/articles/` &&
              res.request().method() === "POST"
          ),
        ]);

        const responseBody = await response[1].json();
        articleId = responseBody.article.slug;
        console.log("articleId", articleId);
      });

      await test.step("Verify Edit an Article", async () => {
        await articlePage.navigateToEditArticlePage();

        await expect(articlePage.articleTitleInput).toHaveValue(
          randomArticleTitle
        );

        await articlePage.editArticle(
          `Updated ${randomArticleTitle}`,
          `Updated ${randomArticleDescription}`,
          `Updated ${randomArticleBody}`
        );
      });

      await test.step("Verify Delete an Article", async () => {
        await articlePage.deleteArticle();
      });
    });
  }
);
