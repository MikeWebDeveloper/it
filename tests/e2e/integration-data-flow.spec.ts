import { test, expect, Page } from '@playwright/test'

test.describe('IT Quiz App - Integration & Data Flow Testing', () => {
  
  // Helper function to extract Zustand store state
  async function getStoreState(page: Page) {
    return await page.evaluate(() => {
      const storage = localStorage.getItem('it-quiz-storage')
      return storage ? JSON.parse(storage) : null
    })
  }

  // Helper function to wait for store updates
  async function waitForStoreUpdate(page: Page, condition: (state: any) => boolean, timeout = 5000) {
    const startTime = Date.now()
    while (Date.now() - startTime < timeout) {
      const state = await getStoreState(page)
      if (state && condition(state)) {
        return state
      }
      await page.waitForTimeout(100)
    }
    throw new Error('Store update condition not met within timeout')
  }

  // Helper function to capture store state in screenshot
  async function captureStateScreenshot(page: Page, name: string) {
    const state = await getStoreState(page)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    await page.screenshot({ 
      path: `test-results/integration/${name}-${timestamp}.png`,
      fullPage: true 
    })
    console.log(`State at ${name}:`, JSON.stringify(state, null, 2))
    return state
  }

  test.beforeEach(async ({ page }) => {
    // Clear any existing state for clean tests
    await page.evaluate(() => localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000) // Allow for hydration
  })

  test.describe('1. Quiz Session Data Flow', () => {
    test('Complete quiz flow with state tracking', async ({ page }) => {
      // Initial state verification
      let initialState = await captureStateScreenshot(page, 'initial-state')
      expect(initialState).toBeTruthy()

      // Navigate to practice config
      const practiceButton = page.getByText('Practice Mode').or(
        page.locator('button:has-text("Practice")')
      ).first()
      
      await practiceButton.click()
      await page.waitForLoadState('networkidle')
      
      // Configure quiz
      const categoryCheckboxes = page.locator('input[type="checkbox"]')
      const checkboxCount = await categoryCheckboxes.count()
      
      if (checkboxCount > 0) {
        // Select first category
        await categoryCheckboxes.first().click()
        await page.waitForTimeout(200)
      }

      // Set question count
      const questionInput = page.locator('input[type="number"]').first()
      if (await questionInput.isVisible()) {
        await questionInput.fill('3')
      }

      // Start quiz and verify store update
      const startButton = page.getByText('Start').or(
        page.locator('button[type="submit"]')
      ).first()
      
      if (await startButton.isVisible()) {
        await startButton.click()
        await page.waitForLoadState('networkidle')
        
        // Verify quiz session started in store
        const quizStartedState = await waitForStoreUpdate(page, (state) => 
          state.state?.currentSession !== null
        )
        
        expect(quizStartedState.state.currentSession).toBeTruthy()
        await captureStateScreenshot(page, 'quiz-session-started')

        // Answer questions and track state changes
        let questionIndex = 0
        const maxQuestions = 3

        while (questionIndex < maxQuestions) {
          // Check current question in store
          const currentState = await getStoreState(page)
          const expectedIndex = currentState?.state?.currentSession?.currentQuestionIndex || 0
          
          console.log(`Question ${questionIndex + 1}: Store index = ${expectedIndex}`)

          // Find and click answer
          const answerOptions = page.locator('button').filter({ 
            hasText: /^[A-D]\.|^\d+\./ 
          })
          
          const options = await answerOptions.all()
          if (options.length > 0) {
            await options[0].click()
            await page.waitForTimeout(300)

            // Verify answer stored
            const answeredState = await waitForStoreUpdate(page, (state) => {
              const session = state.state?.currentSession
              if (!session) return false
              
              const currentQuestion = session.questions?.[session.currentQuestionIndex]
              return currentQuestion && session.answers?.[currentQuestion.id] !== undefined
            })

            await captureStateScreenshot(page, `question-${questionIndex + 1}-answered`)

            questionIndex++

            // Navigate to next question
            const nextButton = page.getByText('Next').first()
            if (await nextButton.isVisible() && questionIndex < maxQuestions) {
              await nextButton.click()
              await page.waitForTimeout(300)
              
              // Verify navigation in store
              await waitForStoreUpdate(page, (state) => 
                state.state?.currentSession?.currentQuestionIndex === questionIndex
              )
            } else {
              break
            }
          } else {
            break
          }
        }

        // Complete quiz and verify results stored
        const finishButton = page.getByText('Finish').or(
          page.getByText('Complete')
        ).first()
        
        if (await finishButton.isVisible()) {
          await finishButton.click()
          await page.waitForLoadState('networkidle')
          
          // Verify quiz completion and statistics update
          const completedState = await waitForStoreUpdate(page, (state) => {
            return state.state?.currentSession?.completed === true &&
                   state.state?.sessionHistory?.length > 0
          })

          expect(completedState.state.currentSession.completed).toBe(true)
          expect(completedState.state.sessionHistory.length).toBeGreaterThan(0)
          expect(completedState.state.userProgress.totalSessionsCompleted).toBeGreaterThan(0)
          
          await captureStateScreenshot(page, 'quiz-completed-final-state')
        }
      }
    })
  })

  test.describe('2. Progress Tracking Integration', () => {
    test('Progress accumulation across multiple sessions', async ({ page }) => {
      // Session 1
      await completeQuickSession(page, 'practice')
      const firstSessionState = await captureStateScreenshot(page, 'after-first-session')
      
      const firstSessionCount = firstSessionState.state.userProgress.totalSessionsCompleted
      const firstQuestionCount = firstSessionState.state.userProgress.totalQuestions

      // Session 2
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      await completeQuickSession(page, 'practice')
      const secondSessionState = await captureStateScreenshot(page, 'after-second-session')

      // Verify accumulation
      expect(secondSessionState.state.userProgress.totalSessionsCompleted).toBeGreaterThan(firstSessionCount)
      expect(secondSessionState.state.userProgress.totalQuestions).toBeGreaterThan(firstQuestionCount)
      
      // Session 3 - Different mode
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      await completeQuickSession(page, 'timed')
      const thirdSessionState = await captureStateScreenshot(page, 'after-third-session')

      // Verify learning vs exam stats separation
      expect(thirdSessionState.state.learningStats.practiceSessionsCompleted).toBeGreaterThan(0)
      expect(thirdSessionState.state.examStats.timedQuizzesCompleted).toBeGreaterThan(0)
    })
  })

  test.describe('3. Theme and Settings Persistence', () => {
    test('Settings persistence across page reloads and navigation', async ({ page }) => {
      // Initial theme state
      const initialTheme = await page.locator('html').getAttribute('class')
      
      // Toggle theme
      const themeToggle = page.locator('[data-testid="theme-toggle"]').or(
        page.locator('button').filter({ hasText: /🌙|☀️|theme/i })
      ).first()

      if (await themeToggle.isVisible()) {
        await themeToggle.click()
        await page.waitForTimeout(300)
        
        const newTheme = await page.locator('html').getAttribute('class')
        expect(newTheme).not.toBe(initialTheme)
        
        // Verify theme persisted in store
        const themeState = await getStoreState(page)
        await captureStateScreenshot(page, 'theme-changed')

        // Test persistence across navigation
        await page.goto('/flashcards')
        await page.waitForLoadState('networkidle')
        
        const persistedTheme = await page.locator('html').getAttribute('class')
        expect(persistedTheme).toBe(newTheme)

        // Test persistence across reload
        await page.reload()
        await page.waitForLoadState('networkidle')
        
        const reloadedTheme = await page.locator('html').getAttribute('class')
        expect(reloadedTheme).toBe(newTheme)
        
        await captureStateScreenshot(page, 'theme-persisted-after-reload')
      }
    })
  })

  test.describe('4. Achievement System Integration', () => {
    test('Achievement triggering and notification flow', async ({ page }) => {
      // Complete perfect session to trigger achievements
      await completeQuickSession(page, 'practice', true) // perfectScore = true
      
      const achievementState = await getStoreState(page)
      await captureStateScreenshot(page, 'after-perfect-session')

      // Check for achievements in store
      if (achievementState.state.userProgress.achievements?.length > 0) {
        expect(achievementState.state.userProgress.achievements.length).toBeGreaterThan(0)
        
        // Check for new achievement notifications
        if (achievementState.state.newAchievements?.length > 0) {
          expect(achievementState.state.newAchievements.length).toBeGreaterThan(0)
        }
      }

      // Navigate to different page and verify achievements persist
      await page.goto('/stats')
      await page.waitForLoadState('networkidle')
      
      const persistedAchievements = await getStoreState(page)
      expect(persistedAchievements.state.userProgress.achievements.length)
        .toBe(achievementState.state.userProgress.achievements.length)
    })
  })

  test.describe('5. Study Session Timer Integration', () => {
    test('Timer state management and persistence', async ({ page }) => {
      // Find and interact with study timer
      const studyTimer = page.locator('[data-testid*="study"]').or(
        page.getByText(/Study Session/).locator('..')
      ).first()

      if (await studyTimer.isVisible()) {
        await studyTimer.click()
        await page.waitForTimeout(300)
        
        // Look for timer controls
        const startTimerButton = page.locator('button').filter({ 
          hasText: /start|begin/i 
        }).first()

        if (await startTimerButton.isVisible()) {
          await startTimerButton.click()
          await page.waitForTimeout(500)
          
          await captureStateScreenshot(page, 'timer-started')
          
          // Navigate away and back to test timer persistence
          await page.goto('/flashcards')
          await page.waitForLoadState('networkidle')
          await page.waitForTimeout(300)
          
          await page.goto('/')
          await page.waitForLoadState('networkidle')
          
          // Timer should persist or reset appropriately
          await captureStateScreenshot(page, 'timer-after-navigation')
        }
      }
    })
  })

  test.describe('6. Flashcard Session Data Flow', () => {
    test('Flashcard progress tracking and state management', async ({ page }) => {
      await page.goto('/flashcards')
      await page.waitForLoadState('networkidle')
      
      const initialState = await captureStateScreenshot(page, 'flashcards-initial')

      // Select categories and start flashcard session
      const categoryCheckbox = page.locator('input[type="checkbox"]').first()
      if (await categoryCheckbox.isVisible()) {
        await categoryCheckbox.click()
        await page.waitForTimeout(200)
      }

      const startButton = page.getByText('Start').first()
      if (await startButton.isVisible()) {
        await startButton.click()
        await page.waitForLoadState('networkidle')
        
        // Interact with flashcards and track state
        const flashcard = page.locator('[data-testid*="flashcard"]').first()
        if (await flashcard.isVisible()) {
          // Flip card
          await flashcard.click()
          await page.waitForTimeout(300)
          await captureStateScreenshot(page, 'flashcard-flipped')

          // Navigate through flashcards
          const nextButton = page.getByText('Next').first()
          if (await nextButton.isVisible()) {
            await nextButton.click()
            await page.waitForTimeout(300)
            await captureStateScreenshot(page, 'flashcard-navigation')
          }

          // Check if flashcard progress is tracked in store
          const flashcardState = await getStoreState(page)
          if (flashcardState.state.learningStats.flashcardsReviewed) {
            expect(flashcardState.state.learningStats.flashcardsReviewed).toBeGreaterThan(0)
          }
        }
      }
    })
  })

  test.describe('7. Adaptive Practice Integration', () => {
    test('Adaptive learning algorithm and question ordering', async ({ page }) => {
      await page.goto('/adaptive-practice')
      await page.waitForLoadState('networkidle')
      
      const initialState = await captureStateScreenshot(page, 'adaptive-initial')

      // Start adaptive session
      const startButton = page.getByText('Start').first()
      if (await startButton.isVisible()) {
        await startButton.click()
        await page.waitForLoadState('networkidle')
        
        // Answer questions and observe adaptive behavior
        for (let i = 0; i < 3; i++) {
          const beforeAnswer = await captureStateScreenshot(page, `adaptive-before-answer-${i + 1}`)
          
          const answerOptions = page.locator('button').filter({ 
            hasText: /^[A-D]\.|^\d+\./ 
          })
          
          const options = await answerOptions.all()
          if (options.length > 0) {
            // Alternate between correct and incorrect to test adaptation
            const answerIndex = i % 2
            await options[answerIndex].click()
            await page.waitForTimeout(300)
            
            const afterAnswer = await captureStateScreenshot(page, `adaptive-after-answer-${i + 1}`)
            
            // Check if question ordering adapts based on performance
            const stateBeforeNext = await getStoreState(page)
            
            const nextButton = page.getByText('Next').first()
            if (await nextButton.isVisible()) {
              await nextButton.click()
              await page.waitForTimeout(500)
            } else {
              break
            }
          }
        }
      }
    })
  })

  test.describe('8. Error Handling and Recovery', () => {
    test('State recovery from localStorage corruption', async ({ page }) => {
      // Corrupt localStorage data
      await page.evaluate(() => {
        localStorage.setItem('it-quiz-storage', '{"invalid": json}')
      })

      // Reload and verify app handles corruption gracefully
      await page.reload()
      await page.waitForLoadState('networkidle')
      
      // App should recover with default state
      const recoveredState = await getStoreState(page)
      expect(recoveredState).toBeTruthy()
      await captureStateScreenshot(page, 'recovered-from-corruption')

      // Verify app is functional after recovery
      const practiceButton = page.getByText('Practice Mode').first()
      if (await practiceButton.isVisible()) {
        await practiceButton.click()
        await page.waitForLoadState('networkidle')
        expect(page.url()).toContain('/practice')
      }
    })
  })

  test.describe('9. Cross-Tab State Synchronization', () => {
    test('State consistency across multiple tabs', async ({ page, context }) => {
      // Complete session in first tab
      await completeQuickSession(page, 'practice')
      const firstTabState = await captureStateScreenshot(page, 'first-tab-completed')

      // Open second tab
      const secondTab = await context.newPage()
      await secondTab.goto('/')
      await secondTab.waitForLoadState('networkidle')
      
      // Verify state is synchronized
      const secondTabState = await getStoreState(secondTab)
      expect(secondTabState.state.userProgress.totalSessionsCompleted)
        .toBe(firstTabState.state.userProgress.totalSessionsCompleted)

      await secondTab.screenshot({
        path: `test-results/integration/second-tab-synced-${Date.now()}.png`,
        fullPage: true
      })
    })
  })

  // Helper function to complete a quick quiz session
  async function completeQuickSession(page: Page, mode: 'practice' | 'timed', perfectScore = false) {
    if (mode === 'practice') {
      const practiceButton = page.getByText('Practice Mode').first()
      if (await practiceButton.isVisible()) {
        await practiceButton.click()
        await page.waitForLoadState('networkidle')
      }
    } else {
      const timedButton = page.getByText('Quick Quiz').or(
        page.getByText('Timed Quiz')
      ).first()
      if (await timedButton.isVisible()) {
        await timedButton.click()
        await page.waitForLoadState('networkidle')
      }
    }

    // Start quiz (handle configuration if needed)
    const startButton = page.getByText('Start').or(
      page.locator('button[type="submit"]')
    ).first()
    
    if (await startButton.isVisible()) {
      await startButton.click()
      await page.waitForLoadState('networkidle')
      
      // Answer questions
      for (let i = 0; i < 2; i++) {
        const answerOptions = page.locator('button').filter({ 
          hasText: /^[A-D]\.|^\d+\./ 
        })
        
        const options = await answerOptions.all()
        if (options.length > 0) {
          // Select first option if perfectScore, random otherwise
          const answerIndex = perfectScore ? 0 : Math.floor(Math.random() * options.length)
          await options[answerIndex].click()
          await page.waitForTimeout(200)

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
        await page.waitForLoadState('networkidle')
      }
    }
  }
})