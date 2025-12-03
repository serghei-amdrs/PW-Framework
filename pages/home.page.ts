import { Locator, expect } from '@playwright/test';
import { BasePage } from './base/base-page';

/**
 * Home Page - the main landing page with article feeds
 */
export class HomePage extends BasePage {
  readonly pagePath = '/';
  readonly pageLoadIndicator: Locator = this.page.getByRole('heading', { name: 'conduit' });

  // ==================== Locators ====================

  get banner(): Locator {
    return this.page.getByRole('heading', { name: 'conduit' });
  }

  get yourFeedTab(): Locator {
    return this.page.getByText('Your Feed');
  }

  get globalFeedTab(): Locator {
    return this.page.getByText('Global Feed');
  }

  get tagFeedTab(): Locator {
    return this.page.locator('.feed-toggle .nav-link').nth(2);
  }

  get noArticlesMessage(): Locator {
    return this.page.getByText('No articles are here... yet.');
  }

  get articlePreviews(): Locator {
    return this.page.locator('.article-preview');
  }

  get popularTags(): Locator {
    return this.page.locator('.sidebar .tag-list .tag-pill');
  }

  get loadingIndicator(): Locator {
    return this.page.getByText('Loading articles...');
  }

  get pagination(): Locator {
    return this.page.locator('.pagination');
  }

  // ==================== Actions ====================

  /**
   * Navigate to home page as a guest (not logged in)
   */
  async navigateAsGuest(): Promise<void> {
    await this.page.goto('/');
    await expect(this.banner).toBeVisible();
  }

  /**
   * Navigate to home page as logged in user
   */
  async navigateAsUser(): Promise<void> {
    await this.page.goto('/');
    await expect(this.yourFeedTab).toBeVisible({ timeout: 15000 });
    await expect(this.globalFeedTab).toBeVisible();
  }

  /**
   * Override navigate to wait for feed tabs when logged in
   */
  override async waitForPageLoad(): Promise<void> {
    // Wait for either guest view (banner only) or logged-in view (feed tabs)
    await expect(this.banner).toBeVisible({ timeout: 10000 });
  }

  /**
   * Click on Your Feed tab
   */
  async clickYourFeed(): Promise<void> {
    await this.yourFeedTab.click();
    await this.waitForArticlesToLoad();
  }

  /**
   * Click on Global Feed tab
   */
  async clickGlobalFeed(): Promise<void> {
    await this.globalFeedTab.click();
    await this.waitForArticlesToLoad();
  }

  /**
   * Click on a specific tag to filter articles
   */
  async clickTag(tagName: string): Promise<void> {
    await this.popularTags.filter({ hasText: tagName }).click();
    await this.waitForArticlesToLoad();
  }

  /**
   * Click on an article by title
   */
  async clickArticle(title: string): Promise<void> {
    await this.page.getByRole('link', { name: title }).click();
  }

  /**
   * Wait for articles to finish loading
   */
  async waitForArticlesToLoad(): Promise<void> {
    await expect(this.loadingIndicator).toBeHidden({ timeout: 10000 });
  }

  /**
   * Favorite an article by index (0-based)
   */
  async favoriteArticle(index: number): Promise<void> {
    const favoriteButton = this.articlePreviews.nth(index).locator('button');
    await favoriteButton.click();
  }

  // ==================== Assertions ====================

  async expectYourFeedActive(): Promise<void> {
    await expect(this.yourFeedTab).toHaveClass(/active/);
  }

  async expectGlobalFeedActive(): Promise<void> {
    await expect(this.globalFeedTab).toHaveClass(/active/);
  }

  async expectNoArticles(): Promise<void> {
    await expect(this.noArticlesMessage).toBeVisible();
  }

  async expectArticlesVisible(): Promise<void> {
    await expect(this.articlePreviews.first()).toBeVisible();
  }

  async expectArticleCount(count: number): Promise<void> {
    await expect(this.articlePreviews).toHaveCount(count);
  }

  async expectTagVisible(tagName: string): Promise<void> {
    await expect(this.popularTags.filter({ hasText: tagName })).toBeVisible();
  }
}
