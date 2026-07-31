import type { Page } from '@playwright/test';

export async function injectAuth(
  page: Page,
  auth: { token: string; email: string; role: 'homeowner' | 'contractor' },
) {
  // Inject into localStorage once per tab session so Zustand persist can rehydrate.
  // A sessionStorage flag prevents re-injection on subsequent navigations (e.g. after logout).
  await page.addInitScript(({ token, email, role }) => {
    if (sessionStorage.getItem('_e2e_auth_injected')) return;
    sessionStorage.setItem('_e2e_auth_injected', '1');
    localStorage.setItem(
      'bloomy-auth',
      JSON.stringify({ state: { token, email, role }, version: 0 }),
    );
  }, auth);
  // Set cookie so Next.js middleware (which guards /admin/*) can read the token
  await page.context().addCookies([
    { name: 'token', value: auth.token, url: 'http://localhost:3001' },
  ]);
}
