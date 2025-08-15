'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { useQuizStore } from '@/store/useQuizStore'
import { Question } from '@/types/quiz'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageTransition } from '@/components/animations/PageTransition'
import { AnimatedThemeToggle } from '@/components/ui/AnimatedThemeToggle'
import { LearnCard } from '@/components/learn/LearnCard'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Target,
  Share2,
  Shuffle,
  List,
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
  ExternalLink
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

export default function QuestionDetailPage() {
  const router = useRouter()
  const params = useParams()
  const questionId = parseInt(params.id as string)
  
  const { setQuestions } = useQuizStore()
  const [mounted, setMounted] = useState(false)
  const [question, setQuestion] = useState<Question | null>(null)
  const [relatedQuestions, setRelatedQuestions] = useState<Question[]>([])
  
  // Local state for bookmarks and studied questions
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Set<number>>(new Set())
  const [studiedQuestions, setStudiedQuestions] = useState<Set<number>>(new Set())

  useEffect(() => {
    setMounted(true)
    setQuestions(questionData.questions)
    
    // Find the question
    const foundQuestion = questionData.questions.find(q => q.id === questionId)
    if (foundQuestion) {
      setQuestion(foundQuestion)
      
      // Find related questions from the same topic
      const related = questionData.questions
        .filter(q => q.topic === foundQuestion.topic && q.id !== foundQuestion.id)
        .slice(0, 3)
      setRelatedQuestions(related)
    }
    
    // Load local data
    const savedBookmarks = localStorage.getItem('learn-bookmarks')
    const savedStudied = localStorage.getItem('learn-studied')
    
    if (savedBookmarks) {
      setBookmarkedQuestions(new Set(JSON.parse(savedBookmarks)))
    }
    if (savedStudied) {
      setStudiedQuestions(new Set(JSON.parse(savedStudied)))
    }
  }, [questionId, setQuestions])

  // Save to localStorage when state changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('learn-bookmarks', JSON.stringify([...bookmarkedQuestions]))
    }
  }, [bookmarkedQuestions, mounted])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('learn-studied', JSON.stringify([...studiedQuestions]))
    }
  }, [studiedQuestions, mounted])

  const handleBookmarkToggle = (questionId: number) => {
    setBookmarkedQuestions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(questionId)) {
        newSet.delete(questionId)
      } else {
        newSet.add(questionId)
      }
      return newSet
    })
  }

  const handleMarkAsStudied = (questionId: number) => {
    setStudiedQuestions(prev => new Set([...prev, questionId]))
  }

  const handlePreviousQuestion = () => {
    const currentIndex = questionData.questions.findIndex(q => q.id === questionId)
    if (currentIndex > 0) {
      const prevQuestion = questionData.questions[currentIndex - 1]
      router.push(`/learn/question/${prevQuestion.id}`)
    }
  }

  const handleNextQuestion = () => {
    const currentIndex = questionData.questions.findIndex(q => q.id === questionId)
    if (currentIndex < questionData.questions.length - 1) {
      const nextQuestion = questionData.questions[currentIndex + 1]
      router.push(`/learn/question/${nextQuestion.id}`)
    }
  }

  const handleRandomQuestion = () => {
    const randomQuestion = questionData.questions[Math.floor(Math.random() * questionData.questions.length)]
    router.push(`/learn/question/${randomQuestion.id}`)
  }

  const handleShareQuestion = async () => {
    const shareData = {
      title: `IT Quiz Question ${questionId}`,
      text: question?.question.substring(0, 100) + '...',
      url: window.location.href
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        // Fallback to clipboard
        await navigator.clipboard.writeText(window.location.href)
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(window.location.href)
    }
  }

  if (!mounted || !question) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="text-center py-12">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">
                    {!mounted ? 'Loading...' : 'Question not found'}
                  </p>
                  <Button 
                    onClick={() => router.push('/learn/browse')}
                    className="mt-4"
                  >
                    Browse Questions
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </PageTransition>
    )
  }

  const currentIndex = questionData.questions.findIndex(q => q.id === questionId)
  const hasPrevious = currentIndex > 0
  const hasNext = currentIndex < questionData.questions.length - 1
  
  const Icon = topicIcons[question.topic] || Settings
  const colorGradient = topicColors[question.topic] || 'from-gray-500 to-gray-600'

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <header className="mb-8">
            <nav className="flex items-center justify-between mb-6">
              <Button
                variant="outline"
                onClick={() => router.push('/learn/browse')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Browse Questions
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

            {/* Question Info Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between mb-6"
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "p-3 rounded-xl bg-gradient-to-r text-white",
                  colorGradient
                )}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Question {question.id}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{question.topic}</Badge>
                    <Badge variant="outline">
                      {currentIndex + 1} of {questionData.questions.length}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShareQuestion}
                  className="flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRandomQuestion}
                  className="flex items-center gap-2"
                >
                  <Shuffle className="w-4 h-4" />
                  Random
                </Button>
              </div>
            </motion.div>
          </header>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={handlePreviousQuestion}
                    disabled={!hasPrevious}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous Question
                  </Button>

                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/learn/topics/${encodeURIComponent(question.topic)}`)}
                      className="flex items-center gap-2"
                    >
                      <List className="w-4 h-4" />
                      More from {question.topic}
                    </Button>
                  </div>

                  <Button
                    variant="outline"
                    onClick={handleNextQuestion}
                    disabled={!hasNext}
                    className="flex items-center gap-2"
                  >
                    Next Question
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Question Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <LearnCard
              question={question}
              isBookmarked={bookmarkedQuestions.has(question.id)}
              isStudied={studiedQuestions.has(question.id)}
              onBookmarkToggle={handleBookmarkToggle}
              onMarkAsStudied={handleMarkAsStudied}
              showTopicIcon={false}
              showDetailLink={false}
            />
          </motion.div>

          {/* Related Questions */}
          {relatedQuestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Related Questions from {question.topic}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {relatedQuestions.map((relatedQuestion, index) => (
                      <motion.div
                        key={relatedQuestion.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex items-center justify-between p-4 rounded-lg border hover:shadow-md transition-all duration-200 group"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              Q{relatedQuestion.id}
                            </Badge>
                            {studiedQuestions.has(relatedQuestion.id) && (
                              <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                Studied
                              </Badge>
                            )}
                            {bookmarkedQuestions.has(relatedQuestion.id) && (
                              <Badge className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                Bookmarked
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm font-medium group-hover:text-primary transition-colors">
                            {relatedQuestion.question.length > 120 
                              ? relatedQuestion.question.substring(0, 120) + '...'
                              : relatedQuestion.question
                            }
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/learn/question/${relatedQuestion.id}`)}
                          className="ml-4"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="mt-6 text-center">
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/learn/topics/${encodeURIComponent(question.topic)}`)}
                    >
                      View All {question.topic} Questions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                  <div className="text-center sm:text-left">
                    <h3 className="font-semibold mb-1">Ready for more?</h3>
                    <p className="text-sm text-muted-foreground">
                      Continue exploring or test your knowledge
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => router.push('/learn/browse')}>
                      <BookOpen className="w-4 h-4 mr-2" />
                      Browse More
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => router.push(`/practice-config?topic=${encodeURIComponent(question.topic)}`)}
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Practice {question.topic}
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