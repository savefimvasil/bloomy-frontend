import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class RegisterPage {
  constructor(private readonly page: Page) {}

  // Step 1 – email
  async gotoInit() {
    await this.page.goto('/register');
  }

  async fillEmailInit(email: string) {
    await this.page.getByLabel('Email').fill(email);
  }

  async acceptTerms() {
    const checkbox = this.page.locator('input[type="checkbox"]').first();
    if (!(await checkbox.isChecked())) await checkbox.check();
  }

  async submitInit() {
    await this.page.getByRole('button', { name: /continue|next|send/i }).click();
  }

  // Step 2 – OTP
  async fillOtp(code: string) {
    // The verify page uses a single input[inputmode="numeric"] with maxlength=6
    const single = this.page.locator('input[inputmode="numeric"]');
    if (await single.count() > 0) {
      await single.first().fill(code);
      return;
    }
    // Fallback: individual digit inputs (alternative OTP UI)
    const inputs = await this.page.locator('input[maxlength="1"], input[name^="digit"]').all();
    if (inputs.length >= 6) {
      const digits = code.split('');
      for (let i = 0; i < 6; i++) await inputs[i].fill(digits[i]);
    } else {
      await this.page.locator('input[type="text"]').first().fill(code);
    }
  }

  async submitOtp() {
    await this.page.getByRole('button', { name: /verify|confirm|next/i }).click();
  }

  // Step 3 – role
  async selectRole(role: 'homeowner' | 'contractor') {
    const label = role === 'homeowner' ? /homeowner/i : /contractor/i;
    await this.page.getByText(label).click();
  }

  async submitRole() {
    await this.page.getByRole('button', { name: /continue|next/i }).click();
  }

  // Step 4 – password
  async fillPassword(password: string) {
    await this.page.getByLabel(/^password$/i).fill(password);
    await this.page.getByLabel(/confirm password/i).fill(password);
  }

  async submitPassword() {
    await this.page.getByRole('button', { name: /continue|next|set/i }).click();
  }

  // Step 5 – profile
  async fillProfile(name: string, surname: string) {
    await this.page.getByLabel(/first name|name/i).first().fill(name);
    await this.page.getByLabel(/last name|surname/i).fill(surname);
  }

  async submitProfile() {
    await this.page.getByRole('button', { name: /finish|complete|create/i }).click();
  }

  async expectRedirectToVerify() {
    await expect(this.page).toHaveURL(/\/register\/verify/);
  }

  async expectRedirectToRole() {
    await expect(this.page).toHaveURL(/\/register\/role/);
  }

  async expectRedirectToPassword() {
    await expect(this.page).toHaveURL(/\/register\/password/);
  }

  async expectRedirectToProfile() {
    await expect(this.page).toHaveURL(/\/register\/profile/);
  }
}
