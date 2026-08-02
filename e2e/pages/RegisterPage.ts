import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class RegisterPage {
  constructor(private readonly page: Page) {}

  // Step 1 – email
  async gotoInit() {
    await this.page.goto('/register');
  }

  async fillEmailInit(email: string) {
    await this.page.getByTestId('register-email').fill(email);
  }

  async acceptTerms() {
    const checkbox = this.page.getByTestId('register-terms');
    if (!(await checkbox.isChecked())) await checkbox.check();
  }

  async submitInit() {
    await this.page.getByTestId('register-submit').click();
  }

  // Step 2 – OTP
  async fillOtp(code: string) {
    await this.page.getByTestId('register-otp').fill(code);
  }

  async submitOtp() {
    await this.page.getByTestId('register-verify').click();
  }

  // Step 3 – role
  async selectRole(role: 'homeowner' | 'contractor') {
    await this.page.getByTestId(`role-${role}`).click();
  }

  async submitRole() {
    await this.page.getByTestId('role-continue').click();
  }

  // Step 4 – password
  async fillPassword(password: string) {
    await this.page.getByTestId('register-password').fill(password);
    await this.page.getByTestId('register-confirm-password').fill(password);
  }

  async submitPassword() {
    await this.page.getByTestId('register-password-submit').click();
  }

  // Step 5 – profile
  async fillProfile(name: string, surname: string) {
    await this.page.getByTestId('register-name').fill(name);
    await this.page.getByTestId('register-surname').fill(surname);
  }

  async submitProfile() {
    await this.page.getByTestId('register-profile-submit').click();
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
