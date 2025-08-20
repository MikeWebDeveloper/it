'use client'

import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import debounce from 'lodash.debounce'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface UseAutoSaveOptions<T = unknown> {
  data: T
  saveFunction: (data: T) => Promise<void> | void
  delay?: number
  enabled?: boolean
  onSave?: () => void
  onError?: (error: Error) => void
}

export function useAutoSave<T = unknown>({
  data,
  saveFunction,
  delay = 2000,
  enabled = true,
  onSave,
  onError
}: UseAutoSaveOptions<T>) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const previousDataRef = useRef<T | undefined>(undefined)
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Debounced save function
  const debouncedSave = useRef(
    debounce(async (dataToSave: T) => {
      if (!enabled) return

      try {
        setSaveStatus('saving')
        
        await saveFunction(dataToSave)
        
        setSaveStatus('saved')
        setLastSaved(new Date())
        onSave?.()
        
        toast.success('Progress saved', {
          duration: 2000,
          icon: '💾',
        })

        // Reset to idle after showing success briefly
        setTimeout(() => setSaveStatus('idle'), 1000)
      } catch (error) {
        setSaveStatus('error')
        onError?.(error as Error)
        
        toast.error('Failed to save progress', {
          duration: 4000,
          icon: '⚠️',
        })
        
        // Reset to idle after error
        setTimeout(() => setSaveStatus('idle'), 3000)
      }
    }, delay)
  ).current

  // Watch for data changes and trigger save
  useEffect(() => {
    if (!enabled) return

    const hasChanged = JSON.stringify(data) !== JSON.stringify(previousDataRef.current)
    
    if (hasChanged && previousDataRef.current !== undefined) {
      debouncedSave(data)
    }
    
    previousDataRef.current = data
  }, [data, enabled, debouncedSave])

  // Manual save function
  const saveNow = async () => {
    if (!enabled) return

    try {
      setSaveStatus('saving')
      await saveFunction(data)
      setSaveStatus('saved')
      setLastSaved(new Date())
      onSave?.()
      
      toast.success('Progress saved manually', {
        duration: 2000,
        icon: '✅',
      })
      
      setTimeout(() => setSaveStatus('idle'), 1000)
    } catch (error) {
      setSaveStatus('error')
      onError?.(error as Error)
      
      toast.error('Failed to save progress', {
        duration: 4000,
        icon: '❌',
      })
      
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    const currentTimeoutRef = saveTimeoutRef.current
    return () => {
      debouncedSave.cancel()
      if (currentTimeoutRef) {
        clearTimeout(currentTimeoutRef)
      }
    }
  }, [debouncedSave])

  return {
    saveStatus,
    lastSaved,
    saveNow,
    isEnabled: enabled
  }
}