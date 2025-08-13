'use client'

import { cn } from '@/lib/utils'
import { Check, X } from 'lucide-react'

interface AnswerChoiceProps {
  option: string
  isSelected: boolean
  isCorrect?: boolean
  isMultipleChoice: boolean
  onClick: () => void
  disabled?: boolean
}

export function AnswerChoice({
  option,
  isSelected,
  isCorrect,
  isMultipleChoice,
  onClick,
  disabled = false
}: AnswerChoiceProps) {
  const getVariant = () => {
    if (disabled && isCorrect !== undefined) {
      // Show results
      if (isCorrect) {
        return 'correct'
      } else if (isSelected && !isCorrect) {
        return 'incorrect'
      } else if (isSelected) {
        return 'selected'
      }
      return 'default'
    } else if (isSelected) {
      return 'selected'
    }
    return 'default'
  }

  const variant = getVariant()

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        // Base styles
        "w-full p-3 md:p-4 text-left rounded-lg border-2 transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "active:scale-[0.98] disabled:active:scale-100",
        
        // Mobile-optimized touch targets
        "min-h-[56px] touch-manipulation",
        
        // Variant styles
        {
          // Default state
          'border-border bg-card hover:bg-accent hover:border-accent-foreground/20': 
            variant === 'default' && !disabled,
          
          // Selected state (during quiz)
          'border-primary bg-primary/10 text-primary-foreground': 
            variant === 'selected' && !disabled,
          
          // Correct answer (results view)
          'border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100': 
            variant === 'correct',
          
          // Incorrect answer (results view)
          'border-red-500 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100': 
            variant === 'incorrect',
          
          // Disabled state
          'cursor-not-allowed opacity-75': disabled,
          
          // Interactive states
          'cursor-pointer': !disabled,
        }
      )}
    >
      <div className="flex items-start space-x-3">
        {/* Selection indicator */}
        <div className={cn(
          "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5",
          {
            // Multiple choice - squares
            'rounded-sm': isMultipleChoice,
            
            // Default state
            'border-muted-foreground/40': variant === 'default',
            
            // Selected state
            'border-primary bg-primary text-primary-foreground': 
              variant === 'selected' && !disabled,
            
            // Correct state
            'border-green-500 bg-green-500 text-white': variant === 'correct',
            
            // Incorrect state  
            'border-red-500 bg-red-500 text-white': variant === 'incorrect',
          }
        )}>
          {variant === 'selected' && !disabled && (
            <div className="w-2 h-2 bg-current rounded-full" />
          )}
          {variant === 'correct' && (
            <Check className="w-4 h-4" />
          )}
          {variant === 'incorrect' && (
            <X className="w-4 h-4" />
          )}
        </div>
        
        {/* Option text */}
        <span className="flex-1 leading-relaxed">
          {option}
        </span>
      </div>
    </button>
  )
}