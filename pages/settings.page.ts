import { Locator, expect } from '@playwright/test';
import { BasePage } from './base/base-page';

/**
 * Settings Page - handles user profile settings
 */
export class SettingsPage extends BasePage {
  readonly pagePath = '/#/settings';
  readonly pageLoadIndicator: Locator = this.page.getByRole('heading', { name: 'Your Settings' });

  // ==================== Locators ====================

  get profileImageInput(): Locator {
    return this.page.getByRole('textbox', { name: 'URL of profile picture' });
  }

  get usernameInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Username' });
  }

  get bioTextarea(): Locator {
    return this.page.getByRole('textbox', { name: 'Short bio about you' });
  }

  get emailInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Email' });
  }

  get passwordInput(): Locator {
    return this.page.getByRole('textbox', { name: 'New Password' });
  }

  get updateSettingsButton(): Locator {
    return this.page.getByRole('button', { name: 'Update Settings' });
  }

  get logoutButton(): Locator {
    return this.page.getByRole('button', { name: 'Or click here to logout.' });
  }

  // ==================== Actions ====================

  /**
   * Update profile image URL
   */
  async updateProfileImage(imageUrl: string): Promise<void> {
    await this.profileImageInput.fill(imageUrl);
  }

  /**
   * Update username
   */
  async updateUsername(username: string): Promise<void> {
    await this.usernameInput.fill(username);
  }

  /**
   * Update bio
   */
  async updateBio(bio: string): Promise<void> {
    await this.bioTextarea.fill(bio);
  }

  /**
   * Update email
   */
  async updateEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  /**
   * Update password
   */
  async updatePassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  /**
   * Save settings changes
   */
  async saveSettings(): Promise<void> {
    await this.updateSettingsButton.click();
    await this.waitForApiResponse('api/user', 'PUT');
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await this.logoutButton.click();
    await expect(this.page.getByRole('heading', { name: 'conduit' })).toBeVisible();
  }

  // ==================== Assertions ====================

  async expectUsername(username: string): Promise<void> {
    await expect(this.usernameInput).toHaveValue(username);
  }

  async expectEmail(email: string): Promise<void> {
    await expect(this.emailInput).toHaveValue(email);
  }
}
