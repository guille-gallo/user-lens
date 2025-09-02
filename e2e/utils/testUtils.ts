import { Page, expect } from '@playwright/test';
import { TestUser, TestNotification } from '../fixtures/testData';

/**
 * Senior-level test utilities
 * Provides reusable functions for common E2E operations
 */
export class TestUtils {
  
  /**
   * Setup test data by mocking API responses
   */
  static async setupMockData(page: Page, users: TestUser[], notifications: TestNotification[] = []) {
    // Mock users API
    await page.route('**/api/users**', async (route) => {
      const url = route.request().url();
      
      if (url.includes('/api/users') && route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(users)
        });
      } else {
        await route.continue();
      }
    });

    // Mock notifications API
    await page.route('**/api/notifications**', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(notifications)
        });
      } else {
        await route.continue();
      }
    });
  }

  /**
   * Wait for network requests to complete
   */
  static async waitForNetworkIdle(page: Page, timeout = 5000) {
    await page.waitForLoadState('networkidle', { timeout });
  }

  /**
   * Take a screenshot with descriptive name
   */
  static async takeScreenshot(page: Page, name: string) {
    await page.screenshot({
      path: `test-results/screenshots/${name}-${Date.now()}.png`,
      fullPage: true
    });
  }

  /**
   * Verify page accessibility basics
   */
  static async checkBasicAccessibility(page: Page) {
    // Check for page title
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title).not.toBe('');

    // Check for proper heading structure (at least one h1)
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);

    // Check for alt text on images
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  }

  /**
   * Simulate slow network conditions
   */
  static async simulateSlowNetwork(page: Page) {
    await page.route('**/*', async (route) => {
      // Add delay to simulate slow network
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });
  }

  /**
   * Simulate network failure
   */
  static async simulateNetworkFailure(page: Page, urlPattern: string) {
    await page.route(urlPattern, async (route) => {
      await route.abort('failed');
    });
  }

  /**
   * Verify responsive design at different viewport sizes
   */
  static async testResponsiveDesign(page: Page, callback: () => Promise<void>) {
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop Large' },
      { width: 1366, height: 768, name: 'Desktop Medium' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(500); // Allow for responsive adjustments
      
      try {
        await callback();
      } catch (error) {
        throw new Error(`Responsive test failed at ${viewport.name} (${viewport.width}x${viewport.height}): ${error}`);
      }
    }
  }

  /**
   * Generate test report data
   */
  static generateTestReport(testName: string, duration: number, status: 'passed' | 'failed', error?: string) {
    return {
      testName,
      duration,
      status,
      timestamp: new Date().toISOString(),
      error: error || null
    };
  }

  /**
   * Wait for specific element to be stable (not animating)
   */
  static async waitForElementStable(page: Page, selector: string, timeout = 5000) {
    const element = page.locator(selector);
    
    // Wait for element to be visible
    await element.waitFor({ state: 'visible', timeout });
    
    // Check if element position is stable
    let previousBounds = await element.boundingBox();
    await page.waitForTimeout(100);
    
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const currentBounds = await element.boundingBox();
      
      if (previousBounds && currentBounds &&
          Math.abs(currentBounds.x - previousBounds.x) < 1 &&
          Math.abs(currentBounds.y - previousBounds.y) < 1) {
        return; // Element is stable
      }
      
      previousBounds = currentBounds;
      await page.waitForTimeout(100);
    }
  }

  /**
   * Verify no console errors (except known ones)
   */
  static async verifyNoConsoleErrors(page: Page, allowedErrors: string[] = []) {
    const errors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const errorText = msg.text();
        const isAllowedError = allowedErrors.some(allowed => errorText.includes(allowed));
        
        if (!isAllowedError) {
          errors.push(errorText);
        }
      }
    });

    return {
      getErrors: () => errors,
      expectNoErrors: () => {
        if (errors.length > 0) {
          throw new Error(`Console errors found: ${errors.join(', ')}`);
        }
      }
    };
  }
}
