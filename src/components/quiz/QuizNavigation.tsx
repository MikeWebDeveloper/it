'use client'

import { ChevronLeft, ChevronRight, Check, SkipForward, ArrowLeft, ArrowRight, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface QuizNavigationProps {
  currentIndex: number
  totalQuestions: number
  onNavigate: (direction: 'next' | 'previous' | number) => void
  onComplete: () => void
  isLastQuestion: boolean
  hasAnswered: boolean
  className?: string
}

// Animation variants for consistent animations
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20
    }
  },
  hover: {
    scale: 1.05,
    y: -2,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  },
  tap: {
    scale: 0.95,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 20
    }
  }
}

const dotVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: (index: number) => ({
    scale: 1,
    opacity: 1,
    transition: {
      delay: index * 0.05,
      duration: 0.3,
      type: "spring",
      stiffness: 200,
      damping: 20
    }
  }),
  active: {
    scale: [1, 1.3, 1],
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 15
    }
  }
}

export function QuizNavigation({
  currentIndex,
  totalQuestions,
  onNavigate,
  onComplete,
  isLastQuestion,
  hasAnswered,
  className
}: QuizNavigationProps) {
  const isFirstQuestion = currentIndex === 0

  const handlePrevious = () => {
    if (!isFirstQuestion) {
      onNavigate('previous')
    }
  }

  const handleNext = () => {
    if (!isLastQuestion) {
      onNavigate('next')
    }
  }

  const handleComplete = () => {
    if (hasAnswered) {
      onComplete()
    }
  }

  const getQuestionIndicators = () => {
    const maxVisible = Math.min(totalQuestions, 12)
    const indicators = []
    
    if (totalQuestions <= maxVisible) {
      // Show all questions for small sets
      for (let i = 0; i < totalQuestions; i++) {
        indicators.push({
          index: i,
          isCurrent: i === currentIndex,
          isAnswered: false // You can add logic to track answered questions
        })
      }
    } else {
      // For large sets, show strategic points
      const start = Math.max(0, currentIndex - 2)
      const end = Math.min(totalQuestions - 1, currentIndex + 2)
      
      // Always show first
      indicators.push({ index: 0, isCurrent: false, isAnswered: false })
      
      if (start > 1) {
        indicators.push({ index: -1, isCurrent: false, isAnswered: false }) // Ellipsis
      }
      
      // Show questions around current
      for (let i = start; i <= end; i++) {
        if (i > 0 && i < totalQuestions - 1) {
          indicators.push({ index: i, isCurrent: i === currentIndex, isAnswered: false })
        }
      }
      
      if (end < totalQuestions - 2) {
        indicators.push({ index: -1, isCurrent: false, isAnswered: false }) // Ellipsis
      }
      
      // Always show last
      indicators.push({ index: totalQuestions - 1, isCurrent: false, isAnswered: false })
    }
    
    return indicators
  }

  const indicators = getQuestionIndicators()

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        "flex items-center justify-between gap-2 md:gap-4 w-full max-w-2xl mx-auto",
        "px-2 py-3 md:px-4 md:py-6",
        className
      )}
    >
      {/* Previous button */}
      <motion.div
        variants={itemVariants}
        whileHover="hover"
        whileTap="tap"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={isFirstQuestion}
          className={cn(
            "flex items-center gap-1 md:gap-2 min-h-[40px] md:min-h-[48px] px-2 md:px-4",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "text-xs md:text-sm group",
            "transition-all duration-200"
          )}
          aria-label="Go to previous question"
        >
          <motion.div
            animate={{ x: isFirstQuestion ? 0 : [-2, 0] }}
            transition={{ duration: 0.2 }}
          >
            <ChevronLeft className="w-3 h-3 md:w-4 md:h-4" />
          </motion.div>
          <span className="hidden sm:inline">Previous</span>
          <span className="sm:hidden">Prev</span>
        </Button>
      </motion.div>

      {/* Question indicator dots */}
      <motion.div 
        className="flex items-center gap-0.5 md:gap-1 flex-1 justify-center max-w-xs overflow-x-auto px-1"
        variants={itemVariants}
      >
        <div className="flex items-center gap-1 md:gap-2">
          {indicators.map((indicator, i) => (
            <motion.div
              key={`indicator-${i}`}
              custom={i}
              variants={dotVariants}
              animate={indicator.isCurrent ? "active" : "visible"}
              className="flex items-center justify-center"
            >
              {indicator.index === -1 ? (
                <span className="text-muted-foreground text-xs">...</span>
              ) : (
                <motion.div
                  className={cn(
                    "w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-all duration-200 cursor-pointer",
                    "hover:scale-125 hover:shadow-sm",
                    {
                      'bg-primary shadow-md': indicator.isCurrent,
                      'bg-muted-foreground/40 hover:bg-muted-foreground/60': !indicator.isCurrent,
                    }
                  )}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onNavigate(indicator.index)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Go to question ${indicator.index + 1}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onNavigate(indicator.index)
                    }
                  }}
                />
              )}
            </motion.div>
          ))}
        </div>
        
        {/* Question counter */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="flex items-center gap-1 ml-2 md:ml-3"
        >
          <Target className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
          <span className="text-[10px] md:text-xs text-muted-foreground font-medium">
            {currentIndex + 1}/{totalQuestions}
          </span>
        </motion.div>
      </motion.div>

      {/* Next/Complete button */}
      <motion.div
        variants={itemVariants}
        whileHover="hover"
        whileTap="tap"
      >
        {isLastQuestion ? (
          <Button
            size="sm"
            onClick={handleComplete}
            disabled={!hasAnswered}
            className={cn(
              "flex items-center gap-1 md:gap-2 min-h-[40px] md:min-h-[48px] px-2 md:px-4",
              "bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted",
              "text-xs md:text-sm group",
              "transition-all duration-200"
            )}
            aria-label="Complete quiz"
          >
            <motion.div
              animate={{ scale: hasAnswered ? [1, 1.1, 1] : 1 }}
              transition={{ duration: 0.5, repeat: hasAnswered ? Infinity : 0, repeatDelay: 1 }}
            >
              <Check className="w-3 h-3 md:w-4 md:h-4" />
            </motion.div>
            <span>Complete</span>
          </Button>
        ) : (
          <Button
            variant={hasAnswered ? "default" : "outline"}
            size="sm"
            onClick={handleNext}
            disabled={!hasAnswered}
            className={cn(
              "flex items-center gap-1 md:gap-2 min-h-[40px] md:min-h-[48px] px-2 md:px-4",
              "text-xs md:text-sm",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted",
              !hasAnswered && "text-muted-foreground",
              "transition-all duration-200"
            )}
            aria-label={hasAnswered ? "Go to next question" : "Skip question"}
          >
            {hasAnswered ? (
              <>
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">Next</span>
                <motion.div
                  animate={{ x: [0, 2, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                >
                  <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
                </motion.div>
              </>
            ) : (
              <>
                <span className="hidden sm:inline">Skip</span>
                <span className="sm:hidden">Skip</span>
                <motion.div
                  animate={{ x: [0, 3, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1.5 }}
                >
                  <SkipForward className="w-3 h-3 md:w-4 md:h-4" />
                </motion.div>
              </>
            )}
          </Button>
        )}
      </motion.div>
    </motion.div>
  )
}