import { Locator, expect } from '@playwright/test';
import { BasePage } from './base/base-page';

/**
 * Article Editor Page - handles creating and editing articles
 */
export class ArticleEditorPage extends BasePage {
  readonly pagePath = '/#/editor';
  readonly pageLoadIndicator: Locator = this.page.getByRole('textbox', { name: 'Article Title' });

  // ==================== Locators ====================

  get titleInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Article Title' });
  }

  get descriptionInput(): Locator {
    return this.page.getByRole('textbox', { name: "What's this article about?" });
  }

  get bodyInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Write your article (in' });
  }

  get tagsInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Enter tags' });
  }

  get publishButton(): Locator {
    return this.page.getByRole('button', { name: 'Publish Article' });
  }

  get errorMessages(): Locator {
    return this.page.locator('.error-messages li');
  }

  // ==================== Actions ====================

  /**
   * Fill article form
   */
  async fillArticleForm(
    title: string,
    description: string,
    body: string,
    tags?: string
  ): Promise<void> {
    await this.titleInput.fill(title);
    await this.descriptionInput.fill(description);
    await this.bodyInput.fill(body);

    if (tags) {
      await this.tagsInput.fill(tags);
    }
  }

  /**
   * Publish article and wait for navigation to article view
   */
  async publishArticle(
    title: string,
    description: string,
    body: string,
    tags?: string
  ): Promise<void> {
    await this.fillArticleForm(title, description, body, tags);
    await this.publishButton.click();
    await this.waitForApiResponse('/api/articles/', 'GET');
    await expect(this.page.getByRole('heading', { name: title })).toBeVisible();
  }

  /**
   * Update article and wait for navigation
   */
  async updateArticle(
    title: string,
    description: string,
    body: string,
    tags?: string
  ): Promise<void> {
    await this.fillArticleForm(title, description, body, tags);
    await this.publishButton.click();
    await this.waitForApiResponse('/api/articles/', 'GET');
    await expect(this.page.getByRole('heading', { name: title })).toBeVisible();
  }

  /**
   * Clear all form fields
   */
  async clearForm(): Promise<void> {
    await this.titleInput.clear();
    await this.descriptionInput.clear();
    await this.bodyInput.clear();
    await this.tagsInput.clear();
  }

  // ==================== Assertions ====================

  async expectTitleValue(title: string): Promise<void> {
    await expect(this.titleInput).toHaveValue(title);
  }

  async expectDescriptionValue(description: string): Promise<void> {
    await expect(this.descriptionInput).toHaveValue(description);
  }

  async expectBodyValue(body: string): Promise<void> {
    await expect(this.bodyInput).toHaveValue(body);
  }

  async expectErrorMessage(message: string): Promise<void> {
    await expect(this.errorMessages.filter({ hasText: message })).toBeVisible();
  }

  async expectTitleBlankError(): Promise<void> {
    await expect(this.page.getByText("title can't be blank")).toBeVisible();
  }
}
