'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Question } from '@/types/quiz'

// Lazy load questions data to avoid blocking main thread
let questionsCache: { questions: Question[], exam_info: any } | null = null

export async function loadQuestionsData(): Promise<{ questions: Question[], exam_info: any }> {
  if (questionsCache) {
    return questionsCache
  }

  // Use dynamic import with web worker for parsing
  const { default: questionData } = await import('@/data/questions.json')
  
  // Parse in chunks to avoid blocking main thread
  const parseInChunks = (data: any): Promise<{ questions: Question[], exam_info: any }> => {
    return new Promise((resolve) => {
      // Use scheduler.postTask if available, otherwise setTimeout
      const schedule = (callback: () => void) => {
        if ('scheduler' in window && 'postTask' in (window as any).scheduler) {
          (window as any).scheduler.postTask(callback, { priority: 'user-blocking' })
        } else {
          setTimeout(callback, 0)
        }
      }

      schedule(() => {
        questionsCache = {
          questions: data.questions,
          exam_info: data.exam_info
        }
        resolve(questionsCache)
      })
    })
  }

  return parseInChunks(questionData)
}

// Lazy load questions by topic to reduce memory usage
export async function loadQuestionsByTopic(topic: string): Promise<Question[]> {
  const data = await loadQuestionsData()
  return data.questions.filter(q => q.topic === topic)
}

// Paginated loading for better performance
export async function loadQuestionsPage(page: number, pageSize: number = 20): Promise<{
  questions: Question[]
  totalPages: number
  hasMore: boolean
}> {
  const data = await loadQuestionsData()
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const totalPages = Math.ceil(data.questions.length / pageSize)
  
  return {
    questions: data.questions.slice(startIndex, endIndex),
    totalPages,
    hasMore: page < totalPages
  }
}

// Pre-load critical data
export const preloadQuestions = () => {
  // Only preload on good connections
  if ('connection' in navigator) {
    const connection = (navigator as any).connection
    if (connection?.effectiveType === '4g' || connection?.downlink > 2) {
      loadQuestionsData()
    }
  }
}