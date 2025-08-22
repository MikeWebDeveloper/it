'use client'

import { useState, useImperativeHandle, forwardRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Question } from '@/types/quiz'
import { DifficultyBadge } from '@/components/ui/DifficultyBadge'
import { cn } from '@/lib/utils'
import { 
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
  RotateCcw,
  Eye,
  EyeOff
} from 'lucide-react'

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
  'General IT': 'bg-teal-500 border-teal-200 text-teal-50'
}

interface FlashcardCardProps {
  question: Question
  currentIndex: number
  totalQuestions: number
  onNext: () => void
  onPrevious: () => void
  className?: string
}

export const FlashcardCard = forwardRef<{ flip: () => void }, FlashcardCardProps>(function FlashcardCard({
  question,
  currentIndex,
  totalQuestions,
  onNext,
  onPrevious,
  className
}, ref) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)

  const IconComponent = topicIcons[question.topic] || Settings
  const topicColorClass = topicColors[question.topic] || topicColors['General IT']

  const handleFlip = useCallback(() => {
    setIsFlipped(!isFlipped)
    if (!isFlipped) {
      setShowExplanation(false)
    }
  }, [isFlipped])

  // Expose flip function through ref
  useImperativeHandle(ref, () => ({
    flip: handleFlip
  }), [handleFlip])

  const handleNext = () => {
    setIsFlipped(false)
    setShowExplanation(false)
    onNext()
  }

  const handlePrevious = () => {
    setIsFlipped(false)
    setShowExplanation(false)
    onPrevious()
  }

  // Convert correctAnswer indices to actual answer strings for display
  const correctAnswer = Array.isArray(question.correctAnswer) 
    ? question.correctAnswer.map(index => question.options[index]).join(', ')
    : question.options[question.correctAnswer]

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      {/* Progress indicator */}
      <div className="mb-6 text-center">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Card {currentIndex + 1} of {totalQuestions}
          </span>
          <div className="flex items-center gap-2">
            <DifficultyBadge 
              question={question}
              variant="compact"
              animated={true}
            />
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs font-medium border-2 flex items-center gap-1.5 px-2 py-1",
                topicColorClass
              )}
            >
              <IconComponent className="w-3 h-3" />
              {question.topic}
            </Badge>
          </div>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div className="relative h-96 perspective-1000">
        <motion.div
          className="relative w-full h-full"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          {/* Front of card - Question */}
          <Card 
            className={cn(
              "absolute inset-0 w-full h-full cursor-pointer",
              "border-0 shadow-lg bg-card/95 backdrop-blur",
              "hover:shadow-xl transition-shadow duration-300",
              "backface-hidden"
            )}
            onClick={handleFlip}
          >
            <CardContent className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="mb-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Question
                </h3>
                <p className="text-lg leading-relaxed font-medium">
                  {question.question}
                </p>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-auto">
                <Eye className="w-4 h-4" />
                <span>Tap to reveal answer</span>
              </div>
            </CardContent>
          </Card>

          {/* Back of card - Answer */}
          <Card 
            className={cn(
              "absolute inset-0 w-full h-full cursor-pointer",
              "border-0 shadow-lg bg-primary/5 backdrop-blur",
              "hover:shadow-xl transition-shadow duration-300",
              "backface-hidden rotate-y-180"
            )}
            onClick={handleFlip}
          >
            <CardContent className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="mb-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Correct Answer
                </h3>
                <p className="text-lg leading-relaxed font-semibold text-primary mb-4">
                  {correctAnswer}
                </p>
                
                {question.explanation && (
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowExplanation(!showExplanation)
                      }}
                      className="flex items-center gap-2"
                    >
                      {showExplanation ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {showExplanation ? 'Hide' : 'Show'} Explanation
                    </Button>
                    
                    {showExplanation && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="p-3 bg-muted/50 rounded-lg border text-left"
                      >
                        <p className="text-sm leading-relaxed">
                          {question.explanation}
                        </p>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-auto">
                <RotateCcw className="w-4 h-4" />
                <span>Tap to flip back</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="flex items-center gap-2"
        >
          ← Previous
        </Button>
        
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFlip}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Flip Card
          </Button>
        </div>
        
        <Button
          variant="outline"
          onClick={handleNext}
          disabled={currentIndex === totalQuestions - 1}
          className="flex items-center gap-2"
        >
          Next →
        </Button>
      </div>
    </div>
  )
})