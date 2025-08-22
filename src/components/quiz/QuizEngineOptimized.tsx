'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useCallback, useMemo, memo } from 'react'
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

// Memoized header component to prevent unnecessary re-renders
const QuizHeader = memo(function QuizHeader({
  mode,
  saveStatus,
  lastSaved,
  saveNow,
  timeRemaining,
  isPaused,
  togglePause
}: {
  mode: QuizMode
  saveStatus: any
  lastSaved: Date | null
  saveNow: () => void
  timeRemaining: number | null
  isPaused: boolean
  togglePause: () => void
}) {
  const modeTitle = useMemo(() => {
    switch (mode) {
      case 'practice': return 'Practice Mode'
      case 'timed': return 'Timed Quiz'
      case 'review': return 'Review Mode'
      default: return 'Quiz'
    }
  }, [mode])

  const timerBadgeVariant = useMemo(() => 
    timeRemaining && timeRemaining < 300000 ? "destructive" : "secondary"
  , [timeRemaining])

  return (
    <div className="flex items-center justify-between py-3 px-1 flex-shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="text-lg md:text-xl font-semibold">{modeTitle}</h1>
        
        <SaveStatusIndicator
          status={saveStatus}
          lastSaved={lastSaved}
          onManualSave={saveNow}
          compact={true}
          className="hidden sm:flex"
        />
      </div>

      <div className="flex items-center gap-2">
        <SaveStatusIndicator
          status={saveStatus}
          lastSaved={lastSaved}
          onManualSave={saveNow}
          compact={true}
          className="sm:hidden"
        />
        
        {mode === 'timed' && timeRemaining !== null && (
          <>
            <Badge variant={timerBadgeVariant} className="text-xs md:text-sm">
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
  )
})

// Memoized pause overlay to prevent re-renders
const PauseOverlay = memo(function PauseOverlay({
  isVisible,
  timeRemaining,
  onResume
}: {
  isVisible: boolean
  timeRemaining: number | null
  onResume: () => void
}) {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card p-6 rounded-lg border shadow-lg text-center">
        <h2 className="text-lg font-semibold mb-2">Quiz Paused</h2>
        <p className="text-muted-foreground mb-4">
          Time remaining: {formatTime(timeRemaining || 0)}
        </p>
        <Button onClick={onResume}>
          <Play className="w-4 h-4 mr-2" />
          Resume
        </Button>
      </div>
    </div>
  )
})

export function QuizEngineOptimized({ mode }: QuizEngineProps) {
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

  // Memoize derived values to prevent unnecessary recalculations
  const currentQuestion = useMemo(() => 
    currentSession?.questions[currentSession?.currentQuestionIndex]
  , [currentSession?.questions, currentSession?.currentQuestionIndex])

  const selectedAnswer = useMemo(() => 
    currentQuestion ? currentSession?.answers[currentQuestion.id] : undefined
  , [currentQuestion, currentSession?.answers])

  const hasAnswer = useMemo(() => {
    if (!currentSession || !currentQuestion || selectedAnswer === undefined || selectedAnswer === null) return false
    
    if (Array.isArray(currentQuestion.correctAnswer)) {
      if (!Array.isArray(selectedAnswer)) return false
      return selectedAnswer.length === currentQuestion.correctAnswer.length
    }
    
    return selectedAnswer !== '' && selectedAnswer !== null
  }, [currentSession, currentQuestion, selectedAnswer])

  const hasAllRequiredAnswers = useMemo(() => {
    if (!currentQuestion || !Array.isArray(currentQuestion.correctAnswer)) return hasAnswer
    if (!Array.isArray(selectedAnswer)) return false
    return selectedAnswer.length === currentQuestion.correctAnswer.length
  }, [currentQuestion, selectedAnswer, hasAnswer])

  // Auto-save with optimized configuration
  const { saveStatus, lastSaved, saveNow } = useAutoSave({
    data: currentSession,
    saveFunction: saveProgress,
    delay: 2000, // Increased delay to reduce saves
    enabled: !!currentSession && !currentSession.completed,
  })

  const feedback = useAudioHapticFeedback()

  // Optimized answer checking with memoization
  const checkAnswer = useCallback((answer: string | string[], correctAnswer: number | number[], options: string[]) => {
    if (Array.isArray(correctAnswer)) {
      if (!Array.isArray(answer)) return false
      // Convert answer strings to indices
      const answerIndices = answer.map(a => options.indexOf(a))
      return answerIndices.length === correctAnswer.length && 
             answerIndices.every(idx => correctAnswer.includes(idx))
    } else {
      // Convert single answer string to index
      const answerIndex = options.indexOf(String(answer))
      return answerIndex === correctAnswer
    }
  }, [])

  // Memoized topic progress calculation
  const topicProgress = useMemo(() => {
    if (!currentSession || !currentQuestion || !userProgress.topicProgress[currentQuestion.topic]) {
      return undefined
    }
    
    const topicData = userProgress.topicProgress[currentQuestion.topic]
    return {
      correct: topicData.correctAnswers,
      total: topicData.questionsAnswered,
      accuracy: topicData.questionsAnswered > 0 
        ? (topicData.correctAnswers / topicData.questionsAnswered) * 100 
        : 0
    }
  }, [currentSession?.currentQuestionIndex, userProgress.topicProgress, currentQuestion])

  const handleComplete = useCallback(() => {
    completeQuiz()
    setShowResults(true)
    feedback.onQuizComplete()
  }, [completeQuiz, feedback])

  // Optimized timer effect
  useEffect(() => {
    if (!timeRemaining || isPaused || timeRemaining <= 0) return

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (!prev || prev <= 1000) {
          handleComplete()
          return 0
        }
        
        // Warning thresholds
        if (prev <= 120000 && prev > 119000) {
          feedback.onTimerWarning()
        }
        
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

  // Initialize timer for timed mode
  useEffect(() => {
    if (!currentSession || mode !== 'timed') return
    if (currentSession.timeRemaining) {
      setTimeRemaining(currentSession.timeRemaining)
    }
  }, [currentSession, mode])

  // Optimized initialization
  useEffect(() => {
    const timer = setTimeout(() => setIsInitializing(false), 800)
    return () => clearTimeout(timer)
  }, [])

  // Optimized handlers
  const handleAnswerSelect = useCallback((answer: string | string[]) => {
    answerQuestion(currentQuestion?.id || 0, answer)
    
    if (mode === 'practice' && !hasAnsweredCurrentQuestion && currentQuestion) {
      if (Array.isArray(currentQuestion.correctAnswer)) {
        const answerArray = Array.isArray(answer) ? answer : []
        const requiredCount = currentQuestion.correctAnswer.length
        
        if (answerArray.length === requiredCount) {
          const correct = checkAnswer(answer, currentQuestion.correctAnswer, currentQuestion.options)
          setCurrentAnswer(answer)
          setIsAnswerCorrect(correct)
          setShowFeedback(true)
          setHasAnsweredCurrentQuestion(true)
          feedback.onAnswerSelect(correct)
        } else {
          feedback.onButtonClick()
        }
      } else {
        const correct = checkAnswer(answer, currentQuestion.correctAnswer, currentQuestion.options)
        setCurrentAnswer(answer)
        setIsAnswerCorrect(correct)
        setShowFeedback(true)
        setHasAnsweredCurrentQuestion(true)
        feedback.onAnswerSelect(correct)
      }
    } else {
      feedback.onButtonClick()
    }
  }, [currentQuestion, answerQuestion, mode, hasAnsweredCurrentQuestion, checkAnswer, feedback])

  const togglePause = useCallback(() => {
    setIsPaused(!isPaused)
    feedback.onButtonClick()
  }, [isPaused, feedback])

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

  // Memoized keyboard shortcuts
  const keyboardShortcuts = useMemo(() => createQuizShortcuts({
    onPrevious: handlePrevious,
    onNext: handleNext,
    onAnswer: (answerIndex: number) => {
      if (!currentQuestion || showFeedback || isPaused) return
      const options = currentQuestion.options || []
      if (answerIndex >= options.length) return
      handleAnswerSelect(options[answerIndex])
    },
    onSubmit: () => {
      if (hasAnswer) handleNext()
    },
    onExit: () => {
      if (window.confirm('Exit quiz? Progress will be saved.')) {
        window.history.back()
      }
    },
    onPause: mode === 'timed' ? togglePause : undefined,
  }), [handlePrevious, handleNext, currentQuestion, hasAnswer, mode, togglePause, showFeedback, isPaused, handleAnswerSelect])

  useKeyboardShortcuts({
    shortcuts: keyboardShortcuts,
    enabled: !showKeyboardHelp && !isInitializing,
    showToasts: false,
    scope: 'global'
  })

  if (isInitializing || (!currentSession && !showResults)) {
    return <QuizSkeleton variant="preparing" />
  }

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
        <QuizHeader
          mode={mode}
          saveStatus={saveStatus}
          lastSaved={lastSaved}
          saveNow={saveNow}
          timeRemaining={timeRemaining}
          isPaused={isPaused}
          togglePause={togglePause}
        />

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

        <PauseOverlay
          isVisible={isPaused && mode === 'timed'}
          timeRemaining={timeRemaining}
          onResume={togglePause}
        />

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

      {mode === 'practice' && currentAnswer && currentQuestion && (
        <FeedbackOverlay
          question={currentQuestion}
          userAnswer={currentAnswer}
          isCorrect={isAnswerCorrect}
          isVisible={showFeedback}
          onContinue={() => {
            setShowFeedback(false)
            setTimeout(() => handleNext(), 300)
          }}
          onClose={() => setShowFeedback(false)}
          topicProgress={topicProgress}
        />
      )}

      <KeyboardShortcutsHelp
        shortcuts={keyboardShortcuts}
        isOpen={showKeyboardHelp}
        onClose={() => setShowKeyboardHelp(false)}
        title="Quiz Keyboard Shortcuts"
      />
    </div>
  )
}