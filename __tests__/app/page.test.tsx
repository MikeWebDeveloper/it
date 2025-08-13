import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

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

describe('Home Page', () => {
  it('renders app title', () => {
    render(<Home />)
    
    expect(screen.getByText('IT Quiz App')).toBeInTheDocument()
  })

  it('renders quiz mode selection buttons', () => {
    render(<Home />)
    
    expect(screen.getByText('Practice Mode')).toBeInTheDocument()
    expect(screen.getByText('Timed Quiz')).toBeInTheDocument()
    expect(screen.getByText('Review Mode')).toBeInTheDocument()
  })

  it('displays user progress statistics', () => {
    render(<Home />)
    
    expect(screen.getByText('5')).toBeInTheDocument() // Total sessions
    expect(screen.getByText('3')).toBeInTheDocument() // Current streak
  })

  it('shows correct quiz count from data', () => {
    render(<Home />)
    
    expect(screen.getByText(/50 Questions Available/)).toBeInTheDocument()
  })
})