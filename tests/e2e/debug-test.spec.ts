import { test, expect } from '@playwright/test'

test.describe('Debug Test - Application Structure', () => {
  test('Examine application structure and capture state', async ({ page }) => {
    // Navigate to homepage with extended timeout
    await page.goto('/', { waitUntil: 'networkidle', timeout: 30000 })
    
    // Wait for React hydration
    await page.waitForTimeout(3000)
    
    // Capture full page screenshot
    await page.screenshot({ 
      path: 'test-results/debug-homepage.png', 
      fullPage: true 
    })
    
    // Get page title
    const title = await page.title()
    console.log('Page Title:', title)
    
    // Get all headings
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents()
    console.log('Headings found:', headings)
    
    // Get all button texts
    const buttons = await page.locator('button').allTextContents()
    console.log('Buttons found:', buttons.slice(0, 10)) // First 10 buttons
    
    // Get all link texts  
    const links = await page.locator('a').allTextContents()
    console.log('Links found:', links.slice(0, 10)) // First 10 links
    
    // Check for main content areas
    const mainElement = await page.locator('main').count()
    console.log('Main elements:', mainElement)
    
    // Check for navigation
    const navElements = await page.locator('nav').count()
    console.log('Nav elements:', navElements)
    
    // Get body classes to check theme
    const bodyClasses = await page.locator('body').getAttribute('class')
    console.log('Body classes:', bodyClasses)
    
    // Check localStorage state
    const localStorage = await page.evaluate(() => {
      const storage = {}
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          storage[key] = localStorage.getItem(key)
        }
      }
      return storage
    })
    console.log('LocalStorage:', localStorage)
    
    // Check for specific text content
    const allText = await page.textContent('body')
    console.log('Text content includes "IT Quiz":', allText?.includes('IT Quiz'))
    console.log('Text content includes "Practice":', allText?.includes('Practice'))
    console.log('Text content includes "Quiz":', allText?.includes('Quiz'))
    
    // Check if we can find elements by different selectors
    const practiceSelectors = [
      'text=Practice Mode',
      'button:has-text("Practice")',
      '[data-testid*="practice"]',
      'text=Practice',
      '*:has-text("Practice")'
    ]
    
    for (const selector of practiceSelectors) {
      try {
        const count = await page.locator(selector).count()
        console.log(`Selector "${selector}": ${count} elements found`)
      } catch (error) {
        console.log(`Selector "${selector}": Error - ${error}`)
      }
    }
    
    // Get current URL
    console.log('Current URL:', page.url())
    
    // Check if the page is fully loaded
    const readyState = await page.evaluate(() => document.readyState)
    console.log('Document ready state:', readyState)
    
    // Check for any error messages in console
    const logs = []
    page.on('console', msg => logs.push(`${msg.type()}: ${msg.text()}`))
    
    // Wait a bit more and capture final state
    await page.waitForTimeout(2000)
    console.log('Console logs:', logs)
    
    // Final screenshot after waiting
    await page.screenshot({ 
      path: 'test-results/debug-homepage-final.png', 
      fullPage: true 
    })
    
    // Basic assertions that should pass
    expect(title).toBeTruthy()
    expect(readyState).toBe('complete')
  })
})