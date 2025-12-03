import { Locator, expect } from '@playwright/test';
import { BasePage } from './base/base-page';

/**
 * Register/Sign Up Page - handles new user registration
 */
export class RegisterPage extends BasePage {
  readonly pagePath = '/#/register';
  readonly pageLoadIndicator: Locator = this.page.getByRole('heading', { name: 'Sign up' });

  // ==================== Locators ====================

  get usernameInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Username' });
  }

  get emailInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Email' });
  }

  get passwordInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Password' });
  }

  get signUpButton(): Locator {
    return this.page.getByRole('button', { name: 'Sign up' });
  }

  get haveAccountLink(): Locator {
    return this.page.getByRole('link', { name: 'Have an account?' });
  }

  get errorMessages(): Locator {
    return this.page.locator('.error-messages li');
  }

  // ==================== Actions ====================

  /**
   * Fill in the registration form
   */
  async fillRegistrationForm(username: string, email: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  /**
   * Submit the registration form
   */
  async submitRegistration(): Promise<void> {
    await this.signUpButton.click();
  }

  /**
   * Complete registration flow
   */
  async register(username: string, email: string, password: string): Promise<void> {
    await this.fillRegistrationForm(username, email, password);
    await this.submitRegistration();
  }

  /**
   * Register and verify success
   */
  async registerAndVerify(username: string, email: string, password: string): Promise<void> {
    await this.register(username, email, password);
    await this.waitForApiResponse('api/users', 'POST');
    await expect(this.page.getByRole('navigation').getByText(username)).toBeVisible();
  }

  // ==================== Assertions ====================

  async expectErrorMessage(message: string): Promise<void> {
    await expect(this.errorMessages.filter({ hasText: message })).toBeVisible();
  }

  async expectNoErrors(): Promise<void> {
    await expect(this.errorMessages).toHaveCount(0);
  }
}
