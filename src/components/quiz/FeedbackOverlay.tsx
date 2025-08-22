'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, Lightbulb, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Question } from '@/types/quiz'
import { cn } from '@/lib/utils'

interface FeedbackOverlayProps {
  question: Question
  userAnswer: string | string[]
  isCorrect: boolean
  isVisible: boolean
  onContinue: () => void
  onClose: () => void
  topicProgress?: {
    correct: number
    total: number
    accuracy: number
  }
}

export function FeedbackOverlay({
  question,
  userAnswer,
  isCorrect,
  isVisible,
  onContinue,
  onClose,
  topicProgress
}: FeedbackOverlayProps) {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (isVisible && isCorrect) {
      setShowConfetti(true)
      const timer = setTimeout(() => setShowConfetti(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, isCorrect])

  if (!isVisible) return null

  // Convert correctAnswer indices to actual answer strings for display
  const correctAnswerIndices = Array.isArray(question.correctAnswer) 
    ? question.correctAnswer 
    : [question.correctAnswer]
  const correctAnswer = correctAnswerIndices.map(index => question.options[index])

  const userAnswerArray = Array.isArray(userAnswer) 
    ? userAnswer 
    : [userAnswer]

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.2 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  }

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: 50
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 25,
        duration: 0.5
      }
    },
    exit: { 
      opacity: 0,
      scale: 0.9,
      y: -20,
      transition: { duration: 0.2 }
    }
  }

  const resultIconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { 
      scale: 1, 
      rotate: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 400,
        damping: 15,
        delay: 0.2
      }
    }
  }

  const progressVariants = {
    hidden: { width: 0 },
    visible: {
      width: topicProgress ? `${topicProgress.accuracy}%` : '0%',
      transition: {
        duration: 1,
        delay: 0.8,
        ease: 'easeOut' as const
      }
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          variants={cardVariants}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl"
        >
          <Card className={cn(
            "relative overflow-hidden border-2",
            isCorrect 
              ? "border-green-500 bg-green-50 dark:bg-green-950/20" 
              : "border-red-500 bg-red-50 dark:bg-red-950/20"
          )}>
            {/* Confetti Effect */}
            {showConfetti && isCorrect && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                    initial={{ 
                      x: '50%', 
                      y: '50%', 
                      scale: 0,
                      rotate: 0
                    }}
                    animate={{ 
                      x: `${Math.random() * 100}%`,
                      y: `${Math.random() * 100}%`,
                      scale: [0, 1, 0],
                      rotate: 360
                    }}
                    transition={{ 
                      duration: 2,
                      delay: i * 0.1,
                      ease: 'easeOut'
                    }}
                  />
                ))}
              </div>
            )}

            <CardContent className="p-8 space-y-6">
              {/* Result Header */}
              <div className="text-center space-y-4">
                <motion.div
                  variants={resultIconVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex justify-center"
                >
                  {isCorrect ? (
                    <CheckCircle2 className="w-16 h-16 text-green-600" />
                  ) : (
                    <XCircle className="w-16 h-16 text-red-600" />
                  )}
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className={cn(
                    "text-2xl font-bold",
                    isCorrect ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
                  )}>
                    {isCorrect ? "Excellent!" : "Not quite right"}
                  </h2>
                  <p className="text-muted-foreground">
                    {isCorrect 
                      ? "You got it correct! Keep up the great work."
                      : "Don't worry, learning from mistakes helps you improve."
                    }
                  </p>
                </motion.div>
              </div>

              {/* Answer Comparison - Enhanced for Multiple Choice */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4"
              >
                {Array.isArray(question.correctAnswer) ? (
                  // Multiple choice detailed feedback
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground mb-3">Answer Analysis:</h3>
                      <div className="space-y-2">
                        {userAnswerArray.map((answer, index) => {
                          const isCorrectChoice = correctAnswer.includes(answer)
                          return (
                            <div key={index} className="flex items-center gap-2">
                              <Badge 
                                variant={isCorrectChoice ? "default" : "destructive"}
                                className={cn(
                                  "flex items-center gap-1",
                                  isCorrectChoice ? "bg-green-600" : ""
                                )}
                              >
                                {isCorrectChoice ? (
                                  <CheckCircle2 className="w-3 h-3" />
                                ) : (
                                  <XCircle className="w-3 h-3" />
                                )}
                                {answer}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {isCorrectChoice ? "Correct choice" : "Incorrect choice"}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    
                    {!isCorrect && (
                      <div>
                        <h3 className="font-semibold text-sm text-muted-foreground mb-2">All Correct Answers:</h3>
                        <div className="space-y-2">
                          {correctAnswer.map((answer, index) => {
                            const wasSelected = userAnswerArray.includes(answer)
                            return (
                              <Badge 
                                key={index} 
                                variant="default" 
                                className={cn(
                                  "mr-2 bg-green-600 flex items-center gap-1 w-fit",
                                  !wasSelected && "opacity-70"
                                )}
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                {answer}
                                {!wasSelected && <span className="text-xs ml-1">(missed)</span>}
                              </Badge>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Single choice feedback (existing logic)
                  !isCorrect && (
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-sm text-muted-foreground mb-2">Your Answer:</h3>
                        <div className="space-y-2">
                          {userAnswerArray.map((answer, index) => (
                            <Badge key={index} variant="destructive" className="mr-2">
                              {answer}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-sm text-muted-foreground mb-2">Correct Answer:</h3>
                        <div className="space-y-2">
                          {correctAnswer.map((answer, index) => (
                            <Badge key={index} variant="default" className="mr-2 bg-green-600">
                              {answer}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                )}
              </motion.div>

              {/* Explanation */}
              {question.explanation && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">
                        Explanation
                      </h4>
                      <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                        {question.explanation}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Topic Progress */}
              {topicProgress && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{question.topic} Progress</span>
                    </div>
                    <Badge variant="outline">
                      {topicProgress.correct}/{topicProgress.total} correct
                    </Badge>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className={cn(
                        "h-full rounded-full",
                        topicProgress.accuracy >= 80 
                          ? "bg-green-500" 
                          : topicProgress.accuracy >= 60
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      )}
                      variants={progressVariants}
                      initial="hidden"
                      animate="visible"
                    />
                  </div>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    {topicProgress.accuracy.toFixed(1)}% accuracy in this topic
                  </p>
                </motion.div>
              )}

              {/* Continue Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex justify-center pt-4"
              >
                <Button
                  onClick={onContinue}
                  size="lg"
                  className={cn(
                    "min-w-32 shadow-lg",
                    isCorrect 
                      ? "bg-green-600 hover:bg-green-700" 
                      : "bg-blue-600 hover:bg-blue-700"
                  )}
                >
                  Continue Learning
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}