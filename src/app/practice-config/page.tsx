'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuizStore } from '@/store/useQuizStore'
import { Button } from '@/components/ui/button'
import { CategorySelector } from '@/components/quiz/CategorySelector'
import { QuizConfig, QuizConfiguration } from '@/components/quiz/QuizConfig'
import { PageTransition } from '@/components/animations/PageTransition'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import questionData from '@/data/questions.json'
import { shuffleArray } from '@/lib/utils'
import { QuestionData } from '@/types/quiz'

type ViewMode = 'categories' | 'config'

export default function PracticeConfigPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('categories')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)
  
  const { startQuiz } = useQuizStore()
  const { setTheme, theme } = useTheme()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleCategorySelect = (categories: string[]) => {
    setSelectedCategories(categories)
  }

  const handleCategoriesNext = () => {
    if (selectedCategories.length > 0) {
      setViewMode('config')
    }
  }

  const handleStartConfiguredQuiz = (config: QuizConfiguration) => {
    // Filter questions by selected categories
    const categoryQuestions = questionData.questions.filter(q => 
      config.categories.includes(q.topic)
    )
    
    // Shuffle if needed and limit to configured count
    const questions = config.randomOrder 
      ? shuffleArray(categoryQuestions).slice(0, config.questionCount)
      : categoryQuestions.slice(0, config.questionCount)
    
    startQuiz(config.mode, questions, config.timeLimit)
    router.push(`/quiz/${config.mode}`)
  }

  const handleBackToCategories = () => {
    setViewMode('categories')
  }

  const handleBackToHome = () => {
    router.push('/')
  }

  if (viewMode === 'config') {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="outline"
                  onClick={handleBackToCategories}
                >
                  ← Back to Topics
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="rounded-full"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <QuizConfig
              selectedCategories={selectedCategories}
              onStartQuiz={handleStartConfiguredQuiz}
              onBack={handleBackToCategories}
            />
          </div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                onClick={handleBackToHome}
              >
                ← Back to Home
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="rounded-full"
                suppressHydrationWarning
              >
                {mounted ? (
                  theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />
                ) : (
                  <Sun className="w-4 h-4" />
                )}
              </Button>
            </div>
            <h1 className="text-3xl font-bold mb-2">Choose Your Topics</h1>
            <p className="text-muted-foreground">
              Select the topics you want to study. You can choose individual topics or all of them.
            </p>
          </div>

          <CategorySelector
            onCategorySelect={handleCategorySelect}
            selectedCategories={selectedCategories}
            questionData={questionData as QuestionData}
          />

          {selectedCategories.length > 0 && (
            <div className="mt-8 flex justify-center">
              <Button size="lg" onClick={handleCategoriesNext}>
                Continue to Quiz Configuration
              </Button>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}