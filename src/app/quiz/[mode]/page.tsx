'use client'

import { use, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuizStore } from '@/store/useQuizStore'
import { QuizEngine } from '@/components/quiz/QuizEngine'
import { QuizResults } from '@/components/quiz/QuizResults'
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

  // If no active session, redirect to home
  useEffect(() => {
    if (!currentSession) {
      router.push('/')
    }
  }, [currentSession, router])

  if (!currentSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">No Active Quiz</h2>
          <p className="text-muted-foreground">
            Please start a quiz from the home page.
          </p>
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