'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuizStore } from '@/store/useQuizStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Trophy, 
  Target, 
  Clock,
  TrendingUp,
  Calendar,
  BarChart3,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Sun,
  Moon,
  Filter
} from 'lucide-react'
import questionData from '@/data/questions.json'
import { useTheme } from 'next-themes'

export default function StatsPage() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const { userProgress, sessionHistory } = useQuizStore()
  const { setTheme, theme } = useTheme()
  const router = useRouter()

  // Calculate overall statistics
  const totalQuestions = userProgress.totalQuestions
  const correctAnswers = userProgress.totalCorrect
  const incorrectAnswers = totalQuestions - correctAnswers
  const overallAccuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0

  // Topic statistics
  const topicStats = Object.entries(userProgress.topicProgress).map(([topic, progress]) => {
    const accuracy = progress.questionsAnswered > 0 
      ? (progress.correctAnswers / progress.questionsAnswered) * 100 
      : 0
    
    const totalTopicQuestions = questionData.questions.filter(q => q.topic === topic).length
    const completionRate = (progress.questionsAnswered / totalTopicQuestions) * 100

    return {
      topic,
      ...progress,
      accuracy,
      completionRate,
      totalAvailable: totalTopicQuestions
    }
  }).sort((a, b) => b.accuracy - a.accuracy)

  // Recent sessions analysis
  const recentSessions = sessionHistory.slice(-10).reverse()
  const sessionTypes = sessionHistory.reduce((acc, session) => {
    acc[session.mode] = (acc[session.mode] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Streak and consistency
  const currentStreak = userProgress.streak
  const longestStreak = userProgress.longestStreak || currentStreak


  const masteryLevels = {
    beginner: topicStats.filter(t => t.masteryLevel === 'beginner').length,
    intermediate: topicStats.filter(t => t.masteryLevel === 'intermediate').length,
    advanced: topicStats.filter(t => t.masteryLevel === 'advanced').length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <BarChart3 className="w-8 h-8" />
                Your Statistics
              </h1>
              <p className="text-muted-foreground">
                Track your learning progress and performance
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-full"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>

        {/* Overall Performance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalQuestions}</div>
              <p className="text-xs text-muted-foreground">
                {correctAnswers} correct, {incorrectAnswers} incorrect
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Accuracy</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallAccuracy.toFixed(1)}%</div>
              <Progress value={overallAccuracy} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentStreak}</div>
              <p className="text-xs text-muted-foreground">
                Longest: {longestStreak} days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quizzes Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userProgress.totalSessionsCompleted}</div>
              <p className="text-xs text-muted-foreground">
                {sessionTypes.practice || 0} practice, {sessionTypes.timed || 0} timed, {sessionTypes.review || 0} review
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Mastery Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Mastery Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-500 mb-2">{masteryLevels.beginner}</div>
                <div className="text-sm font-medium">Beginner Topics</div>
                <div className="text-xs text-muted-foreground">Need more practice</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-500 mb-2">{masteryLevels.intermediate}</div>
                <div className="text-sm font-medium">Intermediate Topics</div>
                <div className="text-xs text-muted-foreground">Making progress</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500 mb-2">{masteryLevels.advanced}</div>
                <div className="text-sm font-medium">Advanced Topics</div>
                <div className="text-xs text-muted-foreground">Well mastered</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Topic Performance */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Topic Performance
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTopic(selectedTopic ? null : 'all')}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                {selectedTopic ? 'Show All' : 'Filter'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topicStats.map((topic) => (
                <div key={topic.topic} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={
                          topic.masteryLevel === 'advanced' ? 'default' : 
                          topic.masteryLevel === 'intermediate' ? 'secondary' : 
                          'outline'
                        }
                        className="min-w-[90px]"
                      >
                        {topic.masteryLevel}
                      </Badge>
                      <span className="font-medium">{topic.topic}</span>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-semibold">{topic.accuracy.toFixed(1)}% accuracy</div>
                      <div className="text-muted-foreground">
                        {topic.questionsAnswered}/{topic.totalAvailable} questions
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Accuracy</span>
                      <span>{topic.accuracy.toFixed(1)}%</span>
                    </div>
                    <Progress value={topic.accuracy} className="h-2" />
                    
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Completion</span>
                      <span>{topic.completionRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={topic.completionRate} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentSessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No quiz sessions completed yet.</p>
                <p className="text-sm">Start practicing to see your progress!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentSessions.map((session, index) => {
                  const accuracy = session.totalQuestions > 0 
                    ? (session.correctAnswers / session.totalQuestions) * 100 
                    : 0
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="capitalize">
                          {session.mode}
                        </Badge>
                        <div>
                          <div className="font-medium">
                            {session.correctAnswers}/{session.totalQuestions} correct
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(session.completedAt).toLocaleDateString()} • 
                            {session.timeSpent ? ` ${Math.round(session.timeSpent / 1000 / 60)}min` : ' No time limit'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          {accuracy >= 80 ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                          <span className="font-semibold">{accuracy.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}