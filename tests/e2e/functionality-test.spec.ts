import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:3001';

test.describe('Functionality Testing - Post-Fix Validation', () => {
  test('Complete Practice Mode Flow', async ({ page }) => {
    console.log('🎯 TESTING PRACTICE MODE COMPLETE FLOW:');
    
    // Navigate to practice config
    await page.goto(`${BASE_URL}/practice-config`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Check page loaded correctly
    const heading = await page.locator('h1, h2').filter({ hasText: /Choose Your Topics|Practice|Topics/ }).first();
    const isVisible = await heading.isVisible();
    console.log(`✅ Practice config page loaded: ${isVisible}`);
    
    // Check for topic selection buttons
    const topicButtons = page.locator('button').filter({ hasText: /Hardware|Software|Networking|Security/ });
    const topicCount = await topicButtons.count();
    console.log(`📚 Topic selection buttons found: ${topicCount}`);
    
    if (topicCount > 0) {
      // Click first topic
      await topicButtons.first().click();
      console.log('✅ Selected first topic');
      
      // Look for configuration options
      const selectAllButton = page.locator('button:has-text("Select All")');
      if (await selectAllButton.isVisible()) {
        await selectAllButton.click();
        console.log('✅ Selected all topics');
      }
      
      // Look for start quiz button
      const startButton = page.locator('button').filter({ hasText: /Start|Begin|Continue/ });
      const startCount = await startButton.count();
      console.log(`🚀 Start buttons found: ${startCount}`);
      
      if (startCount > 0) {
        await startButton.first().click();
        await page.waitForLoadState('networkidle');
        console.log(`✅ Start clicked, current URL: ${page.url()}`);
        
        // Check if we're in a quiz
        const quizIndicators = [
          page.locator('text=Question'),
          page.locator('[data-testid*="question"]'),
          page.locator('text=Answer'),
          page.locator('button:has-text("Next")'),
          page.locator('button:has-text("Submit")')
        ];
        
        for (const indicator of quizIndicators) {
          if (await indicator.first().isVisible()) {
            console.log('✅ Quiz started successfully!');
            break;
          }
        }
      }
    }
  });

  test('Complete Flashcards Flow', async ({ page }) => {
    console.log('🎯 TESTING FLASHCARDS COMPLETE FLOW:');
    
    // Navigate to flashcards
    await page.goto(`${BASE_URL}/flashcards`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Check page loaded correctly
    const heading = await page.locator('h1, h2').filter({ hasText: /Flashcard|Study|Topics/ }).first();
    const isVisible = await heading.isVisible();
    console.log(`✅ Flashcards page loaded: ${isVisible}`);
    
    // Check for topic selection
    const topicButtons = page.locator('button').filter({ hasText: /Hardware|Software|Networking|Security/ });
    const topicCount = await topicButtons.count();
    console.log(`📚 Topic selection buttons found: ${topicCount}`);
    
    if (topicCount > 0) {
      // Select a topic
      await topicButtons.first().click();
      console.log('✅ Selected first topic');
      
      // Look for start study button
      const startButton = page.locator('button').filter({ hasText: /Start|Begin|Study/ });
      const startCount = await startButton.count();
      console.log(`🚀 Start buttons found: ${startCount}`);
      
      if (startCount > 0) {
        await startButton.first().click();
        await page.waitForLoadState('networkidle');
        console.log(`✅ Start clicked, current URL: ${page.url()}`);
        
        // Check if flashcard study started
        const flashcardIndicators = [
          page.locator('[data-testid*="flashcard"]'),
          page.locator('text=Front'),
          page.locator('text=Back'),
          page.locator('button:has-text("Flip")'),
          page.locator('button:has-text("Next")')
        ];
        
        for (const indicator of flashcardIndicators) {
          if (await indicator.first().isVisible()) {
            console.log('✅ Flashcard study started successfully!');
            break;
          }
        }
      }
    }
  });

  test('Homepage Navigation and Theme Toggle', async ({ page }) => {
    console.log('🎯 TESTING HOMEPAGE NAVIGATION AND THEME:');
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Test theme toggle
    const themeButton = page.locator('button').filter({ hasText: /🌙|☀️|theme/i }).first();
    if (await themeButton.isVisible()) {
      const initialText = await themeButton.textContent();
      await themeButton.click();
      await page.waitForTimeout(500);
      const newText = await themeButton.textContent();
      console.log(`✅ Theme toggle works: ${initialText} → ${newText}`);
    }
    
    // Test navigation to Practice Mode
    const practiceButton = page.locator('button:has-text("Practice Mode")').first();
    if (await practiceButton.isVisible()) {
      await practiceButton.click();
      await page.waitForLoadState('networkidle');
      const currentUrl = page.url();
      if (currentUrl.includes('practice')) {
        console.log('✅ Navigation to Practice Mode works');
      } else {
        console.log(`⚠️ Expected practice URL, got: ${currentUrl}`);
      }
      
      // Go back
      await page.goBack();
      await page.waitForLoadState('networkidle');
    }
    
    // Test navigation to Flashcards
    const flashcardsButton = page.locator('button:has-text("Flashcards")').first();
    if (await flashcardsButton.isVisible()) {
      await flashcardsButton.click();
      await page.waitForLoadState('networkidle');
      const currentUrl = page.url();
      if (currentUrl.includes('flashcard')) {
        console.log('✅ Navigation to Flashcards works');
      } else {
        console.log(`⚠️ Expected flashcard URL, got: ${currentUrl}`);
      }
      
      // Go back
      await page.goBack();
      await page.waitForLoadState('networkidle');
    }
    
    // Test Timed Quiz
    const timedButton = page.locator('button:has-text("Timed Quiz")').first();
    if (await timedButton.isVisible()) {
      await timedButton.click();
      await page.waitForLoadState('networkidle');
      const currentUrl = page.url();
      console.log(`✅ Timed Quiz navigation: ${currentUrl}`);
      
      // Go back
      await page.goBack();
      await page.waitForLoadState('networkidle');
    }
  });

  test('Console Error Check', async ({ page }) => {
    console.log('🎯 COMPREHENSIVE CONSOLE ERROR CHECK:');
    
    const errors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    const pages = [
      { name: 'Homepage', url: '/' },
      { name: 'Practice Config', url: '/practice-config' },
      { name: 'Flashcards', url: '/flashcards' },
      { name: 'Timed Quiz', url: '/quiz/timed' },
      { name: 'Review Mode', url: '/quiz/review' }
    ];
    
    for (const pageInfo of pages) {
      console.log(`Checking ${pageInfo.name}...`);
      await page.goto(`${BASE_URL}${pageInfo.url}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000); // Allow for hydration
      
      const pageErrors = errors.length;
      console.log(`${pageInfo.name}: ${pageErrors} console errors so far`);
    }
    
    console.log(`\n📊 FINAL CONSOLE ERROR REPORT:`);
    console.log(`Total errors found: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('Errors:');
      errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    } else {
      console.log('✅ No console errors detected!');
    }
  });

  test('404 and Error Handling', async ({ page }) => {
    console.log('🎯 TESTING 404 AND ERROR HANDLING:');
    
    const testUrls = [
      '/non-existent-page',
      '/quiz/invalid-mode',
      '/practice/wrong',
      '/flashcards/invalid'
    ];
    
    for (const url of testUrls) {
      await page.goto(`${BASE_URL}${url}`);
      await page.waitForLoadState('networkidle');
      
      const is404 = await page.locator('text=404, text=Not Found, text=Page not found').isVisible();
      const currentUrl = page.url();
      
      if (is404 || currentUrl.includes('404')) {
        console.log(`✅ ${url} properly shows 404`);
      } else {
        console.log(`⚠️ ${url} doesn't show 404 (redirected to ${currentUrl})`);
      }
    }
  });
});