'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuizStore } from '@/store/useQuizStore'
import { QuizEngine } from '@/components/quiz/QuizEngine'
import { QuizResults } from '@/components/quiz/QuizResults'
import { QuizSkeleton } from '@/components/skeletons'
import { QuizMode } from '@/types/quiz'

interface QuizPageProps {
  params: Promise<{
    mode: QuizMode
  }>
}

export default function QuizPage({ params }: QuizPageProps) {
  const resolvedParams = use(params)
  const { currentSession } = useQuizStore()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [redirecting, setRedirecting] = useState(false)

  // Simulate loading and check for session
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
      
      // If no session after loading, start redirect
      if (!currentSession) {
        setRedirecting(true)
        setTimeout(() => {
          router.push('/')
        }, 2000) // Give user time to see the message
      }
    }, 800) // Brief loading period

    return () => clearTimeout(timer)
  }, [currentSession, router])

  // Show loading skeleton initially
  if (isLoading) {
    return <QuizSkeleton variant="connecting" />
  }

  // Show redirect message
  if (!currentSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 bg-muted/20 rounded-full flex items-center justify-center">
            <div className="text-4xl">🚀</div>
          </div>
          <h2 className="text-2xl font-semibold">Starting Quiz Session</h2>
          <p className="text-muted-foreground">
            {redirecting 
              ? "Redirecting you to start a new quiz..." 
              : "Checking for active quiz session..."
            }
          </p>
          {redirecting && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span>Redirecting in a moment...</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Show results if quiz is completed
  if (currentSession.completed) {
    return <QuizResults />
  }

  return <QuizEngine mode={resolvedParams.mode} />
}