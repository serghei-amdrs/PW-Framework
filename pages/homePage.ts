import { Page, Locator, expect } from '@playwright/test';

/**
 * Home Page Object - handles home/landing page interactions.
 *
 * @deprecated This is a legacy page object. Consider using the new `HomePage`
 * from `pages/home.page.ts` which extends `BasePage` for better consistency.
 *
 * @example
 * ```typescript
 * // In test file
 * const homePage = new HomePage(page);
 * await homePage.navigateToHomePageGuest();
 * await homePage.signIn('user@example.com', 'password');
 * ```
 */
export class HomePage {
  /**
   * Creates an instance of HomePage.
   * @param page - Playwright Page instance
   */
  constructor(private page: Page) {}

  // ==================== Locators ====================

  /** Main banner heading displaying "conduit" logo */
  get homeBanner(): Locator {
    return this.page.getByRole('heading', { name: 'conduit' });
  }

  /** "Your Feed" tab button - visible when logged in */
  get yourFeedBtn(): Locator {
    return this.page.getByText('Your Feed');
  }

  /** "Global Feed" tab button - visible for all users */
  get globalFeedBtn(): Locator {
    return this.page.getByText('Global Feed');
  }

  /** Link to Bondar Academy website in footer */
  get bondarAcademyLink(): Locator {
    return this.page.getByRole('link', {
      name: 'www.bondaracademy.com',
    });
  }

  /** Message displayed when no articles exist in the feed */
  get noArticlesMessage(): Locator {
    return this.page.getByText('No articles are here... yet.');
  }

  // ==================== Actions ====================

  /**
   * Navigate to home page as a guest (unauthenticated) user.
   * Waits for the home banner to be visible before returning.
   */
  async navigateToHomePageGuest(): Promise<void> {
    await this.page.goto(process.env.URL as string);
    await expect(this.homeBanner).toBeVisible();
  }

  /**
   * Navigate to home page as an authenticated user.
   * Waits for both feed tabs to be visible before returning.
   */
  async navigateToHomePageUser(): Promise<void> {
    await this.page.goto(process.env.URL as string);
    await expect(this.yourFeedBtn).toBeVisible();
    await expect(this.globalFeedBtn).toBeVisible();
  }

  /**
   * Sign in to the application with provided credentials.
   * Navigates to sign in page, fills form, and waits for successful authentication.
   *
   * @param email - User's email address
   * @param password - User's password
   *
   * @example
   * ```typescript
   * await homePage.signIn('test@example.com', 'password123');
   * ```
   */
  async signIn(email: string, password: string): Promise<void> {
    await this.page.getByRole('link', { name: 'Sign in' }).click();
    await this.page.getByPlaceholder('Email').fill(email);
    await this.page.getByPlaceholder('Password').fill(password);
    await this.page.getByRole('button', { name: 'Sign in' }).click();
    await expect(this.yourFeedBtn).toBeVisible();
  }
}
