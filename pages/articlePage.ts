import { Page, Locator, expect } from "@playwright/test";

export class ArticlePage {
  constructor(private page: Page) {}

  get articleTitleInput(): Locator {
    return this.page.getByRole("textbox", {
      name: "Article Title",
    });
  }
  get articleDescriptionInput(): Locator {
    return this.page.getByRole("textbox", {
      name: "What's this article about?",
    });
  }
  get articleBodyInput(): Locator {
    return this.page.getByRole("textbox", {
      name: "Write your article (in",
    });
  }
  get articleTagInput(): Locator {
    return this.page.getByRole("textbox", {
      name: "Enter tags",
    });
  }
  get publishArticleButton(): Locator {
    return this.page.getByRole("button", {
      name: "Publish Article",
    });
  }
  get publishErrorMessage(): Locator {
    return this.page.getByText("title can't be blank");
  }
  get editArticleButton(): Locator {
    return this.page.getByRole("link", { name: " Edit Article" }).first();
  }
  get deleteArticleButton(): Locator {
    return this.page.getByRole("button", { name: " Delete Article" }).first();
  }

  async navigateToEditArticlePage(): Promise<void> {
    await this.editArticleButton.click();

    await this.page.waitForResponse(
      (response) =>
        response.url().includes("/api/articles/") &&
        response.request().method() === "GET"
    );
  }

  async publishArticle(
    title: string,
    description: string,
    body: string,
    tags?: string
  ): Promise<void> {
    await this.articleTitleInput.fill(title);
    await this.articleDescriptionInput.fill(description);
    await this.articleBodyInput.fill(body);

    if (tags) {
      await this.articleTagInput.fill(tags);
    }

    await this.publishArticleButton.click();

    await this.page.waitForResponse(
      (response) =>
        response.url().includes("/api/articles/") &&
        response.request().method() === "GET"
    );

    await expect(this.page.getByRole("heading", { name: title })).toBeVisible();
  }

  async editArticle(
    title: string,
    description: string,
    body: string,
    tags?: string
  ): Promise<void> {
    await this.articleTitleInput.fill(title);
    await this.articleDescriptionInput.fill(description);
    await this.articleBodyInput.fill(body);

    if (tags) {
      await this.articleTagInput.fill(tags);
    }

    await this.publishArticleButton.click();

    await this.page.waitForResponse(
      (response) =>
        response.url().includes("/api/articles/") &&
        response.request().method() === "GET"
    );

    await expect(this.page.getByRole("heading", { name: title })).toBeVisible();
  }

  async deleteArticle(): Promise<void> {
    await this.deleteArticleButton.click();

    await expect(this.page.getByText("Global Feed")).toBeVisible();
  }
}
