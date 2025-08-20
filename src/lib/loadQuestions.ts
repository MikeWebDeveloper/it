import { QuestionData } from '@/types/quiz'

// Cache for loaded questions
let questionsCache: QuestionData | null = null

/**
 * Lazy loader for questions data
 * Only loads the JSON when actually needed
 */
export async function loadQuestionsData(): Promise<QuestionData> {
  if (questionsCache) {
    return questionsCache
  }

  // Dynamic import to load questions only when needed
  const { default: data } = await import('@/data/questions.json')
  questionsCache = data as QuestionData
  
  return questionsCache
}

/**
 * Synchronous getter for when questions are already loaded
 */
export function getQuestionsFromCache(): QuestionData | null {
  return questionsCache
}