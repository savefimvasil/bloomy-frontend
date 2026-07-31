# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth/login.spec.ts >> Login flow @smoke >> homeowner happy path – redirects to /cabinet/projects
- Location: e2e/auth/login.spec.ts:18:7

# Error details

```
TimeoutError: locator.fill: Timeout 10000ms exceeded.
Call log:
  - waiting for getByLabel('Email')

```

# Test source

```ts
  1  | import type { Page } from '@playwright/test';
  2  | import { expect } from '@playwright/test';
  3  | 
  4  | export class LoginPage {
  5  |   constructor(private readonly page: Page) {}
  6  | 
  7  |   async goto() {
  8  |     await this.page.goto('/login');
  9  |   }
  10 | 
  11 |   async fillEmail(email: string) {
> 12 |     await this.page.getByLabel('Email').fill(email);
     |                                         ^ TimeoutError: locator.fill: Timeout 10000ms exceeded.
  13 |   }
  14 | 
  15 |   async fillPassword(password: string) {
  16 |     await this.page.getByLabel('Password').fill(password);
  17 |   }
  18 | 
  19 |   async submit() {
  20 |     await this.page.getByRole('button', { name: /sign in/i }).click();
  21 |   }
  22 | 
  23 |   async login(email: string, password: string) {
  24 |     await this.goto();
  25 |     await this.fillEmail(email);
  26 |     await this.fillPassword(password);
  27 |     await this.submit();
  28 |   }
  29 | 
  30 |   async expectRootError(message: string | RegExp) {
  31 |     await expect(this.page.locator('form').getByText(message)).toBeVisible();
  32 |   }
  33 | 
  34 |   async expectStillOnLogin() {
  35 |     await expect(this.page).toHaveURL(/\/login/);
  36 |   }
  37 | }
  38 | 
```