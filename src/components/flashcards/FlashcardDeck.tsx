'use client'

import { useState, useEffect, useCallback } from 'react'
import { Question } from '@/types/quiz'
import { FlashcardCard } from './FlashcardCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Shuffle, 
  RotateCcw, 
  Home, 
  Trophy,
  Clock,
  Target
} from 'lucide-react'
import { useSwipeable } from 'react-swipeable'

interface FlashcardDeckProps {
  questions: Question[]
  title: string
  onComplete?: () => void
  onExit?: () => void
}

export function FlashcardDeck({ 
  questions, 
  title, 
  onComplete,
  onExit 
}: FlashcardDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [studiedCards, setStudiedCards] = useState<Set<number>>(new Set())
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>(questions)
  const [startTime] = useState(Date.now())

  const currentQuestion = shuffledQuestions[currentIndex]

  // Swipe handlers for mobile
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (currentIndex < shuffledQuestions.length - 1) {
        handleNext()
      }
    },
    onSwipedRight: () => {
      if (currentIndex > 0) {
        handlePrevious()
      }
    },
    trackMouse: true,
    preventScrollOnSwipe: true
  })

  const handleNext = useCallback(() => {
    setStudiedCards(prev => new Set(prev).add(currentIndex))
    
    if (currentIndex < shuffledQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setIsComplete(true)
      onComplete?.()
    }
  }, [currentIndex, shuffledQuestions.length, onComplete])

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }, [currentIndex])

  const handleShuffle = () => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5)
    setShuffledQuestions(shuffled)
    setCurrentIndex(0)
    setStudiedCards(new Set())
    setIsComplete(false)
  }

  const handleRestart = () => {
    setCurrentIndex(0)
    setStudiedCards(new Set())
    setIsComplete(false)
  }

  const studyTime = Math.floor((Date.now() - startTime) / 1000 / 60)
  const completionRate = (studiedCards.size / shuffledQuestions.length) * 100

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'ArrowLeft':
          event.preventDefault()
          handlePrevious()
          break
        case 'ArrowRight':
          event.preventDefault()
          handleNext()
          break
        case 'Space':
          event.preventDefault()
          // Flip functionality would be handled by the FlashcardCard
          break
        case 'Escape':
          event.preventDefault()
          onExit?.()
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentIndex, shuffledQuestions.length, onExit, handleNext, handlePrevious])

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4"
      >
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
            </motion.div>
            <CardTitle className="text-2xl font-bold">
              Deck Complete!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">
                You&apos;ve studied all {shuffledQuestions.length} cards
              </p>
              <Badge variant="secondary" className="text-sm">
                {title}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-2xl font-bold">{studyTime}</span>
                </div>
                <p className="text-xs text-muted-foreground">Minutes</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  <span className="text-2xl font-bold">{shuffledQuestions.length}</span>
                </div>
                <p className="text-xs text-muted-foreground">Cards Studied</p>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handleRestart} 
                className="w-full flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Study Again
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline"
                  onClick={handleShuffle}
                  className="flex items-center gap-2"
                >
                  <Shuffle className="w-4 h-4" />
                  Shuffle
                </Button>
                <Button 
                  variant="outline"
                  onClick={onExit}
                  className="flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Home
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div 
      {...swipeHandlers}
      className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8 px-4"
    >
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl font-bold mb-2">Flashcard Study</h1>
          <p className="text-muted-foreground">{title}</p>
          
          {/* Study Progress */}
          <div className="mt-4 flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>{studiedCards.size} studied</span>
            <span>•</span>
            <span>{shuffledQuestions.length - studiedCards.size} remaining</span>
            <span>•</span>
            <span>{Math.round(completionRate)}% complete</span>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between mb-6"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={onExit}
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Exit
          </Button>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShuffle}
              className="flex items-center gap-2"
            >
              <Shuffle className="w-4 h-4" />
              Shuffle
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRestart}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Restart
            </Button>
          </div>
        </motion.div>

        {/* Flashcard */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <FlashcardCard
              question={currentQuestion}
              currentIndex={currentIndex}
              totalQuestions={shuffledQuestions.length}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          </motion.div>
        </AnimatePresence>

        {/* Keyboard shortcuts hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-xs text-muted-foreground"
        >
          <p>
            Use arrow keys to navigate • Space to flip • Swipe on mobile • ESC to exit
          </p>
        </motion.div>
      </div>
    </div>
  )
}