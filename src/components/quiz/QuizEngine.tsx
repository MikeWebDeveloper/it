'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useQuizStore } from '@/store/useQuizStore'
import { QuestionCard } from './QuestionCard'
import { QuizNavigation } from './QuizNavigation'
import { FeedbackOverlay } from './FeedbackOverlay'
import { QuestionNavigationMap } from './QuestionNavigationMap'
import { QuizMode } from '@/types/quiz'
import { formatTime } from '@/lib/utils'
import { Clock, Pause, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAutoSave } from '@/hooks/useAutoSave'
import { SaveStatusIndicator } from '@/components/ui/SaveStatusIndicator'
import { QuizSkeleton } from '@/components/skeletons'
import { useKeyboardShortcuts, createQuizShortcuts } from '@/hooks/useKeyboardShortcuts'
import { KeyboardShortcutsHelp } from '@/components/ui/KeyboardShortcutsHelp'
import { useAudioHapticFeedback } from '@/hooks/useAudioHapticFeedback'

interface QuizEngineProps {
  mode: QuizMode
}

export function QuizEngine({ mode }: QuizEngineProps) {
  const {
    currentSession,
    answerQuestion,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    completeQuiz,
    userProgress,
    saveProgress
  } = useQuizStore()

  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [currentAnswer, setCurrentAnswer] = useState<string | string[] | null>(null)
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false)
  const [hasAnsweredCurrentQuestion, setHasAnsweredCurrentQuestion] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)

  // Auto-save functionality
  const { saveStatus, lastSaved, saveNow } = useAutoSave({
    data: currentSession,
    saveFunction: saveProgress,
    delay: 1500, // Save 1.5 seconds after changes
    enabled: !!currentSession && !currentSession.completed,
  })

  // Audio and haptic feedback
  const feedback = useAudioHapticFeedback()

  const handleComplete = useCallback(() => {
    completeQuiz()
    setShowResults(true)
    feedback.onQuizComplete()
  }, [completeQuiz, feedback])

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
        
        // Warning at 2 minutes (120 seconds) remaining
        if (prev <= 120000 && prev > 119000) {
          feedback.onTimerWarning()
        }
        
        // Final warning at 30 seconds
        if (prev <= 30000 && prev > 29000) {
          feedback.onTimerWarning()
        }
        
        return prev - 1000
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timeRemaining, isPaused, handleComplete, feedback])

  // Reset feedback state when question changes
  useEffect(() => {
    setShowFeedback(false)
    setCurrentAnswer(null)
    setHasAnsweredCurrentQuestion(false)
  }, [currentSession?.currentQuestionIndex])

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false)
    }, 1000) // Show loading skeleton for 1 second

    return () => clearTimeout(timer)
  }, [])

  // Define derived values with useMemo (must be before early return)
  const currentQuestion = currentSession?.questions[currentSession?.currentQuestionIndex]
  const selectedAnswer = currentQuestion ? currentSession?.answers[currentQuestion.id] : undefined
  
  // Check if question has a valid answer (for UI - can user proceed?)
  const hasAnswer = useMemo(() => {
    if (!currentSession || !currentQuestion || selectedAnswer === undefined || selectedAnswer === null) return false
    
    // For multiple choice questions, check if user selected required NUMBER of answers
    if (Array.isArray(currentQuestion.correct_answer)) {
      if (!Array.isArray(selectedAnswer)) return false
      // Allow proceeding when correct number of answers selected (not necessarily correct ones)
      return selectedAnswer.length === currentQuestion.correct_answer.length
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

  // All callbacks and handlers - MUST be defined before any early returns
  const handleAnswerSelect = useCallback((answer: string | string[]) => {
    answerQuestion(currentQuestion?.id || 0, answer)
    
    // For practice mode, show immediate feedback
    if (mode === 'practice' && !hasAnsweredCurrentQuestion && currentQuestion) {
      const correct = checkAnswer(answer, currentQuestion.correct_answer)
      setCurrentAnswer(answer)
      setIsAnswerCorrect(correct)
      setShowFeedback(true)
      setHasAnsweredCurrentQuestion(true)
      
      // Trigger audio/haptic feedback
      feedback.onAnswerSelect(correct)
    } else {
      // General selection feedback for other modes
      feedback.onButtonClick()
    }
  }, [currentQuestion, answerQuestion, mode, hasAnsweredCurrentQuestion, checkAnswer, feedback])

  const handleFeedbackClose = useCallback(() => {
    setShowFeedback(false)
  }, [])

  // Keyboard shortcuts - moved before conditional returns
  const handleKeyboardAnswerSelect = useCallback((answerIndex: number) => {
    if (!currentQuestion || showFeedback || isPaused) return

    const options = currentQuestion.options || []
    if (answerIndex >= options.length) return

    const selectedOption = options[answerIndex]
    
    // Keyboard shortcut feedback
    feedback.onKeyboardShortcut()
    
    // Handle multiple choice questions
    if (Array.isArray(currentQuestion.correct_answer)) {
      const currentAnswers = Array.isArray(selectedAnswer) ? selectedAnswer : []
      
      if (currentAnswers.includes(selectedOption)) {
        // Remove if already selected
        const newAnswers = currentAnswers.filter(ans => ans !== selectedOption)
        answerQuestion(currentQuestion.id, newAnswers)
      } else {
        // Add to selection
        answerQuestion(currentQuestion.id, [...currentAnswers, selectedOption])
      }
    } else {
      // Single answer selection
      answerQuestion(currentQuestion.id, selectedOption)
      
      // Auto-advance in practice mode for single answers
      if (mode === 'practice' && !hasAnsweredCurrentQuestion) {
        const correct = checkAnswer(selectedOption, currentQuestion.correct_answer)
        setCurrentAnswer(selectedOption)
        setIsAnswerCorrect(correct)
        setShowFeedback(true)
        setHasAnsweredCurrentQuestion(true)
        
        // Trigger immediate feedback for correct/incorrect
        feedback.onAnswerSelect(correct)
      }
    }
  }, [currentQuestion, selectedAnswer, answerQuestion, checkAnswer, mode, hasAnsweredCurrentQuestion, showFeedback, isPaused, feedback])

  const handleNext = useCallback(() => {
    if (currentSession && currentSession.currentQuestionIndex < currentSession.questions.length - 1) {
      nextQuestion()
      feedback.onQuestionNavigation()
    }
  }, [currentSession, nextQuestion, feedback])

  const handlePrevious = useCallback(() => {
    if (currentSession && currentSession.currentQuestionIndex > 0) {
      previousQuestion()
      feedback.onQuestionNavigation()
    }
  }, [currentSession, previousQuestion, feedback])

  const togglePause = useCallback(() => {
    setIsPaused(!isPaused)
    feedback.onButtonClick()
  }, [isPaused, feedback])

  const handleFeedbackContinue = useCallback(() => {
    setShowFeedback(false)
    // Auto advance to next question in practice mode
    if (currentSession && currentSession.currentQuestionIndex < currentSession.questions.length - 1) {
      setTimeout(() => {
        nextQuestion()
      }, 300) // Small delay for smooth transition
    } else {
      // Last question, complete quiz
      setTimeout(() => {
        handleComplete()
      }, 300)
    }
  }, [currentSession, nextQuestion, handleComplete])

  const handleSubmit = useCallback(() => {
    if (!currentQuestion || isPaused) return

    if (showFeedback) {
      handleFeedbackContinue()
    } else if (hasAnswer) {
      // For multiple choice, show feedback or advance
      if (mode === 'practice' && !hasAnsweredCurrentQuestion && selectedAnswer !== undefined) {
        const correct = checkAnswer(selectedAnswer, currentQuestion.correct_answer)
        setCurrentAnswer(selectedAnswer)
        setIsAnswerCorrect(correct)
        setShowFeedback(true)
        setHasAnsweredCurrentQuestion(true)
      } else {
        handleNext()
      }
    }
  }, [currentQuestion, showFeedback, hasAnswer, mode, hasAnsweredCurrentQuestion, selectedAnswer, checkAnswer, handleFeedbackContinue, handleNext, isPaused])

  const handleExit = useCallback(() => {
    if (showFeedback) {
      handleFeedbackClose()
    } else {
      // Show confirmation or go back
      if (window.confirm('Are you sure you want to exit the quiz? Your progress will be saved.')) {
        window.history.back()
      }
    }
  }, [showFeedback, handleFeedbackClose])

  const handleGoToFirst = useCallback(() => {
    if (!currentSession || isPaused) return
    goToQuestion(0)
    feedback.onQuestionNavigation()
  }, [currentSession, goToQuestion, isPaused, feedback])

  const handleGoToLast = useCallback(() => {
    if (!currentSession || isPaused) return
    goToQuestion(currentSession.questions.length - 1)
    feedback.onQuestionNavigation()
  }, [currentSession, goToQuestion, isPaused, feedback])

  const keyboardShortcuts = useMemo(() => createQuizShortcuts({
    onPrevious: handlePrevious,
    onNext: handleNext,
    onAnswer: handleKeyboardAnswerSelect,
    onSubmit: handleSubmit,
    onExit: handleExit,
    onPause: mode === 'timed' ? togglePause : undefined,
    onFirst: handleGoToFirst,
    onLast: handleGoToLast,
    onHelp: () => setShowKeyboardHelp(true)
  }), [
    handlePrevious, 
    handleNext, 
    handleKeyboardAnswerSelect, 
    handleSubmit, 
    handleExit, 
    mode, 
    togglePause, 
    handleGoToFirst, 
    handleGoToLast
  ])

  useKeyboardShortcuts({
    shortcuts: keyboardShortcuts,
    enabled: !showKeyboardHelp && !isInitializing,
    showToasts: false,
    scope: 'global'
  })

  // Show loading skeleton during initialization or when session is loading
  if (isInitializing || (!currentSession && !showResults)) {
    return <QuizSkeleton variant="preparing" />
  }

  // Show "no session" state only after loading is complete
  if (!currentSession || !currentQuestion) {
    return (
      <div className="h-screen overflow-hidden bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto mb-6 bg-muted/20 rounded-full flex items-center justify-center">
            <div className="text-4xl">🎯</div>
          </div>
          <h2 className="text-2xl font-semibold">No Active Quiz</h2>
          <p className="text-muted-foreground max-w-md">
            Your quiz session has ended or wasn&apos;t properly initialized. 
            Please return to the home page to start a new quiz.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
      <div className="container mx-auto px-4 flex flex-col h-full max-w-4xl">
        {/* Header - Compact for mobile */}
        <div className="flex items-center justify-between py-3 px-1 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-lg md:text-xl font-semibold">
              {mode === 'practice' && 'Practice Mode'}
              {mode === 'timed' && 'Timed Quiz'}
              {mode === 'review' && 'Review Mode'}
            </h1>
            
            {/* Auto-save status indicator */}
            <SaveStatusIndicator
              status={saveStatus}
              lastSaved={lastSaved}
              onManualSave={saveNow}
              compact={true}
              className="hidden sm:flex"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Auto-save status indicator (mobile) */}
            <SaveStatusIndicator
              status={saveStatus}
              lastSaved={lastSaved}
              onManualSave={saveNow}
              compact={true}
              className="sm:hidden"
            />
            
            {/* Timer (for timed mode) */}
            {mode === 'timed' && timeRemaining !== null && (
              <>
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
              </>
            )}
          </div>
        </div>

        {/* Question Navigation Map */}
        <div className="flex-shrink-0 px-1 pb-3">
          <QuestionNavigationMap
            questions={currentSession.questions}
            currentIndex={currentSession.currentQuestionIndex}
            answers={currentSession.answers}
            onNavigate={goToQuestion}
            showResults={showResults}
            compact={true}
          />
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

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp
        shortcuts={keyboardShortcuts}
        isOpen={showKeyboardHelp}
        onClose={() => setShowKeyboardHelp(false)}
        title="Quiz Keyboard Shortcuts"
      />
    </div>
  )
}