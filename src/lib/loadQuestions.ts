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

// Cache for loaded questions with timestamp for invalidation
let questionsCache: QuestionData | null = null

/**
 * Transforms raw question data to standardized format
 */
function normalizeQuestion(rawQuestion: RawQuestion): Question {
  console.log('DEBUG - Normalizing question:', rawQuestion.id)
  console.log('DEBUG - Raw question object:', rawQuestion)
  console.log('DEBUG - Raw correctAnswer:', rawQuestion.correctAnswer)
  console.log('DEBUG - Raw correct_answer:', rawQuestion.correct_answer)
  console.log('DEBUG - Raw question keys:', Object.keys(rawQuestion))
  
  const normalized: Question = {
    id: rawQuestion.id,
    question: rawQuestion.question,
    options: rawQuestion.options,
    correctAnswer: 0, // Temporary placeholder, will be overwritten
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
      normalized.correctAnswer = answerIndex !== -1 ? answerIndex : answerIndex
    }
  }
  
  // Validate that we have a valid correctAnswer
  if (normalized.correctAnswer === undefined || 
      (Array.isArray(normalized.correctAnswer) && normalized.correctAnswer.length === 0)) {
    console.error(`Question ${rawQuestion.id} has invalid correctAnswer:`, rawQuestion.correctAnswer)
    throw new Error(`Question ${rawQuestion.id} has invalid correctAnswer`)
  }

  console.log('DEBUG - Final normalized question:', rawQuestion.id, 'correctAnswer:', normalized.correctAnswer)
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
  
  console.log('DEBUG - Raw JSON data loaded')
  console.log('DEBUG - Raw data structure:', Object.keys(rawData))
  console.log('DEBUG - Raw questions count:', rawData.questions.length)
  console.log('DEBUG - First raw question:', rawData.questions[0])
  console.log('DEBUG - First raw question keys:', Object.keys(rawData.questions[0]))
  
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

/**
 * Clear the questions cache to force reload
 */
export function clearQuestionsCache(): void {
  questionsCache = null
  cacheTimestamp = 0
  console.log('DEBUG - Questions cache cleared')
}