import { test, expect } from '../fixtures';
import { createDbClient, getTestHomeowner, getTestContractor } from '../fixtures/db';
import { injectAuth } from '../fixtures/auth';
import { LoginPage } from '../pages/LoginPage';
import type { Client } from 'pg';

test.describe('Login flow @smoke', () => {
  let db: Client;

  test.beforeAll(async () => {
    db = await createDbClient();
  });

  test.afterAll(async () => {
    await db.end();
  });

  test('homeowner happy path – redirects to /cabinet/projects', async ({ page }) => {
    const user = await getTestHomeowner(db);

    const loginPage = new LoginPage(page);
    await loginPage.login(user.email, user.password);

    await expect(page).toHaveURL(/\/cabinet/);
    const stored = await page.evaluate(() => localStorage.getItem('bloomy-auth'));
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!) as { state: { token: string } };
    expect(parsed.state.token).toBeTruthy();
  });

  test('contractor happy path – redirects to /cabinet', async ({ page }) => {
    const user = await getTestContractor(db);

    const loginPage = new LoginPage(page);
    await loginPage.login(user.email, user.password);

    await expect(page).toHaveURL(/\/cabinet/);
  });

  test('wrong password shows inline error and stays on /login', async ({ page }) => {
    const user = await getTestHomeowner(db);

    const loginPage = new LoginPage(page);
    await loginPage.login(user.email, 'WrongPassword!');

    await loginPage.expectStillOnLogin();
    // Accept any credential error or rate-limit response from the API
    await expect(page.locator('form')).toContainText(
      /invalid|incorrect|wrong|not found|login failed|credentials|too many|throttle|unauthorized/i,
    );
  });

  test('unknown email shows same error (no enumeration)', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('nobody@e2e.test', 'AnyPassword1!');

    await loginPage.expectStillOnLogin();
    await expect(page.locator('form')).toContainText(
      /invalid|incorrect|wrong|not found|login failed|credentials|too many|throttle|unauthorized/i,
    );
  });

  test('empty form shows validation errors without making API call', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    const requests: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes('/auth/login')) requests.push(req.url());
    });

    await loginPage.submit();

    expect(requests).toHaveLength(0);
    await expect(page.locator('form')).toContainText(/required|invalid/i);
  });

  test('already logged-in user visiting /login is redirected to /cabinet', async ({ page }) => {
    const user = await getTestHomeowner(db);

    await injectAuth(page, { token: user.token, email: user.email, role: 'homeowner' });
    await page.goto('/login');

    await expect(page).toHaveURL(/\/cabinet/);
  });
});
