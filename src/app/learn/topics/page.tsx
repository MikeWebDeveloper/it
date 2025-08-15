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
  AlertTriangle,
  BookOpen,
  TrendingUp,
  Clock
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

const topicDescriptions: Record<string, string> = {
  'Hardware': 'Computer components, assembly, and hardware troubleshooting',
  'Hardware Safety': 'ESD protection, safety procedures, and best practices',
  'Networking': 'Network protocols, configuration, and connectivity',
  'Operating Systems': 'Windows, Linux, macOS installation and management',
  'Security': 'Cybersecurity fundamentals, threats, and protection',
  'Troubleshooting': 'Problem-solving methodologies and diagnostic techniques',
  'Printers': 'Printer types, installation, and maintenance',
  'Mobile Devices': 'Smartphones, tablets, and mobile technologies',
  'Cloud Computing': 'Cloud services, deployment models, and virtualization',
  'Command Line': 'Terminal commands and scripting basics',
  'General IT': 'IT fundamentals, concepts, and best practices'
}

export default function TopicBrowser() {
  const router = useRouter()
  const { learningStats, setQuestions } = useQuizStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setQuestions(questionData.questions)
  }, [setQuestions])

  if (!mounted) return null

  // Calculate topic statistics
  const topicStats = questionData.exam_info.topics.map(topic => {
    const topicQuestions = questionData.questions.filter(q => q.topic === topic)
    const learningProgress = learningStats.topicLearningProgress[topic]
    
    const totalQuestions = topicQuestions.length
    const studiedQuestions = learningProgress?.questionsStudied || 0
    const correctAnswers = learningProgress?.correctAnswers || 0
    const timeSpent = learningProgress?.timeSpent || 0
    const accuracy = studiedQuestions > 0 ? (correctAnswers / studiedQuestions) * 100 : 0
    const progress = totalQuestions > 0 ? (studiedQuestions / totalQuestions) * 100 : 0
    const masteryLevel = learningProgress?.masteryLevel || 'beginner'
    
    return {
      topic,
      totalQuestions,
      studiedQuestions,
      correctAnswers,
      timeSpent,
      accuracy,
      progress,
      masteryLevel,
      lastStudied: learningProgress?.lastStudied
    }
  })

  const handleTopicClick = (topic: string) => {
    router.push(`/learn/topics/${encodeURIComponent(topic)}`)
  }

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
                Explore by Topic
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                Dive deep into specific IT topics and master each area
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
                  Overall Topic Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {topicStats.filter(t => t.studiedQuestions > 0).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Topics Started</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {topicStats.filter(t => t.masteryLevel === 'advanced').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Advanced</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {topicStats.filter(t => t.masteryLevel === 'intermediate').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Intermediate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round(topicStats.reduce((acc, t) => acc + t.timeSpent, 0))}
                    </div>
                    <div className="text-sm text-muted-foreground">Minutes Studied</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Topics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topicStats.map((topicStat, index) => {
              const { topic } = topicStat
              const Icon = topicIcons[topic] || Settings
              const colorGradient = topicColors[topic] || 'from-gray-500 to-gray-600'
              
              return (
                <motion.div
                  key={topic}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * (index + 3), duration: 0.5 }}
                  onClick={() => handleTopicClick(topic)}
                  className="cursor-pointer"
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300 group border-2 hover:border-primary/20">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-3 rounded-lg bg-gradient-to-r text-white group-hover:scale-110 transition-transform duration-300",
                            colorGradient
                          )}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <CardTitle className="text-lg group-hover:text-primary transition-colors">
                              {topic}
                            </CardTitle>
                            <Badge 
                              className={cn("text-xs mt-1", getMasteryBadgeColor(topicStat.masteryLevel))}
                            >
                              {topicStat.masteryLevel}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {topicDescriptions[topic]}
                      </p>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span className="font-medium">
                            {topicStat.studiedQuestions}/{topicStat.totalQuestions}
                          </span>
                        </div>
                        <Progress 
                          value={topicStat.progress} 
                          className="h-2"
                        />
                        <p className="text-xs text-muted-foreground">
                          {topicStat.progress.toFixed(1)}% completed
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                        <div className="text-center">
                          <div className={cn("text-lg font-bold", getMasteryColor(topicStat.masteryLevel))}>
                            {topicStat.accuracy.toFixed(0)}%
                          </div>
                          <div className="text-xs text-muted-foreground">Accuracy</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">
                            {topicStat.timeSpent}
                          </div>
                          <div className="text-xs text-muted-foreground">Minutes</div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button 
                        className="w-full mt-4 group-hover:scale-105 transition-transform duration-200"
                        variant={topicStat.studiedQuestions > 0 ? "default" : "outline"}
                      >
                        <BookOpen className="w-4 h-4 mr-2" />
                        {topicStat.studiedQuestions > 0 ? 'Continue Learning' : 'Start Learning'}
                      </Button>

                      {/* Last Studied */}
                      {topicStat.lastStudied && (
                        <p className="text-xs text-muted-foreground text-center pt-2">
                          <Clock className="w-3 h-3 inline mr-1" />
                          Last studied: {new Date(topicStat.lastStudied).toLocaleDateString()}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8 text-center"
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                  <div className="text-center sm:text-left">
                    <h3 className="font-semibold mb-1">
                      Want to browse all questions?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Explore questions across all topics in one place
                    </p>
                  </div>
                  <Button 
                    onClick={() => router.push('/learn/browse')}
                    variant="outline"
                  >
                    Browse All Questions
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