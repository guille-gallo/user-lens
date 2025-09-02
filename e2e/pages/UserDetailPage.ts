import { Page, Locator } from '@playwright/test';

export class UserDetailPage {
  readonly page: Page;
  readonly userDetailContainer: Locator;
  readonly editableFields: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.userDetailContainer = page.locator('.user-detail-page');
    this.editableFields = page.locator('.editable-field');
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.backButton = page.getByRole('button', { name: 'Back' });
  }

  async navigateToUser(userId: string) {
    await this.page.goto(`/users/${userId}`);
  }

  async goto(userId: string) {
    await this.page.goto(`/users/${userId}`);
    await this.page.waitForLoadState('networkidle');
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.userDetailContainer.waitFor({ state: 'visible', timeout: 10000 });
  }

  async getUserDetails() {
    // Wait for page to load and extract user details
    await this.waitForPageLoad();
    
    // Get user details from EditableField components
    const nameField = this.page.locator('[data-field="name"] .editable-field__value').first();
    const emailField = this.page.locator('[data-field="email"] .editable-field__value').first();
    const phoneField = this.page.locator('[data-field="phone"] .editable-field__value').first();
    
    return {
      name: await nameField.textContent() || '',
      email: await emailField.textContent() || '',
      phone: await phoneField.textContent() || ''
    };
  }

  async editField(fieldName: string, value: string) {
    const field = this.page.locator(`[data-field="${fieldName}"] input`);
    if (await field.isVisible()) {
      await field.fill(value);
    }
  }

  async saveChanges() {
    if (await this.saveButton.isVisible()) {
      await this.saveButton.click();
    }
  }

  async cancelEditing() {
    if (await this.cancelButton.isVisible()) {
      await this.cancelButton.click();
    }
  }

  async goBack() {
    if (await this.backButton.isVisible()) {
      await this.backButton.click();
    }
  }

  async getUserInfo(field: string): Promise<string | null> {
    const fieldLocator = this.page.locator(`[data-field="${field}"]`);
    if (await fieldLocator.isVisible()) {
      return await fieldLocator.textContent();
    }
    return null;
  }

  async expectUserDetails(userData: { name: string; email: string; phone?: string }) {
    await this.page.waitForTimeout(1000);
    const pageContent = await this.page.textContent('body');
    if (!pageContent?.includes(userData.name) || !pageContent?.includes(userData.email)) {
      throw new Error(`User details not visible: ${userData.name}, ${userData.email}`);
    }
  }

  async startEditing() {
    // Click on an editable field to start editing mode
    const firstEditableField = this.editableFields.first();
    if (await firstEditableField.isVisible()) {
      await firstEditableField.click();
    }
  }

  async editUser(userData: { name?: string; email?: string; phone?: string }) {
    if (userData.name) {
      await this.editField('name', userData.name);
    }
    if (userData.email) {
      await this.editField('email', userData.email);
    }
    if (userData.phone) {
      await this.editField('phone', userData.phone);
    }
  }

  async expectEditFormHidden() {
    // Check that edit form/mode is not active
    await this.page.waitForTimeout(1000);
    const editingElements = await this.page.locator('input[type="text"]:visible').count();
    if (editingElements > 0) {
      throw new Error('Edit form is still visible');
    }
  }
}
