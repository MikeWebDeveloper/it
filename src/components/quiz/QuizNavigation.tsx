'use client'

import { ChevronLeft, ChevronRight, Check, SkipForward } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface QuizNavigationProps {
  currentIndex: number
  totalQuestions: number
  hasAnswer: boolean
  onPrevious: () => void
  onNext: () => void
  onComplete: () => void
  className?: string
}

export function QuizNavigation({
  currentIndex,
  totalQuestions,
  hasAnswer,
  onPrevious,
  onNext,
  onComplete,
  className
}: QuizNavigationProps) {
  const isLastQuestion = currentIndex === totalQuestions - 1
  const isFirstQuestion = currentIndex === 0

  return (
    <div className={cn(
      "flex items-center justify-between gap-2 md:gap-4 w-full max-w-2xl mx-auto",
      "px-2 py-3 md:px-4 md:py-6",
      className
    )}>
      {/* Previous button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onPrevious}
        disabled={isFirstQuestion}
        className={cn(
          "flex items-center gap-1 md:gap-2 min-h-[40px] md:min-h-[48px] px-2 md:px-4",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "text-xs md:text-sm"
        )}
      >
        <ChevronLeft className="w-3 h-3 md:w-4 md:h-4" />
        <span className="hidden sm:inline">Previous</span>
        <span className="sm:hidden">Prev</span>
      </Button>

      {/* Question indicator dots */}
      <div className="flex items-center gap-0.5 md:gap-1 flex-1 justify-center max-w-xs overflow-x-auto px-1">
        {Array.from({ length: Math.min(totalQuestions, 8) }, (_, i) => {
          // For large question sets, show first few, current area, and last few
          let questionIndex = i
          if (totalQuestions > 8) {
            if (i < 2) {
              questionIndex = i
            } else if (i >= 6) {
              questionIndex = totalQuestions - (8 - i)
            } else {
              // Show questions around current
              const start = Math.max(2, currentIndex - 1)
              questionIndex = start + (i - 2)
            }
          }

          return (
            <div
              key={`dot-${i}-${questionIndex}`}
              className={cn(
                "w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-colors duration-200",
                {
                  'bg-primary': questionIndex === currentIndex,
                  'bg-muted-foreground/40': questionIndex !== currentIndex,
                }
              )}
            />
          )
        })}
        <span className="text-[10px] md:text-xs text-muted-foreground ml-1">
          {currentIndex + 1}/{totalQuestions}
        </span>
      </div>

      {/* Next/Complete button */}
      {isLastQuestion ? (
        <Button
          size="sm"
          onClick={onComplete}
          disabled={!hasAnswer}
          className={cn(
            "flex items-center gap-1 md:gap-2 min-h-[40px] md:min-h-[48px] px-2 md:px-4",
            "bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted",
            "text-xs md:text-sm"
          )}
        >
          <Check className="w-3 h-3 md:w-4 md:h-4" />
          Complete
        </Button>
      ) : (
        <Button
          variant={hasAnswer ? "default" : "outline"}
          size="sm"
          onClick={onNext}
          disabled={!hasAnswer}
          className={cn(
            "flex items-center gap-1 md:gap-2 min-h-[40px] md:min-h-[48px] px-2 md:px-4",
            "text-xs md:text-sm",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted",
            !hasAnswer && "text-muted-foreground"
          )}
        >
          {hasAnswer ? (
            <>
              <span className="hidden sm:inline">Next</span>
              <span className="sm:hidden">Next</span>
              <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
            </>
          ) : (
            <>
              <span className="hidden sm:inline">Skip</span>
              <span className="sm:hidden">Skip</span>
              <SkipForward className="w-3 h-3 md:w-4 md:h-4" />
            </>
          )}
        </Button>
      )}
    </div>
  )
}