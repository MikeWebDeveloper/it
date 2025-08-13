'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { 
  BookOpen, 
  Clock, 
  RotateCcw, 
  Settings,
  Shuffle,
  Target,
  Timer
} from 'lucide-react'
import questionData from '@/data/questions.json'

interface QuizConfigProps {
  selectedCategories: string[]
  onStartQuiz: (config: QuizConfiguration) => void
  onBack: () => void
}

export interface QuizConfiguration {
  mode: 'practice' | 'timed' | 'review'
  categories: string[]
  questionCount: number
  timeLimit?: number
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed'
  randomOrder: boolean
}

export function QuizConfig({ selectedCategories, onStartQuiz, onBack }: QuizConfigProps) {
  const [mode, setMode] = useState<'practice' | 'timed' | 'review'>('practice')
  const [questionCount, setQuestionCount] = useState([10])
  const [timeLimit, setTimeLimit] = useState([15])
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'mixed'>('mixed')
  const [randomOrder, setRandomOrder] = useState(true)

  const totalAvailableQuestions = selectedCategories.reduce((sum, category) => {
    return sum + questionData.questions.filter(q => q.topic === category).length
  }, 0)

  const maxQuestions = Math.min(totalAvailableQuestions, 50)

  const handleStartQuiz = () => {
    const config: QuizConfiguration = {
      mode,
      categories: selectedCategories,
      questionCount: questionCount[0],
      timeLimit: mode === 'timed' ? timeLimit[0] * 60 * 1000 : undefined, // Convert to milliseconds
      difficulty,
      randomOrder
    }
    
    onStartQuiz(config)
  }

  const modeOptions = [
    {
      id: 'practice' as const,
      title: 'Practice Mode',
      description: 'Learn at your own pace with immediate feedback',
      icon: BookOpen,
      color: 'bg-blue-500'
    },
    {
      id: 'timed' as const,
      title: 'Timed Quiz',
      description: 'Simulate real exam conditions with time pressure',
      icon: Clock,
      color: 'bg-orange-500'
    },
    {
      id: 'review' as const,
      title: 'Review Mode',
      description: 'Focus on areas that need improvement',
      icon: RotateCcw,
      color: 'bg-green-500'
    }
  ]

  const difficultyOptions = [
    { id: 'easy' as const, label: 'Easy', description: 'Basic concepts' },
    { id: 'medium' as const, label: 'Medium', description: 'Standard difficulty' },
    { id: 'hard' as const, label: 'Hard', description: 'Advanced topics' },
    { id: 'mixed' as const, label: 'Mixed', description: 'All difficulty levels' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Configure Your Quiz</h2>
        <Button variant="outline" onClick={onBack}>
          Back to Topics
        </Button>
      </div>

      {/* Selected Categories Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="w-5 h-5" />
            Selected Topics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedCategories.map(category => (
              <Badge key={category} variant="secondary">
                {category}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            {totalAvailableQuestions} questions available across {selectedCategories.length} topic{selectedCategories.length !== 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>

      {/* Quiz Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quiz Mode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {modeOptions.map((option) => {
              const IconComponent = option.icon
              const isSelected = mode === option.id
              
              return (
                <div
                  key={option.id}
                  className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                    isSelected 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setMode(option.id)}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`p-2 rounded-lg ${option.color} text-white`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold">{option.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Question Count */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Number of Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="px-2">
            <Slider
              value={questionCount}
              onValueChange={setQuestionCount}
              max={maxQuestions}
              min={5}
              step={5}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>5 questions</span>
            <span className="font-semibold text-foreground">
              {questionCount[0]} questions
            </span>
            <span>{maxQuestions} questions (max)</span>
          </div>
        </CardContent>
      </Card>

      {/* Time Limit (for timed mode) */}
      {mode === 'timed' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Timer className="w-5 h-5" />
              Time Limit
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="px-2">
              <Slider
                value={timeLimit}
                onValueChange={setTimeLimit}
                max={60}
                min={5}
                step={5}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>5 minutes</span>
              <span className="font-semibold text-foreground">
                {timeLimit[0]} minutes
              </span>
              <span>60 minutes</span>
            </div>
            <p className="text-xs text-muted-foreground">
              ≈ {Math.round(timeLimit[0] * 60 / questionCount[0])} seconds per question
            </p>
          </CardContent>
        </Card>
      )}

      {/* Difficulty Level */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Difficulty Level</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {difficultyOptions.map((option) => (
              <Button
                key={option.id}
                variant={difficulty === option.id ? "default" : "outline"}
                onClick={() => setDifficulty(option.id)}
                className="h-auto p-3 flex flex-col items-center"
              >
                <span className="font-medium">{option.label}</span>
                <span className="text-xs text-muted-foreground mt-1">
                  {option.description}
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Shuffle className="w-4 h-4" />
                <span className="font-medium">Random Question Order</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Shuffle questions for varied practice
              </p>
            </div>
            <Button
              variant={randomOrder ? "default" : "outline"}
              size="sm"
              onClick={() => setRandomOrder(!randomOrder)}
            >
              {randomOrder ? 'On' : 'Off'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Start Quiz Button */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Ready to Start?</h3>
              <p className="text-sm text-muted-foreground">
                {questionCount[0]} questions • {selectedCategories.length} topic{selectedCategories.length !== 1 ? 's' : ''} • {difficulty} difficulty
                {mode === 'timed' && ` • ${timeLimit[0]} minutes`}
              </p>
            </div>
            <Button 
              size="lg" 
              onClick={handleStartQuiz}
              className="w-full md:w-auto px-8"
            >
              Start {mode === 'timed' ? 'Timed' : mode === 'review' ? 'Review' : 'Practice'} Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}