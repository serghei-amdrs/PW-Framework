import { Locator, expect } from '@playwright/test';
import { BasePage } from './base/base-page';

/**
 * Login Page - handles user authentication
 */
export class LoginPage extends BasePage {
  readonly pagePath = '/#/login';
  readonly pageLoadIndicator: Locator = this.page.getByRole('heading', { name: 'Sign in' });

  // ==================== Locators ====================

  get emailInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Email' });
  }

  get passwordInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Password' });
  }

  get signInButton(): Locator {
    return this.page.getByRole('button', { name: 'Sign in' });
  }

  get needAccountLink(): Locator {
    return this.page.getByRole('link', { name: 'Need an account?' });
  }

  get errorMessages(): Locator {
    return this.page.locator('.error-messages li');
  }

  // ==================== Actions ====================

  /**
   * Fill in the login form
   */
  async fillLoginForm(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  /**
   * Submit the login form
   */
  async submitLogin(): Promise<void> {
    await this.signInButton.click();
  }

  /**
   * Complete login flow and wait for success
   */
  async login(email: string, password: string): Promise<void> {
    await this.fillLoginForm(email, password);
    await this.submitLogin();
    await this.waitForApiResponse('api/tags', 'GET');
  }

  /**
   * Login and verify success by checking username in navigation
   */
  async loginAndVerify(email: string, password: string, expectedUsername: string): Promise<void> {
    await this.login(email, password);
    await expect(this.page.getByRole('navigation').getByText(expectedUsername)).toBeVisible();
  }

  /**
   * Attempt login expecting failure
   */
  async loginExpectingError(email: string, password: string): Promise<void> {
    await this.fillLoginForm(email, password);
    await this.submitLogin();
    await expect(this.errorMessages.first()).toBeVisible();
  }

  // ==================== Assertions ====================

  async expectErrorMessage(message: string): Promise<void> {
    await expect(this.errorMessages.filter({ hasText: message })).toBeVisible();
  }

  async expectNoErrors(): Promise<void> {
    await expect(this.errorMessages).toHaveCount(0);
  }
}
