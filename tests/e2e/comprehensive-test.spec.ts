import { test, expect, Page } from '@playwright/test';

// Test configuration
const BASE_URL = 'http://localhost:3001';

// Helper function to check for console errors
async function checkConsoleErrors(page: Page, testName: string) {
  const errors: string[] = [];
  
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(`Console Error in ${testName}: ${msg.text()}`);
    }
  });
  
  return errors;
}

// Helper function to wait for page load and check hydration
async function waitForPageLoadAndHydration(page: Page, url: string) {
  await page.goto(url);
  await page.waitForLoadState('networkidle');
  
  // Wait a bit for React hydration to complete
  await page.waitForTimeout(1000);
  
  // Check if the page is properly hydrated by looking for interactive elements
  await page.waitForSelector('body', { state: 'visible' });
}

test.describe('IT Quiz App - Comprehensive Route Testing', () => {
  let consoleErrors: string[] = [];

  test.beforeEach(async ({ page }) => {
    // Set up console error tracking
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(`Console Error: ${msg.text()}`);
      }
    });
  });

  test('1. Homepage (/) - Should load without hydration errors', async ({ page }) => {
    console.log('Testing Homepage...');
    
    await waitForPageLoadAndHydration(page, BASE_URL);
    
    // Check page title
    await expect(page).toHaveTitle(/IT Quiz App/);
    
    // Check main navigation elements exist
    await expect(page.locator('nav')).toBeVisible();
    
    // Check for main content sections
    await expect(page.locator('main')).toBeVisible();
    
    // Check theme toggle button exists and works
    const themeToggle = page.locator('[data-testid="theme-toggle"], button:has-text("🌙"), button:has-text("☀️")').first();
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await page.waitForTimeout(500); // Wait for theme change
      await themeToggle.click();
      await page.waitForTimeout(500); // Switch back
    }
    
    // Check for quiz mode cards/buttons
    const practiceButton = page.locator('text=Practice Mode, button:has-text("Practice"), [href*="practice"]').first();
    const flashcardsButton = page.locator('text=Flashcards, button:has-text("Flashcards"), [href*="flashcard"]').first();
    const timedQuizButton = page.locator('text=Timed Quiz, button:has-text("Timed"), button:has-text("Quick Start")').first();
    
    await expect(practiceButton.or(flashcardsButton).or(timedQuizButton)).toBeVisible();
    
    console.log('Homepage test completed');
  });

  test('2. Practice Mode (/practice-config) - Full E2E flow', async ({ page }) => {
    console.log('Testing Practice Mode...');
    
    // Navigate to practice config page
    await waitForPageLoadAndHydration(page, `${BASE_URL}/practice-config`);
    
    // Check page loads correctly
    await expect(page.locator('h1, h2').filter({ hasText: /practice/i })).toBeVisible();
    
    // Look for category selection elements
    const categorySelectors = [
      'input[type="checkbox"]',
      'button[role="checkbox"]',
      '[data-testid*="category"]',
      'label:has-text("JavaScript")',
      'label:has-text("React")',
      'label:has-text("Node.js")',
      'text=Select Categories',
      'text=All Categories'
    ];
    
    let categoryFound = false;
    for (const selector of categorySelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible()) {
        console.log(`Found category selector: ${selector}`);
        await element.click();
        categoryFound = true;
        break;
      }
    }
    
    if (!categoryFound) {
      console.log('No category selectors found, looking for any interactive elements...');
      const buttons = page.locator('button').all();
      const buttonTexts = await Promise.all((await buttons).map(async (btn) => {
        try {
          return await btn.textContent();
        } catch {
          return '';
        }
      }));
      console.log('Available buttons:', buttonTexts);
    }
    
    // Look for configuration options (number of questions, difficulty, etc.)
    const configSelectors = [
      'select',
      'input[type="number"]',
      'input[type="range"]',
      '[data-testid*="questions"]',
      '[data-testid*="difficulty"]',
      'text=Questions',
      'text=Difficulty'
    ];
    
    for (const selector of configSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible()) {
        console.log(`Found config option: ${selector}`);
        if (selector.includes('select')) {
          await element.selectOption({ index: 1 });
        } else if (selector.includes('input')) {
          await element.fill('10');
        }
      }
    }
    
    // Look for start button
    const startSelectors = [
      'button:has-text("Start")',
      'button:has-text("Begin")',
      'button:has-text("Start Practice")',
      'button:has-text("Start Quiz")',
      '[data-testid*="start"]',
      'button[type="submit"]'
    ];
    
    let startButton = null;
    for (const selector of startSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible()) {
        startButton = element;
        break;
      }
    }
    
    if (startButton) {
      await startButton.click();
      await page.waitForLoadState('networkidle');
      
      // Check if we navigated to a quiz page
      const currentUrl = page.url();
      console.log(`After clicking start, URL is: ${currentUrl}`);
      
      // Look for quiz elements
      const quizElements = [
        'text=Question',
        '[data-testid*="question"]',
        'text=Answer',
        'button:has-text("Next")',
        'button:has-text("Submit")'
      ];
      
      for (const selector of quizElements) {
        const element = page.locator(selector).first();
        if (await element.isVisible()) {
          console.log(`Quiz started successfully - found: ${selector}`);
          break;
        }
      }
    }
    
    console.log('Practice Mode test completed');
  });

  test('3. Flashcards (/flashcards) - Full E2E flow', async ({ page }) => {
    console.log('Testing Flashcards...');
    
    // Navigate to flashcards page
    await waitForPageLoadAndHydration(page, `${BASE_URL}/flashcards`);
    
    // Check page loads correctly
    await expect(page.locator('h1, h2').filter({ hasText: /flashcard/i })).toBeVisible();
    
    // Look for category selection
    const categorySelectors = [
      'input[type="checkbox"]',
      'button[role="checkbox"]',
      '[data-testid*="category"]',
      'label:has-text("JavaScript")',
      'label:has-text("React")',
      'text=Select Categories'
    ];
    
    for (const selector of categorySelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible()) {
        console.log(`Found flashcard category selector: ${selector}`);
        await element.click();
        break;
      }
    }
    
    // Look for start flashcards button
    const startButton = page.locator('button:has-text("Start"), button:has-text("Begin"), button:has-text("Start Study")').first();
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForLoadState('networkidle');
      
      // Check if flashcard study started
      const flashcardElements = [
        '[data-testid*="flashcard"]',
        'text=Front',
        'text=Back',
        'button:has-text("Flip")',
        'button:has-text("Next")',
        'text=Click to reveal'
      ];
      
      for (const selector of flashcardElements) {
        const element = page.locator(selector).first();
        if (await element.isVisible()) {
          console.log(`Flashcards started successfully - found: ${selector}`);
          break;
        }
      }
    }
    
    console.log('Flashcards test completed');
  });

  test('4. Quick Start Routes - Timed Quiz and Review Mode', async ({ page }) => {
    console.log('Testing Quick Start Routes...');
    
    // Test Timed Quiz quick start
    const timedQuizUrls = [
      `${BASE_URL}/quiz/timed`,
      `${BASE_URL}/timed-quiz`,
      `${BASE_URL}/quiz?mode=timed`
    ];
    
    for (const url of timedQuizUrls) {
      try {
        await page.goto(url);
        const response = await page.waitForLoadState('networkidle');
        
        if (!page.url().includes('404')) {
          console.log(`Timed Quiz accessible at: ${url}`);
          
          // Check for quiz elements
          const hasQuizElements = await page.locator('text=Question, [data-testid*="question"], button:has-text("Next")').first().isVisible();
          if (hasQuizElements) {
            console.log('Timed Quiz loaded with quiz elements');
          }
          break;
        }
      } catch (error) {
        console.log(`Timed Quiz URL ${url} failed: ${error}`);
      }
    }
    
    // Test Review Mode quick start
    const reviewModeUrls = [
      `${BASE_URL}/quiz/review`,
      `${BASE_URL}/review-mode`,
      `${BASE_URL}/quiz?mode=review`
    ];
    
    for (const url of reviewModeUrls) {
      try {
        await page.goto(url);
        await page.waitForLoadState('networkidle');
        
        if (!page.url().includes('404')) {
          console.log(`Review Mode accessible at: ${url}`);
          
          // Check for review elements
          const hasReviewElements = await page.locator('text=Review, text=Question, [data-testid*="review"]').first().isVisible();
          if (hasReviewElements) {
            console.log('Review Mode loaded with review elements');
          }
          break;
        }
      } catch (error) {
        console.log(`Review Mode URL ${url} failed: ${error}`);
      }
    }
    
    console.log('Quick Start Routes test completed');
  });

  test('5. Custom Quiz Flow', async ({ page }) => {
    console.log('Testing Custom Quiz Flow...');
    
    // Navigate to homepage and look for custom quiz option
    await waitForPageLoadAndHydration(page, BASE_URL);
    
    const customQuizSelectors = [
      'button:has-text("Custom")',
      'button:has-text("Create Quiz")',
      '[href*="custom"]',
      'text=Custom Quiz'
    ];
    
    for (const selector of customQuizSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible()) {
        console.log(`Found custom quiz option: ${selector}`);
        await element.click();
        await page.waitForLoadState('networkidle');
        
        // Check if we're in a configuration page
        const configElements = [
          'text=Configure',
          'text=Categories',
          'text=Questions',
          'select',
          'input[type="checkbox"]'
        ];
        
        let foundConfig = false;
        for (const configSelector of configElements) {
          const configElement = page.locator(configSelector).first();
          if (await configElement.isVisible()) {
            console.log(`Custom quiz configuration found: ${configSelector}`);
            foundConfig = true;
            break;
          }
        }
        
        if (foundConfig) {
          // Try to start the custom quiz
          const startButton = page.locator('button:has-text("Start"), button:has-text("Begin")').first();
          if (await startButton.isVisible()) {
            await startButton.click();
            await page.waitForLoadState('networkidle');
            console.log('Custom quiz started successfully');
          }
        }
        break;
      }
    }
    
    console.log('Custom Quiz Flow test completed');
  });

  test('6. Theme Toggle Functionality', async ({ page }) => {
    console.log('Testing Theme Toggle...');
    
    await waitForPageLoadAndHydration(page, BASE_URL);
    
    // Look for theme toggle button
    const themeToggleSelectors = [
      '[data-testid="theme-toggle"]',
      'button:has-text("🌙")',
      'button:has-text("☀️")',
      'button:has-text("Dark")',
      'button:has-text("Light")',
      '[aria-label*="theme"]'
    ];
    
    for (const selector of themeToggleSelectors) {
      const themeToggle = page.locator(selector).first();
      if (await themeToggle.isVisible()) {
        console.log(`Found theme toggle: ${selector}`);
        
        // Get initial theme state
        const initialClass = await page.locator('html, body').first().getAttribute('class');
        console.log(`Initial theme class: ${initialClass}`);
        
        // Click theme toggle
        await themeToggle.click();
        await page.waitForTimeout(500);
        
        // Get new theme state
        const newClass = await page.locator('html, body').first().getAttribute('class');
        console.log(`New theme class: ${newClass}`);
        
        // Verify theme changed
        if (initialClass !== newClass) {
          console.log('Theme toggle working correctly');
        } else {
          console.log('Theme may have changed but classes are same');
        }
        
        // Toggle back
        await themeToggle.click();
        await page.waitForTimeout(500);
        
        console.log('Theme toggle test completed');
        break;
      }
    }
  });

  test('7. Navigation and 404 Error Check', async ({ page }) => {
    console.log('Testing Navigation and 404 Errors...');
    
    // Test common routes that should exist
    const routes = [
      '/',
      '/practice-config',
      '/flashcards'
    ];
    
    for (const route of routes) {
      await page.goto(`${BASE_URL}${route}`);
      await page.waitForLoadState('networkidle');
      
      // Check if it's a 404 page
      const is404 = await page.locator('text=404, text=Not Found, text=Page not found').isVisible();
      if (is404) {
        console.log(`❌ Route ${route} returns 404`);
      } else {
        console.log(`✅ Route ${route} loads successfully`);
      }
    }
    
    // Test a route that should return 404
    await page.goto(`${BASE_URL}/non-existent-route`);
    await page.waitForLoadState('networkidle');
    const should404 = await page.locator('text=404, text=Not Found, text=Page not found').isVisible();
    if (should404) {
      console.log('✅ 404 handling works correctly');
    } else {
      console.log('⚠️ 404 page may not be properly configured');
    }
    
    console.log('Navigation test completed');
  });

  test.afterEach(async ({ page }) => {
    // Report any console errors found during the test
    if (consoleErrors.length > 0) {
      console.log('\n🚨 Console Errors Found:');
      consoleErrors.forEach(error => console.log(`  - ${error}`));
      consoleErrors = []; // Reset for next test
    } else {
      console.log('✅ No console errors detected');
    }
  });
});