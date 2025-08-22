import { renderHook, act } from '@testing-library/react'
import { useQuizStore } from '@/store/useQuizStore'
import { Question } from '@/types/quiz'

const mockQuestions: Question[] = [
  {
    id: 1,
    question: "Test question 1",
    options: ["A", "B", "C", "D"],
    correctAnswer: 0,
    topic: "Hardware"
  },
  {
    id: 2,
    question: "Test question 2", 
    options: ["A", "B", "C", "D"],
    correctAnswer: 1,
    topic: "Networking"
  }
]

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('useQuizStore', () => {
  beforeEach(() => {
    localStorage.clear()
    // Reset store state completely
    useQuizStore.setState({
      currentSession: null,
      allQuestions: [],
      userProgress: {
        totalSessionsCompleted: 0,
        totalQuestions: 0,
        totalCorrect: 0,
        streak: 0,
        longestStreak: 0,
        lastSessionDate: '',
        topicProgress: {},
        achievements: []
      },
      sessionHistory: [],
      isDarkMode: true
    })
  })

  it('starts quiz correctly', () => {
    const { result } = renderHook(() => useQuizStore())

    act(() => {
      result.current.startQuiz('practice', mockQuestions, undefined)
    })

    expect(result.current.currentSession?.mode).toBe('practice')
    expect(result.current.currentSession?.questions).toEqual(mockQuestions)
    expect(result.current.currentSession?.currentQuestionIndex).toBe(0)
    expect(result.current.currentSession?.completed).toBe(false)
  })

  it('submits answer correctly', () => {
    const { result } = renderHook(() => useQuizStore())

    act(() => {
      result.current.startQuiz('practice', mockQuestions, undefined)
    })

    act(() => {
      result.current.answerQuestion(1, '0')
    })

    const session = result.current.currentSession
    expect(session?.answers[1]).toBe('0')
  })

  it('completes quiz when all questions answered', () => {
    const { result } = renderHook(() => useQuizStore())

    act(() => {
      result.current.startQuiz('practice', mockQuestions, undefined)
    })

    // Answer all questions
    act(() => {
      result.current.answerQuestion(1, '0') // Correct (index 0 = 'A')
    })
    
    act(() => {
      result.current.answerQuestion(2, '1') // Correct (index 1 = 'B')
    })


    act(() => {
      result.current.completeQuiz()
    })

    const session = result.current.currentSession
    expect(session?.completed).toBe(true)
    expect(session?.score).toBe(100) // 2/2 correct = 100%
  })

  it('updates user progress after quiz completion', () => {
    const { result } = renderHook(() => useQuizStore())

    act(() => {
      result.current.startQuiz('practice', mockQuestions, undefined)
    })

    // Answer all questions
    act(() => {
      result.current.answerQuestion(1, '0')
    })
    
    act(() => {
      result.current.answerQuestion(2, '1')
    })

    act(() => {
      result.current.completeQuiz()
    })

    const progress = result.current.userProgress
    expect(progress.totalSessionsCompleted).toBe(1)
    expect(progress.topicProgress.Hardware.questionsAnswered).toBe(1)
    expect(progress.topicProgress.Networking.questionsAnswered).toBe(1)
  })

  it('handles previous question navigation correctly', () => {
    const { result } = renderHook(() => useQuizStore())

    act(() => {
      result.current.startQuiz('practice', mockQuestions, undefined)
    })

    // Move to next question
    act(() => {
      result.current.nextQuestion()
    })

    expect(result.current.currentSession?.currentQuestionIndex).toBe(1)

    // Go back to previous question
    act(() => {
      result.current.previousQuestion()
    })

    expect(result.current.currentSession?.currentQuestionIndex).toBe(0)
  })

  it('toggles dark mode correctly', () => {
    const { result } = renderHook(() => useQuizStore())

    const initialMode = result.current.isDarkMode

    act(() => {
      result.current.toggleDarkMode()
    })

    expect(result.current.isDarkMode).toBe(!initialMode)
  })

  it('resets session correctly', () => {
    const { result } = renderHook(() => useQuizStore())

    act(() => {
      result.current.startQuiz('practice', mockQuestions, undefined)
    })

    act(() => {
      result.current.resetSession()
    })

    expect(result.current.currentSession).toBeNull()
  })
})