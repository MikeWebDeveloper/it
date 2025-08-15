'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useQuizStore } from '@/store/useQuizStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  SortAsc,
  SortDesc,
  Bookmark,
  Eye,
  BarChart3,
  RefreshCw
} from 'lucide-react'
import questionData from '@/data/questions.json'
import { cn } from '@/lib/utils'

type SortOption = 'id' | 'topic' | 'difficulty' | 'recent'
type ViewMode = 'grid' | 'list'
type FilterOption = 'all' | 'bookmarked' | 'studied' | 'unstudied'

export default function QuestionBrowser() {
  const router = useRouter()
  const { setQuestions } = useQuizStore()
  const [mounted, setMounted] = useState(false)
  
  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTopic, setSelectedTopic] = useState<string>('all')
  const [sortBy, setSortBy] = useState<SortOption>('id')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [filterBy, setFilterBy] = useState<FilterOption>('all')
  
  // Local state for bookmarks and studied questions
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Set<number>>(new Set())
  const [studiedQuestions, setStudiedQuestions] = useState<Set<number>>(new Set())
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const questionsPerPage = 10

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

  // Filter and sort questions
  const filteredAndSortedQuestions = useMemo(() => {
    if (!mounted) return []
    
    const filtered = questionData.questions.filter(question => {
      // Search filter
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch = !searchQuery || 
        question.question.toLowerCase().includes(searchLower) ||
        question.options.some(option => option.toLowerCase().includes(searchLower)) ||
        question.topic.toLowerCase().includes(searchLower) ||
        (question.explanation && question.explanation.toLowerCase().includes(searchLower))
      
      // Topic filter
      const matchesTopic = selectedTopic === 'all' || question.topic === selectedTopic
      
      // Status filter
      const isBookmarked = bookmarkedQuestions.has(question.id)
      const isStudied = studiedQuestions.has(question.id)
      
      const matchesFilter = 
        filterBy === 'all' ||
        (filterBy === 'bookmarked' && isBookmarked) ||
        (filterBy === 'studied' && isStudied) ||
        (filterBy === 'unstudied' && !isStudied)
      
      return matchesSearch && matchesTopic && matchesFilter
    })

    // Sort questions
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'id':
          comparison = a.id - b.id
          break
        case 'topic':
          comparison = a.topic.localeCompare(b.topic)
          break
        case 'difficulty':
          // This would require difficulty data in questions
          comparison = a.id - b.id // Fallback to ID
          break
        case 'recent':
          // Sort by recently studied or bookmarked
          const aRecent = Math.max(
            studiedQuestions.has(a.id) ? 1 : 0,
            bookmarkedQuestions.has(a.id) ? 1 : 0
          )
          const bRecent = Math.max(
            studiedQuestions.has(b.id) ? 1 : 0,
            bookmarkedQuestions.has(b.id) ? 1 : 0
          )
          comparison = bRecent - aRecent
          break
      }
      
      return sortOrder === 'desc' ? -comparison : comparison
    })

    return filtered
  }, [searchQuery, selectedTopic, sortBy, sortOrder, filterBy, bookmarkedQuestions, studiedQuestions, mounted])

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

  const resetFilters = () => {
    setSearchQuery('')
    setSelectedTopic('all')
    setSortBy('id')
    setSortOrder('asc')
    setFilterBy('all')
    setCurrentPage(1)
  }

  if (!mounted) return null

  const topics = questionData.exam_info.topics

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
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
              className="text-center mb-6"
            >
              <h1 className="text-4xl font-bold mb-4">
                Browse Questions
              </h1>
              <p className="text-lg text-muted-foreground">
                Explore all {questionData.questions.length} questions with answers revealed
              </p>
            </motion.div>
          </header>

          {/* Filters and Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
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
                        placeholder="Search questions, topics, or answers..."
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
                    {/* Topic Filter */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Topic:</span>
                      <select
                        value={selectedTopic}
                        onChange={(e) => {
                          setSelectedTopic(e.target.value)
                          setCurrentPage(1)
                        }}
                        className="px-3 py-1 border rounded-md text-sm bg-background"
                      >
                        <option value="all">All Topics</option>
                        {topics.map(topic => (
                          <option key={topic} value={topic}>{topic}</option>
                        ))}
                      </select>
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Status:</span>
                      <select
                        value={filterBy}
                        onChange={(e) => {
                          setFilterBy(e.target.value as FilterOption)
                          setCurrentPage(1)
                        }}
                        className="px-3 py-1 border rounded-md text-sm bg-background"
                      >
                        <option value="all">All Questions</option>
                        <option value="bookmarked">Bookmarked</option>
                        <option value="studied">Studied</option>
                        <option value="unstudied">Not Studied</option>
                      </select>
                    </div>

                    {/* Sort */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Sort:</span>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="px-3 py-1 border rounded-md text-sm bg-background"
                      >
                        <option value="id">Question ID</option>
                        <option value="topic">Topic</option>
                        <option value="recent">Recent Activity</option>
                      </select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      >
                        {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                      </Button>
                    </div>

                    {/* Reset Filters */}
                    <Button variant="outline" size="sm" onClick={resetFilters}>
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Reset
                    </Button>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-4 pt-2 border-t">
                    <Badge variant="outline">
                      {filteredAndSortedQuestions.length} questions found
                    </Badge>
                    <Badge variant="outline">
                      <Bookmark className="w-3 h-3 mr-1" />
                      {bookmarkedQuestions.size} bookmarked
                    </Badge>
                    <Badge variant="outline">
                      <Eye className="w-3 h-3 mr-1" />
                      {studiedQuestions.size} studied
                    </Badge>
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
                    ? "grid grid-cols-1 lg:grid-cols-2 gap-6" 
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
                      No questions found matching your filters.
                    </p>
                    <Button onClick={resetFilters}>
                      Reset Filters
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
                    ({filteredAndSortedQuestions.length} questions total)
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