import { Page, Locator, expect } from '@playwright/test';

/**
 * Navigation component - handles the top navigation bar.
 * This is a reusable component, not a page.
 */
export class NavigationComponent {
  constructor(private page: Page) {}

  // ==================== Locators ====================

  get navbar(): Locator {
    return this.page.getByRole('navigation');
  }

  get brandLogo(): Locator {
    return this.navbar.getByRole('link', { name: 'conduit' });
  }

  get homeLink(): Locator {
    return this.page.getByRole('link', { name: 'Home', exact: true });
  }

  get newArticleLink(): Locator {
    return this.page.getByRole('link', { name: 'New Article' });
  }

  get settingsLink(): Locator {
    return this.page.getByRole('link', { name: 'Settings' });
  }

  get signInLink(): Locator {
    return this.page.getByRole('link', { name: 'Sign in' });
  }

  get signUpLink(): Locator {
    return this.page.getByRole('link', { name: 'Sign up' });
  }

  /**
   * Get the username link in the navigation (visible when logged in)
   */
  getUsernameLink(username: string): Locator {
    return this.navbar.getByRole('link', { name: username });
  }

  // ==================== Actions ====================

  async clickHome(): Promise<void> {
    await this.homeLink.click();
  }

  async clickBrandLogo(): Promise<void> {
    await this.brandLogo.click();
  }

  async clickNewArticle(): Promise<void> {
    await this.newArticleLink.click();
  }

  async clickSettings(): Promise<void> {
    await this.settingsLink.click();
  }

  async clickSignIn(): Promise<void> {
    await this.signInLink.click();
  }

  async clickSignUp(): Promise<void> {
    await this.signUpLink.click();
  }

  async clickUserProfile(username: string): Promise<void> {
    await this.getUsernameLink(username).click();
  }

  // ==================== Assertions ====================

  async expectLoggedIn(username: string): Promise<void> {
    await expect(this.getUsernameLink(username)).toBeVisible();
    await expect(this.newArticleLink).toBeVisible();
    await expect(this.settingsLink).toBeVisible();
  }

  async expectLoggedOut(): Promise<void> {
    await expect(this.signInLink).toBeVisible();
    await expect(this.signUpLink).toBeVisible();
  }

  async isLoggedIn(): Promise<boolean> {
    return await this.newArticleLink.isVisible();
  }
}
