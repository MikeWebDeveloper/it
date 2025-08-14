import { test, expect, Page } from '@playwright/test'

test.describe('IT Quiz App - Performance & Accessibility E2E Testing', () => {
  
  // Performance metrics collection
  interface PerformanceMetrics {
    firstContentfulPaint: number
    largestContentfulPaint: number
    cumulativeLayoutShift: number
    firstInputDelay?: number
    totalBlockingTime: number
    memoryUsage?: any
  }

  // Helper function to collect performance metrics
  async function collectPerformanceMetrics(page: Page): Promise<PerformanceMetrics> {
    const metrics = await page.evaluate(() => {
      return new Promise<PerformanceMetrics>((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const paintEntries = performance.getEntriesByType('paint')
          const navigationEntries = performance.getEntriesByType('navigation')
          
          const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0
          const lcp = entries.find(entry => entry.entryType === 'largest-contentful-paint')?.startTime || 0
          
          // Calculate CLS from layout shift entries
          const layoutShifts = performance.getEntriesByType('layout-shift')
          const cls = layoutShifts.reduce((sum, entry: any) => {
            return entry.hadRecentInput ? sum : sum + entry.value
          }, 0)

          // Calculate TBT (simplified)
          const longTasks = performance.getEntriesByType('longtask')
          const tbt = longTasks.reduce((sum, task: any) => {
            return sum + Math.max(0, task.duration - 50)
          }, 0)

          resolve({
            firstContentfulPaint: fcp,
            largestContentfulPaint: lcp,
            cumulativeLayoutShift: cls,
            totalBlockingTime: tbt,
            memoryUsage: (performance as any).memory
          })
        })

        observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift', 'longtask'] })
        
        // Fallback timeout
        setTimeout(() => {
          const paintEntries = performance.getEntriesByType('paint')
          const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0
          
          resolve({
            firstContentfulPaint: fcp,
            largestContentfulPaint: 0,
            cumulativeLayoutShift: 0,
            totalBlockingTime: 0,
            memoryUsage: (performance as any).memory
          })
        }, 3000)
      })
    })

    return metrics
  }

  // Helper function to check accessibility
  async function checkAccessibility(page: Page) {
    // Check for proper ARIA labels
    const elementsNeedingLabels = await page.locator('button, input, select').all()
    const accessibilityIssues: string[] = []

    for (const element of elementsNeedingLabels) {
      const ariaLabel = await element.getAttribute('aria-label')
      const title = await element.getAttribute('title')
      const textContent = await element.textContent()
      
      if (!ariaLabel && !title && !textContent?.trim()) {
        accessibilityIssues.push('Element without accessible name found')
      }
    }

    // Check for proper heading hierarchy
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all()
    let lastLevel = 0
    
    for (const heading of headings) {
      const tagName = await heading.evaluate(el => el.tagName.toLowerCase())
      const currentLevel = parseInt(tagName.charAt(1))
      
      if (currentLevel > lastLevel + 1 && lastLevel !== 0) {
        accessibilityIssues.push(`Heading hierarchy skip detected: ${tagName} after h${lastLevel}`)
      }
      lastLevel = currentLevel
    }

    // Check for proper color contrast (basic check)
    const textElements = await page.locator('p, span, div, button, a').all()
    for (let i = 0; i < Math.min(10, textElements.length); i++) {
      const element = textElements[i]
      const styles = await element.evaluate(el => {
        const computed = window.getComputedStyle(el)
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          fontSize: computed.fontSize
        }
      })
      
      // Basic contrast check (simplified)
      if (styles.color === styles.backgroundColor) {
        accessibilityIssues.push('Potential color contrast issue detected')
      }
    }

    return accessibilityIssues
  }

  test.describe('1. Core Web Vitals Performance', () => {
    test('Homepage performance metrics', async ({ page }) => {
      // Navigate and measure
      const startTime = Date.now()
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      const loadTime = Date.now() - startTime

      const metrics = await collectPerformanceMetrics(page)
      
      console.log('Performance Metrics:', {
        pageLoadTime: loadTime,
        ...metrics
      })

      // Performance assertions
      expect(loadTime).toBeLessThan(5000) // Page should load within 5 seconds
      expect(metrics.firstContentfulPaint).toBeLessThan(2500) // FCP should be under 2.5s
      expect(metrics.cumulativeLayoutShift).toBeLessThan(0.1) // CLS should be minimal

      // Take performance screenshot
      await page.screenshot({
        path: `test-results/performance/homepage-performance-${Date.now()}.png`,
        fullPage: true
      })
    })

    test('Quiz page performance under load', async ({ page }) => {
      // Start quiz and measure performance during interaction
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      const practiceButton = page.getByText('Practice Mode').first()
      if (await practiceButton.isVisible()) {
        const navigationStart = Date.now()
        await practiceButton.click()
        await page.waitForLoadState('networkidle')
        const navigationTime = Date.now() - navigationStart

        expect(navigationTime).toBeLessThan(3000) // Navigation should be fast

        // Start quiz
        const startButton = page.getByText('Start').first()
        if (await startButton.isVisible()) {
          const quizStartTime = Date.now()
          await startButton.click()
          await page.waitForLoadState('networkidle')
          const quizStartDuration = Date.now() - quizStartTime

          expect(quizStartDuration).toBeLessThan(2000)

          // Measure performance during quiz interactions
          const metrics = await collectPerformanceMetrics(page)
          
          // Rapid interactions to test performance
          for (let i = 0; i < 5; i++) {
            const answerOption = page.locator('button').filter({ 
              hasText: /^[A-D]\.|^\d+\./ 
            }).first()
            
            if (await answerOption.isVisible()) {
              const interactionStart = Date.now()
              await answerOption.click()
              await page.waitForTimeout(100)
              const interactionTime = Date.now() - interactionStart
              
              expect(interactionTime).toBeLessThan(500) // Interactions should be responsive
            }
          }

          console.log('Quiz Performance Metrics:', metrics)
        }
      }
    })

    test('Memory usage monitoring during extended session', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Get initial memory usage
      const initialMemory = await page.evaluate(() => (performance as any).memory)
      
      // Simulate extended usage
      const actions = [
        () => page.goto('/'),
        () => page.goto('/flashcards'),
        () => page.goto('/stats'),
        () => page.goto('/practice-config')
      ]

      const memorySnapshots = [initialMemory]

      for (let i = 0; i < 10; i++) {
        const actionIndex = i % actions.length
        await actions[actionIndex]()
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(500)

        const currentMemory = await page.evaluate(() => (performance as any).memory)
        memorySnapshots.push(currentMemory)
      }

      // Analyze memory usage
      const finalMemory = memorySnapshots[memorySnapshots.length - 1]
      const memoryIncrease = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize

      console.log('Memory Usage Analysis:', {
        initial: initialMemory,
        final: finalMemory,
        increase: memoryIncrease,
        increasePercentage: (memoryIncrease / initialMemory.usedJSHeapSize) * 100
      })

      // Memory should not increase excessively (allow for 50% increase max)
      expect(memoryIncrease / initialMemory.usedJSHeapSize).toBeLessThan(0.5)
    })
  })

  test.describe('2. Accessibility Compliance', () => {
    test('WCAG compliance for main navigation', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      const accessibilityIssues = await checkAccessibility(page)
      
      // Check keyboard navigation
      await page.keyboard.press('Tab')
      const firstFocusable = await page.locator(':focus').first()
      expect(firstFocusable).toBeVisible()

      // Check ARIA roles and labels
      const buttons = await page.locator('button').all()
      for (const button of buttons.slice(0, 5)) { // Check first 5 buttons
        const ariaLabel = await button.getAttribute('aria-label')
        const textContent = await button.textContent()
        
        expect(ariaLabel || textContent).toBeTruthy()
      }

      // Check heading structure
      const h1Elements = await page.locator('h1').count()
      expect(h1Elements).toBeGreaterThanOrEqual(1)
      expect(h1Elements).toBeLessThanOrEqual(1) // Should have exactly one h1

      console.log('Accessibility Issues Found:', accessibilityIssues)
      expect(accessibilityIssues.length).toBeLessThan(5) // Allow minimal issues
    })

    test('Keyboard navigation throughout quiz flow', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Navigate to practice mode using keyboard
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      
      let currentFocus = await page.locator(':focus').textContent()
      console.log('Current focus:', currentFocus)

      // Find practice mode button and activate
      const practiceButton = page.getByText('Practice Mode').first()
      if (await practiceButton.isVisible()) {
        await practiceButton.focus()
        await page.keyboard.press('Enter')
        await page.waitForLoadState('networkidle')

        // Navigate quiz configuration with keyboard
        await page.keyboard.press('Tab')
        await page.keyboard.press('Tab')
        
        // Check if we can start quiz with keyboard
        const startButton = page.getByText('Start').first()
        if (await startButton.isVisible()) {
          await startButton.focus()
          await page.keyboard.press('Enter')
          await page.waitForLoadState('networkidle')

          // Test quiz navigation with keyboard
          const answerOptions = page.locator('button').filter({ 
            hasText: /^[A-D]\.|^\d+\./ 
          })
          
          const firstOption = answerOptions.first()
          if (await firstOption.isVisible()) {
            await firstOption.focus()
            await page.keyboard.press('Enter')
            await page.waitForTimeout(200)

            // Test arrow key navigation
            await page.keyboard.press('ArrowDown')
            await page.waitForTimeout(100)
            await page.keyboard.press('Enter')
          }
        }
      }

      // Take accessibility screenshot
      await page.screenshot({
        path: `test-results/accessibility/keyboard-navigation-${Date.now()}.png`,
        fullPage: true
      })
    })

    test('Screen reader compatibility', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Check for screen reader landmarks
      const landmarks = await page.locator('[role="main"], [role="navigation"], [role="banner"], main, nav, header').count()
      expect(landmarks).toBeGreaterThan(0)

      // Check for proper alt text on images
      const images = await page.locator('img').all()
      for (const img of images) {
        const altText = await img.getAttribute('alt')
        const ariaLabel = await img.getAttribute('aria-label')
        const role = await img.getAttribute('role')
        
        // Images should have alt text or be marked as decorative
        expect(altText !== null || role === 'presentation' || ariaLabel).toBeTruthy()
      }

      // Check for proper form labels
      const inputs = await page.locator('input, select, textarea').all()
      for (const input of inputs) {
        const id = await input.getAttribute('id')
        const ariaLabel = await input.getAttribute('aria-label')
        const ariaLabelledBy = await input.getAttribute('aria-labelledby')
        
        if (id) {
          const label = await page.locator(`label[for="${id}"]`).count()
          expect(label > 0 || ariaLabel || ariaLabelledBy).toBeTruthy()
        }
      }
    })

    test('Color contrast and visual accessibility', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Test both light and dark themes
      const themes = ['light', 'dark']
      
      for (const theme of themes) {
        // Switch theme
        const themeToggle = page.locator('[data-testid="theme-toggle"]').or(
          page.locator('button').filter({ hasText: /🌙|☀️|theme/i })
        ).first()

        if (await themeToggle.isVisible()) {
          await themeToggle.click()
          await page.waitForTimeout(300)
        }

        // Check focus indicators
        const focusableElements = await page.locator('button, input, select, a[href]').all()
        for (let i = 0; i < Math.min(3, focusableElements.length); i++) {
          const element = focusableElements[i]
          await element.focus()
          
          // Check if focus is visible
          const focusedElement = await page.locator(':focus').first()
          expect(focusedElement).toBeVisible()
        }

        // Take theme screenshot for manual review
        await page.screenshot({
          path: `test-results/accessibility/${theme}-theme-${Date.now()}.png`,
          fullPage: true
        })
      }
    })
  })

  test.describe('3. Mobile Performance and Touch Accessibility', () => {
    test.use({ viewport: { width: 375, height: 667 } })

    test('Mobile touch target accessibility', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Check touch target sizes (minimum 44x44px)
      const interactiveElements = await page.locator('button, input, select, a[href]').all()
      
      for (let i = 0; i < Math.min(10, interactiveElements.length); i++) {
        const element = interactiveElements[i]
        if (await element.isVisible()) {
          const box = await element.boundingBox()
          if (box) {
            expect(box.height).toBeGreaterThanOrEqual(44)
            expect(box.width).toBeGreaterThanOrEqual(44)
          }
        }
      }

      // Test touch interactions
      const practiceButton = page.getByText('Practice Mode').first()
      if (await practiceButton.isVisible()) {
        const box = await practiceButton.boundingBox()
        if (box) {
          await page.touchscreen.tap(box.x + box.width/2, box.y + box.height/2)
          await page.waitForLoadState('networkidle')
          
          // Verify navigation worked
          expect(page.url()).toContain('/practice')
        }
      }
    })

    test('Mobile performance metrics', async ({ page }) => {
      const startTime = Date.now()
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      const mobileLoadTime = Date.now() - startTime

      // Mobile should load reasonably fast even on slower connections
      expect(mobileLoadTime).toBeLessThan(7000) // Allow more time for mobile

      const metrics = await collectPerformanceMetrics(page)
      console.log('Mobile Performance Metrics:', metrics)

      // Test scroll performance
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight)
      })
      await page.waitForTimeout(100)
      
      await page.evaluate(() => {
        window.scrollTo(0, 0)
      })
      await page.waitForTimeout(100)

      // Take mobile performance screenshot
      await page.screenshot({
        path: `test-results/performance/mobile-performance-${Date.now()}.png`,
        fullPage: true
      })
    })
  })

  test.describe('4. Bundle Size and Resource Loading', () => {
    test('Resource loading optimization', async ({ page }) => {
      const resourceSizes: Array<{name: string, size: number, type: string}> = []
      
      page.on('response', async (response) => {
        if (response.url().includes('localhost:3001')) {
          const contentLength = response.headers()['content-length']
          const size = contentLength ? parseInt(contentLength) : 0
          
          resourceSizes.push({
            name: response.url(),
            size,
            type: response.request().resourceType()
          })
        }
      })

      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Analyze resource sizes
      const totalSize = resourceSizes.reduce((sum, resource) => sum + resource.size, 0)
      const jsSize = resourceSizes
        .filter(r => r.type === 'script')
        .reduce((sum, resource) => sum + resource.size, 0)
      const cssSize = resourceSizes
        .filter(r => r.type === 'stylesheet')
        .reduce((sum, resource) => sum + resource.size, 0)

      console.log('Resource Analysis:', {
        totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
        jsSize: `${(jsSize / 1024).toFixed(2)} KB`,
        cssSize: `${(cssSize / 1024).toFixed(2)} KB`,
        resourceCount: resourceSizes.length
      })

      // Basic size expectations
      expect(totalSize).toBeLessThan(5 * 1024 * 1024) // Under 5MB total
      expect(jsSize).toBeLessThan(2 * 1024 * 1024) // Under 2MB JS
    })
  })

  test.describe('5. Stress Testing', () => {
    test('Rapid user interactions stress test', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Rapid navigation stress test
      const navigationActions = [
        () => page.goto('/'),
        () => page.goto('/flashcards'),
        () => page.goto('/stats'),
        () => page.goto('/practice-config')
      ]

      const startTime = Date.now()
      
      for (let i = 0; i < 20; i++) {
        const actionIndex = i % navigationActions.length
        await navigationActions[actionIndex]()
        await page.waitForLoadState('domcontentloaded')
        
        // Don't wait for full networkidle to stress test
        await page.waitForTimeout(100)
      }

      const totalTime = Date.now() - startTime
      console.log(`Completed 20 rapid navigations in ${totalTime}ms`)
      
      // App should remain responsive
      expect(totalTime).toBeLessThan(30000) // Should complete within 30 seconds
      
      // Verify app is still functional
      await page.waitForLoadState('networkidle')
      const title = await page.locator('h1').first().textContent()
      expect(title).toBeTruthy()
    })

    test('Large dataset handling', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Navigate to stats page which may have large datasets
      await page.goto('/stats')
      await page.waitForLoadState('networkidle')

      const loadTime = await page.evaluate(() => {
        const startTime = performance.now()
        // Trigger any data loading/rendering
        window.scrollTo(0, document.body.scrollHeight)
        window.scrollTo(0, 0)
        return performance.now() - startTime
      })

      expect(loadTime).toBeLessThan(1000) // Should handle large data quickly
    })
  })

  // Generate comprehensive performance report
  test.afterAll(async () => {
    console.log('\n=== Performance & Accessibility Test Summary ===')
    console.log('Check test-results/performance/ for performance screenshots')
    console.log('Check test-results/accessibility/ for accessibility screenshots')
    console.log('Review console logs for detailed metrics')
  })
})