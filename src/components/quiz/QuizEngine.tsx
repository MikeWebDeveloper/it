'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useQuizStore } from '@/store/useQuizStore'
import { QuestionCard } from './QuestionCard'
import { QuizNavigation } from './QuizNavigation'
import { FeedbackOverlay } from './FeedbackOverlay'
import { QuestionNavigationMap } from './QuestionNavigationMap'
import { QuizMode } from '@/types/quiz'
import { formatTime } from '@/lib/utils'
import { Clock, Pause, Play, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAutoSave } from '@/hooks/useAutoSave'
import { SaveStatusIndicator } from '@/components/ui/SaveStatusIndicator'
import { QuizSkeleton } from '@/components/skeletons'
import { useKeyboardShortcuts, createQuizShortcuts } from '@/hooks/useKeyboardShortcuts'
import { KeyboardShortcutsHelp } from '@/components/ui/KeyboardShortcutsHelp'
import { useAudioHapticFeedback } from '@/hooks/useAudioHapticFeedback'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'

interface QuizEngineProps {
  mode: QuizMode
}

// Animation variants for consistent animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 20
    }
  },
  hover: {
    y: -4,
    scale: 1.01,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
}

const feedbackVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: -20,
    transition: {
      duration: 0.2
    }
  }
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
  const [showTimeWarning, setShowTimeWarning] = useState(false)

  // Auto-save functionality
  const { saveStatus, lastSaved, saveNow } = useAutoSave({
    data: currentSession,
    saveFunction: saveProgress,
    delay: 1500,
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

  // Timer countdown effect
  useEffect(() => {
    if (!timeRemaining || isPaused || mode !== 'timed') return

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null) return null
        
        const newTime = prev - 1000
        
        // Show warning when 5 minutes remaining
        if (newTime <= 5 * 60 * 1000 && !showTimeWarning) {
          setShowTimeWarning(true)
          feedback.onTimeWarning()
        }
        
        // Auto-complete when time runs out
        if (newTime <= 0) {
          handleComplete()
          return 0
        }
        
        return newTime
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining, isPaused, mode, showTimeWarning, feedback, handleComplete])

  // Check answer correctness
  const checkAnswer = useCallback((answer: string | string[], correctAnswer: number | number[], options: string[]) => {
    if (Array.isArray(correctAnswer)) {
      if (!Array.isArray(answer)) return false
      const answerIndices = answer.map(a => options.indexOf(a))
      return answerIndices.length === correctAnswer.length && 
             answerIndices.every(idx => correctAnswer.includes(idx))
    } else {
      const answerIndex = options.indexOf(String(answer))
      return answerIndex === correctAnswer
    }
  }, [])

  // Calculate topic progress for current question
  const getTopicProgress = useCallback(() => {
    if (!currentSession?.questions[currentSession.currentQuestionIndex] || 
        !userProgress.topicProgress[currentSession.questions[currentSession.currentQuestionIndex].topic]) {
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

  // Handle answer submission
  const handleAnswerSubmit = useCallback((answer: string | string[]) => {
    if (!currentSession) return

    const currentQuestion = currentSession.questions[currentSession.currentQuestionIndex]
    const isCorrect = checkAnswer(answer, currentQuestion.correctAnswer, currentQuestion.options)
    
    setIsAnswerCorrect(isCorrect)
    setCurrentAnswer(answer)
    setHasAnsweredCurrentQuestion(true)
    
    // Provide feedback
    if (isCorrect) {
      feedback.onCorrectAnswer()
    } else {
      feedback.onIncorrectAnswer()
    }
    
    // Auto-advance after delay
    setTimeout(() => {
      if (currentSession.currentQuestionIndex < currentSession.questions.length - 1) {
        nextQuestion()
        setHasAnsweredCurrentQuestion(false)
        setCurrentAnswer(null)
        setIsAnswerCorrect(false)
      }
    }, 2000)
  }, [currentSession, checkAnswer, feedback, nextQuestion])

  // Handle question navigation
  const handleQuestionChange = useCallback((direction: 'next' | 'previous' | number) => {
    if (typeof direction === 'number') {
      goToQuestion(direction)
    } else if (direction === 'next') {
      nextQuestion()
    } else {
      previousQuestion()
    }
    
    setHasAnsweredCurrentQuestion(false)
    setCurrentAnswer(null)
    setIsAnswerCorrect(false)
  }, [goToQuestion, nextQuestion, previousQuestion])

  // Toggle pause state
  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev)
    feedback.onTogglePause()
  }, [feedback])

  // Keyboard shortcuts
  const shortcuts = useMemo(() => createQuizShortcuts({
    onNext: () => handleQuestionChange('next'),
    onPrevious: () => handleQuestionChange('previous'),
    onTogglePause: togglePause,
    onShowHelp: () => setShowKeyboardHelp(true)
  }), [handleQuestionChange, togglePause])

  useKeyboardShortcuts(shortcuts)

  // Initialize component
  useEffect(() => {
    if (currentSession) {
      setIsInitializing(false)
    }
  }, [currentSession])

  // Show loading state
  if (isInitializing || !currentSession) {
    return <QuizSkeleton />
  }

  const currentQuestion = currentSession.questions[currentSession.currentQuestionIndex]
  const topicProgress = getTopicProgress()
  const isLastQuestion = currentSession.currentQuestionIndex === currentSession.questions.length - 1

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        {/* Header with progress and timer */}
        <motion.header 
          className="mb-6"
          variants={itemVariants}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Progress indicator */}
            <div className="flex items-center gap-4">
              <motion.div
                variants={cardVariants}
                whileHover="hover"
              >
                <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {currentSession.currentQuestionIndex + 1}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          of {currentSession.questions.length}
                        </div>
                      </div>
                      <div className="w-24 h-2 bg-secondary/20 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-primary rounded-full"
                          initial={{ width: 0 }}
                          animate={{ 
                            width: `${((currentSession.currentQuestionIndex + 1) / currentSession.questions.length) * 100}%` 
                          }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Topic progress */}
              {topicProgress && (
                <motion.div
                  variants={cardVariants}
                  whileHover="hover"
                >
                  <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-foreground">
                          {topicProgress.accuracy.toFixed(0)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Topic Accuracy
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Timer and controls */}
            <div className="flex items-center gap-3">
              {mode === 'timed' && timeRemaining !== null && (
                <motion.div
                  variants={cardVariants}
                  whileHover="hover"
                  className={showTimeWarning ? "animate-pulse" : ""}
                >
                  <Card className={`bg-card/80 backdrop-blur-sm border-border/50 ${showTimeWarning ? 'border-orange-500/50' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Clock className={`w-5 h-5 ${showTimeWarning ? 'text-orange-500' : 'text-muted-foreground'}`} />
                        <div className="text-center">
                          <div className={`text-lg font-mono font-bold ${showTimeWarning ? 'text-orange-500' : 'text-foreground'}`}>
                            {formatTime(timeRemaining)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Remaining
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Pause/Resume button */}
              <motion.div
                variants={cardVariants}
                whileHover="hover"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={togglePause}
                  className="h-12 w-12 p-0 rounded-full"
                  aria-label={isPaused ? "Resume quiz" : "Pause quiz"}
                >
                  <AnimatePresence mode="wait">
                    {isPaused ? (
                      <motion.div
                        key="play"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Play className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="pause"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Pause className="w-5 h-5" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>

              {/* Save status */}
              <SaveStatusIndicator status={saveStatus} lastSaved={lastSaved} />
            </div>
          </div>
        </motion.header>

        {/* Main quiz content */}
        <motion.main 
          className="space-y-6"
          variants={itemVariants}
        >
          {/* Question card */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
          >
            <QuestionCard
              question={currentQuestion}
              onAnswerSubmit={handleAnswerSubmit}
              hasAnswered={hasAnsweredCurrentQuestion}
              isCorrect={isAnswerCorrect}
              currentAnswer={currentAnswer}
              mode={mode}
            />
          </motion.div>

          {/* Navigation */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
          >
            <QuizNavigation
              currentIndex={currentSession.currentQuestionIndex}
              totalQuestions={currentSession.questions.length}
              onNavigate={handleQuestionChange}
              onComplete={handleComplete}
              isLastQuestion={isLastQuestion}
              hasAnswered={hasAnsweredCurrentQuestion}
            />
          </motion.div>

          {/* Question navigation map */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
          >
            <QuestionNavigationMap
              questions={currentSession.questions}
              currentIndex={currentSession.currentQuestionIndex}
              onNavigate={handleQuestionChange}
              userAnswers={currentSession.userAnswers}
            />
          </motion.div>
        </motion.main>

        {/* Feedback overlay */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              variants={feedbackVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
            >
              <FeedbackOverlay
                isCorrect={isAnswerCorrect}
                correctAnswer={currentQuestion.correctAnswer}
                explanation={currentQuestion.explanation}
                onClose={() => setShowFeedback(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Keyboard shortcuts help */}
        <AnimatePresence>
          {showKeyboardHelp && (
            <motion.div
              variants={feedbackVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
            >
              <KeyboardShortcutsHelp
                shortcuts={shortcuts}
                onClose={() => setShowKeyboardHelp(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Time warning */}
        <AnimatePresence>
          {showTimeWarning && (
            <motion.div
              variants={feedbackVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-4 right-4 z-50"
            >
              <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    <div>
                      <div className="font-semibold text-orange-800 dark:text-orange-200">
                        Time Warning
                      </div>
                      <div className="text-sm text-orange-600 dark:text-orange-400">
                        Less than 5 minutes remaining!
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}