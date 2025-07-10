import { test, expect } from '@playwright/test';

test.describe('Login functionality', () => {
  test('should login successfully and see the map', async ({ page }) => {
    // Navigate to the app (should redirect to login)
    await page.goto('/');
    
    // Verify we're on the login page
    await expect(page).toHaveURL('/login');
    await expect(page.getByText('Thailand Province Map')).toBeVisible();
    
    // Fill in login credentials
    await page.getByTestId('username-input').fill('tester');
    await page.getByTestId('password-input').fill('abc123');
    
    // Click login button
    await page.getByTestId('login-button').click();
    
    // Should redirect to map page
    await expect(page).toHaveURL('/map');
    
    // Wait for map to load
    await expect(page.getByTestId('thailand-map')).toBeVisible();
    
    // Wait for the leaflet map to actually render
    await page.waitForSelector('.leaflet-container', { timeout: 15000 });
    
    // Verify map title is visible
    await expect(page.getByText('Thailand Province Population')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in wrong credentials
    await page.getByTestId('username-input').fill('wrong');
    await page.getByTestId('password-input').fill('wrong');
    
    // Click login button
    await page.getByTestId('login-button').click();
    
    // Should show error message
    await expect(page.getByTestId('error-message')).toBeVisible();
    await expect(page.getByTestId('error-message')).toHaveText('Invalid credentials');
    
    // Should still be on login page
    await expect(page).toHaveURL('/login');
  });

  test('should redirect authenticated user from login to map', async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.getByTestId('username-input').fill('tester');
    await page.getByTestId('password-input').fill('abc123');
    await page.getByTestId('login-button').click();
    await expect(page).toHaveURL('/map');
    
    // Try to go back to login
    await page.goto('/login');
    
    // Should be redirected to map
    await expect(page).toHaveURL('/map');
  });
});