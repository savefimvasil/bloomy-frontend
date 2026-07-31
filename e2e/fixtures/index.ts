import { test as base, expect, type Browser } from '@playwright/test';

// Extend the base test to block external image CDNs on every page.
// Unsplash images on /login and /register take >15s in restricted networks
// and prevent the `load` event from firing, causing navigation timeouts.
export const test = base.extend<object>({
  page: async ({ page }, use) => {
    await page.route(/unsplash\.com|pexels\.com/, (route) => void route.abort());
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(page);
  },
});

export { expect, type Browser };
