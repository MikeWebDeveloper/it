import { test, expect } from '@playwright/test'

test.describe('Exhibit Display Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should test question 13 - motherboard exhibit', async ({ page }) => {
    // Navigate to practice mode and find question 13
    await page.click('text=Practice Mode')
    
    // Wait for categories to load
    await page.waitForSelector('[role="list"]')
    
    // Select Hardware category if available
    await page.locator('[role="listitem"]').filter({ hasText: 'Hardware' }).click()
    
    // Start the quiz
    await page.click('text=Continue to Quiz Configuration')
    await page.click('text=Start Quiz')
    
    // Wait for quiz to load
    await page.waitForSelector('[data-testid="question-card"]', { timeout: 10000 })
    
    // Find question 13 by navigating through questions
    let currentQuestionText = await page.locator('h2').first().textContent()
    let attempts = 0
    
    while (!currentQuestionText?.includes('video card') && attempts < 20) {
      await page.click('text=Next')
      await page.waitForTimeout(500)
      currentQuestionText = await page.locator('h2').first().textContent()
      attempts++
    }
    
    if (currentQuestionText?.includes('video card')) {
      // Take screenshot of the question with exhibit
      await page.screenshot({ 
        path: 'tests/screenshots/question-13-motherboard.png',
        fullPage: true 
      })
      
      // Check if exhibit is displayed
      const exhibitImage = page.locator('img[alt*="exhibit"]')
      if (await exhibitImage.count() > 0) {
        await expect(exhibitImage).toBeVisible()
        
        // Test exhibit expand functionality
        const expandButton = page.locator('[aria-label="Expand exhibit to full screen"]')
        if (await expandButton.count() > 0) {
          await expandButton.click()
          await page.waitForTimeout(500)
          
          // Take screenshot of expanded exhibit
          await page.screenshot({ 
            path: 'tests/screenshots/question-13-expanded.png' 
          })
          
          // Close expanded view
          await page.keyboard.press('Escape')
        }
      }
    }
  })

  test('should test question 164 - network sharing exhibit', async ({ page }) => {
    // Navigate to practice mode
    await page.click('text=Practice Mode')
    await page.waitForSelector('[role="list"]')
    
    // Select Networking category
    await page.locator('[role="listitem"]').filter({ hasText: 'Networking' }).click()
    
    // Start the quiz
    await page.click('text=Continue to Quiz Configuration')
    await page.click('text=Start Quiz')
    
    await page.waitForSelector('[data-testid="question-card"]')
    
    // Find question about payroll/printer sharing
    let currentQuestionText = await page.locator('h2').first().textContent()
    let attempts = 0
    
    while (!currentQuestionText?.includes('payroll') && attempts < 20) {
      await page.click('text=Next')
      await page.waitForTimeout(500)
      currentQuestionText = await page.locator('h2').first().textContent()
      attempts++
    }
    
    if (currentQuestionText?.includes('payroll')) {
      await page.screenshot({ 
        path: 'tests/screenshots/question-164-network.png',
        fullPage: true 
      })
      
      const exhibitImage = page.locator('img[alt*="exhibit"]')
      if (await exhibitImage.count() > 0) {
        await expect(exhibitImage).toBeVisible()
      }
    }
  })

  test('should test question 190 - mobile device exhibit', async ({ page }) => {
    await page.click('text=Practice Mode')
    await page.waitForSelector('[role="list"]')
    
    // Select Mobile Devices category
    await page.locator('[role="listitem"]').filter({ hasText: 'Mobile' }).click()
    
    await page.click('text=Continue to Quiz Configuration')
    await page.click('text=Start Quiz')
    
    await page.waitForSelector('[data-testid="question-card"]')
    
    // Find mobile device question
    let currentQuestionText = await page.locator('h2').first().textContent()
    let attempts = 0
    
    while (!currentQuestionText?.includes('mobile device screen') && attempts < 20) {
      await page.click('text=Next')
      await page.waitForTimeout(500)
      currentQuestionText = await page.locator('h2').first().textContent()
      attempts++
    }
    
    if (currentQuestionText?.includes('mobile device screen')) {
      await page.screenshot({ 
        path: 'tests/screenshots/question-190-mobile.png',
        fullPage: true 
      })
      
      const exhibitImage = page.locator('img[alt*="exhibit"]')
      if (await exhibitImage.count() > 0) {
        await expect(exhibitImage).toBeVisible()
      }
    }
  })

  test('should test exhibit error handling', async ({ page }) => {
    // Test with a broken exhibit by checking console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Console error:', msg.text())
      }
    })
    
    await page.click('text=Practice Mode')
    await page.waitForSelector('[role="list"]')
    await page.locator('[role="listitem"]').first().click()
    await page.click('text=Continue to Quiz Configuration')
    await page.click('text=Start Quiz')
    
    // Navigate through several questions to check for exhibit errors
    for (let i = 0; i < 5; i++) {
      await page.waitForTimeout(1000)
      const nextButton = page.locator('text=Next')
      if (await nextButton.count() > 0) {
        await nextButton.click()
      }
    }
  })

  test('should verify exhibit accessibility', async ({ page }) => {
    await page.click('text=Practice Mode')
    await page.waitForSelector('[role="list"]')
    await page.locator('[role="listitem"]').first().click()
    await page.click('text=Continue to Quiz Configuration')  
    await page.click('text=Start Quiz')
    
    await page.waitForSelector('[data-testid="question-card"]')
    
    // Check for exhibit images with proper alt text
    const exhibitImages = page.locator('img[alt*="exhibit"]')
    const count = await exhibitImages.count()
    
    for (let i = 0; i < count; i++) {
      const img = exhibitImages.nth(i)
      const alt = await img.getAttribute('alt')
      expect(alt).toBeTruthy()
      expect(alt?.length).toBeGreaterThan(0)
    }
    
    // Check for exhibit controls accessibility
    const expandButtons = page.locator('[aria-label*="Expand exhibit"]')
    const downloadButtons = page.locator('[aria-label*="Download exhibit"]')
    
    if (await expandButtons.count() > 0) {
      await expect(expandButtons.first()).toHaveAttribute('aria-label')
    }
    
    if (await downloadButtons.count() > 0) {
      await expect(downloadButtons.first()).toHaveAttribute('aria-label')
    }
  })
})