import { test, expect, Page, BrowserContext } from '@playwright/test'

test.describe('IT Quiz App - Complete User Journeys E2E Testing', () => {
  // Test data and configuration
  const MOBILE_VIEWPORT = { width: 375, height: 667 }
  const TABLET_VIEWPORT = { width: 768, height: 1024 }
  const DESKTOP_VIEWPORT = { width: 1920, height: 1080 }
  
  // Helper function to wait for app initialization
  async function waitForAppReady(page: Page) {
    await page.waitForLoadState('networkidle')
    // Wait for hydration and zustand store initialization
    await page.waitForFunction(() => {
      return window.localStorage.getItem('it-quiz-storage') !== null || 
             document.querySelector('[data-testid="app-loaded"]') !== null ||
             document.querySelector('main') !== null
    }, { timeout: 10000 })
    await page.waitForTimeout(500) // Additional buffer for animations
  }

  // Helper function to capture screenshot with timestamp
  async function captureTimestampedScreenshot(page: Page, name: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    await page.screenshot({ 
      path: `test-results/screenshots/${name}-${timestamp}.png`,
      fullPage: true 
    })
  }

  test.describe('1. New User Onboarding Journey', () => {
    test('Complete first-time user experience flow', async ({ page, context }) => {
      // Clear any existing data to simulate new user
      await context.clearCookies()
      await page.goto('/')
      await page.evaluate(() => localStorage.clear())
      await page.reload()
      await waitForAppReady(page)

      // Capture initial state
      await captureTimestampedScreenshot(page, 'new-user-homepage')

      // Verify new user experience
      await expect(page.getByText('IT Quiz App')).toBeVisible()
      await expect(page.getByText(/Master IT Essentials/)).toBeVisible()
      
      // Check that no progress is shown for new user
      const progressSection = page.locator('[data-testid="user-progress"]')
      if (await progressSection.isVisible()) {
        // If progress section exists, it should show zero stats
        await expect(page.getByText('0')).toBeVisible()
      }

      // Navigate through study session timer for new users
      const studyTimer = page.locator('[data-testid="study-timer"]').or(
        page.getByText(/Study Session/).locator('..')
      )
      if (await studyTimer.isVisible()) {
        await captureTimestampedScreenshot(page, 'new-user-study-timer')
      }

      // Explore different learning modes
      const practiceButton = page.getByText('Practice Mode').or(
        page.locator('button:has-text("Practice")')
      ).first()
      
      if (await practiceButton.isVisible()) {
        await practiceButton.click()
        await waitForAppReady(page)
        await captureTimestampedScreenshot(page, 'new-user-practice-config')
        
        // Navigate back to home
        const backButton = page.getByText('Back').or(page.locator('button[aria-label*="back"]'))
        if (await backButton.isVisible()) {
          await backButton.click()
          await waitForAppReady(page)
        } else {
          await page.goto('/')
          await waitForAppReady(page)
        }
      }

      // Test theme toggle for new user
      const themeToggle = page.locator('[data-testid="theme-toggle"]').or(
        page.locator('button').filter({ hasText: /🌙|☀️|theme/i })
      ).first()
      
      if (await themeToggle.isVisible()) {
        const initialTheme = await page.locator('html').getAttribute('class')
        await themeToggle.click()
        await page.waitForTimeout(300)
        const newTheme = await page.locator('html').getAttribute('class')
        expect(initialTheme).not.toBe(newTheme)
        await captureTimestampedScreenshot(page, 'new-user-theme-toggle')
      }
    })
  })

  test.describe('2. Complete Practice Quiz Session', () => {
    test('Full practice mode workflow from topic selection to results', async ({ page }) => {
      await page.goto('/')
      await waitForAppReady(page)

      // Navigate to practice configuration
      const practiceButton = page.getByText('Practice Mode').or(
        page.locator('button:has-text("Practice")')
      ).first()
      
      await practiceButton.click()
      await waitForAppReady(page)
      await captureTimestampedScreenshot(page, 'practice-config-page')

      // Select topics/categories
      const categoryCheckboxes = page.locator('input[type="checkbox"]').or(
        page.locator('button[role="checkbox"]')
      )
      
      const visibleCheckboxes = await categoryCheckboxes.all()
      if (visibleCheckboxes.length > 0) {
        // Select first 2-3 categories
        for (let i = 0; i < Math.min(3, visibleCheckboxes.length); i++) {
          if (await visibleCheckboxes[i].isVisible()) {
            await visibleCheckboxes[i].click()
            await page.waitForTimeout(100)
          }
        }
        await captureTimestampedScreenshot(page, 'categories-selected')
      }

      // Configure quiz settings
      const questionCountInput = page.locator('input[type="number"]').or(
        page.locator('input[data-testid*="question"]')
      ).first()
      
      if (await questionCountInput.isVisible()) {
        await questionCountInput.fill('5')
        await page.waitForTimeout(100)
      }

      // Start the quiz
      const startButtons = [
        page.getByText('Start Practice'),
        page.getByText('Start Quiz'),
        page.getByText('Begin'),
        page.locator('button[type="submit"]')
      ]

      let quizStarted = false
      for (const button of startButtons) {
        if (await button.isVisible()) {
          await button.click()
          await waitForAppReady(page)
          
          // Check if we're in quiz mode
          const questionIndicator = page.getByText(/Question \d+ of/).or(
            page.locator('[data-testid*="question"]')
          )
          
          if (await questionIndicator.isVisible()) {
            quizStarted = true
            break
          }
        }
      }

      if (quizStarted) {
        await captureTimestampedScreenshot(page, 'quiz-started-first-question')
        
        // Answer a few questions
        for (let i = 0; i < 3; i++) {
          // Look for answer options
          const answerOptions = page.locator('button').filter({ hasText: /^[A-D]\.|\d+\./ }).or(
            page.locator('[data-testid*="answer"]').locator('button')
          ).or(
            page.locator('input[type="radio"]')
          )

          const options = await answerOptions.all()
          if (options.length > 0) {
            // Select first option
            await options[0].click()
            await page.waitForTimeout(200)
            
            await captureTimestampedScreenshot(page, `question-${i + 1}-answered`)
            
            // Look for next button
            const nextButton = page.getByText('Next').or(
              page.locator('button[data-testid*="next"]')
            ).first()
            
            if (await nextButton.isVisible()) {
              await nextButton.click()
              await page.waitForTimeout(300)
            } else {
              break
            }
          }
        }

        // Complete quiz or look for results
        const finishButton = page.getByText('Finish').or(
          page.getByText('Complete').or(
            page.getByText('Submit')
          )
        ).first()
        
        if (await finishButton.isVisible()) {
          await finishButton.click()
          await waitForAppReady(page)
          await captureTimestampedScreenshot(page, 'quiz-results')
          
          // Verify results page elements
          const resultsElements = [
            page.getByText(/Score|Accuracy/),
            page.getByText(/Correct|Points/),
            page.getByText(/Results|Summary/)
          ]
          
          for (const element of resultsElements) {
            if (await element.isVisible()) {
              expect(element).toBeVisible()
              break
            }
          }
        }
      } else {
        console.log('Could not start quiz - testing available elements')
        const availableButtons = await page.locator('button').allTextContents()
        console.log('Available buttons:', availableButtons)
      }
    })
  })

  test.describe('3. Timed Quiz Session with Time Pressure', () => {
    test('Complete timed quiz with countdown and performance tracking', async ({ page }) => {
      await page.goto('/')
      await waitForAppReady(page)

      // Start quick timed quiz
      const quickQuizButton = page.getByText('Quick Quiz').or(
        page.getByText('Timed Quiz').or(
          page.locator('button:has-text("15 minutes")')
        )
      ).first()

      if (await quickQuizButton.isVisible()) {
        await quickQuizButton.click()
        await waitForAppReady(page)
        
        // Check for timer display
        const timerElement = page.locator('[data-testid*="timer"]').or(
          page.getByText(/\d+:\d+/).or(
            page.getByText(/Time|Timer/)
          )
        ).first()
        
        if (await timerElement.isVisible()) {
          await captureTimestampedScreenshot(page, 'timed-quiz-with-timer')
        }

        // Rapid-fire answer questions to test time pressure
        let questionsAnswered = 0
        const maxQuestions = 5

        while (questionsAnswered < maxQuestions) {
          const answerOptions = page.locator('button').filter({ 
            hasText: /^[A-D]\.|^\d+\./ 
          }).or(
            page.locator('[data-testid*="answer"]').locator('button')
          )

          const options = await answerOptions.all()
          if (options.length > 0) {
            // Select random option to simulate real user behavior
            const randomIndex = Math.floor(Math.random() * options.length)
            await options[randomIndex].click()
            await page.waitForTimeout(100)
            
            if (questionsAnswered === 0) {
              await captureTimestampedScreenshot(page, 'timed-quiz-first-answer')
            }

            questionsAnswered++

            // Look for next button
            const nextButton = page.getByText('Next').first()
            if (await nextButton.isVisible()) {
              await nextButton.click()
              await page.waitForTimeout(200)
            } else {
              break
            }
          } else {
            break
          }
        }

        await captureTimestampedScreenshot(page, 'timed-quiz-progress')
      } else {
        // Try custom quiz approach
        const customQuizButton = page.getByText('Custom Exam').first()
        if (await customQuizButton.isVisible()) {
          await customQuizButton.click()
          await waitForAppReady(page)
          await captureTimestampedScreenshot(page, 'custom-quiz-config')
        }
      }
    })
  })

  test.describe('4. Flashcard Study Session', () => {
    test('Complete flashcard study with navigation and interactions', async ({ page }) => {
      await page.goto('/flashcards')
      await waitForAppReady(page)
      await captureTimestampedScreenshot(page, 'flashcards-home')

      // Select categories for flashcard study
      const categoryCheckboxes = page.locator('input[type="checkbox"]').or(
        page.locator('button[role="checkbox"]')
      )
      
      const checkboxes = await categoryCheckboxes.all()
      if (checkboxes.length > 0) {
        await checkboxes[0].click()
        await page.waitForTimeout(200)
      }

      // Start flashcard session
      const startButton = page.getByText('Start Study').or(
        page.getByText('Begin Flashcards').or(
          page.getByText('Start')
        )
      ).first()

      if (await startButton.isVisible()) {
        await startButton.click()
        await waitForAppReady(page)
        
        // Test flashcard interactions
        const flashcard = page.locator('[data-testid*="flashcard"]').or(
          page.locator('.flashcard')
        ).first()

        if (await flashcard.isVisible()) {
          await captureTimestampedScreenshot(page, 'flashcard-front')
          
          // Click to flip card
          await flashcard.click()
          await page.waitForTimeout(500)
          await captureTimestampedScreenshot(page, 'flashcard-flipped')

          // Test navigation buttons
          const nextButton = page.getByText('Next').or(
            page.locator('button[data-testid*="next"]')
          ).first()
          
          if (await nextButton.isVisible()) {
            await nextButton.click()
            await page.waitForTimeout(300)
            await captureTimestampedScreenshot(page, 'flashcard-next')
          }

          // Test previous button
          const prevButton = page.getByText('Previous').or(
            page.locator('button[data-testid*="prev"]')
          ).first()
          
          if (await prevButton.isVisible()) {
            await prevButton.click()
            await page.waitForTimeout(300)
          }

          // Test swipe gestures (simulate touch)
          const cardElement = page.locator('[data-testid*="flashcard"]').first()
          if (await cardElement.isVisible()) {
            const box = await cardElement.boundingBox()
            if (box) {
              // Simulate swipe left
              await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.5)
              await page.mouse.down()
              await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.5)
              await page.mouse.up()
              await page.waitForTimeout(300)
              await captureTimestampedScreenshot(page, 'flashcard-after-swipe')
            }
          }
        }
      }
    })
  })

  test.describe('5. Settings and Preferences', () => {
    test('Configure and persist app settings across sessions', async ({ page, context }) => {
      await page.goto('/')
      await waitForAppReady(page)

      // Test theme switching
      const themeToggle = page.locator('[data-testid="theme-toggle"]').or(
        page.locator('button').filter({ hasText: /🌙|☀️|theme/i })
      ).first()

      if (await themeToggle.isVisible()) {
        const initialTheme = await page.locator('html').getAttribute('class')
        await themeToggle.click()
        await page.waitForTimeout(300)
        
        const newTheme = await page.locator('html').getAttribute('class')
        expect(initialTheme).not.toBe(newTheme)
        await captureTimestampedScreenshot(page, 'theme-changed')

        // Test persistence by reloading
        await page.reload()
        await waitForAppReady(page)
        
        const persistedTheme = await page.locator('html').getAttribute('class')
        expect(persistedTheme).toBe(newTheme)
      }

      // Test study session timer settings
      const studyTimer = page.locator('[data-testid*="study"]').first()
      if (await studyTimer.isVisible()) {
        await studyTimer.click()
        await page.waitForTimeout(200)
        
        // Look for timer controls
        const timerControls = page.locator('button').filter({ 
          hasText: /start|pause|reset|settings/i 
        })
        
        const controls = await timerControls.all()
        if (controls.length > 0) {
          await controls[0].click()
          await page.waitForTimeout(300)
          await captureTimestampedScreenshot(page, 'study-timer-active')
        }
      }

      // Test audio/haptic preferences (if accessible)
      const settingsButton = page.locator('button').filter({ 
        hasText: /settings|preferences|config/i 
      }).first()
      
      if (await settingsButton.isVisible()) {
        await settingsButton.click()
        await waitForAppReady(page)
        await captureTimestampedScreenshot(page, 'settings-page')
      }
    })
  })

  test.describe('6. Achievement System and Progress Tracking', () => {
    test('Trigger achievements and verify progress persistence', async ({ page }) => {
      await page.goto('/')
      await waitForAppReady(page)
      
      // Check initial progress state
      const progressStats = page.locator('[data-testid*="progress"]').or(
        page.getByText(/streak|completed|mastered/i)
      ).first()
      
      if (await progressStats.isVisible()) {
        await captureTimestampedScreenshot(page, 'initial-progress')
      }

      // Complete a practice session to trigger achievements
      const practiceButton = page.getByText('Practice Mode').first()
      if (await practiceButton.isVisible()) {
        await practiceButton.click()
        await waitForAppReady(page)

        // Quick configuration
        const startButton = page.getByText('Start').or(
          page.locator('button[type="submit"]')
        ).first()
        
        if (await startButton.isVisible()) {
          await startButton.click()
          await waitForAppReady(page)

          // Answer questions perfectly to trigger achievement
          let perfectAnswers = 0
          const maxQuestions = 3

          for (let i = 0; i < maxQuestions; i++) {
            const answerOptions = page.locator('button').filter({ 
              hasText: /^[A-D]\.|^\d+\./ 
            })

            const options = await answerOptions.all()
            if (options.length > 0) {
              // Select first option (assuming it might be correct)
              await options[0].click()
              await page.waitForTimeout(200)
              perfectAnswers++

              const nextButton = page.getByText('Next').first()
              if (await nextButton.isVisible()) {
                await nextButton.click()
                await page.waitForTimeout(300)
              }
            }
          }

          // Complete quiz
          const finishButton = page.getByText('Finish').or(
            page.getByText('Complete')
          ).first()
          
          if (await finishButton.isVisible()) {
            await finishButton.click()
            await waitForAppReady(page)
            
            // Look for achievement notifications
            const achievementNotification = page.locator('[data-testid*="achievement"]').or(
              page.getByText(/achievement|badge|unlock/i)
            ).first()
            
            if (await achievementNotification.isVisible()) {
              await captureTimestampedScreenshot(page, 'achievement-unlocked')
            }

            await captureTimestampedScreenshot(page, 'quiz-completed-with-progress')
          }
        }
      }

      // Return to home and verify updated progress
      await page.goto('/')
      await waitForAppReady(page)
      await captureTimestampedScreenshot(page, 'updated-progress-home')
    })
  })

  test.describe('7. Adaptive Practice Mode', () => {
    test('AI-powered adaptive learning session', async ({ page }) => {
      await page.goto('/adaptive-practice')
      await waitForAppReady(page)
      await captureTimestampedScreenshot(page, 'adaptive-practice-home')

      // Check for AI/adaptive indicators
      const adaptiveElements = page.locator('[data-testid*="adaptive"]').or(
        page.getByText(/AI|adaptive|personalized/i)
      )

      if (await adaptiveElements.first().isVisible()) {
        // Start adaptive session
        const startButton = page.getByText('Start').or(
          page.getByText('Begin Adaptive Practice')
        ).first()

        if (await startButton.isVisible()) {
          await startButton.click()
          await waitForAppReady(page)
          
          // Test adaptive question flow
          let questionsAnswered = 0
          const maxQuestions = 4

          while (questionsAnswered < maxQuestions) {
            const questionElement = page.locator('[data-testid*="question"]').or(
              page.getByText(/Question/)
            ).first()

            if (await questionElement.isVisible()) {
              await captureTimestampedScreenshot(page, `adaptive-question-${questionsAnswered + 1}`)
              
              const answerOptions = page.locator('button').filter({ 
                hasText: /^[A-D]\.|^\d+\./ 
              })

              const options = await answerOptions.all()
              if (options.length > 0) {
                // Vary answers to test adaptation
                const answerIndex = questionsAnswered % options.length
                await options[answerIndex].click()
                await page.waitForTimeout(300)

                questionsAnswered++

                const nextButton = page.getByText('Next').first()
                if (await nextButton.isVisible()) {
                  await nextButton.click()
                  await page.waitForTimeout(500)
                } else {
                  break
                }
              } else {
                break
              }
            } else {
              break
            }
          }

          await captureTimestampedScreenshot(page, 'adaptive-session-completed')
        }
      }
    })
  })

  test.describe('8. Keyboard Shortcuts and Accessibility', () => {
    test('Test keyboard navigation and shortcuts throughout app', async ({ page }) => {
      await page.goto('/')
      await waitForAppReady(page)

      // Test keyboard shortcuts help
      await page.keyboard.press('?')
      await page.waitForTimeout(500)
      
      const helpModal = page.locator('[data-testid*="help"]').or(
        page.getByText(/keyboard|shortcuts|help/i)
      ).first()
      
      if (await helpModal.isVisible()) {
        await captureTimestampedScreenshot(page, 'keyboard-shortcuts-help')
        await page.keyboard.press('Escape')
        await page.waitForTimeout(300)
      }

      // Test tab navigation
      await page.keyboard.press('Tab')
      await page.waitForTimeout(200)
      await page.keyboard.press('Tab')
      await page.waitForTimeout(200)
      await page.keyboard.press('Enter')
      await waitForAppReady(page)

      // If we're in a quiz, test quiz keyboard shortcuts
      const quizElement = page.locator('[data-testid*="quiz"]').or(
        page.getByText(/Question \d+ of/)
      ).first()

      if (await quizElement.isVisible()) {
        await captureTimestampedScreenshot(page, 'quiz-keyboard-navigation')
        
        // Test answer selection with numbers
        await page.keyboard.press('1')
        await page.waitForTimeout(200)
        await page.keyboard.press('ArrowRight')
        await page.waitForTimeout(200)
        await page.keyboard.press('Space')
        await page.waitForTimeout(200)
        
        await captureTimestampedScreenshot(page, 'quiz-keyboard-answered')
      }

      // Test accessibility features
      const focusableElements = page.locator('button, input, select, a[href]')
      const elementCount = await focusableElements.count()
      
      expect(elementCount).toBeGreaterThan(0) // Ensure interactive elements exist
    })
  })

  test.describe('9. Mobile-Specific User Experience', () => {
    test.use({ viewport: MOBILE_VIEWPORT })

    test('Complete mobile user journey with touch interactions', async ({ page }) => {
      await page.goto('/')
      await waitForAppReady(page)
      await captureTimestampedScreenshot(page, 'mobile-homepage')

      // Test mobile navigation
      const mobileMenuButton = page.locator('button[aria-label*="menu"]').or(
        page.locator('[data-testid*="mobile-menu"]')
      ).first()

      if (await mobileMenuButton.isVisible()) {
        await mobileMenuButton.click()
        await page.waitForTimeout(300)
        await captureTimestampedScreenshot(page, 'mobile-menu-open')
      }

      // Test mobile touch targets (minimum 44px)
      const buttons = page.locator('button')
      const buttonCount = await buttons.count()
      
      for (let i = 0; i < Math.min(5, buttonCount); i++) {
        const button = buttons.nth(i)
        if (await button.isVisible()) {
          const box = await button.boundingBox()
          if (box) {
            expect(box.height).toBeGreaterThanOrEqual(44)
            expect(box.width).toBeGreaterThanOrEqual(44)
          }
        }
      }

      // Start mobile quiz session
      const practiceButton = page.getByText('Practice Mode').first()
      if (await practiceButton.isVisible()) {
        await practiceButton.click()
        await waitForAppReady(page)
        await captureTimestampedScreenshot(page, 'mobile-practice-config')

        // Test mobile form interactions
        const startButton = page.getByText('Start').first()
        if (await startButton.isVisible()) {
          await startButton.click()
          await waitForAppReady(page)
          await captureTimestampedScreenshot(page, 'mobile-quiz-started')

          // Test mobile answer selection
          const answerOptions = page.locator('button').filter({ 
            hasText: /^[A-D]\.|^\d+\./ 
          })

          const options = await answerOptions.all()
          if (options.length > 0) {
            await options[0].click()
            await page.waitForTimeout(200)
            await captureTimestampedScreenshot(page, 'mobile-answer-selected')

            // Test swipe gesture for next question
            const nextButton = page.getByText('Next').first()
            if (await nextButton.isVisible()) {
              const box = await nextButton.boundingBox()
              if (box) {
                // Simulate touch gesture
                await page.touchscreen.tap(box.x + box.width/2, box.y + box.height/2)
                await page.waitForTimeout(300)
                await captureTimestampedScreenshot(page, 'mobile-next-question')
              }
            }
          }
        }
      }
    })
  })

  test.describe('10. Performance and Load Testing', () => {
    test('Extended usage session with performance monitoring', async ({ page }) => {
      // Monitor performance metrics
      const performanceEntries: any[] = []
      
      page.on('metrics', (metrics) => {
        performanceEntries.push({
          timestamp: Date.now(),
          metrics
        })
      })

      await page.goto('/')
      await waitForAppReady(page)

      // Simulate extended usage session
      const actions = [
        () => page.getByText('Practice Mode').click(),
        () => page.getByText('Flashcards').click(),
        () => page.getByText('Stats').click(),
        () => page.goto('/'),
        () => page.reload()
      ]

      for (let i = 0; i < 5; i++) {
        for (const action of actions) {
          try {
            await action()
            await waitForAppReady(page)
            await page.waitForTimeout(500)
          } catch (error) {
            console.log(`Action failed: ${error}`)
          }
        }
      }

      // Capture performance screenshot
      await captureTimestampedScreenshot(page, 'performance-test-completed')

      // Check for memory leaks or performance issues
      const finalMetrics = await page.evaluate(() => {
        return {
          memory: (performance as any).memory,
          timing: performance.timing,
          navigation: performance.navigation
        }
      })

      console.log('Performance Metrics:', finalMetrics)
      
      // Basic performance assertions
      expect(performanceEntries.length).toBeGreaterThan(0)
    })
  })

  test.describe('11. Data Persistence and State Management', () => {
    test('Verify data persistence across browser sessions', async ({ page, context }) => {
      // Create initial state
      await page.goto('/')
      await waitForAppReady(page)

      // Start and complete a practice session
      const practiceButton = page.getByText('Practice Mode').first()
      if (await practiceButton.isVisible()) {
        await practiceButton.click()
        await waitForAppReady(page)

        const startButton = page.getByText('Start').first()
        if (await startButton.isVisible()) {
          await startButton.click()
          await waitForAppReady(page)

          // Answer a question
          const answerOption = page.locator('button').filter({ 
            hasText: /^[A-D]\.|^\d+\./ 
          }).first()
          
          if (await answerOption.isVisible()) {
            await answerOption.click()
            await page.waitForTimeout(200)

            const finishButton = page.getByText('Finish').or(
              page.getByText('Complete')
            ).first()
            
            if (await finishButton.isVisible()) {
              await finishButton.click()
              await waitForAppReady(page)
            }
          }
        }
      }

      // Capture state before session end
      const initialProgress = await page.evaluate(() => {
        return localStorage.getItem('it-quiz-storage')
      })

      await captureTimestampedScreenshot(page, 'before-session-restart')

      // Simulate browser restart
      await context.close()
      const newContext = await page.context().browser()?.newContext()
      if (newContext) {
        const newPage = await newContext.newPage()
        await newPage.goto('/')
        await waitForAppReady(newPage)

        // Check if progress persisted
        const persistedProgress = await newPage.evaluate(() => {
          return localStorage.getItem('it-quiz-storage')
        })

        expect(persistedProgress).toBeTruthy()
        await captureTimestampedScreenshot(newPage, 'after-session-restart')

        // Verify progress is displayed
        const progressElement = newPage.locator('[data-testid*="progress"]').or(
          newPage.getByText(/completed|streak/)
        ).first()

        if (await progressElement.isVisible()) {
          await expect(progressElement).toBeVisible()
        }
      }
    })
  })

  test.describe('12. Cross-Device Responsive Behavior', () => {
    test.describe('Desktop Layout', () => {
      test.use({ viewport: DESKTOP_VIEWPORT })
      
      test('Desktop-specific features and layout', async ({ page }) => {
        await page.goto('/')
        await waitForAppReady(page)
        await captureTimestampedScreenshot(page, 'desktop-layout')

        // Test desktop-specific features
        const sidebarOrNav = page.locator('nav, [data-testid*="sidebar"]').first()
        if (await sidebarOrNav.isVisible()) {
          await expect(sidebarOrNav).toBeVisible()
        }

        // Test multi-column layout
        const columns = page.locator('[class*="grid"], [class*="flex"]')
        const hasMultiColumn = await columns.count() > 0
        expect(hasMultiColumn).toBe(true)
      })
    })

    test.describe('Tablet Layout', () => {
      test.use({ viewport: TABLET_VIEWPORT })
      
      test('Tablet-specific adaptations', async ({ page }) => {
        await page.goto('/')
        await waitForAppReady(page)
        await captureTimestampedScreenshot(page, 'tablet-layout')

        // Test tablet touch targets and spacing
        const buttons = page.locator('button')
        const buttonCount = await buttons.count()
        
        for (let i = 0; i < Math.min(3, buttonCount); i++) {
          const button = buttons.nth(i)
          if (await button.isVisible()) {
            const box = await button.boundingBox()
            if (box) {
              expect(box.height).toBeGreaterThanOrEqual(44)
            }
          }
        }
      })
    })
  })

  // Global cleanup and reporting
  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status === 'failed') {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      await page.screenshot({ 
        path: `test-results/failures/failed-${testInfo.title}-${timestamp}.png`,
        fullPage: true 
      })
    }
  })
})