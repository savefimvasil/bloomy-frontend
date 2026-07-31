import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async fillEmail(email: string) {
    await this.page.getByLabel('Email').fill(email);
  }

  async fillPassword(password: string) {
    await this.page.getByLabel('Password').fill(password);
  }

  async submit() {
    await this.page.getByRole('button', { name: /sign in/i }).click();
  }

  async login(email: string, password: string) {
    await this.goto();
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();
  }

  async expectRootError(message: string | RegExp) {
    await expect(this.page.locator('form').getByText(message)).toBeVisible();
  }

  async expectStillOnLogin() {
    await expect(this.page).toHaveURL(/\/login/);
  }
}
