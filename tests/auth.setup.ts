import { test as setup, expect } from '../fixtures/pom/test-options';
import { User } from '../fixtures/api/types-guards';
import { UserSchema } from '../fixtures/api/schemas';

setup('auth user', async ({ apiRequest, homePage, loginPage, navigation, page }) => {
  await setup.step('auth for user by API', async () => {
    const { status, body } = await apiRequest<User>({
      method: 'POST',
      url: 'api/users/login',
      baseUrl: process.env.API_URL,
      body: {
        user: {
          email: process.env.EMAIL,
          password: process.env.PASSWORD,
        },
      },
    });

    expect(status).toBe(200);
    expect(UserSchema.parse(body)).toBeTruthy();
    process.env['ACCESS_TOKEN'] = body.user.token;
  });

  await setup.step('create logged in user session', async () => {
    await homePage.navigateAsGuest();
    await navigation.clickSignIn();
    await loginPage.loginAndVerify(
      process.env.EMAIL!,
      process.env.PASSWORD!,
      process.env.USER_NAME!
    );
    await page.context().storageState({ path: '.auth/userSession.json' });
  });
});
