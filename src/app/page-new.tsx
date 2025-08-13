'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuizStore } from '@/store/useQuizStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CategorySelector } from '@/components/quiz/CategorySelector'
import { QuizConfig, QuizConfiguration } from '@/components/quiz/QuizConfig'
import { 
  Trophy, 
  Target, 
  BookOpen,
  Sun,
  Moon,
  BarChart3
} from 'lucide-react'
import questionData from '@/data/questions.json'
import { useTheme } from 'next-themes'
import { shuffleArray } from '@/lib/utils'

type ViewMode = 'home' | 'categories' | 'config'

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('home')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  
  const { 
    userProgress, 
    setQuestions, 
    startQuiz 
  } = useQuizStore()
  
  const { setTheme, theme } = useTheme()
  const router = useRouter()

  // Load questions on mount
  useEffect(() => {
    setQuestions(questionData.questions)
  }, [setQuestions])

  const handleQuickStart = (mode: 'practice' | 'timed' | 'review') => {
    // Quick start with all topics and default settings
    const allQuestions = shuffleArray(questionData.questions).slice(0, 10)
    const timeLimit = mode === 'timed' ? 15 * 60 * 1000 : undefined
    startQuiz(mode, allQuestions, timeLimit)
    router.push(`/quiz/${mode}`)
  }

  const handleCustomQuiz = () => {
    setSelectedCategories(questionData.exam_info.topics) // Select all by default
    setViewMode('categories')
  }

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

  const totalTopics = Object.keys(userProgress.topicProgress).length
  const masteredTopics = Object.values(userProgress.topicProgress).filter(
    topic => topic.masteryLevel === 'advanced'
  ).length

  if (viewMode === 'categories') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                onClick={() => setViewMode('home')}
              >
                ← Back to Home
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
            <h1 className="text-3xl font-bold mb-2">Choose Your Topics</h1>
            <p className="text-muted-foreground">
              Select the topics you want to study. You can choose individual topics or all of them.
            </p>
          </div>

          <CategorySelector
            onCategorySelect={handleCategorySelect}
            selectedCategories={selectedCategories}
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
    )
  }

  if (viewMode === 'config') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <QuizConfig
            selectedCategories={selectedCategories}
            onStartQuiz={handleStartConfiguredQuiz}
            onBack={() => setViewMode('categories')}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div></div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/stats')}
                className="rounded-full"
              >
                <BarChart3 className="w-4 h-4" />
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
          
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            IT Quiz App
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            Master IT Essentials with {questionData.exam_info.total_questions} interactive questions
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {questionData.exam_info.topics.slice(0, 5).map(topic => (
              <Badge key={topic} variant="outline" className="text-xs">
                {topic}
              </Badge>
            ))}
            {questionData.exam_info.topics.length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{questionData.exam_info.topics.length - 5} more
              </Badge>
            )}
          </div>
        </div>

        {/* Progress Overview */}
        {userProgress.totalSessionsCompleted > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Your Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {userProgress.totalSessionsCompleted}
                  </div>
                  <div className="text-xs text-muted-foreground">Quizzes Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {userProgress.streak}
                  </div>
                  <div className="text-xs text-muted-foreground">Day Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {totalTopics}
                  </div>
                  <div className="text-xs text-muted-foreground">Topics Studied</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {masteredTopics}
                  </div>
                  <div className="text-xs text-muted-foreground">Topics Mastered</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Start Options */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Quick Start
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Jump right into a quiz with default settings
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => handleQuickStart('practice')}
                className="h-auto p-4 flex flex-col items-center gap-2"
                variant="outline"
              >
                <BookOpen className="w-6 h-6" />
                <div className="text-center">
                  <div className="font-semibold">Practice Mode</div>
                  <div className="text-xs text-muted-foreground">10 questions • No time limit</div>
                </div>
              </Button>
              
              <Button
                onClick={() => handleQuickStart('timed')}
                className="h-auto p-4 flex flex-col items-center gap-2"
                variant="outline"
              >
                <Target className="w-6 h-6" />
                <div className="text-center">
                  <div className="font-semibold">Timed Quiz</div>
                  <div className="text-xs text-muted-foreground">10 questions • 15 minutes</div>
                </div>
              </Button>
              
              <Button
                onClick={() => handleQuickStart('review')}
                className="h-auto p-4 flex flex-col items-center gap-2"
                variant="outline"
              >
                <Trophy className="w-6 h-6" />
                <div className="text-center">
                  <div className="font-semibold">Review Mode</div>
                  <div className="text-xs text-muted-foreground">Focus on weak areas</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Custom Quiz */}
        <Card className="bg-gradient-to-r from-primary/10 via-blue-500/10 to-purple-500/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Custom Quiz
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Choose specific topics, question count, difficulty, and timing
            </p>
          </CardHeader>
          <CardContent>
            <Button 
              size="lg" 
              onClick={handleCustomQuiz}
              className="w-full"
            >
              Create Custom Quiz
            </Button>
            <div className="mt-3 text-center">
              <p className="text-xs text-muted-foreground">
                Select from {questionData.exam_info.topics.length} topics • Configure difficulty • Set custom timing
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}