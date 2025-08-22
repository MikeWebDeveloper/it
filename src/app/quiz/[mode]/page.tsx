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
  const { currentSession, allQuestions, startQuiz } = useQuizStore()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [redirecting, setRedirecting] = useState(false)


  // Check for session and handle initialization
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
      
      // If no session after loading, try to create one or redirect
      if (!currentSession) {
        // Try to create a session if we have questions and the mode matches
        if (allQuestions.length > 0 && resolvedParams.mode) {
          // Create a default session for the current mode
          const questions = allQuestions.slice(0, 10) // Take first 10 questions
          const timeLimit = resolvedParams.mode === 'timed' ? 15 * 60 * 1000 : undefined
          
          startQuiz(resolvedParams.mode, questions, timeLimit)
          
          // Give the store time to update
          setTimeout(() => {
            if (!useQuizStore.getState().currentSession) {
              setRedirecting(true)
              setTimeout(() => {
                router.push('/')
              }, 2000)
            }
          }, 100)
        } else {
          // No questions available, redirect to home
          setRedirecting(true)
          setTimeout(() => {
            router.push('/')
          }, 2000)
        }
      }
    }, 800) // Brief loading period

    return () => clearTimeout(timer)
  }, [currentSession, allQuestions, resolvedParams.mode, startQuiz, router])

  // Show loading skeleton initially
  if (isLoading) {
    return <QuizSkeleton variant="connecting" />
  }

  // Show redirect message if no session and redirecting
  if (!currentSession && redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 bg-muted/20 rounded-full flex items-center justify-center">
            <div className="text-4xl">🚀</div>
          </div>
          <h2 className="text-2xl font-semibold">Starting Quiz Session</h2>
          <p className="text-muted-foreground">
            Redirecting you to start a new quiz...
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Redirecting in a moment...</span>
          </div>
        </div>
      </div>
    )
  }

  // Show session creation message if no session but not redirecting yet
  if (!currentSession && !redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 bg-muted/20 rounded-full flex items-center justify-center">
            <div className="text-4xl">🚀</div>
          </div>
          <h2 className="text-2xl font-semibold">Starting Quiz Session</h2>
          <p className="text-muted-foreground">
            Creating your quiz session...
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Please wait...</span>
          </div>
        </div>
      </div>
    )
  }

  // Show results if quiz is completed
  if (currentSession?.completed) {
    return <QuizResults />
  }

  // Show quiz engine if session exists
  if (currentSession) {
    return <QuizEngine mode={resolvedParams.mode} />
  }

  // Fallback - should not reach here
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p>Something went wrong. Please try again.</p>
        <button 
          onClick={() => router.push('/')}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Go Home
        </button>
      </div>
    </div>
  )
}