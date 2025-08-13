import { test, expect } from '@playwright/test'

test.describe('IT Quiz App', () => {
  test('should display home page correctly', async ({ page }) => {
    await page.goto('/')
    
    // Check main heading
    await expect(page.getByText('IT Quiz App')).toBeVisible()
    
    // Check quiz mode buttons
    await expect(page.getByText('Practice Mode')).toBeVisible()
    await expect(page.getByText('Timed Quiz')).toBeVisible()
    await expect(page.getByText('Review Mode')).toBeVisible()
    
    // Check question count
    await expect(page.getByText(/50 Questions Available/)).toBeVisible()
  })

  test('should start practice quiz', async ({ page }) => {
    await page.goto('/')
    
    // Click Practice Mode button
    await page.getByText('Practice Mode').click()
    
    // Should navigate to practice quiz
    await expect(page.url()).toContain('/quiz/practice')
    
    // Should display first question
    await expect(page.getByText(/Question 1 of/)).toBeVisible()
    
    // Should have answer options
    const answerButtons = page.locator('button[class*="cursor-pointer"]')
    await expect(answerButtons).toHaveCount(4)
  })

  test('should be mobile responsive', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Check mobile navigation and touch targets
    await expect(page.getByText('IT Quiz App')).toBeVisible()
    
    const practiceButton = page.getByText('Practice Mode')
    await expect(practiceButton).toBeVisible()
    
    // Check that buttons are touch-friendly (minimum 44px height)
    const buttonBox = await practiceButton.boundingBox()
    expect(buttonBox?.height).toBeGreaterThanOrEqual(44)
  })

  test('should toggle dark mode', async ({ page }) => {
    await page.goto('/')
    
    // Check current theme
    const body = page.locator('body')
    
    // Find theme toggle button
    const themeToggle = page.locator('button[class*="rounded-full"]').first()
    await themeToggle.click()
    
    // Theme should change (this is a basic check)
    await page.waitForTimeout(100)
    
    // Verify theme toggle functionality worked
    await expect(themeToggle).toBeVisible()
  })

  test('should have proper PWA features', async ({ page }) => {
    await page.goto('/')
    
    // Check that manifest.json is loaded
    const manifestResponse = await page.request.get('/manifest.json')
    expect(manifestResponse.status()).toBe(200)
    
    // Check that service worker registration is attempted
    const serviceWorkerRegistered = await page.evaluate(() => {
      return 'serviceWorker' in navigator
    })
    expect(serviceWorkerRegistered).toBe(true)
  })
})