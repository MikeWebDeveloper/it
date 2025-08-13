'use client'

import { useEffect, useState, useCallback } from 'react'
import { useQuizStore } from '@/store/useQuizStore'
import { QuestionCard } from './QuestionCard'
import { QuizNavigation } from './QuizNavigation'
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
    completeQuiz
  } = useQuizStore()

  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [showResults, setShowResults] = useState(false)

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

  if (!currentSession) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">No active quiz session</p>
      </div>
    )
  }

  const currentQuestion = currentSession.questions[currentSession.currentQuestionIndex]
  const selectedAnswer = currentSession.answers[currentQuestion.id]
  const hasAnswer = selectedAnswer !== undefined && selectedAnswer !== null
  
  const handleAnswerSelect = (answer: string | string[]) => {
    answerQuestion(currentQuestion.id, answer)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold">
              {mode === 'practice' && 'Practice Mode'}
              {mode === 'timed' && 'Timed Quiz'}
              {mode === 'review' && 'Review Mode'}
            </h1>
            <p className="text-sm text-muted-foreground">
              IT Essentials Exam Preparation
            </p>
          </div>

          {/* Timer (for timed mode) */}
          {mode === 'timed' && timeRemaining !== null && (
            <div className="flex items-center gap-2">
              <Badge variant={timeRemaining < 300000 ? "destructive" : "secondary"} className="text-sm">
                <Clock className="w-3 h-3 mr-1" />
                {formatTime(timeRemaining)}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={togglePause}
                className="ml-2"
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
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

        {/* Question */}
        <div className="mb-6">
          <QuestionCard
            question={currentQuestion}
            currentIndex={currentSession.currentQuestionIndex}
            totalQuestions={currentSession.questions.length}
            selectedAnswer={selectedAnswer}
            onAnswerSelect={handleAnswerSelect}
            showResult={showResults && mode === 'review'}
          />
        </div>

        {/* Navigation */}
        <QuizNavigation
          currentIndex={currentSession.currentQuestionIndex}
          totalQuestions={currentSession.questions.length}
          hasAnswer={hasAnswer}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onComplete={handleComplete}
        />

        {/* Instructions for mobile users */}
        <div className="mt-8 text-center text-xs text-muted-foreground max-w-md mx-auto">
          <p>
            💡 Tip: Tap and hold answer choices to read them carefully. 
            You can navigate back to previous questions anytime.
          </p>
        </div>
      </div>
    </div>
  )
}