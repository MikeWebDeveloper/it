'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { QuizSession, QuizMode, Question, QuizStatistics, UserProgress, LearningStatistics, ExamStatistics, Achievement } from '@/types/quiz'
import { generateId } from '@/lib/utils'
import { checkAchievements } from '@/lib/achievements'

interface AudioHapticPreferences {
  soundEnabled: boolean
  soundVolume: number
  hapticsEnabled: boolean
  hapticsIntensity: number
}

interface StudySessionSettings {
  sessionTimerEnabled: boolean
  defaultSessionDuration: number // in minutes
  breakReminderInterval: number // in minutes
  breakDuration: number // in minutes
  autoBreakEnabled: boolean
  soundNotifications: boolean
  longBreakInterval: number // after how many short breaks
  longBreakDuration: number // in minutes
}

interface QuizState {
  // Current session state
  currentSession: QuizSession | null
  
  // Question data
  allQuestions: Question[]
  
  // Progress and statistics
  userProgress: UserProgress
  sessionHistory: QuizStatistics[]
  learningStats: LearningStatistics
  examStats: ExamStatistics
  
  // Achievement system
  newAchievements: Achievement[]
  perfectStreakCount: number
  
  // UI state
  isDarkMode: boolean
  
  // Audio & Haptic preferences
  audioHapticPreferences: AudioHapticPreferences
  
  // Study Session Settings
  studySessionSettings: StudySessionSettings
  
  // Actions
  startQuiz: (mode: QuizMode, questions: Question[], timeLimit?: number) => void
  answerQuestion: (questionId: number, answer: string | string[]) => void
  nextQuestion: () => void
  previousQuestion: () => void
  goToQuestion: (index: number) => void
  completeQuiz: () => void
  
  // Settings
  toggleDarkMode: () => void
  updateAudioHapticPreferences: (preferences: Partial<AudioHapticPreferences>) => void
  updateStudySessionSettings: (settings: Partial<StudySessionSettings>) => void
  
  // Data management
  setQuestions: (questions: Question[]) => void
  
  // Achievement actions
  clearNewAchievements: () => void
  
  // Manual save function for auto-save integration
  saveProgress: () => Promise<void>
  
  // Reset
  resetSession: () => void
}

const initialUserProgress: UserProgress = {
  totalSessionsCompleted: 0,
  totalQuestions: 0,
  totalCorrect: 0,
  streak: 0,
  longestStreak: 0,
  lastSessionDate: '',
  topicProgress: {},
  achievements: []
}

const initialLearningStats: LearningStatistics = {
  totalLearningTime: 0,
  totalQuestionsStudied: 0,
  totalCorrectInLearning: 0,
  flashcardsReviewed: 0,
  practiceSessionsCompleted: 0,
  reviewSessionsCompleted: 0,
  dailyLearningStreak: 0,
  averageAccuracyInPractice: 0,
  topicLearningProgress: {},
  weeklyLearningGoal: 300, // 5 hours per week
  weeklyProgress: 0,
  learningHistory: []
}

const initialExamStats: ExamStatistics = {
  totalExamsCompleted: 0,
  totalExamQuestions: 0,
  totalCorrectInExams: 0,
  averageExamAccuracy: 0,
  averageExamTime: 0,
  bestExamScore: 0,
  worstExamScore: 100,
  examStreak: 0,
  timedQuizzesCompleted: 0,
  customExamsCompleted: 0,
  topicExamPerformance: {},
  monthlyExamGoal: 10,
  monthlyProgress: 0,
  examHistory: []
}

const initialAudioHapticPreferences: AudioHapticPreferences = {
  soundEnabled: true,
  soundVolume: 0.7,
  hapticsEnabled: true,
  hapticsIntensity: 0.8
}

const initialStudySessionSettings: StudySessionSettings = {
  sessionTimerEnabled: true,
  defaultSessionDuration: 25, // 25-minute Pomodoro sessions
  breakReminderInterval: 25, // Remind for breaks every 25 minutes
  breakDuration: 5, // 5-minute short breaks
  autoBreakEnabled: false, // Don't force breaks
  soundNotifications: true,
  longBreakInterval: 4, // Long break after 4 short breaks
  longBreakDuration: 15 // 15-minute long breaks
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set) => ({
      // Initial state
      currentSession: null,
      allQuestions: [],
      userProgress: initialUserProgress,
      sessionHistory: [],
      learningStats: initialLearningStats,
      examStats: initialExamStats,
      newAchievements: [],
      perfectStreakCount: 0,
      isDarkMode: true, // Default to dark mode for better mobile learning
      audioHapticPreferences: initialAudioHapticPreferences,
      studySessionSettings: initialStudySessionSettings,
      
      // Start a new quiz session
      startQuiz: (mode: QuizMode, questions: Question[], timeLimit?: number) => {
        const sessionId = generateId()
        const newSession: QuizSession = {
          id: sessionId,
          mode,
          questions,
          currentQuestionIndex: 0,
          answers: {},
          startTime: Date.now(),
          timeRemaining: timeLimit,
          completed: false
        }
        
        set({ currentSession: newSession })
      },
      
      // Answer the current question
      answerQuestion: (questionId: number, answer: string | string[]) => {
        set((state) => {
          if (!state.currentSession) return state
          
          return {
            currentSession: {
              ...state.currentSession,
              answers: {
                ...state.currentSession.answers,
                [questionId]: answer
              }
            }
          }
        })
      },
      
      // Navigate to next question
      nextQuestion: () => {
        set((state) => {
          if (!state.currentSession) return state
          
          const nextIndex = state.currentSession.currentQuestionIndex + 1
          if (nextIndex >= state.currentSession.questions.length) {
            // Auto-complete if we've reached the end
            return state
          }
          
          return {
            currentSession: {
              ...state.currentSession,
              currentQuestionIndex: nextIndex
            }
          }
        })
      },
      
      // Navigate to previous question
      previousQuestion: () => {
        set((state) => {
          if (!state.currentSession) return state
          
          const prevIndex = Math.max(0, state.currentSession.currentQuestionIndex - 1)
          
          return {
            currentSession: {
              ...state.currentSession,
              currentQuestionIndex: prevIndex
            }
          }
        })
      },
      
      // Navigate to specific question
      goToQuestion: (index: number) => {
        set((state) => {
          if (!state.currentSession) return state
          
          const clampedIndex = Math.max(0, Math.min(index, state.currentSession.questions.length - 1))
          
          return {
            currentSession: {
              ...state.currentSession,
              currentQuestionIndex: clampedIndex
            }
          }
        })
      },
      
      // Complete the current quiz
      completeQuiz: () => {
        set((state) => {
          if (!state.currentSession) return state
          
          const session = state.currentSession
          const timeSpent = Date.now() - session.startTime
          
          // Calculate score
          let correctAnswers = 0
          session.questions.forEach((question) => {
            const userAnswer = session.answers[question.id]
            if (userAnswer !== undefined && userAnswer !== null) {
              // Handle both single and multiple correct answers
              if (Array.isArray(question.correctAnswer)) {
                // Multiple choice - compare arrays of indices
                if (Array.isArray(userAnswer)) {
                  const correctIndices = question.correctAnswer as number[]
                  // Convert user answers to indices for comparison
                  const userIndices = userAnswer.map(ans => question.options.indexOf(ans))
                  if (userIndices.length === correctIndices.length &&
                      userIndices.every(idx => idx !== -1 && correctIndices.includes(idx))) {
                    correctAnswers++
                  }
                }
              } else {
                // Single choice - compare indices
                // Convert user answer to index for comparison
                const userIndex = question.options.indexOf(String(userAnswer))
                if (userIndex !== -1 && userIndex === question.correctAnswer) {
                  correctAnswers++
                }
              }
            }
          })
          
          const accuracy = (correctAnswers / session.questions.length) * 100
          
          // Create quiz statistics
          const stats: QuizStatistics = {
            sessionId: session.id,
            mode: session.mode,
            totalQuestions: session.questions.length,
            correctAnswers,
            incorrectAnswers: session.questions.length - correctAnswers,
            accuracy,
            timeSpent,
            completedAt: new Date().toISOString(),
            topicBreakdown: calculateTopicBreakdown(session.questions, session.answers)
          }
          
          // Update user progress
          const updatedProgress = updateUserProgress(state.userProgress, stats)
          
          // Update learning or exam statistics
          const isLearningMode = session.mode === 'practice' || session.mode === 'review'
          const updatedLearningStats = isLearningMode 
            ? updateLearningStatistics(state.learningStats, session, stats)
            : state.learningStats
          
          const updatedExamStats = !isLearningMode
            ? updateExamStatistics(state.examStats, session, stats)
            : state.examStats

          // Check for new achievements
          const isPerfectScore = accuracy === 100
          const newPerfectStreak = isPerfectScore ? state.perfectStreakCount + 1 : 0
          
          const newAchievements = checkAchievements(
            updatedProgress,
            stats,
            newPerfectStreak
          )

          // Add new achievements to user progress
          const finalProgress = {
            ...updatedProgress,
            achievements: [...updatedProgress.achievements, ...newAchievements]
          }
          
          return {
            currentSession: {
              ...session,
              completed: true,
              score: accuracy
            },
            sessionHistory: [...state.sessionHistory, stats],
            userProgress: finalProgress,
            learningStats: updatedLearningStats,
            examStats: updatedExamStats,
            newAchievements: [...state.newAchievements, ...newAchievements],
            perfectStreakCount: newPerfectStreak
          }
        })
      },
      
      // Toggle dark mode
      toggleDarkMode: () => {
        set((state) => ({ isDarkMode: !state.isDarkMode }))
      },
      
      // Update audio and haptic preferences
      updateAudioHapticPreferences: (preferences: Partial<AudioHapticPreferences>) => {
        set((state) => ({
          audioHapticPreferences: {
            ...state.audioHapticPreferences,
            ...preferences
          }
        }))
      },
      
      // Update study session settings
      updateStudySessionSettings: (settings: Partial<StudySessionSettings>) => {
        set((state) => ({
          studySessionSettings: {
            ...state.studySessionSettings,
            ...settings
          }
        }))
      },
      
      // Set all questions
      setQuestions: (questions: Question[]) => {
        set({ allQuestions: questions })
      },
      
      // Clear new achievements (after showing notifications)
      clearNewAchievements: () => {
        set({ newAchievements: [] })
      },
      
      // Manual save function for auto-save integration
      saveProgress: async () => {
        // Since we're using persist middleware, the state is automatically saved
        // This function exists for the auto-save hook to call and can be extended
        // with additional save logic if needed (e.g., cloud sync)
        return new Promise<void>((resolve, reject) => {
          try {
            // Small delay to simulate save operation
            setTimeout(() => {
              // In the future, this could sync to a cloud service
              resolve()
            }, 100)
          } catch (error) {
            reject(error)
          }
        })
      },
      
      // Reset current session
      resetSession: () => {
        set({ currentSession: null })
      }
    }),
    {
      name: 'it-quiz-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        userProgress: state.userProgress,
        sessionHistory: state.sessionHistory,
        learningStats: state.learningStats,
        examStats: state.examStats,
        perfectStreakCount: state.perfectStreakCount,
        isDarkMode: state.isDarkMode,
        audioHapticPreferences: state.audioHapticPreferences,
        studySessionSettings: state.studySessionSettings,
        allQuestions: state.allQuestions
      }),
      version: 1
    }
  )
)

// Helper functions
function calculateTopicBreakdown(questions: Question[], answers: Record<number, string | string[]>) {
  const breakdown: Record<string, { total: number; correct: number; accuracy: number }> = {}
  
  questions.forEach((question) => {
    const topic = question.topic
    if (!breakdown[topic]) {
      breakdown[topic] = { total: 0, correct: 0, accuracy: 0 }
    }
    
    breakdown[topic].total++
    
    const userAnswer = answers[question.id]
    if (userAnswer) {
      // Check if answer is correct
      let isCorrect = false
      if (Array.isArray(question.correctAnswer)) {
        // Multiple choice - compare arrays of indices
        if (Array.isArray(userAnswer)) {
          const correctIndices = question.correctAnswer as number[]
          const userIndices = userAnswer.map(ans => parseInt(String(ans)))
          if (userIndices.length === correctIndices.length &&
              userIndices.every(idx => correctIndices.includes(idx))) {
            isCorrect = true
          }
        }
      } else {
        // Single choice - compare indices
        if (parseInt(String(userAnswer)) === (question.correctAnswer as number)) {
          isCorrect = true
        }
      }
      
      if (isCorrect) {
        breakdown[topic].correct++
      }
    }
  })
  
  // Calculate accuracy for each topic
  Object.keys(breakdown).forEach(topic => {
    const data = breakdown[topic]
    data.accuracy = data.total > 0 ? (data.correct / data.total) * 100 : 0
  })
  
  return breakdown
}

function updateUserProgress(currentProgress: UserProgress, stats: QuizStatistics): UserProgress {
  const today = new Date().toISOString().split('T')[0]
  const lastSessionDate = currentProgress.lastSessionDate
  
  // Calculate streak
  let newStreak = currentProgress.streak
  if (lastSessionDate) {
    const lastDate = new Date(lastSessionDate)
    const todayDate = new Date(today)
    const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysDiff === 1) {
      newStreak++ // Consecutive day
    } else if (daysDiff > 1) {
      newStreak = 1 // Reset streak but count today
    }
    // If daysDiff === 0, it's the same day, don't change streak
  } else {
    newStreak = 1 // First session
  }
  
  // Update topic progress
  const updatedTopicProgress = { ...currentProgress.topicProgress }
  Object.entries(stats.topicBreakdown).forEach(([topic, breakdown]) => {
    if (!updatedTopicProgress[topic]) {
      updatedTopicProgress[topic] = {
        questionsAnswered: 0,
        correctAnswers: 0,
        masteryLevel: 'beginner'
      }
    }
    
    const topicData = updatedTopicProgress[topic]
    topicData.questionsAnswered += breakdown.total
    topicData.correctAnswers += breakdown.correct
    
    // Update mastery level based on accuracy and experience
    const accuracy = (topicData.correctAnswers / topicData.questionsAnswered) * 100
    if (accuracy >= 90 && topicData.questionsAnswered >= 20) {
      topicData.masteryLevel = 'advanced'
    } else if (accuracy >= 75 && topicData.questionsAnswered >= 10) {
      topicData.masteryLevel = 'intermediate'
    } else {
      topicData.masteryLevel = 'beginner'
    }
  })
  
  return {
    ...currentProgress,
    totalSessionsCompleted: currentProgress.totalSessionsCompleted + 1,
    totalQuestions: currentProgress.totalQuestions + stats.totalQuestions,
    totalCorrect: currentProgress.totalCorrect + stats.correctAnswers,
    streak: newStreak,
    longestStreak: Math.max(currentProgress.longestStreak, newStreak),
    lastSessionDate: today,
    topicProgress: updatedTopicProgress
  }
}

function updateLearningStatistics(
  currentStats: LearningStatistics, 
  session: QuizSession, 
  stats: QuizStatistics
): LearningStatistics {
  const today = new Date().toISOString().split('T')[0]
  const timeSpentMinutes = Math.round(stats.timeSpent / 60000) // Convert to minutes
  
  // Create learning session
  const learningSession = {
    id: session.id,
    mode: session.mode as 'practice' | 'review',
    questionsStudied: stats.totalQuestions,
    correctAnswers: stats.correctAnswers,
    timeSpent: timeSpentMinutes,
    topicsStudied: Object.keys(stats.topicBreakdown),
    date: today,
    completedAt: stats.completedAt
  }
  
  // Update topic learning progress
  const updatedTopicProgress = { ...currentStats.topicLearningProgress }
  Object.entries(stats.topicBreakdown).forEach(([topic, breakdown]) => {
    if (!updatedTopicProgress[topic]) {
      updatedTopicProgress[topic] = {
        timeSpent: 0,
        questionsStudied: 0,
        correctAnswers: 0,
        lastStudied: today,
        masteryLevel: 'beginner'
      }
    }
    
    const topicData = updatedTopicProgress[topic]
    topicData.timeSpent += timeSpentMinutes
    topicData.questionsStudied += breakdown.total
    topicData.correctAnswers += breakdown.correct
    topicData.lastStudied = today
    
    // Update mastery level
    const accuracy = (topicData.correctAnswers / topicData.questionsStudied) * 100
    if (accuracy >= 90 && topicData.questionsStudied >= 20) {
      topicData.masteryLevel = 'advanced'
    } else if (accuracy >= 75 && topicData.questionsStudied >= 10) {
      topicData.masteryLevel = 'intermediate'
    } else {
      topicData.masteryLevel = 'beginner'
    }
  })
  
  return {
    ...currentStats,
    totalLearningTime: currentStats.totalLearningTime + timeSpentMinutes,
    totalQuestionsStudied: currentStats.totalQuestionsStudied + stats.totalQuestions,
    totalCorrectInLearning: currentStats.totalCorrectInLearning + stats.correctAnswers,
    practiceSessionsCompleted: currentStats.practiceSessionsCompleted + (session.mode === 'practice' ? 1 : 0),
    reviewSessionsCompleted: currentStats.reviewSessionsCompleted + (session.mode === 'review' ? 1 : 0),
    averageAccuracyInPractice: currentStats.totalQuestionsStudied > 0 
      ? ((currentStats.totalCorrectInLearning + stats.correctAnswers) / (currentStats.totalQuestionsStudied + stats.totalQuestions)) * 100
      : stats.accuracy,
    topicLearningProgress: updatedTopicProgress,
    learningHistory: [...currentStats.learningHistory, learningSession].slice(-50) // Keep last 50 sessions
  }
}

function updateExamStatistics(
  currentStats: ExamStatistics,
  session: QuizSession,
  stats: QuizStatistics
): ExamStatistics {
  const today = new Date().toISOString().split('T')[0]
  const timeSpentMinutes = Math.round(stats.timeSpent / 60000)
  
  // Create exam session
  const examSession = {
    id: session.id,
    mode: session.mode as 'timed' | 'custom',
    totalQuestions: stats.totalQuestions,
    correctAnswers: stats.correctAnswers,
    accuracy: stats.accuracy,
    timeSpent: timeSpentMinutes,
    timeLimit: session.timeRemaining ? Math.round(session.timeRemaining / 60000) : undefined,
    topicBreakdown: stats.topicBreakdown,
    date: today,
    completedAt: stats.completedAt,
    score: stats.accuracy
  }
  
  // Update topic exam performance
  const updatedTopicPerformance = { ...currentStats.topicExamPerformance }
  Object.entries(stats.topicBreakdown).forEach(([topic, breakdown]) => {
    if (!updatedTopicPerformance[topic]) {
      updatedTopicPerformance[topic] = {
        examsTaken: 0,
        averageAccuracy: 0,
        bestScore: 0,
        lastExamDate: today
      }
    }
    
    const topicData = updatedTopicPerformance[topic]
    const newAccuracy = breakdown.accuracy
    
    topicData.averageAccuracy = (topicData.averageAccuracy * topicData.examsTaken + newAccuracy) / (topicData.examsTaken + 1)
    topicData.examsTaken += 1
    topicData.bestScore = Math.max(topicData.bestScore, newAccuracy)
    topicData.lastExamDate = today
  })
  
  const isPassing = stats.accuracy >= 70
  const newExamStreak = isPassing ? currentStats.examStreak + 1 : 0
  
  return {
    ...currentStats,
    totalExamsCompleted: currentStats.totalExamsCompleted + 1,
    totalExamQuestions: currentStats.totalExamQuestions + stats.totalQuestions,
    totalCorrectInExams: currentStats.totalCorrectInExams + stats.correctAnswers,
    averageExamAccuracy: currentStats.totalExamQuestions > 0
      ? ((currentStats.totalCorrectInExams + stats.correctAnswers) / (currentStats.totalExamQuestions + stats.totalQuestions)) * 100
      : stats.accuracy,
    averageExamTime: (currentStats.averageExamTime * currentStats.totalExamsCompleted + timeSpentMinutes) / (currentStats.totalExamsCompleted + 1),
    bestExamScore: Math.max(currentStats.bestExamScore, stats.accuracy),
    worstExamScore: Math.min(currentStats.worstExamScore, stats.accuracy),
    examStreak: newExamStreak,
    timedQuizzesCompleted: currentStats.timedQuizzesCompleted + (session.mode === 'timed' ? 1 : 0),
    customExamsCompleted: currentStats.customExamsCompleted + (session.mode !== 'timed' ? 1 : 0),
    topicExamPerformance: updatedTopicPerformance,
    examHistory: [...currentStats.examHistory, examSession].slice(-50) // Keep last 50 exams
  }
}