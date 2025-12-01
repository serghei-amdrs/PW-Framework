import { Page, Locator, expect } from "@playwright/test";

export class HomePage {
  constructor(private page: Page) {}

  get homeBanner(): Locator {
    return this.page.getByRole("heading", { name: "conduit" });
  }
  get yourFeedBtn(): Locator {
    return this.page.getByText("Your Feed");
  }
  get globalFeedBtn(): Locator {
    return this.page.getByText("Global Feed");
  }
  get bondarAcademyLink(): Locator {
    return this.page.getByRole("link", {
      name: "www.bondaracademy.com",
    });
  }
  get noArticlesMessage(): Locator {
    return this.page.getByText("No articles are here... yet.");
  }

  async navigateToHomePageGuest(): Promise<void> {
    await this.page.goto(process.env.URL as string);
    await expect(this.homeBanner).toBeVisible();
  }

  async navigateToHomePageUser(): Promise<void> {
    await this.page.goto(process.env.URL as string);
    await expect(this.yourFeedBtn).toBeVisible();
    await expect(this.globalFeedBtn).toBeVisible();
  }

  async signIn(email: string, password: string): Promise<void> {
    await this.page.getByRole("link", { name: "Sign in" }).click();
    await this.page.getByPlaceholder("Email").fill(email);
    await this.page.getByPlaceholder("Password").fill(password);
    await this.page.getByRole("button", { name: "Sign in" }).click();
    await expect(this.yourFeedBtn).toBeVisible();
  }
}
