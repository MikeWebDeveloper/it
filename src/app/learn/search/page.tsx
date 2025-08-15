'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useQuizStore } from '@/store/useQuizStore'
import { Question } from '@/types/quiz'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { PageTransition } from '@/components/animations/PageTransition'
import { AnimatedThemeToggle } from '@/components/ui/AnimatedThemeToggle'
import { LearnCard } from '@/components/learn/LearnCard'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  BarChart3,
  X,
  BookOpen,
  Target,
  Clock,
  TrendingUp,
  Lightbulb,
  FileText,
  Tag
} from 'lucide-react'
import questionData from '@/data/questions.json'
import { cn } from '@/lib/utils'

type SearchFilter = 'all' | 'question' | 'options' | 'explanation' | 'topic'

export default function QuestionSearch() {
  const router = useRouter()
  const { setQuestions } = useQuizStore()
  const [mounted, setMounted] = useState(false)
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFilter, setSearchFilter] = useState<SearchFilter>('all')
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  
  // Results state
  const [searchResults, setSearchResults] = useState<Question[]>([])
  const [isSearching, setIsSearching] = useState(false)
  
  // Local state for bookmarks and studied questions
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Set<number>>(new Set())
  const [studiedQuestions, setStudiedQuestions] = useState<Set<number>>(new Set())

  useEffect(() => {
    setMounted(true)
    setQuestions(questionData.questions)
    
    // Load saved data from localStorage
    const savedBookmarks = localStorage.getItem('learn-bookmarks')
    const savedStudied = localStorage.getItem('learn-studied')
    const savedHistory = localStorage.getItem('search-history')
    
    if (savedBookmarks) {
      setBookmarkedQuestions(new Set(JSON.parse(savedBookmarks)))
    }
    if (savedStudied) {
      setStudiedQuestions(new Set(JSON.parse(savedStudied)))
    }
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory))
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

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('search-history', JSON.stringify(searchHistory))
    }
  }, [searchHistory, mounted])

  // Search function
  const performSearch = useMemo(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    
    const query = searchQuery.toLowerCase().trim()
    const words = query.split(/\s+/).filter(word => word.length > 0)
    
    const results = questionData.questions.filter(question => {
      // Topic filter
      if (selectedTopics.length > 0 && !selectedTopics.includes(question.topic)) {
        return false
      }
      
      // Search filter
      const searchTargets = {
        all: [
          question.question,
          ...question.options,
          question.explanation || '',
          question.topic
        ],
        question: [question.question],
        options: question.options,
        explanation: [question.explanation || ''],
        topic: [question.topic]
      }
      
      const textsToSearch = searchTargets[searchFilter].join(' ').toLowerCase()
      
      // Check if all search words are found
      return words.every(word => textsToSearch.includes(word))
    })
    
    // Sort by relevance (number of matches)
    results.sort((a, b) => {
      const aMatches = words.reduce((count, word) => {
        const aText = [a.question, ...a.options, a.explanation || '', a.topic].join(' ').toLowerCase()
        return count + (aText.match(new RegExp(word, 'g')) || []).length
      }, 0)
      
      const bMatches = words.reduce((count, word) => {
        const bText = [b.question, ...b.options, b.explanation || '', b.topic].join(' ').toLowerCase()
        return count + (bText.match(new RegExp(word, 'g')) || []).length
      }, 0)
      
      return bMatches - aMatches
    })
    
    setSearchResults(results)
    setIsSearching(false)
    
    // Add to search history
    if (query && !searchHistory.includes(query)) {
      setSearchHistory(prev => [query, ...prev.slice(0, 9)]) // Keep last 10 searches
    }
  }, [searchQuery, searchFilter, selectedTopics, searchHistory])

  useEffect(() => {
    const timeoutId = setTimeout(performSearch, 300) // Debounce search
    return () => clearTimeout(timeoutId)
  }, [performSearch])

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

  const handleTopicToggle = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    )
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
    setSelectedTopics([])
  }

  const clearSearchHistory = () => {
    setSearchHistory([])
  }

  if (!mounted) return null

  const topics = questionData.exam_info.topics
  const hasResults = searchResults.length > 0
  const hasQuery = searchQuery.trim().length > 0

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
                Search Questions
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                Find specific questions across all {questionData.questions.length} questions
              </p>
            </motion.div>
          </header>

          {/* Search Interface */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {/* Main Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      placeholder="Search questions, answers, topics, or explanations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 pr-12 h-12 text-lg"
                    />
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearSearch}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {/* Search Filters */}
                  <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Search in:</span>
                      <select
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value as SearchFilter)}
                        className="px-3 py-1 border rounded-md text-sm bg-background"
                      >
                        <option value="all">Everything</option>
                        <option value="question">Questions only</option>
                        <option value="options">Answer options</option>
                        <option value="explanation">Explanations</option>
                        <option value="topic">Topics</option>
                      </select>
                    </div>

                    {/* Search Filter Icons */}
                    <div className="flex items-center gap-1">
                      {searchFilter === 'all' && <FileText className="w-4 h-4 text-muted-foreground" />}
                      {searchFilter === 'question' && <Target className="w-4 h-4 text-muted-foreground" />}
                      {searchFilter === 'options' && <BookOpen className="w-4 h-4 text-muted-foreground" />}
                      {searchFilter === 'explanation' && <Lightbulb className="w-4 h-4 text-muted-foreground" />}
                      {searchFilter === 'topic' && <Tag className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </div>

                  {/* Topic Filters */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Filter by topics:</span>
                      {selectedTopics.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedTopics([])}
                          className="text-xs"
                        >
                          Clear topics
                        </Button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {topics.map(topic => (
                        <Badge
                          key={topic}
                          variant={selectedTopics.includes(topic) ? "default" : "outline"}
                          className="cursor-pointer hover:bg-primary/80 transition-colors"
                          onClick={() => handleTopicToggle(topic)}
                        >
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Search History */}
                  {searchHistory.length > 0 && !hasQuery && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Recent searches:</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearSearchHistory}
                          className="text-xs"
                        >
                          Clear history
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {searchHistory.map((query, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="cursor-pointer hover:bg-muted/80 transition-colors"
                            onClick={() => setSearchQuery(query)}
                          >
                            <Clock className="w-3 h-3 mr-1" />
                            {query}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Search Stats */}
                  {hasQuery && (
                    <div className="flex items-center gap-4 pt-3 border-t">
                      <Badge variant="outline">
                        {isSearching ? 'Searching...' : `${searchResults.length} results`}
                      </Badge>
                      {selectedTopics.length > 0 && (
                        <Badge variant="outline">
                          Filtered by {selectedTopics.length} topics
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Search Results */}
          <AnimatePresence mode="wait">
            {hasQuery ? (
              hasResults ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">
                      Search Results ({searchResults.length})
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {searchResults.map((question) => (
                      <LearnCard
                        key={question.id}
                        question={question}
                        isBookmarked={bookmarkedQuestions.has(question.id)}
                        isStudied={studiedQuestions.has(question.id)}
                        onBookmarkToggle={handleBookmarkToggle}
                        onMarkAsStudied={handleMarkAsStudied}
                      />
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="no-results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12"
                >
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <Search className="w-12 h-12 text-muted-foreground mx-auto" />
                        <div>
                          <h3 className="text-lg font-semibold mb-2">No results found</h3>
                          <p className="text-muted-foreground mb-4">
                            Try different keywords or adjust your filters
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Suggestions:</p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Check your spelling</li>
                            <li>• Try broader search terms</li>
                            <li>• Remove topic filters</li>
                            <li>• Search in &quot;Everything&quot; instead of specific sections</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            ) : (
              <motion.div
                key="no-search"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <Search className="w-16 h-16 text-muted-foreground mx-auto opacity-50" />
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Start your search</h3>
                        <p className="text-muted-foreground mb-6">
                          Search through {questionData.questions.length} questions to find exactly what you need
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                        <Button 
                          variant="outline" 
                          onClick={() => router.push('/learn/browse')}
                          className="flex items-center gap-2"
                        >
                          <BookOpen className="w-4 h-4" />
                          Browse All
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => router.push('/learn/topics')}
                          className="flex items-center gap-2"
                        >
                          <Target className="w-4 h-4" />
                          By Topic
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  )
}