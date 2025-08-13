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
      "flex items-center justify-between gap-4 w-full max-w-2xl mx-auto",
      "px-4 py-6",
      className
    )}>
      {/* Previous button */}
      <Button
        variant="outline"
        size="lg"
        onClick={onPrevious}
        disabled={isFirstQuestion}
        className={cn(
          "flex items-center gap-2 min-h-[48px]",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </Button>

      {/* Question indicator dots */}
      <div className="flex items-center gap-1 flex-1 justify-center max-w-xs overflow-x-auto">
        {Array.from({ length: Math.min(totalQuestions, 10) }, (_, i) => {
          // For large question sets, show first few, current area, and last few
          let questionIndex = i
          if (totalQuestions > 10) {
            if (i < 3) {
              questionIndex = i
            } else if (i >= 7) {
              questionIndex = totalQuestions - (10 - i)
            } else {
              // Show questions around current
              const start = Math.max(3, currentIndex - 1)
              questionIndex = start + (i - 3)
            }
          }

          return (
            <div
              key={questionIndex}
              className={cn(
                "w-2 h-2 rounded-full transition-colors duration-200",
                {
                  'bg-primary': questionIndex === currentIndex,
                  'bg-muted-foreground/40': questionIndex !== currentIndex,
                }
              )}
            />
          )
        })}
        {totalQuestions > 10 && (
          <span className="text-xs text-muted-foreground ml-1">
            {currentIndex + 1}/{totalQuestions}
          </span>
        )}
      </div>

      {/* Next/Complete button */}
      {isLastQuestion ? (
        <Button
          size="lg"
          onClick={onComplete}
          disabled={!hasAnswer}
          className={cn(
            "flex items-center gap-2 min-h-[48px]",
            "bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted"
          )}
        >
          <Check className="w-4 h-4" />
          Complete
        </Button>
      ) : (
        <Button
          variant={hasAnswer ? "default" : "outline"}
          size="lg"
          onClick={onNext}
          className={cn(
            "flex items-center gap-2 min-h-[48px]",
            !hasAnswer && "text-muted-foreground"
          )}
        >
          {hasAnswer ? (
            <>
              Next
              <ChevronRight className="w-4 h-4" />
            </>
          ) : (
            <>
              Skip
              <SkipForward className="w-4 h-4" />
            </>
          )}
        </Button>
      )}
    </div>
  )
}