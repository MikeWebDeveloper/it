'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FlashcardDeck } from '@/components/flashcards/FlashcardDeck'
import { CategorySelector } from '@/components/quiz/CategorySelector'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageTransition } from '@/components/animations/PageTransition'
import { FlashcardSkeleton, CategorySelectorSkeleton } from '@/components/skeletons'
import { useTheme } from 'next-themes'
import { Sun, Moon, BookOpen, Target } from 'lucide-react'
import questionData from '@/data/questions.json'
import { shuffleArray } from '@/lib/utils'
import { Question } from '@/types/quiz'

type ViewMode = 'categories' | 'flashcards'

export default function FlashcardsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('categories')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [flashcardQuestions, setFlashcardQuestions] = useState<Question[]>([])
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  
  const { setTheme, theme } = useTheme()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    
    // Simulate loading categories and questions
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 900)

    return () => clearTimeout(timer)
  }, [])

  const handleCategorySelect = (categories: string[]) => {
    setSelectedCategories(categories)
  }

  const handleStartFlashcards = () => {
    if (selectedCategories.length === 0) return

    setIsTransitioning(true)
    
    // Simulate preparation time
    setTimeout(() => {
      // Filter questions by selected categories
      const categoryQuestions = questionData.questions.filter(q => 
        selectedCategories.includes(q.topic)
      )
      
      // Shuffle questions for variety
      const shuffledQuestions = shuffleArray(categoryQuestions)
      
      setFlashcardQuestions(shuffledQuestions)
      setViewMode('flashcards')
      setIsTransitioning(false)
    }, 1000)
  }

  const handleBackToCategories = () => {
    setViewMode('categories')
  }

  const handleBackToHome = () => {
    router.push('/')
  }

  const handleFlashcardsComplete = () => {
    // When flashcards are complete, go back to category selection
    setViewMode('categories')
  }

  const totalAvailableQuestions = selectedCategories.reduce((sum, category) => {
    return sum + questionData.questions.filter(q => q.topic === category).length
  }, 0)

  // Show loading skeleton when transitioning to flashcards
  if (isTransitioning) {
    return <FlashcardSkeleton variant="shuffling" />
  }

  if (viewMode === 'flashcards') {
    return (
      <FlashcardDeck
        questions={flashcardQuestions}
        title={`${selectedCategories.length > 1 ? 'Mixed Topics' : selectedCategories[0]} Flashcards`}
        onComplete={handleFlashcardsComplete}
        onExit={handleBackToCategories}
      />
    )
  }

  // Show loading skeleton initially
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-32 bg-muted rounded animate-pulse" />
              <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-muted rounded-lg animate-pulse" />
              <div>
                <div className="h-8 w-48 bg-muted rounded animate-pulse mb-2" />
                <div className="h-4 w-64 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </div>

          <CategorySelectorSkeleton />
        </div>
      </div>
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
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Flashcard Study</h1>
                <p className="text-muted-foreground">
                  Interactive study cards with question and answer reveals
                </p>
              </div>
            </div>
          </div>

          {/* Instructions Card */}
          <Card className="mb-8 bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-purple-950/20 border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                <Target className="w-5 h-5" />
                How Flashcards Work
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-semibold">Navigation</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Use arrow keys or swipe to navigate</li>
                    <li>• Click card or press Space to flip</li>
                    <li>• ESC key to exit anytime</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Study Tips</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Read the question carefully</li>
                    <li>• Think before revealing the answer</li>
                    <li>• Review explanations for deeper understanding</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Selection */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Choose Your Study Topics</h2>
            <p className="text-muted-foreground mb-6">
              Select the topics you want to study with flashcards. You can choose individual topics or multiple topics for mixed practice.
            </p>
          </div>

          <CategorySelector
            onCategorySelect={handleCategorySelect}
            selectedCategories={selectedCategories}
          />

          {/* Selected Categories Summary & Start Button */}
          {selectedCategories.length > 0 && (
            <Card className="mt-8 bg-gradient-to-r from-primary/10 via-blue-500/10 to-purple-500/10 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Ready to Study
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Selected Topics:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedCategories.map(category => (
                        <Badge key={category} variant="secondary">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      {totalAvailableQuestions} flashcards available across {selectedCategories.length} topic{selectedCategories.length !== 1 ? 's' : ''}
                    </p>
                    <Button 
                      size="lg" 
                      onClick={handleStartFlashcards}
                      className="px-8"
                    >
                      Start Flashcard Study
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageTransition>
  )
}