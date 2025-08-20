'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */
// Optimized storage operations to reduce main thread blocking

interface StorageOptions {
  key: string
  defaultValue?: any
  serialize?: (value: any) => string
  deserialize?: (value: string) => any
}

// Throttled storage operations to reduce frequency
const saveQueue = new Map<string, any>()
let saveTimeout: NodeJS.Timeout | null = null

const DEFAULT_SERIALIZE = JSON.stringify
const DEFAULT_DESERIALIZE = JSON.parse

// Async localStorage operations using scheduler API when available
export const storage = {
  // Get value with async deserialization
  async get<T>(options: StorageOptions): Promise<T | null> {
    const { key, defaultValue, deserialize = DEFAULT_DESERIALIZE } = options
    
    return new Promise((resolve) => {
      const schedule = typeof window !== 'undefined' && 'scheduler' in window 
        ? (cb: () => void) => (window as any).scheduler.postTask(cb, { priority: 'user-blocking' })
        : setTimeout

      try {
        const item = localStorage.getItem(key)
        if (item === null) {
          resolve(defaultValue ?? null)
          return
        }

        schedule(() => {
          try {
            const parsed = deserialize(item)
            resolve(parsed)
          } catch (error) {
            console.warn(`Failed to parse ${key} from localStorage:`, error)
            resolve(defaultValue ?? null)
          }
        })
      } catch (error) {
        console.warn(`Failed to read ${key} from localStorage:`, error)
        resolve(defaultValue ?? null)
      }
    })
  },

  // Set value with throttled async serialization
  async set<T>(options: StorageOptions & { value: T }): Promise<void> {
    const { key, value, serialize = DEFAULT_SERIALIZE } = options
    
    // Add to save queue
    saveQueue.set(key, value)
    
    // Throttle saves
    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }
    
    saveTimeout = setTimeout(async () => {
      const schedule = typeof window !== 'undefined' && 'scheduler' in window 
        ? (cb: () => void) => (window as any).scheduler.postTask(cb, { priority: 'background' })
        : (cb: () => void) => setTimeout(cb, 0)

      // Process all queued saves
      const entries = Array.from(saveQueue.entries())
      saveQueue.clear()
      
      for (const [queueKey, queueValue] of entries) {
        try {
          await new Promise<void>((resolve) => {
            schedule(() => {
              try {
                const serialized = serialize(queueValue)
                localStorage.setItem(queueKey, serialized)
                resolve()
              } catch (error) {
                console.warn(`Failed to save ${queueKey} to localStorage:`, error)
                resolve()
              }
            })
          })
        } catch (error) {
          console.warn(`Failed to process save queue for ${queueKey}:`, error)
        }
      }
    }, 500) // 500ms throttle
  },

  // Remove value
  remove(key: string): void {
    try {
      localStorage.removeItem(key)
      saveQueue.delete(key) // Remove from queue if pending
    } catch (error) {
      console.warn(`Failed to remove ${key} from localStorage:`, error)
    }
  },

  // Clear all storage
  clear(): void {
    try {
      localStorage.clear()
      saveQueue.clear()
    } catch (error) {
      console.warn('Failed to clear localStorage:', error)
    }
  },

  // Get storage usage information
  getSize(): { used: number; available: number; percentage: number } {
    let used = 0
    try {
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length + key.length
        }
      }
    } catch (error) {
      console.warn('Failed to calculate localStorage usage:', error)
    }

    const available = 5 * 1024 * 1024 // ~5MB typical limit
    return {
      used,
      available,
      percentage: (used / available) * 100
    }
  }
}

// Hook for optimized localStorage usage
import { useState, useEffect, useCallback } from 'react'

export function useOptimizedStorage<T>(
  key: string,
  defaultValue: T,
  options?: {
    serialize?: (value: T) => string
    deserialize?: (value: string) => T
  }
) {
  const [value, setValue] = useState<T>(defaultValue)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Load initial value
  useEffect(() => {
    const loadValue = async () => {
      try {
        setIsLoading(true)
        const stored = await storage.get<T>({
          key,
          defaultValue,
          deserialize: options?.deserialize
        })
        if (stored !== null) {
          setValue(stored)
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Storage error'))
      } finally {
        setIsLoading(false)
      }
    }

    loadValue()
  }, [key, defaultValue, options?.deserialize])

  // Optimized setter
  const setStoredValue = useCallback(async (newValue: T | ((prev: T) => T)) => {
    try {
      const valueToStore = typeof newValue === 'function' 
        ? (newValue as (prev: T) => T)(value)
        : newValue

      setValue(valueToStore)
      
      await storage.set({
        key,
        value: valueToStore,
        serialize: options?.serialize
      })
      
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to save'))
      console.warn(`Failed to save ${key}:`, err)
    }
  }, [key, value, options?.serialize])

  return [value, setStoredValue, { isLoading, error }] as const
}