'use client'

import Link from 'next/link'
import { useQuizStore } from '@/store/useQuizStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { DifficultyBadge } from '@/components/ui/DifficultyBadge'
import { AchievementNotificationManager } from '@/components/ui/AchievementNotification'
import { QuestionNavigationMap } from './QuestionNavigationMap'
import { getDifficultyStats } from '@/lib/difficulty'
import { 
  Trophy, 
  Target, 
  Home, 
  RotateCcw,
  CheckCircle,
  XCircle,
  Award
} from 'lucide-react'
import { formatTime } from '@/lib/utils'

export function QuizResults() {
  const { 
    currentSession, 
    resetSession, 
    newAchievements, 
    clearNewAchievements 
  } = useQuizStore()

  if (!currentSession || !currentSession.completed) {
    return null
  }

  const {
    questions,
    answers,
    score = 0,
    startTime,
    mode
  } = currentSession

  const timeSpent = Date.now() - startTime
  const correctAnswers = questions.filter(q => {
    const userAnswer = answers[q.id]
    if (!userAnswer) return false
    
    if (Array.isArray(q.correctAnswer)) {
      if (!Array.isArray(userAnswer)) return false
      // Convert user answers to indices for comparison
      const userIndices = userAnswer.map(ans => q.options.indexOf(ans))
      const correctIndices = q.correctAnswer as number[]
      return userIndices.length === correctIndices.length &&
             userIndices.every(idx => correctIndices.includes(idx))
    }
    // Convert user answer to index for comparison
    const userIndex = q.options.indexOf(String(userAnswer))
    return userIndex === q.correctAnswer
  }).length

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-blue-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { text: 'Excellent!', variant: 'default' as const, icon: Trophy }
    if (score >= 75) return { text: 'Good Job!', variant: 'secondary' as const, icon: Award }
    if (score >= 60) return { text: 'Keep Learning!', variant: 'outline' as const, icon: Target }
    return { text: 'Try Again!', variant: 'destructive' as const, icon: RotateCcw }
  }

  const scoreInfo = getScoreBadge(score)
  const ScoreIcon = scoreInfo.icon
  
  // Calculate difficulty statistics
  const difficultyStats = getDifficultyStats(questions)

  return (
    <>
      {/* Achievement Notifications */}
      {newAchievements.length > 0 && (
        <AchievementNotificationManager
          achievements={newAchievements}
          onAchievementsShown={clearNewAchievements}
        />
      )}
      
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
            <ScoreIcon className={`w-12 h-12 ${getScoreColor(score)}`} />
          </div>
          
          <h1 className="text-3xl font-bold mb-2">Quiz Complete!</h1>
          <Badge variant={scoreInfo.variant} className="text-sm px-4 py-1">
            {scoreInfo.text}
          </Badge>
        </div>

        {/* Score Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-center">Your Score</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className={`text-6xl font-bold ${getScoreColor(score)}`}>
              {Math.round(score)}%
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {correctAnswers}
                </div>
                <div className="text-xs text-muted-foreground">Correct</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {questions.length - correctAnswers}
                </div>
                <div className="text-xs text-muted-foreground">Incorrect</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {questions.length}
                </div>
                <div className="text-xs text-muted-foreground">Total Questions</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {formatTime(timeSpent)}
                </div>
                <div className="text-xs text-muted-foreground">Time Spent</div>
              </div>
            </div>
            
            <Progress value={score} className="h-3" />
          </CardContent>
        </Card>

        {/* Difficulty Breakdown */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Difficulty Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2">
                  <DifficultyBadge difficulty="easy" variant="compact" animated={false} />
                  <span className="text-sm font-medium">Easy Questions</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-700 dark:text-green-400">
                    {difficultyStats.counts.easy}
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-500">
                    {difficultyStats.percentages.easy}%
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-2">
                  <DifficultyBadge difficulty="medium" variant="compact" animated={false} />
                  <span className="text-sm font-medium">Medium Questions</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-yellow-700 dark:text-yellow-400">
                    {difficultyStats.counts.medium}
                  </div>
                  <div className="text-xs text-yellow-600 dark:text-yellow-500">
                    {difficultyStats.percentages.medium}%
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2">
                  <DifficultyBadge difficulty="hard" variant="compact" animated={false} />
                  <span className="text-sm font-medium">Hard Questions</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-red-700 dark:text-red-400">
                    {difficultyStats.counts.hard}
                  </div>
                  <div className="text-xs text-red-600 dark:text-red-500">
                    {difficultyStats.percentages.hard}%
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Navigation Map */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Question Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <QuestionNavigationMap
              questions={questions}
              currentIndex={-1} // No current question in results
              answers={answers}
              onNavigate={() => {}} // No navigation in results
              showResults={true}
              compact={false}
            />
          </CardContent>
        </Card>

        {/* Question Review */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Question Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {questions.map((question, index) => {
              const userAnswer = answers[question.id]
              
              // Calculate if the answer is correct
              const isCorrect = (() => {
                if (!userAnswer) return false
                
                if (Array.isArray(question.correctAnswer)) {
                  // Multiple choice question
                  if (!Array.isArray(userAnswer)) return false
                  
                  // Convert user answers to indices for comparison
                  const userIndices = userAnswer.map(ans => question.options.indexOf(ans))
                  const correctIndices = question.correctAnswer as number[]
                  
                  // Check if all user indices are in correct indices and lengths match
                  return userIndices.length === correctIndices.length &&
                         userIndices.every(idx => idx !== -1 && correctIndices.includes(idx))
                } else {
                  // Single choice question
                  // Convert user answer to index for comparison
                  const userIndex = question.options.indexOf(String(userAnswer))
                  return userIndex !== -1 && userIndex === question.correctAnswer
                }
              })()

              // Get the correct answer text(s) for display
              const getCorrectAnswerText = () => {
                if (Array.isArray(question.correctAnswer)) {
                  return question.correctAnswer.map(idx => question.options[idx]).join(', ')
                } else {
                  return question.options[question.correctAnswer]
                }
              }

              return (
                <div key={question.id} className="flex items-start gap-3 p-4 rounded-lg border">
                  <div className="flex-shrink-0">
                    {isCorrect ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">Question {index + 1}</span>
                      <DifficultyBadge 
                        question={question}
                        variant="compact"
                        animated={false}
                      />
                      <Badge variant="outline" className="text-xs">
                        {question.topic}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {question.question}
                    </p>
                    
                    <div className="text-xs space-y-1">
                      <div>
                        <span className="font-medium">Your answer: </span>
                        <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                          {userAnswer ? (Array.isArray(userAnswer) ? userAnswer.join(', ') : userAnswer) : 'No answer'}
                        </span>
                      </div>
                      
                      <div>
                        <span className="font-medium">Correct answer: </span>
                        <span className="text-green-600">
                          {getCorrectAnswerText()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button variant="outline" className="w-full sm:w-auto" onClick={resetSession}>
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <Link href={`/quiz/${mode}`}>
            <Button className="w-full sm:w-auto">
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </Link>
        </div>

        {/* Study Tips */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Keep Learning!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground space-y-2">
              {score < 60 && (
                <p>
                  📚 <strong>Study Tip:</strong> Focus on the topics where you missed questions. 
                  Review the explanations and try practice mode to improve your understanding.
                </p>
              )}
              
              {score >= 60 && score < 80 && (
                <p>
                  🎯 <strong>Almost There:</strong> You&apos;re making good progress! 
                  Practice more questions in your weaker areas to boost your score.
                </p>
              )}
              
              {score >= 80 && (
                <p>
                  🌟 <strong>Great Work:</strong> You&apos;re demonstrating solid understanding! 
                  Keep practicing to maintain your skills and try timed quizzes for exam simulation.
                </p>
              )}
              
              <p className="mt-4">
                💡 <strong>Next Steps:</strong> Try different quiz modes and build your daily streak 
                to master all IT Essentials topics!
              </p>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </>
  )
}