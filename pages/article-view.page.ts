import { Locator, expect } from '@playwright/test';
import { BasePage } from './base/base-page';

/**
 * Article View Page - displays a single article with comments
 */
export class ArticleViewPage extends BasePage {
  // Note: pagePath is dynamic based on article slug
  readonly pagePath = '/#/article';
  readonly pageLoadIndicator: Locator = this.page.locator('.article-page');

  // ==================== Locators ====================

  get articleTitle(): Locator {
    return this.page.locator('.article-page h1');
  }

  get articleBody(): Locator {
    return this.page.locator('.article-content');
  }

  get articleTags(): Locator {
    return this.page.locator('.article-page .tag-list .tag-pill');
  }

  get authorName(): Locator {
    return this.page.locator('.article-meta .author');
  }

  get articleDate(): Locator {
    return this.page.locator('.article-meta .date');
  }

  get editArticleButton(): Locator {
    return this.page.getByRole('link', { name: ' Edit Article' }).first();
  }

  get deleteArticleButton(): Locator {
    return this.page.getByRole('button', { name: ' Delete Article' }).first();
  }

  get followAuthorButton(): Locator {
    return this.page.getByRole('button', { name: /Follow/ }).first();
  }

  get favoriteArticleButton(): Locator {
    return this.page.getByRole('button', { name: /Favorite/ }).first();
  }

  // Comments section
  get commentTextarea(): Locator {
    return this.page.getByRole('textbox', { name: 'Write a comment...' });
  }

  get postCommentButton(): Locator {
    return this.page.getByRole('button', { name: 'Post Comment' });
  }

  get commentCards(): Locator {
    return this.page.locator('.card');
  }

  // ==================== Actions ====================

  /**
   * Navigate to article by slug
   */
  async navigateToArticle(slug: string): Promise<void> {
    await this.page.goto(`/#/article/${slug}`);
    await this.waitForPageLoad();
  }

  /**
   * Click edit article button and wait for editor to load
   */
  async clickEditArticle(): Promise<void> {
    await this.editArticleButton.click();
    await this.waitForApiResponse('/api/articles/', 'GET');
  }

  /**
   * Delete the current article
   */
  async deleteArticle(): Promise<void> {
    await this.deleteArticleButton.click();
    await expect(this.page.getByText('Global Feed')).toBeVisible();
  }

  /**
   * Follow the article author
   */
  async followAuthor(): Promise<void> {
    await this.followAuthorButton.click();
  }

  /**
   * Favorite the article
   */
  async favoriteArticle(): Promise<void> {
    await this.favoriteArticleButton.click();
  }

  /**
   * Add a comment to the article
   */
  async addComment(commentText: string): Promise<void> {
    await this.commentTextarea.fill(commentText);
    await this.postCommentButton.click();
    await this.waitForApiResponse('/api/articles/', 'POST');
  }

  /**
   * Delete a comment by index
   */
  async deleteComment(index: number): Promise<void> {
    const deleteButton = this.commentCards.nth(index).locator('.ion-trash-a');
    await deleteButton.click();
  }

  // ==================== Assertions ====================

  async expectArticleTitle(title: string): Promise<void> {
    await expect(this.articleTitle).toHaveText(title);
  }

  async expectAuthor(authorName: string): Promise<void> {
    await expect(this.authorName).toHaveText(authorName);
  }

  async expectTag(tagName: string): Promise<void> {
    await expect(this.articleTags.filter({ hasText: tagName })).toBeVisible();
  }

  async expectCommentVisible(commentText: string): Promise<void> {
    await expect(this.commentCards.filter({ hasText: commentText })).toBeVisible();
  }

  async expectEditButtonVisible(): Promise<void> {
    await expect(this.editArticleButton).toBeVisible();
  }

  async expectEditButtonHidden(): Promise<void> {
    await expect(this.editArticleButton).toBeHidden();
  }
}
