import { Locator, expect } from '@playwright/test';
import { BasePage } from './base/base-page';

/**
 * User Profile Page - displays user's articles and favorites
 */
export class ProfilePage extends BasePage {
  readonly pagePath = '/#/profile';
  readonly pageLoadIndicator: Locator = this.page.locator('.profile-page');

  // ==================== Locators ====================

  get profileImage(): Locator {
    return this.page.locator('.user-img');
  }

  get username(): Locator {
    return this.page.locator('.profile-page h4');
  }

  get bio(): Locator {
    return this.page.locator('.profile-page p');
  }

  get followButton(): Locator {
    return this.page.getByRole('button', { name: /Follow/ });
  }

  get editProfileButton(): Locator {
    return this.page.getByRole('link', { name: 'Edit Profile Settings' });
  }

  get myArticlesTab(): Locator {
    return this.page.getByRole('link', { name: 'My Articles' });
  }

  get favoritedArticlesTab(): Locator {
    return this.page.getByRole('link', { name: 'Favorited Articles' });
  }

  get articlePreviews(): Locator {
    return this.page.locator('.article-preview');
  }

  get noArticlesMessage(): Locator {
    return this.page.getByText('No articles are here... yet.');
  }

  // ==================== Actions ====================

  /**
   * Navigate to a specific user's profile
   */
  async navigateToProfile(username: string): Promise<void> {
    await this.page.goto(`/#/profile/${username}`);
    await this.waitForPageLoad();
  }

  /**
   * Click My Articles tab
   */
  async clickMyArticles(): Promise<void> {
    await this.myArticlesTab.click();
  }

  /**
   * Click Favorited Articles tab
   */
  async clickFavoritedArticles(): Promise<void> {
    await this.favoritedArticlesTab.click();
  }

  /**
   * Follow the user
   */
  async followUser(): Promise<void> {
    await this.followButton.click();
  }

  /**
   * Navigate to edit profile (settings)
   */
  async clickEditProfile(): Promise<void> {
    await this.editProfileButton.click();
  }

  // ==================== Assertions ====================

  async expectUsername(expectedUsername: string): Promise<void> {
    await expect(this.username).toHaveText(expectedUsername);
  }

  async expectBio(expectedBio: string): Promise<void> {
    await expect(this.bio).toHaveText(expectedBio);
  }

  async expectNoArticles(): Promise<void> {
    await expect(this.noArticlesMessage).toBeVisible();
  }

  async expectArticlesVisible(): Promise<void> {
    await expect(this.articlePreviews.first()).toBeVisible();
  }

  async expectEditProfileVisible(): Promise<void> {
    await expect(this.editProfileButton).toBeVisible();
  }

  async expectFollowButtonVisible(): Promise<void> {
    await expect(this.followButton).toBeVisible();
  }
}
