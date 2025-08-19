'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuizStore } from '@/store/useQuizStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CategorySelector } from '@/components/quiz/CategorySelector'
import { QuizConfig, QuizConfiguration } from '@/components/quiz/QuizConfig'
import { PageTransition } from '@/components/animations/PageTransition'
import { AnimatedThemeToggle } from '@/components/ui/AnimatedThemeToggle'
import { StudySessionTimer } from '@/components/ui/StudySessionTimer'
import { CategoryCarousel } from '@/components/ui/CategoryCarousel'
import { motion } from 'framer-motion'
import { 
  Trophy, 
  Target, 
  BookOpen,
  BarChart3,
  RotateCcw,
  GraduationCap
} from 'lucide-react'
import questionData from '@/data/questions.json'
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
      <PageTransition>
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
              <AnimatedThemeToggle variant="compact" size="sm" />
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
      </PageTransition>
    )
  }

  if (viewMode === 'config') {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <QuizConfig
              selectedCategories={selectedCategories}
              onStartQuiz={handleStartConfiguredQuiz}
              onBack={() => setViewMode('categories')}
            />
          </div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-2 md:py-4 max-w-4xl">
        {/* Main navigation - accessible header */}
        <header role="banner" className="mb-2 md:mb-4">
          <nav role="navigation" aria-label="Main navigation" className="flex items-center justify-between mb-4">
            <div></div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/stats')}
                className="rounded-full"
                aria-label="View statistics and progress"
              >
                <BarChart3 className="w-4 h-4" />
              </Button>
              <AnimatedThemeToggle variant="compact" size="sm" />
            </div>
          </nav>
        </header>

        {/* Main content area */}
        <main id="main-content" role="main" tabIndex={-1}>
        {/* App introduction section */}
        <section aria-labelledby="app-title" className="text-center mb-2 md:mb-4">
          
          <h1 id="app-title" className="text-3xl md:text-4xl font-bold mb-1 md:mb-2 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            IT Quiz App
          </h1>
          <p className="text-base md:text-lg text-muted-foreground mb-2 md:mb-4">
            Master IT Essentials with 350+ interactive questions
          </p>
          <CategoryCarousel 
            categories={questionData.exam_info.topics}
            maxVisible={4}
            className="max-w-md mx-auto"
            onCategoryClick={(category) => {
              console.log('Selected category:', category)
            }}
          />
        </section>

        {/* Progress Overview & Study Timer */}
        {userProgress.totalSessionsCompleted > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <section aria-labelledby="progress-heading" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4 mb-2 md:mb-4">
              <h2 id="progress-heading" className="sr-only">Your Learning Progress</h2>
              {/* Progress Overview */}
              <div className="md:col-span-1 xl:col-span-2">
                <Card className="h-full bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 dark:from-yellow-950/20 dark:via-amber-950/20 dark:to-orange-950/20 border-yellow-200 dark:border-yellow-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                      <motion.div
                        animate={{ rotate: [0, -10, 10, -10, 0] }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                      >
                        <Trophy className="w-5 h-5 text-yellow-500" />
                      </motion.div>
                      Your Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <motion.div 
                        className="text-center"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4, duration: 0.3 }}
                      >
                        <motion.div 
                          className="text-2xl font-bold text-primary"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.6, duration: 0.5 }}
                        >
                          {userProgress.totalSessionsCompleted}
                        </motion.div>
                        <div className="text-xs text-muted-foreground">Quizzes Completed</div>
                      </motion.div>
                      <motion.div 
                        className="text-center"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 0.3 }}
                      >
                        <motion.div 
                          className="text-2xl font-bold text-green-600"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.7, duration: 0.5 }}
                        >
                          {userProgress.streak}
                        </motion.div>
                        <div className="text-xs text-muted-foreground">Day Streak</div>
                      </motion.div>
                      <motion.div 
                        className="text-center"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6, duration: 0.3 }}
                      >
                        <motion.div 
                          className="text-2xl font-bold text-blue-600"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.8, duration: 0.5 }}
                        >
                          {totalTopics}
                        </motion.div>
                        <div className="text-xs text-muted-foreground">Topics Studied</div>
                      </motion.div>
                      <motion.div 
                        className="text-center"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7, duration: 0.3 }}
                      >
                        <motion.div 
                          className="text-2xl font-bold text-purple-600"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.9, duration: 0.5 }}
                        >
                          {masteredTopics}
                        </motion.div>
                        <div className="text-xs text-muted-foreground">Topics Mastered</div>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Study Session Timer */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <StudySessionTimer 
                  showStats={true}
                  className="h-full bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20 border-indigo-200 dark:border-indigo-800"
                />
              </motion.div>
            </section>
          </motion.div>
        )}

        {/* Study Timer for new users */}
        {userProgress.totalSessionsCompleted === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-2 md:mb-4"
          >
            <section aria-labelledby="study-timer-heading">
              <h2 id="study-timer-heading" className="sr-only">Study Session Timer</h2>
              <StudySessionTimer 
                showStats={true}
                className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20 border-indigo-200 dark:border-indigo-800"
              />
            </section>
          </motion.div>
        )}

        {/* Learn & Practice Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <section aria-labelledby="learn-practice-heading">
          <Card className="mb-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <BookOpen className="w-5 h-5" />
                </motion.div>
                <h2 id="learn-practice-heading">Learn & Practice</h2>
              </CardTitle>
              <p className="text-sm text-blue-600 dark:text-blue-300">
                Study and learn with immediate feedback and no pressure
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                >
                  <Button
                    onClick={() => router.push('/learn')}
                    className="h-20 md:h-24 p-2 md:p-3 flex flex-col items-center gap-1 md:gap-2 bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg w-full"
                    variant="outline"
                    aria-label="Access learning hub - Browse questions with answers revealed"
                  >
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <GraduationCap className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                    </motion.div>
                    <div className="text-center">
                      <div className="text-xs md:text-sm font-semibold text-blue-800 dark:text-blue-200">Learning Hub</div>
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        Browse & Study
                      </div>
                    </div>
                  </Button>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                >
                  <Button
                    onClick={() => router.push('/flashcards')}
                    className="h-20 md:h-24 p-2 md:p-3 flex flex-col items-center gap-1 md:gap-2 bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg w-full"
                    variant="outline"
                  >
                    <motion.div
                      whileHover={{ scale: 1.2, rotateY: 180 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <RotateCcw className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
                    </motion.div>
                    <div className="text-center">
                      <div className="text-xs md:text-sm font-semibold text-blue-800 dark:text-blue-200">Flashcards</div>
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        Swipe to Flip
                      </div>
                    </div>
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                >
                  <Button
                    onClick={() => handleQuickStart('review')}
                    className="h-20 md:h-24 p-2 md:p-3 flex flex-col items-center gap-1 md:gap-2 bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg w-full"
                    variant="outline"
                  >
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: -10 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <Trophy className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                    </motion.div>
                    <div className="text-center">
                      <div className="text-xs md:text-sm font-semibold text-blue-800 dark:text-blue-200">Review Mode</div>
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        Weak Areas
                      </div>
                    </div>
                  </Button>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7, duration: 0.4 }}
                >
                  <Button
                    onClick={() => router.push('/practice-config')}
                    className="h-20 md:h-24 p-2 md:p-3 flex flex-col items-center gap-1 md:gap-2 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-emerald-200 dark:border-emerald-800 hover:from-emerald-100 hover:to-teal-100 dark:hover:from-emerald-950/40 dark:hover:to-teal-950/40 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg w-full"
                    variant="outline"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
                    </motion.div>
                    <div className="text-center">
                      <div className="text-xs md:text-sm font-semibold text-emerald-800 dark:text-emerald-200">Practice Mode</div>
                      <div className="text-xs text-emerald-600 dark:text-emerald-400">
                        Choose Topics
                      </div>
                    </div>
                  </Button>
                </motion.div>
                  
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8, duration: 0.4 }}
                >
                  <Button
                    onClick={() => router.push('/adaptive-practice')}
                    className="h-20 md:h-24 p-2 md:p-3 flex flex-col items-center gap-1 md:gap-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-950/40 dark:hover:to-pink-950/40 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg w-full"
                    variant="outline"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <div className="w-5 h-5 md:w-6 md:h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-xs font-bold">AI</span>
                      </div>
                    </motion.div>
                    <div className="text-center">
                      <div className="text-xs md:text-sm font-semibold text-purple-800 dark:text-purple-200">Adaptive Practice</div>
                      <div className="text-xs text-purple-600 dark:text-purple-400">
                        AI-Powered
                      </div>
                    </div>
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
          </section>
        </motion.div>

        {/* Test Your Knowledge Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <section aria-labelledby="test-knowledge-heading">
          <Card className="mb-4 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/20 dark:via-emerald-950/20 dark:to-teal-950/20 border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 15 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Target className="w-5 h-5" />
                </motion.div>
                <h2 id="test-knowledge-heading">Test Your Knowledge</h2>
              </CardTitle>
              <p className="text-sm text-green-600 dark:text-green-300">
                Challenge yourself with timed quizzes and exams
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7, duration: 0.4 }}
                >
                  <Button
                    onClick={() => handleQuickStart('timed')}
                    className="h-20 md:h-auto p-3 md:p-4 flex flex-col items-center gap-2 md:gap-3 bg-white dark:bg-gray-900 border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950/40 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg w-full"
                    variant="outline"
                  >
                    <motion.div
                      whileHover={{ scale: 1.3, rotate: 360 }}
                      transition={{ type: "spring", stiffness: 400, duration: 0.8 }}
                    >
                      <Target className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
                    </motion.div>
                    <div className="text-center">
                      <div className="text-sm md:text-base font-semibold text-green-800 dark:text-green-200">Quick Quiz</div>
                      <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                        10 questions • 15 minutes
                      </div>
                    </div>
                  </Button>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8, duration: 0.4 }}
                >
                  <Button 
                    onClick={handleCustomQuiz}
                    className="h-20 md:h-auto p-3 md:p-4 flex flex-col items-center gap-2 md:gap-3 bg-white dark:bg-gray-900 border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950/40 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg w-full"
                    variant="outline"
                  >
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: [0, -10, 10, -10, 0] }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <Trophy className="w-6 h-6 md:w-8 md:h-8 text-emerald-600" />
                    </motion.div>
                    <div className="text-center">
                      <div className="text-sm md:text-base font-semibold text-green-800 dark:text-green-200">Custom Exam</div>
                      <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                        Choose topics • Set difficulty
                      </div>
                    </div>
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
          </section>
        </motion.div>
        </main>
        </div>
      </div>
    </PageTransition>
  )
}