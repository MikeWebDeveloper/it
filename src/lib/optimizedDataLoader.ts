'use client'

import { Question } from '@/types/quiz'

interface JsonData {
  questions: Question[]
  exam_info?: ExamInfo
}

interface ExamInfo {
  title?: string
  description?: string
  version?: string
  totalQuestions?: number
  categories?: string[]
  difficulty?: string
  timeLimit?: number
}

interface DataLoaderState {
  questions: Question[]
  chunks: Map<number, Question[]>
  isLoading: boolean
  progress: number
  error: string | null
  exam_info: ExamInfo | null
}

class OptimizedDataLoader {
  private state: DataLoaderState = {
    questions: [],
    chunks: new Map(),
    isLoading: false,
    progress: 0,
    error: null,
    exam_info: null
  }

  private worker: Worker | null = null
  private listeners: Array<(state: DataLoaderState) => void> = []

  constructor() {
    this.initWorker()
  }

  private initWorker() {
    if (typeof window !== 'undefined' && window.Worker) {
      try {
        this.worker = new Worker('/workers/json-parser.js')
        this.worker.onmessage = this.handleWorkerMessage.bind(this)
        this.worker.onerror = this.handleWorkerError.bind(this)
      } catch {
        console.warn('Web Worker not available, falling back to main thread')
        this.worker = null
      }
    }
  }

  private handleWorkerMessage(e: MessageEvent) {
    const { type, chunk, progress, chunkIndex, totalChunks, exam_info, error } = e.data

    switch (type) {
      case 'CHUNK_PROCESSED':
        this.state.chunks.set(chunkIndex, chunk)
        this.state.progress = progress
        this.notifyListeners()
        break

      case 'PARSING_COMPLETE':
        // Reconstruct full questions array from chunks
        const allQuestions: Question[] = []
        for (let i = 0; i < totalChunks; i++) {
          const chunk = this.state.chunks.get(i)
          if (chunk) {
            allQuestions.push(...chunk)
          }
        }
        
        this.state.questions = allQuestions
        this.state.exam_info = exam_info
        this.state.isLoading = false
        this.state.progress = 100
        this.notifyListeners()
        break

      case 'TOPIC_FILTERED':
      case 'SEARCH_RESULTS':
        // These are handled by specific method callbacks
        break

      case 'ERROR':
        this.state.error = error
        this.state.isLoading = false
        this.notifyListeners()
        break
    }
  }

  private handleWorkerError(error: ErrorEvent) {
    this.state.error = error.message
    this.state.isLoading = false
    this.notifyListeners()
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener({ ...this.state }))
  }

  public subscribe(listener: (state: DataLoaderState) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  public async loadQuestions(): Promise<{ questions: Question[], exam_info: ExamInfo | null }> {
    if (this.state.questions.length > 0) {
      return { questions: this.state.questions, exam_info: this.state.exam_info }
    }

    this.state.isLoading = true
    this.state.progress = 0
    this.state.error = null
    this.notifyListeners()

    try {
      // Use dynamic import to load JSON
      const { default: questionData } = await import('@/data/questions.json')

      if (this.worker) {
        // Use Web Worker for parsing
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Loading timeout'))
          }, 30000) // 30 second timeout

          const originalHandler = this.handleWorkerMessage.bind(this)
          this.worker!.onmessage = (e) => {
            originalHandler(e)
            if (e.data.type === 'PARSING_COMPLETE') {
              clearTimeout(timeout)
              resolve({ questions: this.state.questions, exam_info: this.state.exam_info })
            } else if (e.data.type === 'ERROR') {
              clearTimeout(timeout)
              reject(new Error(e.data.message))
            }
          }

          this.worker!.postMessage({
            type: 'PARSE_QUESTIONS',
            data: questionData,
            chunkSize: 25 // Process 25 questions at a time
          })
        })
      } else {
        // Fallback: parse on main thread with yield points
        return this.parseOnMainThread(questionData)
      }
    } catch (error) {
      this.state.error = error instanceof Error ? error.message : 'Unknown error'
      this.state.isLoading = false
      this.notifyListeners()
      throw error
    }
  }

  private async parseOnMainThread(data: JsonData): Promise<{ questions: Question[], exam_info: ExamInfo | null }> {
    return new Promise((resolve) => {
      const processChunk = (questions: Question[], startIndex: number) => {
        const chunkSize = 25
        const endIndex = Math.min(startIndex + chunkSize, questions.length)
        const chunk = questions.slice(startIndex, endIndex)
        
        this.state.chunks.set(Math.floor(startIndex / chunkSize), chunk)
        this.state.progress = (endIndex / questions.length) * 100
        this.notifyListeners()

        if (endIndex < questions.length) {
          // Use scheduler.postTask for better performance
          if ('scheduler' in window && 'postTask' in (window as unknown as { scheduler: { postTask: (callback: () => void, options: { priority: string }) => void } }).scheduler) {
            (window as unknown as { scheduler: { postTask: (callback: () => void, options: { priority: string }) => void } }).scheduler.postTask(() => {
              processChunk(questions, endIndex)
            }, { priority: 'user-blocking' })
          } else {
            setTimeout(() => processChunk(questions, endIndex), 0)
          }
        } else {
          // Complete
          const allQuestions: Question[] = []
          for (let i = 0; i < Math.ceil(questions.length / chunkSize); i++) {
            const chunk = this.state.chunks.get(i)
            if (chunk) allQuestions.push(...chunk)
          }
          
          this.state.questions = allQuestions
          this.state.exam_info = data.exam_info
          this.state.isLoading = false
          this.state.progress = 100
          this.notifyListeners()
          resolve({ questions: allQuestions, exam_info: data.exam_info })
        }
      }

      processChunk(data.questions || [], 0)
    })
  }

  public async loadQuestionsByTopic(topic: string): Promise<Question[]> {
    if (this.state.questions.length === 0) {
      await this.loadQuestions()
    }

    if (this.worker) {
      return new Promise((resolve) => {
        const originalHandler = this.worker!.onmessage
        this.worker!.onmessage = (e) => {
          if (e.data.type === 'TOPIC_FILTERED') {
            this.worker!.onmessage = originalHandler
            resolve(e.data.questions)
          }
        }

        this.worker!.postMessage({
          type: 'FILTER_BY_TOPIC',
          data: { questions: this.state.questions, topic }
        })
      })
    } else {
      // Fallback to main thread filtering
      return this.state.questions.filter(q => 
        q.topic && q.topic.toLowerCase().includes(topic.toLowerCase())
      )
    }
  }

  public async searchQuestions(searchTerm: string): Promise<Question[]> {
    if (this.state.questions.length === 0) {
      await this.loadQuestions()
    }

    if (this.worker) {
      return new Promise((resolve) => {
        const originalHandler = this.worker!.onmessage
        this.worker!.onmessage = (e) => {
          if (e.data.type === 'SEARCH_RESULTS') {
            this.worker!.onmessage = originalHandler
            resolve(e.data.questions)
          }
        }

        this.worker!.postMessage({
          type: 'SEARCH_QUESTIONS',
          data: { questions: this.state.questions, searchTerm }
        })
      })
    } else {
      // Fallback to main thread search
      const searchText = searchTerm.toLowerCase()
      return this.state.questions.filter(q => 
        q.question?.toLowerCase().includes(searchText) ||
        q.topic?.toLowerCase().includes(searchText) ||
        q.choices?.some(choice => choice.toLowerCase().includes(searchText))
      )
    }
  }

  public getLoadingState(): DataLoaderState {
    return { ...this.state }
  }

  public preload(): void {
    // Only preload on good connections and when idle
    if ('connection' in navigator && 'requestIdleCallback' in window) {
      const connection = (navigator as unknown as { connection: { effectiveType: string, downlink: number } }).connection
      if (connection?.effectiveType === '4g' || connection?.downlink > 2) {
        requestIdleCallback(() => {
          this.loadQuestions().catch(console.error)
        })
      }
    }
  }

  public cleanup(): void {
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
    }
    this.listeners = []
  }
}

// Singleton instance
export const dataLoader = new OptimizedDataLoader()

// Convenience functions for backward compatibility
export const loadQuestionsData = () => dataLoader.loadQuestions()
export const loadQuestionsByTopic = (topic: string) => dataLoader.loadQuestionsByTopic(topic)
export const preloadQuestions = () => dataLoader.preload()

// React hook for loading state
export function useDataLoader() {
  const [state, setState] = useState(dataLoader.getLoadingState())

  useEffect(() => {
    const unsubscribe = dataLoader.subscribe(setState)
    return unsubscribe
  }, [])

  return {
    ...state,
    loadQuestions: dataLoader.loadQuestions.bind(dataLoader),
    loadQuestionsByTopic: dataLoader.loadQuestionsByTopic.bind(dataLoader),
    searchQuestions: dataLoader.searchQuestions.bind(dataLoader),
    preload: dataLoader.preload.bind(dataLoader)
  }
}

// Import React hooks
import { useState, useEffect } from 'react'