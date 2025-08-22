'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuizStore } from '@/store/useQuizStore'
import { AdaptivePractice } from '@/components/practice/AdaptivePractice'
import { PageTransition } from '@/components/animations/PageTransition'
import { AnimatedThemeToggle } from '@/components/ui/AnimatedThemeToggle'
import { loadQuestionsData } from '@/lib/loadQuestions'

export default function AdaptivePracticePage() {
  const [mounted, setMounted] = useState(false)
  const { setQuestions } = useQuizStore()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    
    // Load and normalize questions data
    const loadQuestions = async () => {
      try {
        const questionsData = await loadQuestionsData()
        setQuestions(questionsData.questions)
      } catch (error) {
        console.error('Failed to load questions:', error)
      }
    }
    
    loadQuestions()
  }, [setQuestions])

  const handleBack = () => {
    router.push('/')
  }

  if (!mounted) {
    return null
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-8">
            <div className="flex items-center justify-end mb-4">
              <AnimatedThemeToggle variant="compact" size="sm" />
            </div>
          </div>

          <AdaptivePractice onBack={handleBack} />
        </div>
      </div>
    </PageTransition>
  )
}