export interface Question {
  id: number
  question: string
  options: string[]
  correct_answer: string | string[]
  explanation?: string
  topic: string
}

export interface QuestionData {
  exam_info: {
    title: string
    total_questions: number
    topics: string[]
  }
  questions: Question[]
}

export type QuizMode = 'practice' | 'timed' | 'review'

export interface QuizSession {
  id: string
  mode: QuizMode
  questions: Question[]
  currentQuestionIndex: number
  answers: Record<number, string | string[]>
  startTime: number
  timeRemaining?: number
  completed: boolean
  score?: number
}

export interface QuizStatistics {
  sessionId: string
  mode: QuizMode
  totalQuestions: number
  correctAnswers: number
  incorrectAnswers: number
  accuracy: number
  timeSpent: number
  completedAt: string
  topicBreakdown: Record<string, {
    total: number
    correct: number
    accuracy: number
  }>
}

export interface UserProgress {
  totalSessionsCompleted: number
  totalQuestions: number
  totalCorrect: number
  streak: number
  longestStreak: number
  lastSessionDate: string
  topicProgress: Record<string, {
    questionsAnswered: number
    correctAnswers: number
    masteryLevel: 'beginner' | 'intermediate' | 'advanced'
  }>
  achievements: Achievement[]
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt: string
  category: 'streak' | 'accuracy' | 'speed' | 'topic' | 'milestone'
}