'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuizStore } from '@/store/useQuizStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { PageTransition } from '@/components/animations/PageTransition'
import { AnimatedThemeToggle } from '@/components/ui/AnimatedThemeToggle'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  BarChart3,
  TrendingUp,
  Clock,
  Target,
  BookOpen,
  Trophy,
  Calendar,
  Eye,
  Bookmark,
  CheckCircle,
  Star,
  Zap,
  Brain,
  Award,
  Monitor, 
  Shield, 
  Network, 
  Settings, 
  Smartphone, 
  Printer, 
  Cloud, 
  Terminal,
  Wrench,
  Computer,
  AlertTriangle
} from 'lucide-react'
import questionData from '@/data/questions.json'
import { cn } from '@/lib/utils'

const topicIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Hardware': Computer,
  'Hardware Safety': AlertTriangle,
  'Networking': Network,
  'Operating Systems': Monitor,
  'Security': Shield,
  'Troubleshooting': Wrench,
  'Printers': Printer,
  'Mobile Devices': Smartphone,
  'Cloud Computing': Cloud,
  'Command Line': Terminal,
  'General IT': Settings
}

const topicColors: Record<string, string> = {
  'Hardware': 'from-blue-500 to-blue-600',
  'Hardware Safety': 'from-red-500 to-red-600',
  'Networking': 'from-green-500 to-green-600',
  'Operating Systems': 'from-purple-500 to-purple-600',
  'Security': 'from-orange-500 to-orange-600',
  'Troubleshooting': 'from-yellow-500 to-yellow-600',
  'Printers': 'from-pink-500 to-pink-600',
  'Mobile Devices': 'from-indigo-500 to-indigo-600',
  'Cloud Computing': 'from-cyan-500 to-cyan-600',
  'Command Line': 'from-gray-500 to-gray-600',
  'General IT': 'from-slate-500 to-slate-600'
}

export default function LearningProgress() {
  const router = useRouter()
  const { learningStats, setQuestions } = useQuizStore()
  const [mounted, setMounted] = useState(false)
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Set<number>>(new Set())
  const [studiedQuestions, setStudiedQuestions] = useState<Set<number>>(new Set())

  useEffect(() => {
    setMounted(true)
    setQuestions(questionData.questions)
    
    // Load local data
    const savedBookmarks = localStorage.getItem('learn-bookmarks')
    const savedStudied = localStorage.getItem('learn-studied')
    
    if (savedBookmarks) {
      setBookmarkedQuestions(new Set(JSON.parse(savedBookmarks)))
    }
    if (savedStudied) {
      setStudiedQuestions(new Set(JSON.parse(savedStudied)))
    }
  }, [setQuestions])

  if (!mounted) return null

  const totalQuestions = questionData.questions.length
  const studiedCount = studiedQuestions.size
  const bookmarkedCount = bookmarkedQuestions.size
  const studyProgress = totalQuestions > 0 ? (studiedCount / totalQuestions) * 100 : 0

  // Calculate topic progress
  const topicProgress = questionData.exam_info.topics.map(topic => {
    const topicQuestions = questionData.questions.filter(q => q.topic === topic)
    const topicStudied = topicQuestions.filter(q => studiedQuestions.has(q.id)).length
    const topicBookmarked = topicQuestions.filter(q => bookmarkedQuestions.has(q.id)).length
    const learningData = learningStats.topicLearningProgress[topic]
    
    return {
      topic,
      totalQuestions: topicQuestions.length,
      studiedQuestions: topicStudied,
      bookmarkedQuestions: topicBookmarked,
      progress: topicQuestions.length > 0 ? (topicStudied / topicQuestions.length) * 100 : 0,
      timeSpent: learningData?.timeSpent || 0,
      accuracy: learningData?.questionsStudied > 0 
        ? ((learningData?.correctAnswers || 0) / learningData.questionsStudied) * 100 
        : 0,
      masteryLevel: learningData?.masteryLevel || 'beginner',
      lastStudied: learningData?.lastStudied
    }
  }).sort((a, b) => b.progress - a.progress)

  // Calculate achievements
  const achievements = [
    {
      id: 'first_study',
      title: 'First Steps',
      description: 'Studied your first question',
      icon: Star,
      earned: studiedCount > 0,
      progress: studiedCount > 0 ? 100 : 0
    },
    {
      id: 'bookmark_collector',
      title: 'Bookmark Collector',
      description: 'Bookmarked 10 questions',
      icon: Bookmark,
      earned: bookmarkedCount >= 10,
      progress: Math.min((bookmarkedCount / 10) * 100, 100)
    },
    {
      id: 'quarter_way',
      title: 'Quarter Master',
      description: 'Studied 25% of all questions',
      icon: Target,
      earned: studyProgress >= 25,
      progress: Math.min(studyProgress * 4, 100)
    },
    {
      id: 'half_way',
      title: 'Halfway Hero',
      description: 'Studied 50% of all questions',
      icon: Trophy,
      earned: studyProgress >= 50,
      progress: Math.min(studyProgress * 2, 100)
    },
    {
      id: 'completionist',
      title: 'Completionist',
      description: 'Studied all questions',
      icon: Award,
      earned: studyProgress >= 100,
      progress: studyProgress
    },
    {
      id: 'topic_explorer',
      title: 'Topic Explorer',
      description: 'Started studying 5 different topics',
      icon: Brain,
      earned: topicProgress.filter(t => t.studiedQuestions > 0).length >= 5,
      progress: Math.min((topicProgress.filter(t => t.studiedQuestions > 0).length / 5) * 100, 100)
    }
  ]

  const earnedAchievements = achievements.filter(a => a.earned)
  const nextAchievements = achievements.filter(a => !a.earned).slice(0, 3)

  const getMasteryColor = (level: string) => {
    switch (level) {
      case 'advanced': return 'text-green-600 dark:text-green-400'
      case 'intermediate': return 'text-yellow-600 dark:text-yellow-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getMasteryBadgeColor = (level: string) => {
    switch (level) {
      case 'advanced': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <header className="mb-8">
            <nav className="flex items-center justify-between mb-6">
              <Button
                variant="outline"
                onClick={() => router.push('/learn')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Learning Hub
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
              <h1 className="text-4xl font-bold mb-4">
                Learning Progress
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                Track your study journey and achievements
              </p>
            </motion.div>
          </header>

          {/* Overall Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                  <TrendingUp className="w-5 h-5" />
                  Overall Learning Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Total Progress */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Questions Studied</span>
                      <span className="font-medium">{studiedCount}/{totalQuestions}</span>
                    </div>
                    <Progress value={studyProgress} className="h-3" />
                    <p className="text-xs text-muted-foreground">
                      {studyProgress.toFixed(1)}% completed
                    </p>
                  </div>

                  {/* Study Time */}
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {Math.round(learningStats.totalLearningTime)}
                    </div>
                    <div className="text-sm text-muted-foreground">Minutes Studied</div>
                    <div className="text-xs text-blue-600 mt-1">
                      {Math.round(learningStats.totalLearningTime / 60)} hours total
                    </div>
                  </div>

                  {/* Accuracy */}
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {learningStats.totalQuestionsStudied > 0 
                        ? Math.round((learningStats.totalCorrectInLearning / learningStats.totalQuestionsStudied) * 100)
                        : 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">Study Accuracy</div>
                    <div className="text-xs text-green-600 mt-1">
                      {learningStats.totalCorrectInLearning}/{learningStats.totalQuestionsStudied} correct
                    </div>
                  </div>

                  {/* Bookmarks */}
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {bookmarkedCount}
                    </div>
                    <div className="text-sm text-muted-foreground">Bookmarked</div>
                    <div className="text-xs text-purple-600 mt-1">
                      {((bookmarkedCount / totalQuestions) * 100).toFixed(1)}% of all questions
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Achievements ({earnedAchievements.length}/{achievements.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Earned Achievements */}
                  {earnedAchievements.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Earned Achievements
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {earnedAchievements.map(achievement => {
                          const Icon = achievement.icon
                          return (
                            <div
                              key={achievement.id}
                              className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800"
                            >
                              <div className="p-2 rounded-lg bg-green-500 text-white">
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-green-800 dark:text-green-200">
                                  {achievement.title}
                                </div>
                                <div className="text-xs text-green-600 dark:text-green-400">
                                  {achievement.description}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Next Achievements */}
                  {nextAchievements.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-500" />
                        Next Goals
                      </h3>
                      <div className="space-y-3">
                        {nextAchievements.map(achievement => {
                          const Icon = achievement.icon
                          return (
                            <div
                              key={achievement.id}
                              className="flex items-center gap-3 p-3 rounded-lg border"
                            >
                              <div className="p-2 rounded-lg bg-muted">
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">{achievement.title}</div>
                                <div className="text-xs text-muted-foreground mb-2">
                                  {achievement.description}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Progress value={achievement.progress} className="h-1 flex-1" />
                                  <span className="text-xs font-medium">
                                    {achievement.progress.toFixed(0)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Topic Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Topic Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topicProgress.map((topic, index) => {
                    const Icon = topicIcons[topic.topic] || Settings
                    const colorGradient = topicColors[topic.topic] || 'from-gray-500 to-gray-600'
                    
                    return (
                      <motion.div
                        key={topic.topic}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex items-center gap-4 p-4 rounded-lg border hover:shadow-md transition-all duration-200"
                      >
                        <div className={cn(
                          "p-3 rounded-lg bg-gradient-to-r text-white",
                          colorGradient
                        )}>
                          <Icon className="w-5 h-5" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">{topic.topic}</h3>
                            <div className="flex items-center gap-2">
                              <Badge className={cn("text-xs", getMasteryBadgeColor(topic.masteryLevel))}>
                                {topic.masteryLevel}
                              </Badge>
                              <span className="text-sm font-medium">
                                {topic.studiedQuestions}/{topic.totalQuestions}
                              </span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Progress value={topic.progress} className="h-2 flex-1" />
                              <span className="text-xs text-muted-foreground">
                                {topic.progress.toFixed(0)}%
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {topic.timeSpent}m
                              </div>
                              <div className="flex items-center gap-1">
                                <Target className="w-3 h-3" />
                                {topic.accuracy.toFixed(0)}%
                              </div>
                              <div className="flex items-center gap-1">
                                <Bookmark className="w-3 h-3" />
                                {topic.bookmarkedQuestions}
                              </div>
                              {topic.lastStudied && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(topic.lastStudied).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/learn/topics/${encodeURIComponent(topic.topic)}`)}
                        >
                          Study
                        </Button>
                      </motion.div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                  <div className="text-center sm:text-left">
                    <h3 className="font-semibold mb-1">Keep up the great work!</h3>
                    <p className="text-sm text-muted-foreground">
                      Continue your learning journey with these quick actions
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => router.push('/learn/browse')}>
                      <BookOpen className="w-4 h-4 mr-2" />
                      Browse Questions
                    </Button>
                    <Button variant="outline" onClick={() => router.push('/practice-config')}>
                      <Zap className="w-4 h-4 mr-2" />
                      Practice Quiz
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  )
}