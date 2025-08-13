'use client'

import { Question } from '@/types/quiz'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AnswerChoice } from './AnswerChoice'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
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
  AlertTriangle
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

const MotionCard = motion.create(Card)

interface QuestionCardProps {
  question: Question
  currentIndex: number
  totalQuestions: number
  selectedAnswer?: string | string[]
  onAnswerSelect: (answer: string | string[]) => void
  showResult?: boolean
  className?: string
}

export function QuestionCard({
  question,
  currentIndex,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
  showResult = false,
  className
}: QuestionCardProps) {
  const progress = ((currentIndex + 1) / totalQuestions) * 100
  const isMultipleChoice = Array.isArray(question.correct_answer)
  
  const handleAnswerToggle = (answer: string) => {
    if (isMultipleChoice) {
      const currentAnswers = Array.isArray(selectedAnswer) ? selectedAnswer : []
      if (currentAnswers.includes(answer)) {
        onAnswerSelect(currentAnswers.filter(a => a !== answer))
      } else {
        onAnswerSelect([...currentAnswers, answer])
      }
    } else {
      onAnswerSelect(answer)
    }
  }

  const IconComponent = topicIcons[question.topic] || Settings
  const topicColorClass = topicColors[question.topic] || topicColors['General IT']

  return (
    <MotionCard 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.25, 0.46, 0.45, 0.94] 
      }}
      className={cn(
        "w-full max-w-2xl mx-auto",
        "border-0 shadow-lg bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-background/95",
        "hover:shadow-xl transition-shadow duration-300",
        className
      )}>
      <CardHeader className="space-y-4 pb-4">
        {/* Progress and question number */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Question {currentIndex + 1} of {totalQuestions}</span>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3, ease: "backOut" }}
            >
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
            </motion.div>
          </div>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
            style={{ originX: 0 }}
          >
            <Progress value={progress} className="h-2" />
          </motion.div>
        </div>
        
        {/* Question text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <CardTitle className="text-lg leading-relaxed font-medium">
            {question.question}
          </CardTitle>
        </motion.div>
        
        {isMultipleChoice && (
          <p className="text-sm text-muted-foreground">
            Select all that apply
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-3 pt-0">
        {/* Answer options */}
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <AnswerChoice
              key={index}
              option={option}
              isSelected={
                isMultipleChoice 
                  ? Array.isArray(selectedAnswer) && selectedAnswer.includes(option)
                  : selectedAnswer === option
              }
              isCorrect={
                showResult 
                  ? Array.isArray(question.correct_answer)
                    ? question.correct_answer.includes(option)
                    : question.correct_answer === option
                  : undefined
              }
              isMultipleChoice={isMultipleChoice}
              onClick={() => handleAnswerToggle(option)}
              disabled={showResult}
            />
          ))}
        </div>
        
        {/* Explanation (shown after answering) */}
        {showResult && question.explanation && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg border">
            <h4 className="font-medium text-sm mb-2 text-muted-foreground">
              Explanation:
            </h4>
            <p className="text-sm leading-relaxed">
              {question.explanation}
            </p>
          </div>
        )}
      </CardContent>
    </MotionCard>
  )
}