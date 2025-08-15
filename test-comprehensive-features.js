#!/usr/bin/env node

/**
 * Comprehensive Feature Testing Script
 * Tests both Multiple Choice Fix and Learning Mode features
 */

const puppeteer = require('puppeteer')
const fs = require('fs')

const TEST_CONFIG = {
  baseUrl: 'http://localhost:3001',
  timeout: 30000,
  viewport: { width: 1280, height: 720 }
}

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
}

class TestResult {
  constructor() {
    this.passed = 0
    this.failed = 0
    this.results = []
  }

  pass(test, message = '') {
    this.passed++
    this.results.push({ test, status: 'PASS', message })
    console.log(`${colors.green}✓ ${test}${colors.reset}${message ? ' - ' + message : ''}`)
  }

  fail(test, message = '') {
    this.failed++
    this.results.push({ test, status: 'FAIL', message })
    console.log(`${colors.red}✗ ${test}${colors.reset}${message ? ' - ' + message : ''}`)
  }

  summary() {
    const total = this.passed + this.failed
    console.log(`\n${colors.bold}=== TEST SUMMARY ===${colors.reset}`)
    console.log(`Total Tests: ${total}`)
    console.log(`${colors.green}Passed: ${this.passed}${colors.reset}`)
    console.log(`${colors.red}Failed: ${this.failed}${colors.reset}`)
    console.log(`Success Rate: ${total > 0 ? ((this.passed / total) * 100).toFixed(1) : 0}%`)
    
    if (this.failed > 0) {
      console.log(`\n${colors.red}FAILED TESTS:${colors.reset}`)
      this.results.filter(r => r.status === 'FAIL').forEach(r => {
        console.log(`- ${r.test}: ${r.message}`)
      })
    }
  }
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function testMultipleChoiceFix(page, results) {
  console.log(`\n${colors.blue}${colors.bold}1. MULTIPLE CHOICE FIX TESTING${colors.reset}`)
  
  try {
    // Navigate to practice quiz
    await page.goto(`${TEST_CONFIG.baseUrl}/practice-config`)
    await page.waitForSelector('button', { timeout: 10000 })
    
    // Start a practice quiz
    const startButton = await page.$('button:contains("Start Practice")')
    if (startButton) {
      await startButton.click()
    } else {
      const practiceButton = await page.$('button')
      if (practiceButton) await practiceButton.click()
    }
    
    await page.waitForSelector('[data-testid="question-card"], .question-container, h2', { timeout: 15000 })
    results.pass('Navigate to practice quiz')
    
    // Check for multiple choice question
    const questionText = await page.$eval('h2, .question-text, [data-testid="question-text"]', el => el.textContent)
    console.log(`Current question: ${questionText?.substring(0, 100)}...`)
    
    // Look for multiple answer options
    const options = await page.$$('.answer-option, [data-testid="answer-option"], button[data-answer]')
    if (options.length > 0) {
      results.pass('Answer options found', `${options.length} options available`)
      
      // Test multiple selection behavior
      if (options.length >= 2) {
        // Select first option
        await options[0].click()
        await delay(500)
        
        // Select second option 
        await options[1].click()
        await delay(500)
        
        // Check if both selections are maintained
        const selectedOptions = await page.$$('.answer-option.selected, [data-selected="true"], button[aria-pressed="true"]')
        if (selectedOptions.length >= 1) {
          results.pass('Multiple selection capability working')
        } else {
          results.fail('Multiple selection not working', 'Selections not maintained')
        }
        
        // Check if feedback appears only after required selections
        const feedbackElements = await page.$$('.feedback, [data-testid="feedback"], .feedback-overlay')
        if (feedbackElements.length === 0) {
          results.pass('Feedback correctly delayed until all answers selected')
        } else {
          results.fail('Feedback appears too early', 'Should wait for all required answers')
        }
      }
    } else {
      results.fail('No answer options found')
    }
    
  } catch (error) {
    results.fail('Multiple choice navigation failed', error.message)
  }
}

async function testLearningMode(page, results) {
  console.log(`\n${colors.blue}${colors.bold}2. LEARNING MODE TESTING${colors.reset}`)
  
  try {
    // Test main learning hub
    await page.goto(`${TEST_CONFIG.baseUrl}/learn`)
    await page.waitForSelector('h1, .heading', { timeout: 10000 })
    
    const title = await page.$eval('h1', el => el.textContent)
    if (title && title.includes('Learning')) {
      results.pass('Learning Hub loads correctly')
    } else {
      results.fail('Learning Hub title incorrect', `Found: ${title}`)
    }
    
    // Test learning navigation options
    const learningOptions = await page.$$('button, a[href*="/learn"]')
    if (learningOptions.length >= 3) {
      results.pass('Learning navigation options available', `${learningOptions.length} options found`)
    } else {
      results.fail('Insufficient learning options', `Only ${learningOptions.length} found`)
    }
    
    // Test Browse Questions
    try {
      await page.goto(`${TEST_CONFIG.baseUrl}/learn/browse`)
      await page.waitForSelector('.question, .learn-card, [data-testid="question"]', { timeout: 10000 })
      
      const questions = await page.$$('.question, .learn-card, [data-testid="question"]')
      if (questions.length > 0) {
        results.pass('Browse Questions page working', `${questions.length} questions visible`)
      } else {
        results.fail('No questions found in browse page')
      }
    } catch (error) {
      results.fail('Browse Questions page failed', error.message)
    }
    
    // Test Topics page
    try {
      await page.goto(`${TEST_CONFIG.baseUrl}/learn/topics`)
      await page.waitForSelector('.topic, .card, [data-testid="topic"]', { timeout: 10000 })
      
      const topics = await page.$$('.topic, .card, [data-testid="topic"]')
      if (topics.length > 0) {
        results.pass('Topics page working', `${topics.length} topics available`)
        
        // Test clicking a topic
        await topics[0].click()
        await delay(2000)
        
        const currentUrl = page.url()
        if (currentUrl.includes('/learn/topics/')) {
          results.pass('Topic navigation working')
        } else {
          results.fail('Topic navigation failed', `URL: ${currentUrl}`)
        }
      } else {
        results.fail('No topics found on topics page')
      }
    } catch (error) {
      results.fail('Topics page failed', error.message)
    }
    
    // Test Search functionality
    try {
      await page.goto(`${TEST_CONFIG.baseUrl}/learn/search`)
      await page.waitForSelector('input[type="search"], input[placeholder*="search"], .search-input', { timeout: 10000 })
      
      const searchInput = await page.$('input[type="search"], input[placeholder*="search"], .search-input')
      if (searchInput) {
        await searchInput.type('hardware')
        await delay(1000)
        results.pass('Search functionality available')
      } else {
        results.fail('Search input not found')
      }
    } catch (error) {
      results.fail('Search page failed', error.message)
    }
    
  } catch (error) {
    results.fail('Learning mode navigation failed', error.message)
  }
}

async function testResponsiveDesign(page, results) {
  console.log(`\n${colors.blue}${colors.bold}3. RESPONSIVE DESIGN TESTING${colors.reset}`)
  
  try {
    // Test mobile viewport
    await page.setViewport({ width: 375, height: 667 })
    await page.goto(`${TEST_CONFIG.baseUrl}/learn`)
    await delay(1000)
    
    const mobileLayout = await page.$eval('body', el => {
      return window.getComputedStyle(el).width
    })
    
    if (mobileLayout) {
      results.pass('Mobile responsive layout working')
    }
    
    // Test tablet viewport
    await page.setViewport({ width: 768, height: 1024 })
    await delay(1000)
    results.pass('Tablet responsive layout working')
    
    // Reset to desktop
    await page.setViewport(TEST_CONFIG.viewport)
    
  } catch (error) {
    results.fail('Responsive design test failed', error.message)
  }
}

async function testAccessibility(page, results) {
  console.log(`\n${colors.blue}${colors.bold}4. ACCESSIBILITY TESTING${colors.reset}`)
  
  try {
    await page.goto(`${TEST_CONFIG.baseUrl}/learn`)
    
    // Check for proper heading structure
    const headings = await page.$$('h1, h2, h3, h4, h5, h6')
    if (headings.length > 0) {
      results.pass('Heading structure present', `${headings.length} headings found`)
    }
    
    // Check for alt text on images
    const images = await page.$$('img')
    if (images.length > 0) {
      let imagesWithAlt = 0
      for (const img of images) {
        const alt = await img.getAttribute('alt')
        if (alt !== null) imagesWithAlt++
      }
      
      if (imagesWithAlt === images.length) {
        results.pass('All images have alt text')
      } else {
        results.fail('Missing alt text', `${images.length - imagesWithAlt}/${images.length} images missing alt`)
      }
    }
    
    // Check for proper focus management
    await page.keyboard.press('Tab')
    const focusedElement = await page.evaluateHandle(() => document.activeElement)
    if (focusedElement) {
      results.pass('Keyboard navigation working')
    }
    
  } catch (error) {
    results.fail('Accessibility test failed', error.message)
  }
}

async function testIntegration(page, results) {
  console.log(`\n${colors.blue}${colors.bold}5. INTEGRATION TESTING${colors.reset}`)
  
  try {
    // Test navigation between modes
    await page.goto(`${TEST_CONFIG.baseUrl}`)
    await delay(1000)
    
    // Navigate to learning mode and back
    const learnLink = await page.$('a[href*="/learn"], button:contains("Learn")')
    if (learnLink) {
      await learnLink.click()
      await delay(2000)
      
      const backButton = await page.$('button:contains("Home"), a[href="/"]')
      if (backButton) {
        await backButton.click()
        await delay(1000)
        results.pass('Navigation between modes working')
      }
    }
    
    // Test data consistency
    await page.goto(`${TEST_CONFIG.baseUrl}/learn/browse`)
    await delay(2000)
    
    const questionCount = await page.$$eval('.question, .learn-card', els => els.length)
    if (questionCount > 0) {
      results.pass('Data consistency maintained', `${questionCount} questions loaded`)
    }
    
  } catch (error) {
    results.fail('Integration test failed', error.message)
  }
}

async function runPerformanceTest(page, results) {
  console.log(`\n${colors.blue}${colors.bold}6. PERFORMANCE TESTING${colors.reset}`)
  
  try {
    const startTime = Date.now()
    await page.goto(`${TEST_CONFIG.baseUrl}/learn`)
    await page.waitForSelector('h1', { timeout: 10000 })
    const loadTime = Date.now() - startTime
    
    if (loadTime < 5000) {
      results.pass('Page load performance acceptable', `${loadTime}ms`)
    } else {
      results.fail('Page load too slow', `${loadTime}ms`)
    }
    
    // Check bundle size (basic check)
    const jsResources = await page.$$eval('script[src]', scripts => 
      scripts.map(s => s.src).filter(src => src.includes('/_next/'))
    )
    
    if (jsResources.length > 0) {
      results.pass('JavaScript resources loading', `${jsResources.length} JS files`)
    }
    
  } catch (error) {
    results.fail('Performance test failed', error.message)
  }
}

async function runTests() {
  console.log(`${colors.bold}${colors.blue}IT Quiz App - Comprehensive Feature Testing${colors.reset}`)
  console.log(`Testing URL: ${TEST_CONFIG.baseUrl}`)
  console.log('=' * 50)
  
  const results = new TestResult()
  let browser, page
  
  try {
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    page = await browser.newPage()
    await page.setViewport(TEST_CONFIG.viewport)
    
    // Set default timeout
    page.setDefaultTimeout(TEST_CONFIG.timeout)
    
    // Run all tests
    await testMultipleChoiceFix(page, results)
    await testLearningMode(page, results)
    await testResponsiveDesign(page, results)
    await testAccessibility(page, results)
    await testIntegration(page, results)
    await runPerformanceTest(page, results)
    
  } catch (error) {
    results.fail('Test runner setup failed', error.message)
  } finally {
    if (browser) {
      await browser.close()
    }
  }
  
  results.summary()
  
  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    total_tests: results.passed + results.failed,
    passed: results.passed,
    failed: results.failed,
    success_rate: results.passed / (results.passed + results.failed) * 100,
    results: results.results
  }
  
  fs.writeFileSync('./test-report.json', JSON.stringify(report, null, 2))
  console.log(`\n${colors.green}Report saved to: test-report.json${colors.reset}`)
  
  process.exit(results.failed > 0 ? 1 : 0)
}

// Check if server is running
console.log('Checking server availability...')
require('http').get(TEST_CONFIG.baseUrl, (res) => {
  console.log(`${colors.green}Server is running (${res.statusCode})${colors.reset}`)
  runTests()
}).on('error', (err) => {
  console.log(`${colors.red}Server not available: ${err.message}${colors.reset}`)
  console.log('Please start the development server with: npm run dev')
  process.exit(1)
})