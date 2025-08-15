import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn()
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams()
}))

// Mock the useQuizStore hook
jest.mock('@/store/useQuizStore', () => ({
  useQuizStore: () => ({
    userProgress: {
      totalSessionsCompleted: 5,
      streak: 3,
      topicProgress: {
        Hardware: { questionsAnswered: 10, correctAnswers: 8, masteryLevel: 'intermediate' },
        Networking: { questionsAnswered: 8, correctAnswers: 6, masteryLevel: 'beginner' },
        Security: { questionsAnswered: 5, correctAnswers: 4, masteryLevel: 'beginner' }
      }
    },
    startQuiz: jest.fn(),
    setQuestions: jest.fn()
  })
}))

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'dark',
    setTheme: jest.fn()
  })
}))

// Mock the quiz data
jest.mock('@/data/questions.json', () => ({
  exam_info: {
    title: "IT Essentials 7.0 8.0 Course Final Exam",
    total_questions: 50,
    topics: ["Hardware", "Networking", "Security"]
  },
  questions: [
    {
      id: 1,
      question: "Test question",
      options: ["A", "B", "C", "D"],
      correct_answer: "A",
      topic: "Hardware"
    }
  ]
}))

// Mock PWA Installer
jest.mock('@/components/PWAInstaller', () => ({
  PWAInstaller: () => null
}))

// Mock audio/haptic hooks
jest.mock('@/hooks/useAudioHapticFeedback', () => ({
  useAudioHapticFeedback: () => ({
    audioHapticPreferences: {
      soundEnabled: true,
      volume: 0.7,
      hapticEnabled: true
    },
    updatePreferences: jest.fn(),
    playSuccessSound: jest.fn(),
    playErrorSound: jest.fn(),
    triggerHaptic: jest.fn()
  })
}))

// Mock study session timer hook
jest.mock('@/hooks/useStudySessionTimer', () => ({
  useStudySessionTimer: () => ({
    sessionTime: 0,
    totalStudyTime: 0,
    startSession: jest.fn(),
    endSession: jest.fn(),
    isSessionActive: false,
    formatTime: (time: number) => '00:00'
  })
}))

describe('Home Page', () => {
  it('renders app title', () => {
    render(<Home />)
    
    expect(screen.getByText('IT Quiz App')).toBeInTheDocument()
  })

  it('renders main app description', () => {
    render(<Home />)
    
    expect(screen.getByText('Master IT Essentials with 350+ interactive questions')).toBeInTheDocument()
  })

  it('displays user progress statistics when user has completed sessions', () => {
    render(<Home />)
    
    // Check for progress section elements
    expect(screen.getByText('Your Progress')).toBeInTheDocument()
    expect(screen.getByText('Quizzes Completed')).toBeInTheDocument()
    expect(screen.getByText('Day Streak')).toBeInTheDocument()
    expect(screen.getByText('Topics Studied')).toBeInTheDocument()
    expect(screen.getByText('Topics Mastered')).toBeInTheDocument()
  })

  it('renders main action sections', () => {
    render(<Home />)
    
    // Check for main section headers
    expect(screen.getByText('Learn & Practice')).toBeInTheDocument()
    expect(screen.getByText('Test Your Knowledge')).toBeInTheDocument()
  })

  it('displays practice mode options', () => {
    render(<Home />)
    
    expect(screen.getByText('Practice Mode')).toBeInTheDocument()
    expect(screen.getByText('Adaptive Practice')).toBeInTheDocument()
    expect(screen.getByText('Flashcards')).toBeInTheDocument()
    expect(screen.getByText('Review Mode')).toBeInTheDocument()
  })

  it('displays testing options', () => {
    render(<Home />)
    
    expect(screen.getByText('Quick Quiz')).toBeInTheDocument()
    expect(screen.getByText('Custom Exam')).toBeInTheDocument()
  })

  it('shows topic badges', () => {
    render(<Home />)
    
    // Check for the first topic badge
    expect(screen.getByText('Hardware')).toBeInTheDocument()
  })
})