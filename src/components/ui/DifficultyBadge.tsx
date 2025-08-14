'use client'

import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Question } from '@/types/quiz'
import { 
  getQuestionDifficulty, 
  getDifficultyColor, 
  getDifficultyIcon, 
  DifficultyLevel 
} from '@/lib/difficulty'
import { cn } from '@/lib/utils'

interface DifficultyBadgeProps {
  question?: Question
  difficulty?: DifficultyLevel
  variant?: 'default' | 'compact' | 'detailed'
  className?: string
  animated?: boolean
}

export function DifficultyBadge({
  question,
  difficulty,
  variant = 'default',
  className,
  animated = true
}: DifficultyBadgeProps) {
  // Determine difficulty from question or use provided difficulty
  const difficultyLevel = difficulty || (question ? getQuestionDifficulty(question) : 'medium')
  const colorClass = getDifficultyColor(difficultyLevel)
  const icon = getDifficultyIcon(difficultyLevel)

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 400,
        damping: 25
      }
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2
      }
    }
  }

  const content = () => {
    switch (variant) {
      case 'compact':
        return (
          <span className="flex items-center gap-1">
            <span className="text-xs">{icon}</span>
          </span>
        )
      
      case 'detailed':
        return (
          <span className="flex items-center gap-1.5">
            <span className="text-xs">{icon}</span>
            <span className="text-xs font-medium capitalize">{difficultyLevel}</span>
            <span className="text-[10px] opacity-75">Level</span>
          </span>
        )
      
      default:
        return (
          <span className="flex items-center gap-1">
            <span className="text-xs">{icon}</span>
            <span className="text-xs font-medium capitalize">{difficultyLevel}</span>
          </span>
        )
    }
  }

  const Component = animated ? motion.div : 'div'
  const motionProps = animated ? {
    variants: badgeVariants,
    initial: 'hidden',
    animate: 'visible',
    whileHover: 'hover'
  } : {}

  return (
    <Component {...motionProps} className={className}>
      <Badge 
        variant="outline" 
        className={cn(
          'border select-none cursor-default',
          colorClass,
          variant === 'compact' && 'px-1.5 py-0.5 h-5',
          variant === 'detailed' && 'px-2 py-1',
        )}
      >
        {content()}
      </Badge>
    </Component>
  )
}

// Pre-built difficulty badge variants for common use cases
export function EasyBadge({ className, ...props }: Omit<DifficultyBadgeProps, 'difficulty'>) {
  return <DifficultyBadge {...props} difficulty="easy" className={className} />
}

export function MediumBadge({ className, ...props }: Omit<DifficultyBadgeProps, 'difficulty'>) {
  return <DifficultyBadge {...props} difficulty="medium" className={className} />
}

export function HardBadge({ className, ...props }: Omit<DifficultyBadgeProps, 'difficulty'>) {
  return <DifficultyBadge {...props} difficulty="hard" className={className} />
}