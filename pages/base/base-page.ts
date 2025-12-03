import { Page, Locator, expect } from '@playwright/test';

/**
 * Abstract base class for all page objects.
 * Provides common functionality and enforces consistent structure.
 */
export abstract class BasePage {
  constructor(protected page: Page) {}

  /**
   * The relative URL path for this page (e.g., '/#/login', '/#/settings')
   * Override in child classes to define page-specific URLs
   */
  abstract readonly pagePath: string;

  /**
   * The primary element that indicates this page has fully loaded
   * Override in child classes to define page-specific load indicators
   */
  abstract readonly pageLoadIndicator: Locator;

  /**
   * Navigate to this page using the defined pagePath
   */
  async navigate(): Promise<void> {
    await this.page.goto(this.pagePath);
    await this.waitForPageLoad();
  }

  /**
   * Wait for the page to be fully loaded by checking the pageLoadIndicator
   */
  async waitForPageLoad(): Promise<void> {
    await expect(this.pageLoadIndicator).toBeVisible({ timeout: 10000 });
  }

  /**
   * Check if the current page is displayed
   */
  async isDisplayed(): Promise<boolean> {
    return await this.pageLoadIndicator.isVisible();
  }

  /**
   * Get the current page URL
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Get the page title
   */
  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Wait for a specific URL pattern
   */
  async waitForUrl(urlPattern: string | RegExp): Promise<void> {
    await this.page.waitForURL(urlPattern);
  }

  /**
   * Wait for network to be idle (useful after navigation or actions)
   */
  async waitForNetworkIdle(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for API response with specific URL pattern and method
   */
  async waitForApiResponse(
    urlPattern: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    expectedStatus?: number
  ): Promise<void> {
    await this.page.waitForResponse(
      (response) => {
        const matchesUrl = response.url().includes(urlPattern);
        const matchesMethod = response.request().method() === method;
        const matchesStatus = expectedStatus ? response.status() === expectedStatus : true;
        return matchesUrl && matchesMethod && matchesStatus;
      },
      { timeout: 15000 }
    );
  }

  /**
   * Take a screenshot of the current page
   */
  async takeScreenshot(name: string): Promise<Buffer> {
    return await this.page.screenshot({
      path: `test-results/screenshots/${name}.png`,
      fullPage: true,
    });
  }
}
