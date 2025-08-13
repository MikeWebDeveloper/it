import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { AnswerChoice } from '@/components/quiz/AnswerChoice'

const mockProps = {
  option: "Test answer option",
  isSelected: false,
  isCorrect: undefined,
  isMultipleChoice: false,
  onClick: jest.fn(),
  disabled: false
}

describe('AnswerChoice', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders option text correctly', () => {
    render(<AnswerChoice {...mockProps} />)
    
    expect(screen.getByText('Test answer option')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    render(<AnswerChoice {...mockProps} />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(mockProps.onClick).toHaveBeenCalled()
  })

  it('shows selected state when isSelected is true', () => {
    render(<AnswerChoice {...mockProps} isSelected={true} />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('border-primary')
  })

  it('shows correct state with green styling', () => {
    render(<AnswerChoice {...mockProps} isCorrect={true} disabled={true} />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-green-50')
  })

  it('shows incorrect state with red styling', () => {
    render(<AnswerChoice {...mockProps} isSelected={true} isCorrect={false} disabled={true} />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-red-50')
  })

  it('is disabled when disabled prop is true', () => {
    render(<AnswerChoice {...mockProps} disabled={true} />)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('does not call onClick when disabled', () => {
    render(<AnswerChoice {...mockProps} disabled={true} />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(mockProps.onClick).not.toHaveBeenCalled()
  })

  it('displays check icon when correct', () => {
    render(<AnswerChoice {...mockProps} isCorrect={true} disabled={true} />)
    
    expect(screen.getByRole('button')).toContainHTML('svg')
  })

  it('displays X icon when incorrect', () => {
    render(<AnswerChoice {...mockProps} isSelected={true} isCorrect={false} disabled={true} />)
    
    expect(screen.getByRole('button')).toContainHTML('svg')
  })
})