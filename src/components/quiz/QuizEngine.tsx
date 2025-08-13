'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useQuizStore } from '@/store/useQuizStore'
import { QuestionCard } from './QuestionCard'
import { QuizNavigation } from './QuizNavigation'
import { FeedbackOverlay } from './FeedbackOverlay'
import { QuizMode } from '@/types/quiz'
import { formatTime } from '@/lib/utils'
import { Clock, Pause, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface QuizEngineProps {
  mode: QuizMode
}

export function QuizEngine({ mode }: QuizEngineProps) {
  const {
    currentSession,
    answerQuestion,
    nextQuestion,
    previousQuestion,
    completeQuiz,
    userProgress
  } = useQuizStore()

  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [currentAnswer, setCurrentAnswer] = useState<string | string[] | null>(null)
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false)
  const [hasAnsweredCurrentQuestion, setHasAnsweredCurrentQuestion] = useState(false)

  const handleComplete = useCallback(() => {
    completeQuiz()
    setShowResults(true)
  }, [completeQuiz])

  // Initialize timer for timed mode
  useEffect(() => {
    if (!currentSession || mode !== 'timed') return

    if (currentSession.timeRemaining) {
      setTimeRemaining(currentSession.timeRemaining)
    }
  }, [currentSession, mode])

  // Check answer correctness
  const checkAnswer = useCallback((answer: string | string[], correctAnswer: string | string[]) => {
    if (Array.isArray(correctAnswer)) {
      if (!Array.isArray(answer)) return false
      return answer.length === correctAnswer.length && 
             answer.every(ans => correctAnswer.includes(ans))
    } else {
      return answer === correctAnswer
    }
  }, [])

  // Calculate topic progress for current question
  const getTopicProgress = useCallback(() => {
    if (!currentSession || !currentSession.questions[currentSession.currentQuestionIndex] || !userProgress.topicProgress[currentSession.questions[currentSession.currentQuestionIndex].topic]) {
      return undefined
    }
    
    const currentQuestion = currentSession.questions[currentSession.currentQuestionIndex]
    const topicData = userProgress.topicProgress[currentQuestion.topic]
    return {
      correct: topicData.correctAnswers,
      total: topicData.questionsAnswered,
      accuracy: topicData.questionsAnswered > 0 
        ? (topicData.correctAnswers / topicData.questionsAnswered) * 100 
        : 0
    }
  }, [currentSession, userProgress.topicProgress])

  // Timer countdown
  useEffect(() => {
    if (!timeRemaining || isPaused || timeRemaining <= 0) return

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (!prev || prev <= 1000) {
          // Time's up!
          handleComplete()
          return 0
        }
        return prev - 1000
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timeRemaining, isPaused, handleComplete])

  // Reset feedback state when question changes
  useEffect(() => {
    setShowFeedback(false)
    setCurrentAnswer(null)
    setHasAnsweredCurrentQuestion(false)
  }, [currentSession?.currentQuestionIndex])

  // Define derived values with useMemo (must be before early return)
  const currentQuestion = currentSession?.questions[currentSession?.currentQuestionIndex]
  const selectedAnswer = currentQuestion ? currentSession?.answers[currentQuestion.id] : undefined
  
  // Check if question has a valid answer
  const hasAnswer = useMemo(() => {
    if (!currentSession || !currentQuestion || selectedAnswer === undefined || selectedAnswer === null) return false
    
    // For multiple choice questions (array correct_answer), require ALL correct answers
    if (Array.isArray(currentQuestion.correct_answer)) {
      if (!Array.isArray(selectedAnswer)) return false
      // Check if user selected all required answers
      return selectedAnswer.length === currentQuestion.correct_answer.length &&
             currentQuestion.correct_answer.every(answer => selectedAnswer.includes(answer))
    }
    
    // For single answer questions, just check if we have an answer
    return selectedAnswer !== '' && selectedAnswer !== null
  }, [currentSession, currentQuestion, selectedAnswer])
  
  // Check if all required answers are selected (for UI feedback)
  const hasAllRequiredAnswers = useMemo(() => {
    if (!currentQuestion || !Array.isArray(currentQuestion.correct_answer)) return hasAnswer
    if (!Array.isArray(selectedAnswer)) return false
    return selectedAnswer.length === currentQuestion.correct_answer.length
  }, [currentQuestion, selectedAnswer, hasAnswer])

  if (!currentSession || !currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">No active quiz session</p>
      </div>
    )
  }

  const handleAnswerSelect = (answer: string | string[]) => {
    answerQuestion(currentQuestion.id, answer)
    
    // For practice mode, show immediate feedback
    if (mode === 'practice' && !hasAnsweredCurrentQuestion) {
      const correct = checkAnswer(answer, currentQuestion.correct_answer)
      setCurrentAnswer(answer)
      setIsAnswerCorrect(correct)
      setShowFeedback(true)
      setHasAnsweredCurrentQuestion(true)
    }
  }

  const handleNext = () => {
    if (currentSession.currentQuestionIndex < currentSession.questions.length - 1) {
      nextQuestion()
    }
  }

  const handlePrevious = () => {
    if (currentSession.currentQuestionIndex > 0) {
      previousQuestion()
    }
  }

  const togglePause = () => {
    setIsPaused(!isPaused)
  }

  const handleFeedbackContinue = () => {
    setShowFeedback(false)
    // Auto advance to next question in practice mode
    if (currentSession.currentQuestionIndex < currentSession.questions.length - 1) {
      setTimeout(() => {
        nextQuestion()
      }, 300) // Small delay for smooth transition
    } else {
      // Last question, complete quiz
      setTimeout(() => {
        handleComplete()
      }, 300)
    }
  }

  const handleFeedbackClose = () => {
    setShowFeedback(false)
  }

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
      <div className="container mx-auto px-4 flex flex-col h-full max-w-4xl">
        {/* Header - Compact for mobile */}
        <div className="flex items-center justify-between py-3 px-1 flex-shrink-0">
          <div>
            <h1 className="text-lg md:text-xl font-semibold">
              {mode === 'practice' && 'Practice Mode'}
              {mode === 'timed' && 'Timed Quiz'}
              {mode === 'review' && 'Review Mode'}
            </h1>
          </div>

          {/* Timer (for timed mode) */}
          {mode === 'timed' && timeRemaining !== null && (
            <div className="flex items-center gap-2">
              <Badge variant={timeRemaining < 300000 ? "destructive" : "secondary"} className="text-xs md:text-sm">
                <Clock className="w-3 h-3 mr-1" />
                {formatTime(timeRemaining)}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={togglePause}
                className="h-8 w-8 p-0 md:h-9 md:w-auto md:px-3"
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                <span className="hidden md:inline ml-2">
                  {isPaused ? 'Resume' : 'Pause'}
                </span>
              </Button>
            </div>
          )}
        </div>

        {/* Pause overlay */}
        {isPaused && mode === 'timed' && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-card p-6 rounded-lg border shadow-lg text-center">
              <h2 className="text-lg font-semibold mb-2">Quiz Paused</h2>
              <p className="text-muted-foreground mb-4">
                Time remaining: {formatTime(timeRemaining || 0)}
              </p>
              <Button onClick={togglePause}>
                <Play className="w-4 h-4 mr-2" />
                Resume
              </Button>
            </div>
          </div>
        )}

        {/* Question - Flexible content area */}
        <div className="flex-1 overflow-y-auto pb-4 min-h-0">
          <QuestionCard
            question={currentQuestion}
            currentIndex={currentSession.currentQuestionIndex}
            totalQuestions={currentSession.questions.length}
            selectedAnswer={selectedAnswer}
            onAnswerSelect={handleAnswerSelect}
            showResult={showResults && mode === 'review'}
            hasAllRequiredAnswers={hasAllRequiredAnswers}
          />
        </div>

        {/* Navigation - Always visible at bottom */}
        <div className="flex-shrink-0 border-t border-border/50 pt-2">
          <QuizNavigation
            currentIndex={currentSession.currentQuestionIndex}
            totalQuestions={currentSession.questions.length}
            hasAnswer={hasAnswer}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onComplete={handleComplete}
          />
        </div>
      </div>

      {/* Feedback Overlay for Practice Mode */}
      {mode === 'practice' && currentAnswer && currentQuestion && (
        <FeedbackOverlay
          question={currentQuestion}
          userAnswer={currentAnswer}
          isCorrect={isAnswerCorrect}
          isVisible={showFeedback}
          onContinue={handleFeedbackContinue}
          onClose={handleFeedbackClose}
          topicProgress={getTopicProgress()}
        />
      )}
    </div>
  )
}