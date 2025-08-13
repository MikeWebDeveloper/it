import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:3001';

// Helper to capture page structure and content
async function inspectPage(page: Page, pageName: string) {
  console.log(`\n📋 INSPECTING ${pageName.toUpperCase()} PAGE:`);
  console.log(`URL: ${page.url()}`);
  
  // Get page title
  const title = await page.title();
  console.log(`Title: ${title}`);
  
  // Check for error indicators
  const is404 = await page.locator('text=404, text=Not Found, text=Page not found').isVisible();
  if (is404) {
    console.log('❌ This is a 404 page');
    return;
  }
  
  // Get all headings
  const headings = await page.locator('h1, h2, h3').allTextContents();
  console.log(`Headings: ${headings.join(', ')}`);
  
  // Get all buttons
  const buttons = await page.locator('button').allTextContents();
  console.log(`Buttons: ${buttons.slice(0, 10).join(', ')}${buttons.length > 10 ? '...' : ''}`);
  
  // Get all links
  const links = await page.locator('a').allTextContents();
  console.log(`Links: ${links.slice(0, 10).join(', ')}${links.length > 10 ? '...' : ''}`);
  
  // Get main content structure
  const mainExists = await page.locator('main').isVisible();
  const navExists = await page.locator('nav').isVisible();
  const headerExists = await page.locator('header').isVisible();
  console.log(`Structure: main=${mainExists}, nav=${navExists}, header=${headerExists}`);
  
  // Check for forms
  const forms = await page.locator('form').count();
  const inputs = await page.locator('input').count();
  const selects = await page.locator('select').count();
  console.log(`Forms: ${forms}, Inputs: ${inputs}, Selects: ${selects}`);
  
  // Check for React error boundaries or hydration issues
  const reactErrors = await page.locator('text=Error, text=Something went wrong, [data-testid*="error"]').isVisible();
  if (reactErrors) {
    console.log('⚠️ React error detected');
  }
  
  // Take a screenshot for visual confirmation
  await page.screenshot({ 
    path: `test-results/${pageName}-page.png`, 
    fullPage: true 
  });
  console.log(`Screenshot saved: ${pageName}-page.png`);
}

async function checkConsoleErrors(page: Page) {
  const errors: string[] = [];
  
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  return errors;
}

test.describe('Visual Inspection and Structure Analysis', () => {
  test('1. Homepage Structure and Content', async ({ page }) => {
    const consoleErrors = await checkConsoleErrors(page);
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Allow for hydration
    
    await inspectPage(page, 'homepage');
    
    // Test navigation and interactions
    console.log('\n🔍 TESTING HOMEPAGE INTERACTIONS:');
    
    // Try to find and click theme toggle
    const themeSelectors = [
      '[data-testid="theme-toggle"]',
      'button:has-text("🌙")',
      'button:has-text("☀️")',
      '[aria-label*="theme"]',
      'button[class*="theme"]'
    ];
    
    for (const selector of themeSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible()) {
        console.log(`✅ Found theme toggle: ${selector}`);
        await element.click();
        await page.waitForTimeout(500);
        console.log('✅ Theme toggle clicked successfully');
        break;
      }
    }
    
    // Look for navigation to other pages
    const practiceSelectors = [
      'button:has-text("Practice")',
      'a[href*="practice"]',
      'text=Practice Mode'
    ];
    
    for (const selector of practiceSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible()) {
        console.log(`✅ Found practice link/button: ${selector}`);
        break;
      }
    }
    
    console.log(`Console errors: ${consoleErrors.length}`);
  });

  test('2. Practice Config Page Structure', async ({ page }) => {
    const consoleErrors = await checkConsoleErrors(page);
    
    await page.goto(`${BASE_URL}/practice-config`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await inspectPage(page, 'practice-config');
    
    console.log('\n🔍 TESTING PRACTICE CONFIG INTERACTIONS:');
    
    // Look for interactive elements
    const checkboxes = await page.locator('input[type="checkbox"]').count();
    const radios = await page.locator('input[type="radio"]').count();
    const buttons = await page.locator('button').count();
    
    console.log(`Interactive elements: ${checkboxes} checkboxes, ${radios} radios, ${buttons} buttons`);
    
    // Try to interact with first checkbox if available
    const firstCheckbox = page.locator('input[type="checkbox"]').first();
    if (await firstCheckbox.isVisible()) {
      await firstCheckbox.click();
      console.log('✅ Checkbox interaction works');
    }
    
    // Look for start/submit buttons
    const startButtons = page.locator('button:has-text("Start"), button:has-text("Begin"), button[type="submit"]');
    const startButtonCount = await startButtons.count();
    console.log(`Start buttons found: ${startButtonCount}`);
    
    if (startButtonCount > 0) {
      const firstStartButton = startButtons.first();
      if (await firstStartButton.isVisible()) {
        await firstStartButton.click();
        await page.waitForLoadState('networkidle');
        console.log(`✅ Start button clicked, navigated to: ${page.url()}`);
      }
    }
    
    console.log(`Console errors: ${consoleErrors.length}`);
  });

  test('3. Flashcards Page Structure', async ({ page }) => {
    const consoleErrors = await checkConsoleErrors(page);
    
    await page.goto(`${BASE_URL}/flashcards`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await inspectPage(page, 'flashcards');
    
    console.log('\n🔍 TESTING FLASHCARDS INTERACTIONS:');
    
    // Check for category selection
    const categories = await page.locator('[data-testid*="category"], input[type="checkbox"]').count();
    console.log(`Category selection elements: ${categories}`);
    
    // Try to start flashcards
    const startButtons = page.locator('button:has-text("Start"), button:has-text("Begin")');
    const startButtonCount = await startButtons.count();
    console.log(`Start buttons found: ${startButtonCount}`);
    
    if (startButtonCount > 0) {
      const firstStartButton = startButtons.first();
      if (await firstStartButton.isVisible()) {
        await firstStartButton.click();
        await page.waitForLoadState('networkidle');
        console.log(`✅ Start button clicked, navigated to: ${page.url()}`);
      }
    }
    
    console.log(`Console errors: ${consoleErrors.length}`);
  });

  test('4. Quiz Routes Testing', async ({ page }) => {
    const routes = [
      '/quiz/timed',
      '/quiz/review',
      '/quiz',
      '/timed-quiz',
      '/review'
    ];
    
    for (const route of routes) {
      console.log(`\n🔍 TESTING ROUTE: ${route}`);
      
      try {
        await page.goto(`${BASE_URL}${route}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        
        const is404 = await page.locator('text=404, text=Not Found').isVisible();
        const currentUrl = page.url();
        
        if (is404) {
          console.log(`❌ ${route} - 404 Not Found`);
        } else if (currentUrl.includes('404')) {
          console.log(`❌ ${route} - Redirected to 404`);
        } else {
          console.log(`✅ ${route} - Loads successfully`);
          
          // Quick structure check
          const title = await page.title();
          const headings = await page.locator('h1, h2').allTextContents();
          console.log(`  Title: ${title}`);
          console.log(`  Headings: ${headings.join(', ')}`);
        }
      } catch (error) {
        console.log(`❌ ${route} - Error: ${error}`);
      }
    }
  });

  test('5. Full User Flow Simulation', async ({ page }) => {
    console.log('\n🎯 SIMULATING COMPLETE USER FLOW:');
    
    // Start at homepage
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    console.log('✅ 1. Loaded homepage');
    
    // Try to navigate to practice config
    const practiceLink = page.locator('button:has-text("Practice"), a[href*="practice"], text=Practice Mode').first();
    if (await practiceLink.isVisible()) {
      await practiceLink.click();
      await page.waitForLoadState('networkidle');
      console.log(`✅ 2. Navigated to practice config: ${page.url()}`);
      
      // Try to configure and start a quiz
      const checkboxes = page.locator('input[type="checkbox"]');
      const checkboxCount = await checkboxes.count();
      
      if (checkboxCount > 0) {
        await checkboxes.first().click();
        console.log('✅ 3. Selected a category');
        
        const startButton = page.locator('button:has-text("Start"), button:has-text("Begin")').first();
        if (await startButton.isVisible()) {
          await startButton.click();
          await page.waitForLoadState('networkidle');
          console.log(`✅ 4. Started quiz: ${page.url()}`);
          
          // Check if we're in a quiz
          const questionElements = page.locator('text=Question, [data-testid*="question"]');
          const hasQuestion = await questionElements.count() > 0;
          console.log(`✅ 5. Quiz has questions: ${hasQuestion}`);
        }
      }
    }
    
    // Go back to homepage and try flashcards
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    const flashcardsLink = page.locator('button:has-text("Flashcard"), a[href*="flashcard"], text=Flashcards').first();
    if (await flashcardsLink.isVisible()) {
      await flashcardsLink.click();
      await page.waitForLoadState('networkidle');
      console.log(`✅ 6. Navigated to flashcards: ${page.url()}`);
    }
    
    console.log('🎯 User flow simulation completed');
  });
});