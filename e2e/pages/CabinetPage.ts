import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class CabinetPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/cabinet');
  }

  async gotoQuoteRequests() {
    await this.page.goto('/cabinet/quote-requests');
  }

  async gotoNearbyRequests() {
    await this.page.goto('/cabinet/nearby-requests');
  }

  async gotoMyProposals() {
    await this.page.goto('/cabinet/my-proposals');
  }

  async gotoNotifications() {
    await this.page.goto('/cabinet/notifications');
  }

  async gotoContractorProfile() {
    await this.page.goto('/cabinet/contractor-profile');
  }

  async gotoDirectRequests() {
    await this.page.goto('/cabinet/direct-requests');
  }

  notificationBadge() {
    return this.page.getByTestId('notification-badge').first();
  }

  async logout() {
    await this.page.getByTestId('logout-btn').first().click();
  }

  async expectRedirectedToLogin() {
    await expect(this.page).toHaveURL(/\/login/);
  }

  async expectOnCabinet() {
    await expect(this.page).toHaveURL(/\/cabinet/);
  }
}
