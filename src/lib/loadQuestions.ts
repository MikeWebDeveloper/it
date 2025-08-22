import { QuestionData, Question } from '@/types/quiz'

// Interface for raw question data from JSON
interface RawQuestion {
  id: number
  question: string
  options: string[]
  correctAnswer?: number | number[]
  correct_answer?: string | string[]
  explanation?: string
  topic: string
  difficulty?: string
  exhibit?: {
    src: string
    alt: string
    caption?: string
    width?: number
    height?: number
  }
}

// Cache for loaded questions
let questionsCache: QuestionData | null = null

/**
 * Transforms raw question data to standardized format
 */
function normalizeQuestion(rawQuestion: RawQuestion): Question {
  const normalized: Question = {
    id: rawQuestion.id,
    question: rawQuestion.question,
    options: rawQuestion.options,
    correctAnswer: 0, // default fallback
    explanation: rawQuestion.explanation,
    topic: rawQuestion.topic,
    difficulty: rawQuestion.difficulty
  }

  // Handle exhibit if present
  if (rawQuestion.exhibit) {
    normalized.exhibit = rawQuestion.exhibit
  }

  // Normalize correct answer format
  if (rawQuestion.correctAnswer !== undefined) {
    // Already in correct format (number or number[])
    normalized.correctAnswer = rawQuestion.correctAnswer
  } else if (rawQuestion.correct_answer !== undefined) {
    if (Array.isArray(rawQuestion.correct_answer)) {
      // Multiple choice - convert string array to indices
      normalized.correctAnswer = rawQuestion.correct_answer.map((answer: string) => 
        rawQuestion.options.indexOf(answer)
      ).filter((index: number) => index !== -1)
    } else {
      // Single choice - convert string to index
      const answerIndex = rawQuestion.options.indexOf(rawQuestion.correct_answer)
      normalized.correctAnswer = answerIndex !== -1 ? answerIndex : 0
    }
  }

  return normalized
}

/**
 * Lazy loader for questions data
 * Only loads the JSON when actually needed
 */
export async function loadQuestionsData(): Promise<QuestionData> {
  if (questionsCache) {
    return questionsCache
  }

  // Dynamic import to load questions only when needed
  const { default: rawData } = await import('@/data/questions.json')
  
  // Transform the questions to standardized format
  const normalizedData: QuestionData = {
    ...rawData,
    questions: rawData.questions.map(normalizeQuestion)
  }
  
  questionsCache = normalizedData
  
  return questionsCache
}

/**
 * Synchronous getter for when questions are already loaded
 */
export function getQuestionsFromCache(): QuestionData | null {
  return questionsCache
}