'use client'

import { useRouter } from 'next/navigation'
import { Question } from '@/types/quiz'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { ExhibitDisplay } from '@/components/quiz/ExhibitDisplay'
import { 
  ChevronDown, 
  ChevronUp, 
  Bookmark, 
  BookmarkCheck,
  Eye,
  EyeOff,
  Lightbulb,
  CheckCircle,
  ExternalLink,
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
  'Hardware': 'bg-blue-500 border-blue-200 text-blue-50',
  'Hardware Safety': 'bg-red-500 border-red-200 text-red-50',
  'Networking': 'bg-green-500 border-green-200 text-green-50',
  'Operating Systems': 'bg-purple-500 border-purple-200 text-purple-50',
  'Security': 'bg-orange-500 border-orange-200 text-orange-50',
  'Troubleshooting': 'bg-yellow-500 border-yellow-200 text-yellow-900',
  'Printers': 'bg-pink-500 border-pink-200 text-pink-50',
  'Mobile Devices': 'bg-indigo-500 border-indigo-200 text-indigo-50',
  'Cloud Computing': 'bg-cyan-500 border-cyan-200 text-cyan-50',
  'Command Line': 'bg-gray-500 border-gray-200 text-gray-50',
  'General IT': 'bg-slate-500 border-slate-200 text-slate-50'
}

interface LearnCardProps {
  question: Question
  isBookmarked?: boolean
  onBookmarkToggle?: (questionId: number) => void
  onMarkAsStudied?: (questionId: number) => void
  isStudied?: boolean
  showTopicIcon?: boolean
  showDetailLink?: boolean
  className?: string
}

export function LearnCard({ 
  question, 
  isBookmarked = false, 
  onBookmarkToggle,
  onMarkAsStudied,
  isStudied = false,
  showTopicIcon = true,
  showDetailLink = true,
  className 
}: LearnCardProps) {
  const router = useRouter()
  const [showExplanation, setShowExplanation] = useState(false)
  const [showAnswer, setShowAnswer] = useState(true) // Always show answer in learn mode
  
  const TopicIcon = topicIcons[question.topic] || Settings
  const topicColorClass = topicColors[question.topic] || 'bg-gray-500 border-gray-200 text-gray-50'
  
  // Convert correctAnswer indices to actual answer strings
  const correctAnswerIndices = Array.isArray(question.correctAnswer) 
    ? question.correctAnswer 
    : [question.correctAnswer]
  const correctAnswers = correctAnswerIndices.map(index => question.options[index])

  const handleBookmark = () => {
    onBookmarkToggle?.(question.id)
  }

  const handleMarkStudied = () => {
    onMarkAsStudied?.(question.id)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <Card className={cn(
        "relative overflow-hidden border-2 hover:shadow-lg transition-all duration-300",
        isStudied ? "border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-950/20" : "hover:border-primary/20"
      )}>
        {/* Question Header */}
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              {showTopicIcon && (
                <div className={cn("p-2 rounded-lg", topicColorClass)}>
                  <TopicIcon className="w-4 h-4" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    Q{question.id}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {question.topic}
                  </Badge>
                  {isStudied && (
                    <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Studied
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {showDetailLink && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/learn/question/${question.id}`)}
                  className="h-8 w-8 p-0"
                  title="View details"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBookmark}
                className="h-8 w-8 p-0"
              >
                {isBookmarked ? (
                  <BookmarkCheck className="w-4 h-4 text-blue-600" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </Button>
              {!isStudied && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkStudied}
                  className="h-8 w-8 p-0"
                  title="Mark as studied"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Question Text */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium leading-relaxed">
              {question.question}
            </h3>

            {/* Exhibit Display if present */}
            {question.exhibit && (
              <ExhibitDisplay exhibit={question.exhibit} />
            )}

            {/* Answer Options */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Answer Options:</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAnswer(!showAnswer)}
                  className="text-xs"
                >
                  {showAnswer ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                  {showAnswer ? 'Hide' : 'Show'} Answer
                </Button>
              </div>
              
              <div className="space-y-1">
                {question.options.map((option, index) => {
                  const isCorrect = correctAnswers.includes(option)
                  const optionLetter = String.fromCharCode(65 + index) // A, B, C, D
                  
                  return (
                    <motion.div
                      key={index}
                      className={cn(
                        "p-3 rounded-lg border transition-all duration-200",
                        showAnswer && isCorrect 
                          ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
                          : "bg-muted/30 border-border"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                          showAnswer && isCorrect
                            ? "bg-green-500 text-white"
                            : "bg-muted border"
                        )}>
                          {showAnswer && isCorrect ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            optionLetter
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={cn(
                            "text-sm",
                            showAnswer && isCorrect && "font-medium text-green-700 dark:text-green-300"
                          )}>
                            {option}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Correct Answer Summary */}
            <AnimatePresence>
              {showAnswer && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-800 dark:text-green-200">
                      Correct Answer{correctAnswers.length > 1 ? 's' : ''}:
                    </span>
                  </div>
                  <div className="space-y-1">
                    {correctAnswers.map((answer, index) => (
                      <p key={index} className="text-sm text-green-700 dark:text-green-300 font-medium">
                        • {answer}
                      </p>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Explanation */}
            {question.explanation && (
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="w-full justify-between p-3 h-auto text-left"
                >
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium">Explanation</span>
                  </div>
                  {showExplanation ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>

                <AnimatePresence>
                  {showExplanation && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
                    >
                      <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                        {question.explanation}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}