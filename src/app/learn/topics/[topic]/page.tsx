'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { useQuizStore } from '@/store/useQuizStore'
import { Question } from '@/types/quiz'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { PageTransition } from '@/components/animations/PageTransition'
import { AnimatedThemeToggle } from '@/components/ui/AnimatedThemeToggle'
import { LearnCard } from '@/components/learn/LearnCard'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  Search, 
  Grid3X3, 
  List,
  BarChart3,
  BookOpen,
  Target,
  Clock,
  TrendingUp,
  Filter,
  Eye,
  Bookmark,
  CheckCircle,
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
  PlayCircle
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

type ViewMode = 'grid' | 'list'
type SortOption = 'id' | 'recent' | 'studied'
type FilterOption = 'all' | 'studied' | 'unstudied' | 'bookmarked'

export default function TopicDetailPage() {
  const router = useRouter()
  const params = useParams()
  const topicParam = params.topic as string
  const topic = decodeURIComponent(topicParam)
  
  const { learningStats, setQuestions } = useQuizStore()
  const [mounted, setMounted] = useState(false)
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortOption>('id')
  const [filterBy, setFilterBy] = useState<FilterOption>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const questionsPerPage = 12
  
  // Local state for bookmarks and studied questions
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Set<number>>(new Set())
  const [studiedQuestions, setStudiedQuestions] = useState<Set<number>>(new Set())

  useEffect(() => {
    setMounted(true)
    setQuestions(questionData.questions)
    
    // Load bookmarks and studied questions from localStorage
    const savedBookmarks = localStorage.getItem('learn-bookmarks')
    const savedStudied = localStorage.getItem('learn-studied')
    
    if (savedBookmarks) {
      setBookmarkedQuestions(new Set(JSON.parse(savedBookmarks)))
    }
    if (savedStudied) {
      setStudiedQuestions(new Set(JSON.parse(savedStudied)))
    }
  }, [setQuestions])

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

  // Get topic questions
  const topicQuestions = useMemo(() => {
    return questionData.questions.filter(q => q.topic === topic)
  }, [topic])

  // Filter and sort questions
  const filteredAndSortedQuestions = useMemo(() => {
    if (!mounted) return []
    
    const filtered = topicQuestions.filter(question => {
      // Search filter
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch = !searchQuery || 
        question.question.toLowerCase().includes(searchLower) ||
        question.options.some(option => option.toLowerCase().includes(searchLower)) ||
        (question.explanation && question.explanation.toLowerCase().includes(searchLower))
      
      // Status filter
      const isBookmarked = bookmarkedQuestions.has(question.id)
      const isStudied = studiedQuestions.has(question.id)
      
      const matchesFilter = 
        filterBy === 'all' ||
        (filterBy === 'bookmarked' && isBookmarked) ||
        (filterBy === 'studied' && isStudied) ||
        (filterBy === 'unstudied' && !isStudied)
      
      return matchesSearch && matchesFilter
    })

    // Sort questions
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'id':
          return a.id - b.id
        case 'recent':
          const aRecent = Math.max(
            studiedQuestions.has(a.id) ? 1 : 0,
            bookmarkedQuestions.has(a.id) ? 1 : 0
          )
          const bRecent = Math.max(
            studiedQuestions.has(b.id) ? 1 : 0,
            bookmarkedQuestions.has(b.id) ? 1 : 0
          )
          return bRecent - aRecent
        case 'studied':
          const aStudied = studiedQuestions.has(a.id) ? 1 : 0
          const bStudied = studiedQuestions.has(b.id) ? 1 : 0
          return bStudied - aStudied
        default:
          return a.id - b.id
      }
    })

    return filtered
  }, [topicQuestions, searchQuery, filterBy, sortBy, bookmarkedQuestions, studiedQuestions, mounted])

  // Calculate topic statistics
  const topicStats = useMemo(() => {
    const learningProgress = learningStats.topicLearningProgress[topic]
    const totalQuestions = topicQuestions.length
    const studiedCount = Array.from(studiedQuestions).filter(id => 
      topicQuestions.some(q => q.id === id)
    ).length
    const bookmarkedCount = Array.from(bookmarkedQuestions).filter(id => 
      topicQuestions.some(q => q.id === id)
    ).length
    
    return {
      totalQuestions,
      studiedQuestions: studiedCount,
      bookmarkedQuestions: bookmarkedCount,
      correctAnswers: learningProgress?.correctAnswers || 0,
      timeSpent: learningProgress?.timeSpent || 0,
      accuracy: studiedCount > 0 ? ((learningProgress?.correctAnswers || 0) / studiedCount) * 100 : 0,
      progress: totalQuestions > 0 ? (studiedCount / totalQuestions) * 100 : 0,
      masteryLevel: learningProgress?.masteryLevel || 'beginner'
    }
  }, [topic, topicQuestions, studiedQuestions, bookmarkedQuestions, learningStats])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedQuestions.length / questionsPerPage)
  const paginatedQuestions = filteredAndSortedQuestions.slice(
    (currentPage - 1) * questionsPerPage,
    currentPage * questionsPerPage
  )

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

  const handleStartPracticeQuiz = () => {
    const unstudiedQuestions = topicQuestions.filter(q => !studiedQuestions.has(q.id))
    const questionsToUse = unstudiedQuestions.length > 0 ? unstudiedQuestions : topicQuestions
    const randomQuestions = questionsToUse.sort(() => Math.random() - 0.5).slice(0, 10)
    
    // Navigate to practice with pre-selected questions
    router.push(`/practice-config?topic=${encodeURIComponent(topic)}`)
  }

  if (!mounted) return null

  const Icon = topicIcons[topic] || Settings
  const colorGradient = topicColors[topic] || 'from-gray-500 to-gray-600'

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <header className="mb-8">
            <nav className="flex items-center justify-between mb-6">
              <Button
                variant="outline"
                onClick={() => router.push('/learn/topics')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                All Topics
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
              className="flex items-center gap-4 mb-6"
            >
              <div className={cn(
                "p-4 rounded-xl bg-gradient-to-r text-white",
                colorGradient
              )}>
                <Icon className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">{topic}</h1>
                <p className="text-lg text-muted-foreground">
                  {topicStats.totalQuestions} questions available
                </p>
              </div>
            </motion.div>
          </header>

          {/* Topic Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Your Progress in {topic}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Questions Studied</span>
                      <span className="font-medium">
                        {topicStats.studiedQuestions}/{topicStats.totalQuestions}
                      </span>
                    </div>
                    <Progress value={topicStats.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {topicStats.progress.toFixed(1)}% completed
                    </p>
                  </div>

                  {/* Accuracy */}
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {topicStats.accuracy.toFixed(0)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Accuracy</div>
                    <Badge className="mt-1 text-xs">
                      {topicStats.masteryLevel}
                    </Badge>
                  </div>

                  {/* Time Spent */}
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {topicStats.timeSpent}
                    </div>
                    <div className="text-sm text-muted-foreground">Minutes</div>
                  </div>

                  {/* Bookmarks */}
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {topicStats.bookmarkedQuestions}
                    </div>
                    <div className="text-sm text-muted-foreground">Bookmarked</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t">
                  <Button onClick={handleStartPracticeQuiz} className="flex items-center gap-2">
                    <PlayCircle className="w-4 h-4" />
                    Practice Quiz
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => router.push('/learn/browse?topic=' + encodeURIComponent(topic))}
                    className="flex items-center gap-2"
                  >
                    <Grid3X3 className="w-4 h-4" />
                    Browse All
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Filters and Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Search and View Controls */}
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search questions in this topic..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value)
                          setCurrentPage(1)
                        }}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                      >
                        <Grid3X3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                      >
                        <List className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Filter Controls */}
                  <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Show:</span>
                      <select
                        value={filterBy}
                        onChange={(e) => {
                          setFilterBy(e.target.value as FilterOption)
                          setCurrentPage(1)
                        }}
                        className="px-3 py-1 border rounded-md text-sm bg-background"
                      >
                        <option value="all">All Questions</option>
                        <option value="unstudied">Not Studied</option>
                        <option value="studied">Studied</option>
                        <option value="bookmarked">Bookmarked</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Sort:</span>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="px-3 py-1 border rounded-md text-sm bg-background"
                      >
                        <option value="id">Question ID</option>
                        <option value="studied">Study Status</option>
                        <option value="recent">Recent Activity</option>
                      </select>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-4 ml-auto">
                      <Badge variant="outline">
                        {filteredAndSortedQuestions.length} questions
                      </Badge>
                      <Badge variant="outline">
                        <Eye className="w-3 h-3 mr-1" />
                        {topicStats.studiedQuestions} studied
                      </Badge>
                      <Badge variant="outline">
                        <Bookmark className="w-3 h-3 mr-1" />
                        {topicStats.bookmarkedQuestions} bookmarked
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Questions List */}
          <AnimatePresence mode="wait">
            {paginatedQuestions.length > 0 ? (
              <motion.div
                key={currentPage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={cn(
                  viewMode === 'grid' 
                    ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6" 
                    : "space-y-6"
                )}
              >
                {paginatedQuestions.map((question) => (
                  <LearnCard
                    key={question.id}
                    question={question}
                    isBookmarked={bookmarkedQuestions.has(question.id)}
                    isStudied={studiedQuestions.has(question.id)}
                    onBookmarkToggle={handleBookmarkToggle}
                    onMarkAsStudied={handleMarkAsStudied}
                    showTopicIcon={false}
                    className={viewMode === 'list' ? 'max-w-none' : ''}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground mb-4">
                      No questions found matching your criteria.
                    </p>
                    <Button onClick={() => {
                      setSearchQuery('')
                      setFilterBy('all')
                      setCurrentPage(1)
                    }}>
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8 flex justify-center"
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum
                        if (totalPages <= 5) {
                          pageNum = i + 1
                        } else if (currentPage <= 3) {
                          pageNum = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        } else {
                          pageNum = currentPage - 2 + i
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                  
                  <p className="text-sm text-muted-foreground text-center mt-4">
                    Page {currentPage} of {totalPages} 
                    ({filteredAndSortedQuestions.length} questions)
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}