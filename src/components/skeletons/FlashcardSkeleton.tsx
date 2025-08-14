'use client'

import { motion } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface FlashcardSkeletonProps {
  variant?: 'loading' | 'preparing' | 'shuffling'
  className?: string
}

export function FlashcardSkeleton({ variant = 'loading', className }: FlashcardSkeletonProps) {
  const getMessage = () => {
    switch (variant) {
      case 'preparing':
        return 'Preparing flashcards...'
      case 'shuffling':
        return 'Shuffling questions...'
      default:
        return 'Loading flashcards...'
    }
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4 ${className}`}>
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
          <Skeleton className="h-8 w-48 mx-auto mb-2" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>

        {/* Main Flashcard */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, rotateY: -10 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <Card className="relative min-h-[400px] md:min-h-[500px] shadow-2xl border-2">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-5 h-5" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-12" />
                </div>
              </div>
              <Skeleton className="h-6 w-24 mx-auto" />
            </CardHeader>
            
            <CardContent className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="space-y-4 w-full max-w-lg">
                {/* Question skeleton */}
                <div className="space-y-3">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-4/5 mx-auto" />
                  <Skeleton className="h-6 w-3/4 mx-auto" />
                </div>
                
                {/* Answer options skeleton */}
                <div className="space-y-3 mt-8">
                  {Array.from({ length: 4 }, (_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                    >
                      <Skeleton className="h-12 w-full rounded-lg" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Progress and Navigation */}
        <div className="mt-6 space-y-4">
          {/* Progress */}
          <div className="text-center">
            <Skeleton className="h-2 w-full mb-2" />
            <Skeleton className="h-4 w-20 mx-auto" />
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-24" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        {/* Controls hint */}
        <div className="mt-6 text-center space-y-2">
          <Skeleton className="h-3 w-48 mx-auto" />
          <Skeleton className="h-3 w-40 mx-auto" />
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

export function CategorySelectorSkeleton() {
  return (
    <div className="space-y-6">
      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5" />
            <Skeleton className="h-6 w-40" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-20" />
                <div className="space-y-1">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 9 }, (_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="h-full hover:shadow-lg transition-all cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-full mb-2" />
                    <Skeleton className="h-4 w-4/5 mb-3" />
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}