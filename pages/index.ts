// Base
export { BasePage } from './base/base-page';

// Components
export { NavigationComponent } from './components/navigation.component';

// Pages
export { HomePage } from './home.page';
export { LoginPage } from './login.page';
export { RegisterPage } from './register.page';
export { SettingsPage } from './settings.page';
export { ArticleEditorPage } from './article-editor.page';
export { ArticleViewPage } from './article-view.page';
export { ProfilePage } from './profile.page';

// Legacy exports (for backward compatibility - will be deprecated)
// TODO: Remove these after migrating all tests to new page structure
export { HomePage as HomeLegacy } from './homePage';
export { NavPage } from './navPage';
export { ArticlePage } from './articlePage';
