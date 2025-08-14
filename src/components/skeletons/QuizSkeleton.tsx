'use client'

import { motion } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface QuizSkeletonProps {
  variant?: 'loading' | 'preparing' | 'connecting'
  className?: string
}

export function QuizSkeleton({ variant = 'loading', className }: QuizSkeletonProps) {
  const getMessage = () => {
    switch (variant) {
      case 'preparing':
        return 'Preparing your quiz...'
      case 'connecting':
        return 'Starting quiz session...'
      default:
        return 'Loading quiz...'
    }
  }

  return (
    <div className={`h-screen overflow-hidden bg-gradient-to-br from-background via-background to-muted/20 flex flex-col ${className}`}>
      <div className="container mx-auto px-4 flex flex-col h-full max-w-4xl">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between py-3 px-1 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-6 w-20 hidden sm:block" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-16 sm:hidden" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>

        {/* Navigation Map Skeleton */}
        <div className="flex-shrink-0 px-1 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 flex-wrap max-w-sm">
              {Array.from({ length: 10 }, (_, i) => (
                <Skeleton key={i} className="w-6 h-6 rounded-full" />
              ))}
            </div>
            <Skeleton className="h-5 w-8" />
          </div>
        </div>

        {/* Main Question Card Skeleton */}
        <div className="flex-1 overflow-y-auto pb-4 min-h-0">
          <Card className="h-full">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-3">
                <Skeleton className="h-6 w-24" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-12" />
                </div>
              </div>
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Question Text */}
              <div className="space-y-3">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-4/5" />
                <Skeleton className="h-6 w-3/4" />
              </div>

              {/* Answer Options */}
              <div className="space-y-3">
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-lg border">
                    <Skeleton className="w-6 h-6 rounded-full flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-full mb-1" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Skeleton */}
        <div className="flex-shrink-0 border-t border-border/50 pt-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-20" />
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <Skeleton key={i} className="w-2 h-2 rounded-full" />
              ))}
            </div>
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
      </div>

      {/* Loading Message */}
      <motion.div
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-card border shadow-lg rounded-lg px-4 py-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <motion.div
            className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <span>{getMessage()}</span>
        </div>
      </motion.div>
    </div>
  )
}

export function QuestionCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-6 w-24" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-12" />
          </div>
        </div>
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Question Text */}
        <div className="space-y-3">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-4/5" />
        </div>

        {/* Answer Options */}
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex items-start gap-3 p-4 rounded-lg border">
              <Skeleton className="w-6 h-6 rounded-full flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <Skeleton className="h-5 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}