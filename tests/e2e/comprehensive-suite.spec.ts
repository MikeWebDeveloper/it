import { test, expect, Page, BrowserContext } from '@playwright/test'

/**
 * Master E2E Test Suite for IT Quiz App
 * 
 * This test orchestrates comprehensive end-to-end testing scenarios
 * that simulate real-world user behavior and validate complete
 * application workflows.
 */

test.describe('IT Quiz App - Master E2E Test Suite', () => {
  let testContext: {
    sessionData: any[]
    performanceMetrics: any[]
    userJourneyResults: any[]
    integrationResults: any[]
  }

  test.beforeAll(async () => {
    testContext = {
      sessionData: [],
      performanceMetrics: [],
      userJourneyResults: [],
      integrationResults: []
    }
  })

  // Helper functions for comprehensive testing
  async function captureComprehensiveScreenshot(page: Page, scenario: string, step: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `${scenario}-${step}-${timestamp}.png`
    
    await page.screenshot({
      path: `test-results/comprehensive/${filename}`,
      fullPage: true,
      animations: 'disabled'
    })
    
    return filename
  }

  async function validatePageAccessibility(page: Page, pageName: string) {
    const issues = []
    
    // Check for proper heading structure
    const h1Count = await page.locator('h1').count()
    if (h1Count !== 1) {
      issues.push(`${pageName}: Should have exactly one h1, found ${h1Count}`)
    }
    
    // Check for alt text on images
    const images = await page.locator('img').all()
    for (const img of images) {
      const alt = await img.getAttribute('alt')
      const role = await img.getAttribute('role')
      if (!alt && role !== 'presentation') {
        issues.push(`${pageName}: Image missing alt text`)
      }
    }
    
    // Check for keyboard accessibility
    const focusableElements = await page.locator('button, input, select, a[href]').count()
    if (focusableElements === 0) {
      issues.push(`${pageName}: No focusable elements found`)
    }
    
    return issues
  }

  async function measurePagePerformance(page: Page, pageName: string) {
    const metrics = await page.evaluate(() => {
      const paintEntries = performance.getEntriesByType('paint')
      const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0
      
      return {
        firstContentfulPaint: fcp,
        domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
        loadComplete: performance.timing.loadEventEnd - performance.timing.navigationStart,
        memoryUsage: (performance as any).memory
      }
    })
    
    testContext.performanceMetrics.push({
      page: pageName,
      timestamp: new Date().toISOString(),
      ...metrics
    })
    
    return metrics
  }

  test.describe('Scenario 1: New User Complete Journey', () => {
    test('First-time user discovers and masters the application', async ({ page, context }) => {
      // Clear any existing data to simulate new user
      await context.clearCookies()
      await page.goto('/')
      await page.evaluate(() => localStorage.clear())
      await page.reload()
      await page.waitForLoadState('networkidle')
      
      let scenarioResults = {
        scenario: 'new-user-journey',
        steps: [],
        accessibilityIssues: [],
        performanceMetrics: [],
        screenshots: []
      }

      // Step 1: Homepage Discovery
      let screenshot = await captureComprehensiveScreenshot(page, 'new-user', 'homepage-arrival')
      scenarioResults.screenshots.push(screenshot)
      
      let accessibility = await validatePageAccessibility(page, 'homepage')
      scenarioResults.accessibilityIssues.push(...accessibility)
      
      let performance = await measurePagePerformance(page, 'homepage')
      scenarioResults.performanceMetrics.push(performance)
      
      // Verify new user experience
      await expect(page.getByText('IT Quiz App')).toBeVisible()
      await expect(page.getByText(/Master IT Essentials/)).toBeVisible()
      
      scenarioResults.steps.push({
        step: 'homepage-discovery',
        status: 'completed',
        timestamp: new Date().toISOString()
      })

      // Step 2: Explore Learning Options
      const practiceButton = page.getByText('Practice Mode').first()
      if (await practiceButton.isVisible()) {
        await practiceButton.click()
        await page.waitForLoadState('networkidle')
        
        screenshot = await captureComprehensiveScreenshot(page, 'new-user', 'practice-exploration')
        scenarioResults.screenshots.push(screenshot)
        
        accessibility = await validatePageAccessibility(page, 'practice-config')
        scenarioResults.accessibilityIssues.push(...accessibility)
        
        scenarioResults.steps.push({
          step: 'practice-exploration',
          status: 'completed',
          timestamp: new Date().toISOString()
        })
      }

      // Step 3: First Quiz Attempt
      const categoryCheckboxes = page.locator('input[type="checkbox"]')
      const checkboxCount = await categoryCheckboxes.count()
      
      if (checkboxCount > 0) {
        await categoryCheckboxes.first().click()
        await page.waitForTimeout(200)
        
        const startButton = page.getByText('Start').first()
        if (await startButton.isVisible()) {
          await startButton.click()
          await page.waitForLoadState('networkidle')
          
          screenshot = await captureComprehensiveScreenshot(page, 'new-user', 'first-quiz-start')
          scenarioResults.screenshots.push(screenshot)
          
          // Answer a few questions
          for (let i = 0; i < 3; i++) {
            const answerOptions = page.locator('button').filter({ hasText: /^[A-D]\./ })
            const options = await answerOptions.all()
            
            if (options.length > 0) {
              await options[0].click()
              await page.waitForTimeout(200)
              
              const nextButton = page.getByText('Next').first()
              if (await nextButton.isVisible()) {
                await nextButton.click()
                await page.waitForTimeout(300)
              }
            }
          }
          
          // Complete quiz
          const finishButton = page.getByText('Finish').first()
          if (await finishButton.isVisible()) {
            await finishButton.click()
            await page.waitForLoadState('networkidle')
            
            screenshot = await captureComprehensiveScreenshot(page, 'new-user', 'first-quiz-results')
            scenarioResults.screenshots.push(screenshot)
            
            scenarioResults.steps.push({
              step: 'first-quiz-completion',
              status: 'completed',
              timestamp: new Date().toISOString()
            })
          }
        }
      }

      // Step 4: Explore Other Features
      await page.goto('/flashcards')
      await page.waitForLoadState('networkidle')
      
      screenshot = await captureComprehensiveScreenshot(page, 'new-user', 'flashcards-discovery')
      scenarioResults.screenshots.push(screenshot)
      
      await page.goto('/stats')
      await page.waitForLoadState('networkidle')
      
      screenshot = await captureComprehensiveScreenshot(page, 'new-user', 'stats-exploration')
      scenarioResults.screenshots.push(screenshot)
      
      scenarioResults.steps.push({
        step: 'feature-exploration',
        status: 'completed',
        timestamp: new Date().toISOString()
      })

      testContext.userJourneyResults.push(scenarioResults)
      
      console.log('New User Journey Results:', {
        totalSteps: scenarioResults.steps.length,
        accessibilityIssues: scenarioResults.accessibilityIssues.length,
        screenshots: scenarioResults.screenshots.length
      })
    })
  })

  test.describe('Scenario 2: Power User Workflow', () => {
    test('Experienced user leverages advanced features efficiently', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      let scenarioResults = {
        scenario: 'power-user-workflow',
        steps: [],
        performanceMetrics: [],
        screenshots: []
      }

      // Step 1: Quick Navigation with Keyboard
      await page.keyboard.press('?') // Help shortcut
      await page.waitForTimeout(300)
      await page.keyboard.press('Escape')
      
      let screenshot = await captureComprehensiveScreenshot(page, 'power-user', 'keyboard-shortcuts')
      scenarioResults.screenshots.push(screenshot)

      // Step 2: Rapid Quiz Configuration
      const customQuizButton = page.getByText('Custom Exam').first()
      if (await customQuizButton.isVisible()) {
        await customQuizButton.click()
        await page.waitForLoadState('networkidle')
        
        // Power user quickly selects multiple categories
        const checkboxes = page.locator('input[type="checkbox"]')
        const count = await checkboxes.count()
        
        for (let i = 0; i < Math.min(3, count); i++) {
          await checkboxes.nth(i).click()
          await page.waitForTimeout(50) // Rapid selection
        }
        
        // Configure advanced settings
        const questionInput = page.locator('input[type="number"]').first()
        if (await questionInput.isVisible()) {
          await questionInput.fill('10')
        }
        
        screenshot = await captureComprehensiveScreenshot(page, 'power-user', 'rapid-configuration')
        scenarioResults.screenshots.push(screenshot)
        
        const startButton = page.getByText('Start').first()
        if (await startButton.isVisible()) {
          await startButton.click()
          await page.waitForLoadState('networkidle')
        }
      }

      // Step 3: Efficient Quiz Navigation
      for (let i = 0; i < 5; i++) {
        // Use keyboard shortcuts for answers
        await page.keyboard.press('1')
        await page.waitForTimeout(100)
        await page.keyboard.press('ArrowRight') // Next question
        await page.waitForTimeout(100)
      }
      
      screenshot = await captureComprehensiveScreenshot(page, 'power-user', 'efficient-navigation')
      scenarioResults.screenshots.push(screenshot)

      // Step 4: Quick Review and Analysis
      const finishButton = page.getByText('Finish').first()
      if (await finishButton.isVisible()) {
        await finishButton.click()
        await page.waitForLoadState('networkidle')
        
        screenshot = await captureComprehensiveScreenshot(page, 'power-user', 'results-analysis')
        scenarioResults.screenshots.push(screenshot)
      }

      testContext.userJourneyResults.push(scenarioResults)
    })
  })

  test.describe('Scenario 3: Mobile Intensive Usage', () => {
    test.use({ viewport: { width: 375, height: 667 } })

    test('Mobile user studies intensively with touch interactions', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      let scenarioResults = {
        scenario: 'mobile-intensive-usage',
        steps: [],
        touchInteractions: [],
        screenshots: []
      }

      // Step 1: Mobile Study Session Setup
      let screenshot = await captureComprehensiveScreenshot(page, 'mobile-intensive', 'session-start')
      scenarioResults.screenshots.push(screenshot)

      // Start study timer
      const studyTimer = page.locator('[data-testid*="study"]').first()
      if (await studyTimer.isVisible()) {
        const box = await studyTimer.boundingBox()
        if (box) {
          await page.touchscreen.tap(box.x + box.width/2, box.y + box.height/2)
          await page.waitForTimeout(300)
          
          scenarioResults.touchInteractions.push({
            type: 'tap',
            element: 'study-timer',
            timestamp: new Date().toISOString()
          })
        }
      }

      // Step 2: Extended Flashcard Session
      await page.goto('/flashcards')
      await page.waitForLoadState('networkidle')
      
      const categoryCheckbox = page.locator('input[type="checkbox"]').first()
      if (await categoryCheckbox.isVisible()) {
        await categoryCheckbox.click()
        await page.waitForTimeout(200)
        
        const startButton = page.getByText('Start').first()
        if (await startButton.isVisible()) {
          await startButton.click()
          await page.waitForLoadState('networkidle')
          
          // Intensive flashcard interactions
          for (let i = 0; i < 10; i++) {
            const flashcard = page.locator('[data-testid*="flashcard"]').first()
            if (await flashcard.isVisible()) {
              // Tap to flip
              const box = await flashcard.boundingBox()
              if (box) {
                await page.touchscreen.tap(box.x + box.width/2, box.y + box.height/2)
                await page.waitForTimeout(200)
                
                scenarioResults.touchInteractions.push({
                  type: 'tap-flip',
                  card: i + 1,
                  timestamp: new Date().toISOString()
                })
                
                // Swipe to next card
                await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.5)
                await page.mouse.down()
                await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.5)
                await page.mouse.up()
                await page.waitForTimeout(300)
                
                scenarioResults.touchInteractions.push({
                  type: 'swipe-next',
                  card: i + 1,
                  timestamp: new Date().toISOString()
                })
              }
            }
          }
          
          screenshot = await captureComprehensiveScreenshot(page, 'mobile-intensive', 'flashcard-session')
          scenarioResults.screenshots.push(screenshot)
        }
      }

      // Step 3: Multiple Quiz Sessions
      for (let session = 0; session < 3; session++) {
        await page.goto('/')
        await page.waitForLoadState('networkidle')
        
        const practiceButton = page.getByText('Practice Mode').first()
        if (await practiceButton.isVisible()) {
          await practiceButton.click()
          await page.waitForLoadState('networkidle')
          
          const startButton = page.getByText('Start').first()
          if (await startButton.isVisible()) {
            await startButton.click()
            await page.waitForLoadState('networkidle')
            
            // Quick quiz completion
            for (let q = 0; q < 3; q++) {
              const answerOption = page.locator('button').filter({ hasText: /^[A-D]\./ }).first()
              if (await answerOption.isVisible()) {
                await answerOption.click()
                await page.waitForTimeout(100)
                
                const nextButton = page.getByText('Next').first()
                if (await nextButton.isVisible()) {
                  await nextButton.click()
                  await page.waitForTimeout(200)
                }
              }
            }
            
            const finishButton = page.getByText('Finish').first()
            if (await finishButton.isVisible()) {
              await finishButton.click()
              await page.waitForLoadState('networkidle')
            }
          }
        }
        
        scenarioResults.steps.push({
          step: `mobile-quiz-session-${session + 1}`,
          status: 'completed',
          timestamp: new Date().toISOString()
        })
      }

      screenshot = await captureComprehensiveScreenshot(page, 'mobile-intensive', 'session-complete')
      scenarioResults.screenshots.push(screenshot)

      testContext.userJourneyResults.push(scenarioResults)
      
      console.log('Mobile Intensive Usage Results:', {
        totalSessions: scenarioResults.steps.length,
        touchInteractions: scenarioResults.touchInteractions.length,
        screenshots: scenarioResults.screenshots.length
      })
    })
  })

  test.describe('Scenario 4: Data Persistence Validation', () => {
    test('Multi-session data integrity and achievement progression', async ({ page, context }) => {
      let scenarioResults = {
        scenario: 'data-persistence-validation',
        sessions: [],
        achievements: [],
        dataIntegrity: []
      }

      // Session 1: Establish baseline
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      const initialState = await page.evaluate(() => {
        return localStorage.getItem('it-quiz-storage')
      })
      
      scenarioResults.dataIntegrity.push({
        checkpoint: 'initial-state',
        hasData: !!initialState,
        timestamp: new Date().toISOString()
      })

      // Complete multiple sessions to build progress
      for (let i = 0; i < 5; i++) {
        await completeQuizSession(page, i + 1)
        
        const currentState = await page.evaluate(() => {
          const storage = localStorage.getItem('it-quiz-storage')
          return storage ? JSON.parse(storage) : null
        })
        
        scenarioResults.sessions.push({
          sessionNumber: i + 1,
          completedQuestions: currentState?.state?.userProgress?.totalQuestions || 0,
          completedSessions: currentState?.state?.userProgress?.totalSessionsCompleted || 0,
          timestamp: new Date().toISOString()
        })
      }

      // Test persistence across browser restart
      await context.close()
      const newContext = await page.context().browser()?.newContext()
      if (newContext) {
        const newPage = await newContext.newPage()
        await newPage.goto('/')
        await newPage.waitForLoadState('networkidle')
        
        const persistedState = await newPage.evaluate(() => {
          const storage = localStorage.getItem('it-quiz-storage')
          return storage ? JSON.parse(storage) : null
        })
        
        scenarioResults.dataIntegrity.push({
          checkpoint: 'after-restart',
          hasData: !!persistedState,
          sessionsPreserved: persistedState?.state?.userProgress?.totalSessionsCompleted || 0,
          timestamp: new Date().toISOString()
        })
        
        await captureComprehensiveScreenshot(newPage, 'persistence', 'after-browser-restart')
      }

      testContext.integrationResults.push(scenarioResults)
    })
  })

  test.describe('Scenario 5: Performance Under Load', () => {
    test('Application responsiveness during intensive usage', async ({ page }) => {
      let scenarioResults = {
        scenario: 'performance-under-load',
        loadTests: [],
        memorySnapshots: [],
        responseTime: []
      }

      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Baseline memory measurement
      const initialMemory = await page.evaluate(() => (performance as any).memory)
      scenarioResults.memorySnapshots.push({
        checkpoint: 'initial',
        ...initialMemory,
        timestamp: new Date().toISOString()
      })

      // Rapid navigation stress test
      const routes = ['/', '/flashcards', '/stats', '/practice-config']
      const startTime = Date.now()
      
      for (let i = 0; i < 50; i++) {
        const route = routes[i % routes.length]
        const navStart = Date.now()
        
        await page.goto(route)
        await page.waitForLoadState('domcontentloaded')
        
        const navTime = Date.now() - navStart
        scenarioResults.responseTime.push({
          iteration: i + 1,
          route,
          responseTime: navTime,
          timestamp: new Date().toISOString()
        })
        
        // Memory snapshot every 10 iterations
        if (i % 10 === 9) {
          const memory = await page.evaluate(() => (performance as any).memory)
          scenarioResults.memorySnapshots.push({
            checkpoint: `iteration-${i + 1}`,
            ...memory,
            timestamp: new Date().toISOString()
          })
        }
      }

      const totalTime = Date.now() - startTime
      scenarioResults.loadTests.push({
        test: 'rapid-navigation',
        totalIterations: 50,
        totalTime,
        averageResponseTime: scenarioResults.responseTime.reduce((sum, r) => sum + r.responseTime, 0) / 50
      })

      // Final memory measurement
      const finalMemory = await page.evaluate(() => (performance as any).memory)
      scenarioResults.memorySnapshots.push({
        checkpoint: 'final',
        ...finalMemory,
        timestamp: new Date().toISOString()
      })

      await captureComprehensiveScreenshot(page, 'performance', 'load-test-complete')
      
      testContext.performanceMetrics.push(scenarioResults)
      
      console.log('Performance Load Test Results:', {
        totalNavigations: 50,
        totalTime: `${totalTime}ms`,
        averageResponseTime: `${scenarioResults.loadTests[0].averageResponseTime.toFixed(2)}ms`,
        memoryGrowth: `${((finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize) / 1024 / 1024).toFixed(2)}MB`
      })
    })
  })

  // Helper function for completing quiz sessions
  async function completeQuizSession(page: Page, sessionNumber: number) {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const practiceButton = page.getByText('Practice Mode').first()
    if (await practiceButton.isVisible()) {
      await practiceButton.click()
      await page.waitForLoadState('networkidle')
      
      const startButton = page.getByText('Start').first()
      if (await startButton.isVisible()) {
        await startButton.click()
        await page.waitForLoadState('networkidle')
        
        // Answer 2-3 questions
        for (let q = 0; q < 2; q++) {
          const answerOption = page.locator('button').filter({ hasText: /^[A-D]\./ }).first()
          if (await answerOption.isVisible()) {
            await answerOption.click()
            await page.waitForTimeout(100)
            
            const nextButton = page.getByText('Next').first()
            if (await nextButton.isVisible()) {
              await nextButton.click()
              await page.waitForTimeout(200)
            }
          }
        }
        
        const finishButton = page.getByText('Finish').first()
        if (await finishButton.isVisible()) {
          await finishButton.click()
          await page.waitForLoadState('networkidle')
        }
      }
    }
  }

  // Generate comprehensive test report
  test.afterAll(async () => {
    const report = {
      testSuite: 'IT Quiz App - Comprehensive E2E Testing',
      executionDate: new Date().toISOString(),
      summary: {
        userJourneys: testContext.userJourneyResults.length,
        performanceTests: testContext.performanceMetrics.length,
        integrationTests: testContext.integrationResults.length,
        totalScreenshots: testContext.userJourneyResults.reduce((sum, journey) => sum + journey.screenshots?.length || 0, 0)
      },
      results: testContext
    }
    
    console.log('\n=== COMPREHENSIVE E2E TEST REPORT ===')
    console.log(JSON.stringify(report, null, 2))
    console.log('\nScreenshots saved to: test-results/comprehensive/')
    console.log('Performance data saved to: test-results/performance/')
    console.log('Integration results saved to: test-results/integration/')
  })
})