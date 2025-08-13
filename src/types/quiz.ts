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

export interface LearningSession {
  id: string
  mode: 'practice' | 'flashcards' | 'review'
  questionsStudied: number
  correctAnswers: number
  timeSpent: number
  topicsStudied: string[]
  date: string
  completedAt: string
}

export interface ExamSession {
  id: string
  mode: 'timed' | 'custom'
  totalQuestions: number
  correctAnswers: number
  accuracy: number
  timeSpent: number
  timeLimit?: number
  topicBreakdown: Record<string, { total: number; correct: number; accuracy: number }>
  date: string
  completedAt: string
  score: number
}

export interface LearningStatistics {
  totalLearningTime: number // in minutes
  totalQuestionsStudied: number
  totalCorrectInLearning: number
  flashcardsReviewed: number
  practiceSessionsCompleted: number
  reviewSessionsCompleted: number
  dailyLearningStreak: number
  averageAccuracyInPractice: number
  topicLearningProgress: Record<string, {
    timeSpent: number
    questionsStudied: number
    correctAnswers: number
    lastStudied: string
    masteryLevel: 'beginner' | 'intermediate' | 'advanced'
  }>
  weeklyLearningGoal: number // minutes per week
  weeklyProgress: number // current week progress
  learningHistory: LearningSession[]
}

export interface ExamStatistics {
  totalExamsCompleted: number
  totalExamQuestions: number
  totalCorrectInExams: number
  averageExamAccuracy: number
  averageExamTime: number
  bestExamScore: number
  worstExamScore: number
  examStreak: number // consecutive passing exams (>= 70%)
  timedQuizzesCompleted: number
  customExamsCompleted: number
  topicExamPerformance: Record<string, {
    examsTaken: number
    averageAccuracy: number
    bestScore: number
    lastExamDate: string
  }>
  monthlyExamGoal: number // exams per month
  monthlyProgress: number // current month progress
  examHistory: ExamSession[]
}