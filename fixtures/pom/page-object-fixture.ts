import { test as base } from '@playwright/test';

// New page structure (recommended)
import { HomePage } from '../../pages/home.page';
import { LoginPage } from '../../pages/login.page';
import { RegisterPage } from '../../pages/register.page';
import { SettingsPage } from '../../pages/settings.page';
import { ArticleEditorPage } from '../../pages/article-editor.page';
import { ArticleViewPage } from '../../pages/article-view.page';
import { ProfilePage } from '../../pages/profile.page';
import { NavigationComponent } from '../../pages/components/navigation.component';

// Legacy pages (for backward compatibility - will be deprecated)
import { HomePage as HomePageLegacy } from '../../pages/homePage';
import { NavPage } from '../../pages/navPage';
import { ArticlePage } from '../../pages/articlePage';

/**
 * New Page Object Types (recommended for new tests)
 */
export type PageFixtures = {
  // New pages
  homePage: HomePage;
  loginPage: LoginPage;
  registerPage: RegisterPage;
  settingsPage: SettingsPage;
  articleEditorPage: ArticleEditorPage;
  articleViewPage: ArticleViewPage;
  profilePage: ProfilePage;
  navigation: NavigationComponent;

  // Legacy pages (deprecated - use new pages instead)
  /** @deprecated Use homePage instead */
  homePageLegacy: HomePageLegacy;
  /** @deprecated Use navigation instead */
  navPage: NavPage;
  /** @deprecated Use articleEditorPage and articleViewPage instead */
  articlePage: ArticlePage;
};

export const test = base.extend<PageFixtures>({
  // ==================== New Pages ====================
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },

  settingsPage: async ({ page }, use) => {
    await use(new SettingsPage(page));
  },

  articleEditorPage: async ({ page }, use) => {
    await use(new ArticleEditorPage(page));
  },

  articleViewPage: async ({ page }, use) => {
    await use(new ArticleViewPage(page));
  },

  profilePage: async ({ page }, use) => {
    await use(new ProfilePage(page));
  },

  navigation: async ({ page }, use) => {
    await use(new NavigationComponent(page));
  },

  // ==================== Legacy Pages (Deprecated) ====================
  homePageLegacy: async ({ page }, use) => {
    await use(new HomePageLegacy(page));
  },

  navPage: async ({ page }, use) => {
    await use(new NavPage(page));
  },

  articlePage: async ({ page }, use) => {
    await use(new ArticlePage(page));
  },
});

export { expect } from '@playwright/test';
