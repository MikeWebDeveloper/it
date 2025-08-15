'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuizStore } from '@/store/useQuizStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageTransition } from '@/components/animations/PageTransition'
import { AnimatedThemeToggle } from '@/components/ui/AnimatedThemeToggle'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  Search, 
  Target, 
  BarChart3,
  ArrowLeft,
  Grid3X3,
  Filter,
  Clock,
  TrendingUp
} from 'lucide-react'
import questionData from '@/data/questions.json'

export default function LearnHub() {
  const router = useRouter()
  const { learningStats, setQuestions } = useQuizStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setQuestions(questionData.questions)
  }, [setQuestions])

  if (!mounted) return null

  const totalQuestions = questionData.questions.length
  const studiedQuestions = learningStats.totalQuestionsStudied
  const studyProgress = totalQuestions > 0 ? (studiedQuestions / totalQuestions) * 100 : 0
  const topicsWithProgress = Object.keys(learningStats.topicLearningProgress).length
  const totalTopics = questionData.exam_info.topics.length

  const learningSections = [
    {
      title: "Browse All Questions",
      description: "Explore all questions with answers revealed",
      icon: Grid3X3,
      color: "from-blue-500 to-blue-600",
      route: "/learn/browse",
      stats: `${totalQuestions} questions available`,
      actionText: "Start Browsing"
    },
    {
      title: "Topic Explorer",
      description: "Study questions organized by topic",
      icon: Filter,
      color: "from-green-500 to-green-600", 
      route: "/learn/topics",
      stats: `${totalTopics} topics to explore`,
      actionText: "Explore Topics"
    },
    {
      title: "Search Questions",
      description: "Find specific questions by keywords",
      icon: Search,
      color: "from-purple-500 to-purple-600",
      route: "/learn/search",
      stats: "Search across all content",
      actionText: "Search Now"
    },
    {
      title: "Study Progress",
      description: "Track your learning journey",
      icon: TrendingUp,
      color: "from-orange-500 to-orange-600",
      route: "/learn/progress",
      stats: `${studiedQuestions} questions studied`,
      actionText: "View Progress"
    }
  ]

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <header className="mb-8">
            <nav className="flex items-center justify-between mb-6">
              <Button
                variant="outline"
                onClick={() => router.push('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Home
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/stats')}
                  className="rounded-full"
                >
                  <BarChart3 className="w-4 h-4" />
                </Button>
                <AnimatedThemeToggle variant="compact" size="sm" />
              </div>
            </nav>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Learning Hub
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                Explore and study IT questions at your own pace
              </p>
              
              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4 justify-center">
                <Badge variant="outline" className="px-4 py-2 text-sm">
                  <BookOpen className="w-4 h-4 mr-2" />
                  {totalQuestions} Questions
                </Badge>
                <Badge variant="outline" className="px-4 py-2 text-sm">
                  <Target className="w-4 h-4 mr-2" />
                  {totalTopics} Topics
                </Badge>
                <Badge variant="outline" className="px-4 py-2 text-sm">
                  <Clock className="w-4 h-4 mr-2" />
                  {Math.round(learningStats.totalLearningTime)} min studied
                </Badge>
              </div>
            </motion.div>
          </header>

          {/* Progress Overview */}
          {studiedQuestions > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <Card className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20 border-indigo-200 dark:border-indigo-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-indigo-800 dark:text-indigo-200">
                    <TrendingUp className="w-5 h-5" />
                    Your Learning Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Questions Studied</span>
                        <span className="font-medium">{studiedQuestions}/{totalQuestions}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${studyProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {studyProgress.toFixed(1)}% completed
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {topicsWithProgress}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Topics Explored
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round((learningStats.totalCorrectInLearning / Math.max(learningStats.totalQuestionsStudied, 1)) * 100)}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Study Accuracy
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Learning Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {learningSections.map((section, index) => {
              const Icon = section.icon
              return (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * (index + 3), duration: 0.5 }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300 group cursor-pointer border-2 hover:border-primary/20">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg bg-gradient-to-r ${section.color} text-white group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors">
                            {section.title}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mb-3">
                            {section.description}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {section.stats}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Button 
                        className="w-full group-hover:scale-105 transition-transform duration-200"
                        onClick={() => router.push(section.route)}
                      >
                        {section.actionText}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {/* Quick Access */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8 text-center"
          >
            <Card className="bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/20 dark:via-yellow-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                  <div className="text-center sm:text-left">
                    <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-1">
                      Ready to test your knowledge?
                    </h3>
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      Take a quiz to see how much you&apos;ve learned
                    </p>
                  </div>
                  <Button 
                    onClick={() => router.push('/practice-config')}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                  >
                    Start Practice Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  )
}