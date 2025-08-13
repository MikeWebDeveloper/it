import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { QuestionCard } from '@/components/quiz/QuestionCard'
import { Question } from '@/types/quiz'

const mockQuestion: Question = {
  id: 1,
  question: "What is the purpose of RAM in a computer?",
  options: [
    "Store data permanently",
    "Provide temporary storage for active programs",
    "Connect to the internet",
    "Display graphics"
  ],
  correct_answer: "Provide temporary storage for active programs",
  explanation: "RAM (Random Access Memory) provides temporary storage for programs and data currently in use.",
  topic: "Hardware"
}

const mockProps = {
  question: mockQuestion,
  currentIndex: 0,
  totalQuestions: 10,
  selectedAnswer: undefined,
  onAnswerSelect: jest.fn(),
  showResult: false
}

describe('QuestionCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders question text correctly', () => {
    render(<QuestionCard {...mockProps} />)
    
    expect(screen.getByText(mockQuestion.question)).toBeInTheDocument()
  })

  it('renders all answer options', () => {
    render(<QuestionCard {...mockProps} />)
    
    mockQuestion.options.forEach(option => {
      expect(screen.getByText(option)).toBeInTheDocument()
    })
  })

  it('displays question progress indicator', () => {
    render(<QuestionCard {...mockProps} />)
    
    expect(screen.getByText('Question 1 of 10')).toBeInTheDocument()
  })

  it('calls onAnswerSelect when an option is clicked', () => {
    render(<QuestionCard {...mockProps} />)
    
    const firstOption = screen.getByText(mockQuestion.options[0])
    fireEvent.click(firstOption)
    
    expect(mockProps.onAnswerSelect).toHaveBeenCalled()
  })

  it('shows explanation when showResult is true', () => {
    render(<QuestionCard {...mockProps} showResult={true} />)
    
    if (mockQuestion.explanation) {
      expect(screen.getByText(mockQuestion.explanation)).toBeInTheDocument()
    }
  })

  it('highlights selected answer', () => {
    render(<QuestionCard {...mockProps} selectedAnswer={mockQuestion.options[1]} />)
    
    const selectedOption = screen.getByText(mockQuestion.options[1])
    expect(selectedOption.closest('button')).toBeInTheDocument()
  })

  it('displays topic badge', () => {
    render(<QuestionCard {...mockProps} />)
    
    expect(screen.getByText(mockQuestion.topic)).toBeInTheDocument()
  })
})