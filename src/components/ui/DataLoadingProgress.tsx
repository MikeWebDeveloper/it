'use client'

import React from 'react'
import { Progress } from '@/components/ui/progress'
import { Card } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

interface DataLoadingProgressProps {
  progress: number
  isLoading: boolean
  error: string | null
  questionsLoaded: number
  totalQuestions?: number
  className?: string
}

export function DataLoadingProgress({
  progress,
  isLoading,
  error,
  questionsLoaded,
  totalQuestions,
  className = ''
}: DataLoadingProgressProps) {
  if (error) {
    return (
      <Card className={`p-4 border-red-200 bg-red-50 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-red-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-900">Loading Error</p>
            <p className="text-xs text-red-700">{error}</p>
          </div>
        </div>
      </Card>
    )
  }

  if (!isLoading && progress >= 100) {
    return null // Hide when complete
  }

  return (
    <Card className={`p-4 border-blue-200 bg-blue-50 ${className}`}>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900">
              Loading Questions Database...
            </p>
            <p className="text-xs text-blue-700">
              {questionsLoaded > 0 && totalQuestions 
                ? `${questionsLoaded} of ${totalQuestions} questions loaded`
                : 'Preparing question database...'
              }
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-blue-900">
              {Math.round(progress)}%
            </p>
          </div>
        </div>
        
        <Progress 
          value={progress} 
          className="h-2"
          aria-label={`Loading progress: ${Math.round(progress)}%`}
        />
        
        {progress > 0 && progress < 100 && (
          <div className="flex justify-between text-xs text-blue-600">
            <span>Processing chunks...</span>
            <span>This optimizes performance</span>
          </div>
        )}
      </div>
    </Card>
  )
}

// Hook for easy integration
export function useDataLoadingProgress() {
  const [progress, setProgress] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [questionsLoaded, setQuestionsLoaded] = React.useState(0)
  const [totalQuestions, setTotalQuestions] = React.useState<number | undefined>(undefined)

  const updateProgress = React.useCallback((newProgress: number) => {
    setProgress(newProgress)
  }, [])

  const setLoadingState = React.useCallback((loading: boolean) => {
    setIsLoading(loading)
    if (loading) {
      setProgress(0)
      setError(null)
      setQuestionsLoaded(0)
    }
  }, [])

  const setErrorState = React.useCallback((errorMessage: string) => {
    setError(errorMessage)
    setIsLoading(false)
  }, [])

  const updateQuestionCount = React.useCallback((loaded: number, total?: number) => {
    setQuestionsLoaded(loaded)
    if (total !== undefined) {
      setTotalQuestions(total)
    }
  }, [])

  const reset = React.useCallback(() => {
    setProgress(0)
    setIsLoading(false)
    setError(null)
    setQuestionsLoaded(0)
    setTotalQuestions(undefined)
  }, [])

  return {
    progress,
    isLoading,
    error,
    questionsLoaded,
    totalQuestions,
    updateProgress,
    setLoadingState,
    setErrorState,
    updateQuestionCount,
    reset,
    // Component with current state
    ProgressComponent: (props: Partial<DataLoadingProgressProps>) => (
      <DataLoadingProgress
        progress={progress}
        isLoading={isLoading}
        error={error}
        questionsLoaded={questionsLoaded}
        totalQuestions={totalQuestions}
        {...props}
      />
    )
  }
}