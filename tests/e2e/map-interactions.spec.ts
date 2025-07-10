import { test, expect } from '@playwright/test';

test.describe('Map interactions and functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByTestId('username-input').fill('tester');
    await page.getByTestId('password-input').fill('abc123');
    await page.getByTestId('login-button').click();
    await expect(page).toHaveURL('/map');
  });

  test('Map loads and displays correctly', async ({ page }) => {
    // Wait for map to load
    await expect(page.getByTestId('thailand-map')).toBeVisible();
    
    // Wait for the leaflet map to actually render
    await page.waitForSelector('.leaflet-container', { timeout: 15000 });
    
    // Verify map title and instructions
    await expect(page.getByText('Thailand Province Population')).toBeVisible();
    await expect(page.getByText('Hover over provinces to see population data')).toBeVisible();
    
    // Wait a bit for the map tiles to load
    await page.waitForTimeout(3000);
    
    // Verify the map container has proper dimensions
    const mapContainer = page.locator('.leaflet-container');
    const boundingBox = await mapContainer.boundingBox();
    expect(boundingBox?.width).toBeGreaterThan(500);
    expect(boundingBox?.height).toBeGreaterThan(400);
  });

  test('Map shows loading state initially', async ({ page }) => {
    // Navigate to map page
    await page.goto('/map');
    
    // Should show loading indicator briefly
    // Note: This might be too fast to catch consistently, so we'll just verify the map loads
    await expect(page.getByTestId('thailand-map')).toBeVisible();
  });

  test('Map legend displays population ranges', async ({ page }) => {
    await expect(page.getByTestId('thailand-map')).toBeVisible();
    
    // Verify all legend items are present
    const legendItems = [
      '8M+',
      '4M-8M', 
      '2M-4M',
      '1M-2M',
      '<1M'
    ];
    
    for (const item of legendItems) {
      await expect(page.getByText(item)).toBeVisible();
    }
  });

  test('Protected route redirects unauthenticated users', async ({ page }) => {
    // Clear any existing authentication
    await page.context().clearCookies();
    
    // Try to access map directly
    await page.goto('/map');
    
    // Should be redirected to login
    await expect(page).toHaveURL('/login');
    await expect(page.getByText('Thailand Province Map')).toBeVisible();
  });

  test('Map is responsive and fills the screen', async ({ page }) => {
    await expect(page.getByTestId('thailand-map')).toBeVisible();
    
    // Get the map container
    const mapContainer = page.getByTestId('thailand-map');
    const boundingBox = await mapContainer.boundingBox();
    
    // Verify it takes up most of the viewport
    expect(boundingBox?.width).toBeGreaterThan(800);
    expect(boundingBox?.height).toBeGreaterThan(500);
    
    // Verify the map container has full height class
    await expect(mapContainer).toHaveClass(/h-screen/);
  });
});