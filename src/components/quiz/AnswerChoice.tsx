'use client'

import { cn } from '@/lib/utils'
import { Check, X, Circle, Square } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface AnswerChoiceProps {
  option: string
  isSelected: boolean
  isCorrect?: boolean
  isMultipleChoice: boolean
  onClick: () => void
  disabled?: boolean
}

// Animation variants for consistent animations
const containerVariants = {
  hidden: { opacity: 0, x: -20, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15
    }
  },
  hover: {
    scale: 1.02,
    y: -2,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 20
    }
  },
  tap: {
    scale: 0.98,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 20
    }
  }
}

const indicatorVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 20
    }
  },
  selected: {
    scale: [1, 1.2, 1],
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 15
    }
  }
}

const iconVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 20
    }
  }
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

  const ariaLabel = isMultipleChoice 
    ? `${isSelected ? 'Deselect' : 'Select'} answer: ${option}`
    : `Select answer: ${option}`
    
  const ariaDescription = disabled && isCorrect !== undefined
    ? isCorrect 
      ? 'Correct answer'
      : isSelected 
        ? 'Incorrect answer'
        : 'Not selected'
    : undefined

  const getIndicatorIcon = () => {
    if (isMultipleChoice) {
      return Square
    }
    return Circle
  }

  const IndicatorIcon = getIndicatorIcon()

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      role={isMultipleChoice ? "checkbox" : "radio"}
      aria-checked={isSelected}
      aria-label={ariaLabel}
      aria-describedby={ariaDescription ? `answer-description-${option.slice(0, 10)}` : undefined}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      whileHover={!disabled ? "hover" : undefined}
      whileTap={!disabled ? "tap" : undefined}
      className={cn(
        // Base styles
        "w-full p-3 md:p-4 text-left rounded-lg border-2 transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        
        // Mobile-optimized touch targets
        "min-h-[56px] touch-manipulation",
        
        // Variant styles
        {
          // Default state
          'border-border bg-card hover:bg-accent hover:border-accent-foreground/20': 
            variant === 'default' && !disabled,
          
          // Selected state (during quiz)
          'border-primary bg-primary/10 text-primary-foreground shadow-md': 
            variant === 'selected' && !disabled,
          
          // Correct answer (results view)
          'border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100 shadow-lg': 
            variant === 'correct',
          
          // Incorrect answer (results view)
          'border-red-500 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100 shadow-lg': 
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
        <motion.div 
          className={cn(
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
          )}
          variants={indicatorVariants}
          animate={isSelected ? "selected" : "visible"}
        >
          <AnimatePresence mode="wait">
            {variant === 'selected' && !disabled && (
              <motion.div
                key="selected-dot"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="w-2 h-2 bg-current rounded-full"
              />
            )}
            {variant === 'correct' && (
              <motion.div
                key="correct-check"
                variants={iconVariants}
                initial="hidden"
                animate="visible"
              >
                <Check className="w-4 h-4" />
              </motion.div>
            )}
            {variant === 'incorrect' && (
              <motion.div
                key="incorrect-x"
                variants={iconVariants}
                initial="hidden"
                animate="visible"
              >
                <X className="w-4 h-4" />
              </motion.div>
            )}
            {variant === 'default' && !isSelected && (
              <motion.div
                key="default-icon"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ duration: 0.2 }}
              >
                <IndicatorIcon className="w-4 h-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        {/* Option text */}
        <motion.span 
          className="flex-1 leading-relaxed"
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {option}
        </motion.span>
      </div>
      
      {/* Screen reader description for result state */}
      {ariaDescription && (
        <span 
          id={`answer-description-${option.slice(0, 10)}`}
          className="sr-only"
        >
          {ariaDescription}
        </span>
      )}

      {/* Subtle background animation for selected state */}
      {isSelected && !disabled && (
        <motion.div
          className="absolute inset-0 bg-primary/5 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        />
      )}

      {/* Ripple effect for interactions */}
      {!disabled && (
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          initial={{ scale: 0, opacity: 0 }}
          whileTap={{ scale: 1, opacity: 0.1 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </motion.button>
  )
}