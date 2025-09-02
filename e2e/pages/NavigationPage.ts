import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Navigation and Header
 * Handles global navigation and notifications
 */
export class NavigationPage {
  readonly page: Page;
  readonly logo: Locator;
  readonly usersNavLink: Locator;
  readonly notificationsNavLink: Locator;
  readonly notificationBell: Locator;
  readonly notificationBadge: Locator;
  readonly notificationPanel: Locator;
  readonly notificationItems: Locator;

  constructor(page: Page) {
    this.page = page;
    this.logo = page.locator('[data-testid="app-logo"]');
    this.usersNavLink = page.getByRole('link', { name: /users/i });
    this.notificationsNavLink = page.getByRole('link', { name: /notifications/i });
    this.notificationBell = page.locator('[data-testid="notification-bell"]');
    this.notificationBadge = page.locator('[data-testid="notification-badge"]');
    this.notificationPanel = page.locator('[data-testid="notification-panel"]');
    this.notificationItems = page.locator('[data-testid="notification-item"]');
  }

  /**
   * Navigate to users page
   */
  async goToUsers() {
    await this.usersNavLink.click();
  }

  /**
   * Navigate to notifications page
   */
  async goToNotifications() {
    await this.notificationsNavLink.click();
  }

  /**
   * Click notification bell to open panel
   */
  async openNotificationPanel() {
    await this.notificationBell.click();
    await this.notificationPanel.waitFor({ state: 'visible' });
  }

  /**
   * Close notification panel
   */
  async closeNotificationPanel() {
    // Click outside the panel or press escape
    await this.page.keyboard.press('Escape');
    await this.notificationPanel.waitFor({ state: 'hidden' });
  }

  /**
   * Get notification count from badge
   */
  async getNotificationCount() {
    if (await this.notificationBadge.isVisible()) {
      const badgeText = await this.notificationBadge.textContent();
      return parseInt(badgeText || '0', 10);
    }
    return 0;
  }

  /**
   * Click on specific notification in panel
   */
  async clickNotification(index: number) {
    const notification = this.notificationItems.nth(index);
    await notification.click();
  }

  /**
   * Verify current page by URL
   */
  async expectCurrentPage(path: string) {
    await expect(this.page).toHaveURL(new RegExp(path));
  }

  /**
   * Verify notification badge shows count
   */
  async expectNotificationBadge(count: number) {
    if (count > 0) {
      await expect(this.notificationBadge).toBeVisible();
      await expect(this.notificationBadge).toContainText(count.toString());
    } else {
      await expect(this.notificationBadge).toBeHidden();
    }
  }

  /**
   * Verify notification panel is open
   */
  async expectNotificationPanelOpen() {
    await expect(this.notificationPanel).toBeVisible();
  }

  /**
   * Verify notification panel is closed
   */
  async expectNotificationPanelClosed() {
    await expect(this.notificationPanel).toBeHidden();
  }
}
