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
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trophy, 
  Target, 
  BookOpen,
  BarChart3,
  RotateCcw,
  GraduationCap,
  Sparkles,
  Zap,
  Brain,
  Award
} from 'lucide-react'
import { loadQuestionsData } from '@/lib/loadQuestions'
import { shuffleArray } from '@/lib/utils'
import { QuestionData, Question } from '@/types/quiz'

type ViewMode = 'home' | 'categories' | 'config'

// Animation variants for consistent animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 20
    }
  },
  hover: {
    y: -8,
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
}

const iconVariants = {
  hover: {
    scale: 1.2,
    rotate: [0, -10, 10, -10, 0],
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  }
}

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('home')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [questionData, setQuestionData] = useState<QuestionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const { 
    userProgress, 
    setQuestions, 
    startQuiz 
  } = useQuizStore()
  
  const router = useRouter()

  // Load questions on mount with loading state
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const data = await loadQuestionsData()
        setQuestionData(data)
        setQuestions(data.questions)
      } catch (error) {
        console.error('Failed to load questions:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [setQuestions])

  const handleQuickStart = (mode: 'practice' | 'timed' | 'review') => {
    if (!questionData) return
    
    const allQuestions = shuffleArray(questionData.questions).slice(0, 10)
    const timeLimit = mode === 'timed' ? 15 * 60 * 1000 : undefined
    startQuiz(mode, allQuestions, timeLimit)
    router.push(`/quiz/${mode}`)
  }

  const handleCustomQuiz = () => {
    if (questionData) {
      setSelectedCategories(questionData.exam_info.topics)
      setViewMode('categories')
    }
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
    if (!questionData) return
    
    const categoryQuestions = questionData.questions.filter((q: Question) => 
      config.categories.includes(q.topic)
    )
    
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

  // Loading state
  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-muted-foreground">Loading your learning experience...</p>
          </motion.div>
        </div>
      </PageTransition>
    )
  }

  if (viewMode === 'categories') {
    return (
      <PageTransition>
        <motion.div 
          className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            <motion.div className="mb-8" variants={itemVariants}>
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="outline"
                  onClick={() => setViewMode('home')}
                  className="group"
                >
                  <motion.span
                    className="inline-block mr-2"
                    whileHover={{ x: -3 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    ←
                  </motion.span>
                  Back to Home
                </Button>
                <AnimatedThemeToggle variant="compact" size="sm" />
              </div>
              <motion.h1 
                className="text-3xl font-bold mb-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Choose Your Topics
              </motion.h1>
              <motion.p 
                className="text-muted-foreground"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                Select the topics you want to study. You can choose individual topics or all of them.
              </motion.p>
            </motion.div>

            {questionData && (
              <motion.div variants={itemVariants}>
                <CategorySelector
                  onCategorySelect={handleCategorySelect}
                  selectedCategories={selectedCategories}
                  questionData={questionData}
                />
              </motion.div>
            )}

            <AnimatePresence>
              {selectedCategories.length > 0 && (
                <motion.div 
                  className="mt-8 flex justify-center"
                  variants={itemVariants}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Button 
                    size="lg" 
                    onClick={handleCategoriesNext}
                    className="group"
                  >
                    <motion.span
                      className="inline-block mr-2"
                      whileHover={{ x: 3 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      Continue to Quiz Configuration
                    </motion.span>
                    →
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </PageTransition>
    )
  }

  if (viewMode === 'config') {
    return (
      <PageTransition>
        <motion.div 
          className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <QuizConfig
              selectedCategories={selectedCategories}
              onStartQuiz={handleStartConfiguredQuiz}
              onBack={() => setViewMode('categories')}
            />
          </div>
        </motion.div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <motion.div 
        className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="container mx-auto px-4 py-2 md:py-4 max-w-4xl">
          {/* Main navigation - accessible header */}
          <motion.header 
            role="banner" 
            className="mb-2 md:mb-4"
            variants={itemVariants}
          >
            <nav 
              role="navigation" 
              aria-label="Main navigation" 
              className="flex items-center justify-between mb-4"
            >
              <div></div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/stats')}
                  className="rounded-full group"
                  aria-label="View statistics and progress"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <BarChart3 className="w-4 h-4" />
                  </motion.div>
                </Button>
                <AnimatedThemeToggle variant="compact" size="sm" />
              </div>
            </nav>
          </motion.header>

          {/* Main content area */}
          <main id="main-content" role="main" tabIndex={-1}>
            {/* App introduction section */}
            <motion.section 
              aria-labelledby="app-title" 
              className="text-center mb-2 md:mb-4"
              variants={itemVariants}
            >
              <motion.h1 
                id="app-title" 
                className="text-3xl md:text-4xl font-bold mb-1 md:mb-2 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                IT Quiz App
              </motion.h1>
              <motion.p 
                className="text-base md:text-lg text-muted-foreground mb-2 md:mb-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                Master IT Essentials with 350+ interactive questions
              </motion.p>
              {questionData && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  <CategoryCarousel 
                    categories={questionData.exam_info.topics}
                    maxVisible={4}
                    className="max-w-md mx-auto"
                    onCategoryClick={(category) => {
                      console.log('Selected category:', category)
                    }}
                  />
                </motion.div>
              )}
            </motion.section>

            {/* Progress Overview & Study Timer */}
            <AnimatePresence>
              {userProgress.totalSessionsCompleted > 0 && (
                <motion.section 
                  aria-labelledby="progress-heading" 
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4 mb-2 md:mb-4"
                  variants={itemVariants}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <h2 id="progress-heading" className="sr-only">Your Learning Progress</h2>
                  {/* Progress Overview */}
                  <motion.div 
                    className="md:col-span-1 xl:col-span-2"
                    variants={cardVariants}
                    whileHover="hover"
                  >
                    <Card className="h-full bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 dark:from-yellow-950/20 dark:via-amber-950/20 dark:to-orange-950/20 border-yellow-200 dark:border-yellow-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                          <motion.div
                            animate={{ rotate: [0, -10, 10, -10, 0] }}
                            transition={{ duration: 0.5, delay: 0.5, repeat: Infinity, repeatDelay: 2 }}
                          >
                            <Trophy className="w-5 h-5 text-yellow-500" />
                          </motion.div>
                          Your Progress
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {[
                            { value: userProgress.totalSessionsCompleted, label: 'Quizzes Completed', color: 'text-primary', delay: 0.4 },
                            { value: userProgress.streak, label: 'Day Streak', color: 'text-green-600', delay: 0.5 },
                            { value: totalTopics, label: 'Topics Studied', color: 'text-blue-600', delay: 0.6 },
                            { value: masteredTopics, label: 'Topics Mastered', color: 'text-purple-600', delay: 0.7 }
                          ].map((item, index) => (
                            <motion.div 
                              key={index}
                              className="text-center"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: item.delay, duration: 0.3 }}
                            >
                              <motion.div 
                                className={`text-2xl font-bold ${item.color}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: item.delay + 0.2, duration: 0.5 }}
                              >
                                {item.value}
                              </motion.div>
                              <div className="text-xs text-muted-foreground">{item.label}</div>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                  
                  {/* Study Session Timer */}
                  <motion.div
                    variants={cardVariants}
                    whileHover="hover"
                  >
                    <StudySessionTimer 
                      showStats={true}
                      className="h-full bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20 border-indigo-200 dark:border-indigo-800"
                    />
                  </motion.div>
                </motion.section>
              )}
            </AnimatePresence>

            {/* Study Timer for new users */}
            <AnimatePresence>
              {userProgress.totalSessionsCompleted === 0 && (
                <motion.section 
                  aria-labelledby="study-timer-heading"
                  className="mb-2 md:mb-4"
                  variants={itemVariants}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <h2 id="study-timer-heading" className="sr-only">Study Session Timer</h2>
                  <StudySessionTimer 
                    showStats={true}
                    className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20 border-indigo-200 dark:border-indigo-800"
                  />
                </motion.section>
              )}
            </AnimatePresence>

            {/* Learn & Practice Section */}
            <motion.section 
              aria-labelledby="learn-practice-heading"
              variants={itemVariants}
            >
              <motion.div
                variants={cardVariants}
                whileHover="hover"
              >
                <Card className="mb-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                      <motion.div
                        variants={iconVariants}
                        whileHover="hover"
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
                      {[
                        {
                          icon: GraduationCap,
                          label: 'Learning Hub',
                          subtitle: 'Browse & Study',
                          color: 'blue',
                          onClick: () => router.push('/learn'),
                          delay: 0.4
                        },
                        {
                          icon: RotateCcw,
                          label: 'Flashcards',
                          subtitle: 'Swipe to Flip',
                          color: 'indigo',
                          onClick: () => router.push('/flashcards'),
                          delay: 0.5
                        },
                        {
                          icon: Trophy,
                          label: 'Review Mode',
                          subtitle: 'Weak Areas',
                          onClick: () => handleQuickStart('review'),
                          color: 'purple',
                          delay: 0.6
                        },
                        {
                          icon: BookOpen,
                          label: 'Practice Mode',
                          subtitle: 'Choose Topics',
                          onClick: () => router.push('/practice-config'),
                          color: 'emerald',
                          delay: 0.7
                        },
                        {
                          icon: Brain,
                          label: 'Adaptive Practice',
                          subtitle: 'AI-Powered',
                          onClick: () => router.push('/adaptive-practice'),
                          color: 'purple',
                          delay: 0.8
                        }
                      ].map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: item.delay, duration: 0.4 }}
                        >
                          <Button
                            onClick={item.onClick}
                            className={`h-20 md:h-24 p-2 md:p-3 flex flex-col items-center gap-1 md:gap-2 bg-white dark:bg-gray-900 border-${item.color}-200 dark:border-${item.color}-800 hover:bg-${item.color}-50 dark:hover:bg-${item.color}-950/40 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg w-full group`}
                            variant="outline"
                            aria-label={`${item.label} - ${item.subtitle}`}
                          >
                            <motion.div
                              whileHover={{ scale: 1.2, rotate: item.icon === RotateCcw ? 180 : 10 }}
                              transition={{ type: "spring", stiffness: 400 }}
                              className={`w-5 h-5 md:w-6 md:h-6 text-${item.color}-600`}
                            >
                              {item.icon === Brain ? (
                                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 rounded-md flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">AI</span>
                                </div>
                              ) : (
                                <item.icon className="w-full h-full" />
                              )}
                            </motion.div>
                            <div className="text-center">
                              <div className={`text-xs md:text-sm font-semibold text-${item.color}-800 dark:text-${item.color}-200`}>
                                {item.label}
                              </div>
                              <div className={`text-xs text-${item.color}-600 dark:text-${item.color}-400`}>
                                {item.subtitle}
                              </div>
                            </div>
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.section>

            {/* Test Your Knowledge Section */}
            <motion.section 
              aria-labelledby="test-knowledge-heading"
              variants={itemVariants}
            >
              <motion.div
                variants={cardVariants}
                whileHover="hover"
              >
                <Card className="mb-4 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/20 dark:via-emerald-950/20 dark:to-teal-950/20 border-green-200 dark:border-green-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                      <motion.div
                        variants={iconVariants}
                        whileHover="hover"
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
                      {[
                        {
                          icon: Target,
                          label: 'Quick Quiz',
                          subtitle: '10 questions • 15 minutes',
                          onClick: () => handleQuickStart('timed'),
                          delay: 0.7,
                          animation: { scale: 1.3, rotate: 360 }
                        },
                        {
                          icon: Trophy,
                          label: 'Custom Exam',
                          subtitle: 'Choose topics • Set difficulty',
                          onClick: handleCustomQuiz,
                          delay: 0.8,
                          animation: { scale: 1.2, rotate: [0, -10, 10, -10, 0] }
                        }
                      ].map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: index === 0 ? -30 : 30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: item.delay, duration: 0.4 }}
                        >
                          <Button
                            onClick={item.onClick}
                            className="h-20 md:h-auto p-3 md:p-4 flex flex-col items-center gap-2 md:gap-3 bg-white dark:bg-gray-900 border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950/40 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg w-full group"
                            variant="outline"
                            aria-label={`${item.label} - ${item.subtitle}`}
                          >
                            <motion.div
                              whileHover={item.animation}
                              transition={{ type: "spring", stiffness: 400, duration: 0.8 }}
                              className="w-6 h-6 md:w-8 md:h-8 text-green-600"
                            >
                              <item.icon className="w-full h-full" />
                            </motion.div>
                            <div className="text-center">
                              <div className="text-sm md:text-base font-semibold text-green-800 dark:text-green-200">
                                {item.label}
                              </div>
                              <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                                {item.subtitle}
                              </div>
                            </div>
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.section>
          </main>
        </div>
      </motion.div>
    </PageTransition>
  )
}