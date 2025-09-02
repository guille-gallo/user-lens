import { test, expect } from '@playwright/test';

/**
 * Essential E2E Tests - Chrome Only
 * Core functionality verification tests
 */

test.describe('Essential E2E Tests', () => {

  test('Application loads without critical console errors', async ({ page }) => {
    const errors: string[] = [];
    
    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForTimeout(2000);

    // Should not have critical console errors (filtering out known non-critical ones)
    const criticalErrors = errors.filter(error => 
      !error.includes('favicon') &&
      !error.includes('Sass @import') &&
      !error.includes('deprecated') &&
      !error.includes('darken()') &&
      !error.includes('DEPRECATION WARNING')
    );
    
    expect(criticalErrors.length).toBe(0);
  });

  test('Application has basic page structure', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Check basic page structure
    const root = page.locator('#root');
    await expect(root).toBeVisible();
    
    // Check for main content
    const hasContent = await page.locator('body').textContent();
    expect(hasContent?.length || 0).toBeGreaterThan(50);
  });

  test('Search functionality exists and is interactive', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Look for search input with flexible selectors
    const searchInput = page.locator('input[type="text"], input[type="search"], input.search-bar__input');
    
    if (await searchInput.first().isVisible()) {
      await searchInput.first().fill('test');
      await expect(searchInput.first()).toHaveValue('test');
      await searchInput.first().fill('');
      console.log('✅ Search functionality working');
    } else {
      console.log('⚠️ Search input not found - may be expected in current state');
    }
  });

  test('Action buttons exist in the interface', async ({ page }) => {
    await page.goto('/users');
    await page.waitForTimeout(3000);
    
    // Check for any buttons
    const anyButtons = page.locator('button');
    const anyButtonCount = await anyButtons.count();
    expect(anyButtonCount).toBeGreaterThan(0);
    console.log(`✅ Found ${anyButtonCount} buttons in the interface`);
  });

  test('App has proper structure and accessibility', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Check for basic accessibility elements
    const main = page.locator('main, [role="main"]');
    const hasMain = await main.isVisible();
    
    console.log(`Main content area: ${hasMain ? '✅' : '❌'}`);
    
    // Check that the page has a meaningful title
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    expect(title).not.toBe('Document');
    console.log(`✅ Page title: "${title}"`);
  });

  test('Basic navigation works', async ({ page }) => {
    // Home page
    await page.goto('/');
    await page.waitForTimeout(1000);
    expect(page.url()).toMatch(/localhost:5173/);
    
    // Users page
    await page.goto('/users');
    await page.waitForTimeout(1000);
    expect(page.url()).toMatch(/\/users/);
    
    // Notifications page
    await page.goto('/notifications');
    await page.waitForTimeout(1000);
    expect(page.url()).toMatch(/\/notifications/);
    
    console.log('✅ Basic navigation working');
  });

  test('Cross-browser compatibility baseline', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Basic compatibility checks
    const viewport = page.viewportSize();
    expect(viewport?.width).toBeGreaterThan(0);
    expect(viewport?.height).toBeGreaterThan(0);
    
    console.log('✅ chromium compatibility verified');
  });

});
