'use client'

import { Question } from '@/types/quiz'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AnswerChoice } from './AnswerChoice'
import { ExhibitDisplay } from './ExhibitDisplay'
import { DifficultyBadge } from '@/components/ui/DifficultyBadge'
import { useAccessibility } from '@/hooks/useAccessibility'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useMemo } from 'react'
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
  CheckCircle,
  Clock,
  Target,
  XCircle
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

// Animation variants for consistent animations
const containerVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  },
  exit: { opacity: 0, y: -20, scale: 0.95 }
}

const itemVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
}

const progressVariants = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
}

const answerVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (index: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: index * 0.1,
      duration: 0.3,
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  })
}

interface QuestionCardProps {
  question: Question
  onAnswerSubmit: (answer: string | string[]) => void
  hasAnswered: boolean
  isCorrect: boolean
  currentAnswer: string | string[] | null
  mode: 'practice' | 'timed' | 'review'
  className?: string
}

export function QuestionCard({
  question,
  onAnswerSubmit,
  hasAnswered,
  isCorrect,
  currentAnswer,
  mode,
  className
}: QuestionCardProps) {
  const { announce, announceQuizState } = useAccessibility()
  const isMultipleChoice = Array.isArray(question.correctAnswer)
  
  // Memoized values for performance
  const IconComponent = useMemo(() => topicIcons[question.topic] || Settings, [question.topic])
  const topicColorClass = useMemo(() => topicColors[question.topic] || topicColors['General IT'], [question.topic])
  const requiredAnswersCount = useMemo(() => 
    Array.isArray(question.correctAnswer) ? question.correctAnswer.length : 1, 
    [question.correctAnswer]
  )
  
  // Announce question when it changes
  useEffect(() => {
    announceQuizState(
      `Question ${question.id}`,
      `Topic: ${question.topic}. ${question.question}`
    )
  }, [question.id, question.topic, question.question, announceQuizState])
  
  const handleAnswerToggle = (answer: string) => {
    if (isMultipleChoice) {
      const currentAnswers = Array.isArray(currentAnswer) ? currentAnswer : []
      let newAnswers: string[]
      
      if (currentAnswers.includes(answer)) {
        newAnswers = currentAnswers.filter(a => a !== answer)
        announce(`Deselected answer: ${answer}`, 'polite')
      } else {
        newAnswers = [...currentAnswers, answer]
        announce(`Selected answer: ${answer}`, 'polite')
      }
      
      onAnswerSubmit(newAnswers)
    } else {
      onAnswerSubmit(answer)
      announce(`Selected answer: ${answer}`, 'polite')
    }
  }

  const getAnswerStatus = () => {
    if (!hasAnswered) return null
    
    if (isCorrect) {
      return {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50 dark:bg-green-950/20',
        borderColor: 'border-green-200 dark:border-green-800',
        message: 'Correct! Well done!'
      }
    } else {
      return {
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50 dark:bg-red-950/20',
        borderColor: 'border-red-200 dark:border-red-800',
        message: 'Incorrect. Keep learning!'
      }
    }
  }

  const answerStatus = getAnswerStatus()

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={cn("w-full max-w-2xl mx-auto", className)}
    >
      <Card className={cn(
        "w-full border-0 shadow-lg bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-background/95",
        "hover:shadow-xl transition-all duration-300 hover:-translate-y-1",
        "h-full flex flex-col"
      )}>
        <CardHeader className="space-y-3 md:space-y-4 pb-3 md:pb-4 px-3 md:px-6 pt-3 md:pt-6">
          {/* Progress and question number */}
          <motion.div 
            className="space-y-2"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between text-xs md:text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span>Question {question.id}</span>
              </div>
              <div className="flex items-center gap-2">
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.3, ease: "backOut" }}
                >
                  <DifficultyBadge 
                    question={question}
                    variant="default"
                    animated={true}
                  />
                </motion.div>
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.3, ease: "backOut" }}
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
            </div>
            <motion.div
              variants={progressVariants}
              initial="hidden"
              animate="visible"
              style={{ originX: 0 }}
            >
              <Progress value={100} className="h-2" />
            </motion.div>
          </motion.div>
          
          {/* Question text */}
          <motion.div
            variants={itemVariants}
            className="space-y-3"
          >
            <CardTitle 
              className="text-base md:text-lg leading-relaxed font-medium"
              role="heading"
              aria-level={2}
              id={`question-${question.id}`}
            >
              {question.question}
            </CardTitle>
            
            {/* Mode indicator */}
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {mode === 'practice' && <Clock className="w-3 h-3 mr-1" />}
                {mode === 'timed' && <Target className="w-3 h-3 mr-1" />}
                {mode === 'review' && <CheckCircle className="w-3 h-3 mr-1" />}
                {mode.charAt(0).toUpperCase() + mode.slice(1)} Mode
              </Badge>
            </div>
          </motion.div>
          
          {/* Exhibit display */}
          {question.exhibit && (
            <motion.div
              variants={itemVariants}
              className="mt-4"
            >
              <ExhibitDisplay 
                exhibit={question.exhibit} 
                className="max-w-full"
              />
            </motion.div>
          )}
          
          {/* Multiple choice instructions */}
          {isMultipleChoice && (
            <motion.div
              variants={itemVariants}
              className="space-y-2 p-3 bg-muted/30 rounded-lg border border-border/50"
            >
              <p className="text-sm text-muted-foreground font-medium">
                Select all that apply ({requiredAnswersCount} correct answers)
              </p>
              <div className="flex items-center justify-between">
                {currentAnswer && Array.isArray(currentAnswer) && currentAnswer.length > 0 ? (
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium text-primary">
                      Selected: {currentAnswer.length} of {requiredAnswersCount}
                    </p>
                    {currentAnswer.length === requiredAnswersCount ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 15 }}
                          className="w-2 h-2 bg-green-500 rounded-full"
                        />
                        <span className="text-xs font-medium">Ready to continue</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-amber-600">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="w-2 h-2 bg-amber-500 rounded-full"
                        />
                        <span className="text-xs">
                          Select {requiredAnswersCount - currentAnswer.length} more
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Select all {requiredAnswersCount} options to continue
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </CardHeader>
        
        <CardContent className="space-y-2 md:space-y-3 pt-0 px-3 md:px-6 pb-3 md:pb-6">
          {/* Answer options */}
          <fieldset>
            <legend className="sr-only">
              {isMultipleChoice 
                ? `Select ${requiredAnswersCount} correct answers for question ${question.id}`
                : `Select the correct answer for question ${question.id}`
              }
            </legend>
            <div 
              className="space-y-2 md:space-y-3"
              role={isMultipleChoice ? "group" : "radiogroup"}
              aria-labelledby={`question-${question.id}`}
            >
              {question.options.map((option, index) => (
                <motion.div
                  key={index}
                  custom={index}
                  variants={answerVariants}
                >
                  <AnswerChoice
                    option={option}
                    isSelected={
                      isMultipleChoice 
                        ? Array.isArray(currentAnswer) && currentAnswer.includes(option)
                        : currentAnswer === option
                    }
                    isCorrect={
                      hasAnswered
                        ? Array.isArray(question.correctAnswer)
                          ? question.correctAnswer.includes(index)
                          : question.correctAnswer === index
                        : undefined
                    }
                    isMultipleChoice={isMultipleChoice}
                    onClick={() => handleAnswerToggle(option)}
                    disabled={hasAnswered}
                  />
                </motion.div>
              ))}
            </div>
          </fieldset>
          
          {/* Answer feedback */}
          <AnimatePresence>
            {answerStatus && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className={cn(
                  "mt-6 p-4 rounded-lg border",
                  answerStatus.bgColor,
                  answerStatus.borderColor
                )}
              >
                <div className="flex items-center gap-3">
                  <answerStatus.icon className={cn("w-5 h-5", answerStatus.color)} />
                  <div>
                    <h4 className="font-medium text-sm mb-1 text-foreground">
                      {answerStatus.message}
                    </h4>
                    {question.explanation && (
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {question.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}