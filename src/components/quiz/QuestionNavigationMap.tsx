'use client'

import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Circle, Dot } from 'lucide-react'
import { Question } from '@/types/quiz'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface QuestionNavigationMapProps {
  questions: Question[]
  currentIndex: number
  answers: Record<number, string | string[]>
  onNavigate: (index: number) => void
  showResults?: boolean
  compact?: boolean
  className?: string
}

export function QuestionNavigationMap({
  questions,
  currentIndex,
  answers,
  onNavigate,
  showResults = false,
  compact = false,
  className
}: QuestionNavigationMapProps) {
  
  const getQuestionStatus = (question: Question, index: number) => {
    const hasAnswer = answers[question.id] !== undefined && answers[question.id] !== null && answers[question.id] !== ''
    const isCurrent = index === currentIndex
    
    if (!hasAnswer) {
      return isCurrent ? 'current-unanswered' : 'unanswered'
    }
    
    if (showResults) {
      const userAnswer = answers[question.id]
      let isCorrect = false
      
      if (Array.isArray(question.correctAnswer)) {
        if (Array.isArray(userAnswer)) {
          // Convert user answers to indices for comparison
          const userIndices = userAnswer.map(ans => question.options.indexOf(ans))
          const correctIndices = question.correctAnswer as number[]
          isCorrect = userIndices.length === correctIndices.length &&
                      userIndices.every(idx => correctIndices.includes(idx))
        }
      } else {
        // Convert user answer to index for comparison
        const userIndex = question.options.indexOf(String(userAnswer))
        isCorrect = userIndex === (question.correctAnswer as number)
      }
      
      return isCurrent 
        ? (isCorrect ? 'current-correct' : 'current-incorrect')
        : (isCorrect ? 'correct' : 'incorrect')
    }
    
    return isCurrent ? 'current-answered' : 'answered'
  }
  
  const getStatusStyles = (status: string) => {
    const baseStyles = 'relative transition-all duration-200 border-2'
    
    switch (status) {
      case 'current-unanswered':
        return `${baseStyles} bg-primary text-primary-foreground border-primary ring-2 ring-primary/50 scale-110 shadow-lg`
      case 'current-answered':
        return `${baseStyles} bg-blue-500 text-white border-blue-500 ring-2 ring-blue-500/50 scale-110 shadow-lg`
      case 'current-correct':
        return `${baseStyles} bg-green-500 text-white border-green-500 ring-2 ring-green-500/50 scale-110 shadow-lg`
      case 'current-incorrect':
        return `${baseStyles} bg-red-500 text-white border-red-500 ring-2 ring-red-500/50 scale-110 shadow-lg`
      case 'answered':
        return `${baseStyles} bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 hover:bg-blue-200 dark:hover:bg-blue-900/50`
      case 'correct':
        return `${baseStyles} bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-900/50`
      case 'incorrect':
        return `${baseStyles} bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700 hover:bg-red-200 dark:hover:bg-red-900/50`
      default: // unanswered
        return `${baseStyles} bg-muted text-muted-foreground border-muted-foreground/30 hover:bg-muted/80`
    }
  }
  
  const getStatusIcon = (status: string) => {
    if (status.includes('correct')) return <CheckCircle className="w-3 h-3" />
    if (status.includes('incorrect')) return <XCircle className="w-3 h-3" />
    if (status.includes('answered')) return <Dot className="w-3 h-3" />
    return <Circle className="w-3 h-3" />
  }
  
  const totalAnswered = questions.filter(q => answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== '').length
  const progressPercentage = (totalAnswered / questions.length) * 100
  
  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="flex items-center gap-1 flex-wrap max-w-sm">
          {questions.map((question, index) => {
            const status = getQuestionStatus(question, index)
            return (
              <TooltipProvider key={question.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      onClick={() => onNavigate(index)}
                      className={cn(
                        'w-6 h-6 rounded-full text-xs font-medium flex items-center justify-center',
                        getStatusStyles(status)
                      )}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      layout
                    >
                      {index + 1}
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">
                      Question {index + 1}: {question.topic}
                      {status.includes('answered') && ' (Answered)'}
                      {status.includes('correct') && ' (Correct)'}
                      {status.includes('incorrect') && ' (Incorrect)'}
                      {status.includes('current') && ' (Current)'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )
          })}
        </div>
        <Badge variant="outline" className="text-xs">
          {totalAnswered}/{questions.length}
        </Badge>
      </div>
    )
  }
  
  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Question Map</h3>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {totalAnswered}/{questions.length} answered
          </Badge>
          <div className="text-xs text-muted-foreground">
            {Math.round(progressPercentage)}%
          </div>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-muted rounded-full h-1.5">
        <motion.div
          className="bg-primary rounded-full h-1.5"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      
      {/* Question grid */}
      <div className="grid grid-cols-10 sm:grid-cols-12 md:grid-cols-15 lg:grid-cols-20 gap-1">
        {questions.map((question, index) => {
          const status = getQuestionStatus(question, index)
          return (
            <TooltipProvider key={question.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    onClick={() => onNavigate(index)}
                    className={cn(
                      'aspect-square rounded-md text-xs font-medium flex items-center justify-center min-w-[28px] min-h-[28px]',
                      getStatusStyles(status)
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    layout
                  >
                    {showResults && (status.includes('correct') || status.includes('incorrect')) ? (
                      getStatusIcon(status)
                    ) : (
                      index + 1
                    )}
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-xs space-y-1">
                    <p className="font-medium">Question {index + 1}</p>
                    <p className="text-muted-foreground">{question.topic}</p>
                    {status.includes('answered') && !showResults && (
                      <p className="text-blue-400">Answered</p>
                    )}
                    {status.includes('correct') && (
                      <p className="text-green-400">Correct ✓</p>
                    )}
                    {status.includes('incorrect') && (
                      <p className="text-red-400">Incorrect ✗</p>
                    )}
                    {status.includes('current') && (
                      <p className="text-primary">Current question</p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        })}
      </div>
      
      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-muted border border-muted-foreground/30" />
          <span>Unanswered</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700" />
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-primary border border-primary" />
          <span>Current</span>
        </div>
        {showResults && (
          <>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700" />
              <span>Correct</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700" />
              <span>Incorrect</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}