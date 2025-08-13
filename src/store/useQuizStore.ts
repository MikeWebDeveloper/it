'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { QuizSession, QuizMode, Question, QuizStatistics, UserProgress } from '@/types/quiz'
import { generateId } from '@/lib/utils'

interface QuizState {
  // Current session state
  currentSession: QuizSession | null
  
  // Question data
  allQuestions: Question[]
  
  // Progress and statistics
  userProgress: UserProgress
  sessionHistory: QuizStatistics[]
  
  // UI state
  isDarkMode: boolean
  
  // Actions
  startQuiz: (mode: QuizMode, questions: Question[], timeLimit?: number) => void
  answerQuestion: (questionId: number, answer: string | string[]) => void
  nextQuestion: () => void
  previousQuestion: () => void
  completeQuiz: () => void
  
  // Settings
  toggleDarkMode: () => void
  
  // Data management
  setQuestions: (questions: Question[]) => void
  
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

export const useQuizStore = create<QuizState>()(
  persist(
    (set) => ({
      // Initial state
      currentSession: null,
      allQuestions: [],
      userProgress: initialUserProgress,
      sessionHistory: [],
      isDarkMode: true, // Default to dark mode for better mobile learning
      
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
            if (userAnswer) {
              // Handle both single and multiple correct answers
              if (Array.isArray(question.correct_answer)) {
                if (Array.isArray(userAnswer) && 
                    userAnswer.length === question.correct_answer.length &&
                    userAnswer.every(ans => question.correct_answer.includes(ans))) {
                  correctAnswers++
                }
              } else {
                if (userAnswer === question.correct_answer) {
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
          
          return {
            currentSession: {
              ...session,
              completed: true,
              score: accuracy
            },
            sessionHistory: [...state.sessionHistory, stats],
            userProgress: updatedProgress
          }
        })
      },
      
      // Toggle dark mode
      toggleDarkMode: () => {
        set((state) => ({ isDarkMode: !state.isDarkMode }))
      },
      
      // Set all questions
      setQuestions: (questions: Question[]) => {
        set({ allQuestions: questions })
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
        isDarkMode: state.isDarkMode,
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
      if (Array.isArray(question.correct_answer)) {
        if (Array.isArray(userAnswer) && 
            userAnswer.length === question.correct_answer.length &&
            userAnswer.every(ans => question.correct_answer.includes(ans))) {
          isCorrect = true
        }
      } else {
        if (userAnswer === question.correct_answer) {
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
    streak: newStreak,
    lastSessionDate: today,
    topicProgress: updatedTopicProgress
  }
}