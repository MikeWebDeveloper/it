'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  Brain, 
  Target, 
  Clock,
  TrendingUp,
  BookOpen,
  Zap,
  Settings,
  AlertCircle,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { useQuizStore } from '@/store/useQuizStore'
import { useAdaptiveQuestionOrdering, AdaptiveOrderingOptions } from '@/hooks/useAdaptiveQuestionOrdering'
import { cn } from '@/lib/utils'

interface AdaptivePracticeProps {
  className?: string
  onBack?: () => void
}

export function AdaptivePractice({ className, onBack }: AdaptivePracticeProps) {
  const router = useRouter()
  const { allQuestions, startQuiz, userProgress } = useQuizStore()
  const { 
    createAdaptiveQuestionSet, 
    getStudyRecommendations 
  } = useAdaptiveQuestionOrdering()
  
  const [options, setOptions] = useState<AdaptiveOrderingOptions>({
    mode: 'practice',
    maxQuestions: 15,
    focusOnWeakAreas: true,
    balanceDifficulty: true,
    reviewIncorrectAnswers: false,
    prioritizeRecentTopics: false
  })

  const recommendations = getStudyRecommendations
  const hasProgressData = userProgress.totalSessionsCompleted > 0

  const handleStartAdaptiveSession = () => {
    if (allQuestions.length === 0) return

    const adaptiveQuestions = createAdaptiveQuestionSet(allQuestions, options)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const questionList = adaptiveQuestions.map(({ priorityScore, weaknessScore, recencyScore, difficultyScore, ...question }) => question)
    
    // Create the session first
    startQuiz(options.mode, questionList)
    
    // Give the store a moment to update, then navigate
    setTimeout(() => {
      router.push(`/quiz/${options.mode}`)
    }, 100)
  }

  const updateOption = <K extends keyof AdaptiveOrderingOptions>(
    key: K, 
    value: AdaptiveOrderingOptions[K]
  ) => {
    setOptions(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 mb-4"
        >
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Adaptive Practice</h1>
        </motion.div>
        <p className="text-muted-foreground">
          AI-powered practice that adapts to your learning needs
        </p>
      </div>

      {/* Study Recommendations */}
      {hasProgressData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                <TrendingUp className="w-5 h-5" />
                Study Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {recommendations.suggestion}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Weak Topics */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    Focus Areas
                  </h4>
                  {recommendations.weakTopics.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {recommendations.weakTopics.map(topic => (
                        <Badge key={topic} variant="outline" className="text-xs border-orange-300 text-orange-700 dark:text-orange-300">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">All topics performing well!</p>
                  )}
                </div>

                {/* Review Topics */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                    <Clock className="w-4 h-4 text-blue-500" />
                    Due for Review
                  </h4>
                  {recommendations.reviewTopics.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {recommendations.reviewTopics.map(topic => (
                        <Badge key={topic} variant="outline" className="text-xs border-blue-300 text-blue-700 dark:text-blue-300">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">All topics recently studied!</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Adaptive Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Adaptive Settings
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Customize how questions are selected and ordered
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Practice Mode */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Practice Mode</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  variant={options.mode === 'practice' ? 'default' : 'outline'}
                  onClick={() => updateOption('mode', 'practice')}
                  className="justify-start h-auto p-4"
                >
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen className="w-4 h-4" />
                      <span className="font-medium">Practice</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Learn with instant feedback
                    </div>
                  </div>
                </Button>
                <Button
                  variant={options.mode === 'review' ? 'default' : 'outline'}
                  onClick={() => updateOption('mode', 'review')}
                  className="justify-start h-auto p-4"
                >
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-4 h-4" />
                      <span className="font-medium">Review</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Focus on weak areas
                    </div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Number of Questions */}
            <div className="space-y-3">
              <label className="text-sm font-medium">
                Number of Questions: {options.maxQuestions}
              </label>
              <Slider
                value={[options.maxQuestions || 15]}
                onValueChange={([value]) => updateOption('maxQuestions', value)}
                min={5}
                max={50}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5</span>
                <span>50</span>
              </div>
            </div>

            {/* Advanced Options */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Advanced Options</h4>
              
              <div className="space-y-4">
                {/* Focus on Weak Areas */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-orange-500" />
                      <label className="text-sm font-medium">Focus on Weak Areas</label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Prioritize topics where you need improvement
                    </p>
                  </div>
                  <Switch
                    checked={options.focusOnWeakAreas}
                    onCheckedChange={(checked) => updateOption('focusOnWeakAreas', checked)}
                  />
                </div>

                {/* Balance Difficulty */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-500" />
                      <label className="text-sm font-medium">Balance Difficulty</label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Mix of easy, medium, and hard questions
                    </p>
                  </div>
                  <Switch
                    checked={options.balanceDifficulty}
                    onCheckedChange={(checked) => updateOption('balanceDifficulty', checked)}
                  />
                </div>

                {/* Review Incorrect Answers */}
                {options.mode === 'review' && (
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <label className="text-sm font-medium">Review Incorrect Answers</label>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Focus on topics where you made mistakes
                      </p>
                    </div>
                    <Switch
                      checked={options.reviewIncorrectAnswers}
                      onCheckedChange={(checked) => updateOption('reviewIncorrectAnswers', checked)}
                    />
                  </div>
                )}

                {/* Prioritize Recent Topics */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-green-500" />
                      <label className="text-sm font-medium">Prioritize Recent Topics</label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Focus on recently studied material
                    </p>
                  </div>
                  <Switch
                    checked={options.prioritizeRecentTopics}
                    onCheckedChange={(checked) => updateOption('prioritizeRecentTopics', checked)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Start Session */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex gap-4"
      >
        {onBack && (
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1 md:flex-initial"
          >
            Back
          </Button>
        )}
        
        <Button
          onClick={handleStartAdaptiveSession}
          disabled={allQuestions.length === 0}
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Brain className="w-4 h-4 mr-2" />
          Start Adaptive {options.mode === 'practice' ? 'Practice' : 'Review'}
        </Button>
      </motion.div>

      {/* Info Card for New Users */}
      {!hasProgressData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
                    Complete some practice sessions first!
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    Adaptive practice works best after you&apos;ve completed a few regular practice sessions. 
                    This helps the system learn your strengths and weaknesses.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}