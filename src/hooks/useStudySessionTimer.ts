'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useQuizStore } from '@/store/useQuizStore'
import { useAudioHapticFeedback } from './useAudioHapticFeedback'
import { toast } from 'react-hot-toast'

export type SessionState = 'idle' | 'studying' | 'break' | 'paused'
export type BreakType = 'short' | 'long'

interface StudySession {
  id: string
  startTime: number
  endTime?: number
  duration: number // planned duration in minutes
  actualDuration?: number // actual time studied in minutes
  breaksTaken: number
  type: 'study' | 'break'
  breakType?: BreakType
}

interface UseStudySessionTimerOptions {
  onSessionComplete?: (session: StudySession) => void
  onBreakComplete?: (session: StudySession) => void
  onBreakReminder?: () => void
}

export function useStudySessionTimer(options: UseStudySessionTimerOptions = {}) {
  const { studySessionSettings } = useQuizStore()
  const feedback = useAudioHapticFeedback()
  
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null)
  const [sessionState, setSessionState] = useState<SessionState>('idle')
  const [timeRemaining, setTimeRemaining] = useState<number>(0) // in seconds
  const [totalTimeStudied, setTotalTimeStudied] = useState<number>(0) // in seconds
  const [sessionsCompleted, setSessionsCompleted] = useState<number>(0)
  const [breaksTaken, setBreaksTaken] = useState<number>(0)
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)
  const lastBreakReminderRef = useRef<number>(0)

  // Calculate if we should suggest a long break
  const shouldTakeLongBreak = breaksTaken > 0 && breaksTaken % studySessionSettings.longBreakInterval === 0

  // Start a study session
  const startStudySession = useCallback((customDuration?: number) => {
    if (!studySessionSettings.sessionTimerEnabled) return

    const duration = customDuration || studySessionSettings.defaultSessionDuration
    const session: StudySession = {
      id: `study-${Date.now()}`,
      startTime: Date.now(),
      duration,
      breaksTaken: 0,
      type: 'study'
    }

    setCurrentSession(session)
    setSessionState('studying')
    setTimeRemaining(duration * 60) // Convert to seconds
    startTimeRef.current = Date.now()
    lastBreakReminderRef.current = Date.now()

    toast.success(`Study session started: ${duration} minutes`, {
      icon: '📚',
      duration: 2000
    })

    if (studySessionSettings.soundNotifications) {
      feedback.onSuccess()
    }
  }, [studySessionSettings, feedback])

  // Start a break session
  const startBreak = useCallback((breakType: BreakType = 'short') => {
    if (!studySessionSettings.sessionTimerEnabled) return

    const duration = breakType === 'long' 
      ? studySessionSettings.longBreakDuration 
      : studySessionSettings.breakDuration

    const session: StudySession = {
      id: `break-${Date.now()}`,
      startTime: Date.now(),
      duration,
      breaksTaken: 0,
      type: 'break',
      breakType
    }

    setCurrentSession(session)
    setSessionState('break')
    setTimeRemaining(duration * 60)
    startTimeRef.current = Date.now()

    const breakMessage = breakType === 'long' ? 'Long break time! 🧘‍♀️' : 'Short break time! ☕'
    toast.success(breakMessage, {
      duration: 3000
    })

    if (studySessionSettings.soundNotifications) {
      feedback.onSuccess()
    }
  }, [studySessionSettings, feedback])

  // Pause current session
  const pauseSession = useCallback(() => {
    if (sessionState === 'studying' || sessionState === 'break') {
      setSessionState('paused')
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      
      toast('Session paused', { icon: '⏸️' })
    }
  }, [sessionState])

  // Resume paused session
  const resumeSession = useCallback(() => {
    if (sessionState === 'paused') {
      const previousState = currentSession?.type === 'study' ? 'studying' : 'break'
      setSessionState(previousState)
      startTimeRef.current = Date.now() - (currentSession!.duration * 60 * 1000 - timeRemaining * 1000)
      
      toast.success('Session resumed', { icon: '▶️' })
    }
  }, [sessionState, currentSession, timeRemaining])

  // Stop current session
  const stopSession = useCallback(() => {
    if (currentSession && sessionState !== 'idle') {
      const actualDuration = Math.floor((Date.now() - currentSession.startTime) / 1000 / 60)
      const completedSession = {
        ...currentSession,
        endTime: Date.now(),
        actualDuration
      }

      if (currentSession.type === 'study') {
        setTotalTimeStudied(prev => prev + actualDuration * 60)
        options.onSessionComplete?.(completedSession)
      } else {
        options.onBreakComplete?.(completedSession)
      }

      setCurrentSession(null)
      setSessionState('idle')
      setTimeRemaining(0)
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }

      toast('Session stopped', { icon: '⏹️' })
    }
  }, [currentSession, sessionState, options])

  // Skip current session (complete early)
  const skipSession = useCallback(() => {
    if (!currentSession) return

    if (currentSession.type === 'study') {
      setSessionsCompleted(prev => prev + 1)
      setTotalTimeStudied(prev => prev + Math.floor((Date.now() - currentSession.startTime) / 1000))
      
      // Suggest break after study session
      const breakType = shouldTakeLongBreak ? 'long' : 'short'
      toast.success('Study session completed! Take a break?', {
        duration: 5000,
        icon: breakType === 'long' ? '🧘‍♀️' : '☕'
      })
      
      options.onSessionComplete?.({
        ...currentSession,
        endTime: Date.now(),
        actualDuration: Math.floor((Date.now() - currentSession.startTime) / 1000 / 60)
      })
    } else {
      setBreaksTaken(prev => prev + 1)
      
      options.onBreakComplete?.({
        ...currentSession,
        endTime: Date.now(),
        actualDuration: Math.floor((Date.now() - currentSession.startTime) / 1000 / 60)
      })
    }

    setCurrentSession(null)
    setSessionState('idle')
    setTimeRemaining(0)

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (studySessionSettings.soundNotifications) {
      feedback.onQuizComplete()
    }
  }, [currentSession, shouldTakeLongBreak, studySessionSettings.soundNotifications, feedback, options])

  // Timer effect
  useEffect(() => {
    if (sessionState === 'studying' || sessionState === 'break') {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Session completed
            if (sessionState === 'studying') {
              setSessionsCompleted(prev => prev + 1)
              setTotalTimeStudied(prev => prev + (currentSession?.duration || 0) * 60)
              
              // Suggest break
              const breakType = shouldTakeLongBreak ? 'long' : 'short'
              const breakMessage = breakType === 'long' 
                ? 'Great work! Time for a longer break 🧘‍♀️'
                : 'Study session complete! Take a short break ☕'
              
              toast.success(breakMessage, {
                duration: 6000
              })

              options.onSessionComplete?.({
                ...currentSession!,
                endTime: Date.now(),
                actualDuration: currentSession!.duration
              })

              if (studySessionSettings.autoBreakEnabled) {
                // Auto start break
                setTimeout(() => {
                  startBreak(breakType)
                }, 1000)
              }
            } else {
              // Break completed
              setBreaksTaken(prev => prev + 1)
              
              toast.success('Break time over! Ready to study? 📚', {
                duration: 4000
              })

              options.onBreakComplete?.({
                ...currentSession!,
                endTime: Date.now(),
                actualDuration: currentSession!.duration
              })
            }

            if (studySessionSettings.soundNotifications) {
              feedback.onQuizComplete()
            }

            setCurrentSession(null)
            setSessionState('idle')
            return 0
          }

          // Check for break reminder during study sessions
          if (sessionState === 'studying' && studySessionSettings.breakReminderInterval > 0) {
            const timeSinceStart = Date.now() - startTimeRef.current
            const timeSinceLastReminder = Date.now() - lastBreakReminderRef.current
            const reminderInterval = studySessionSettings.breakReminderInterval * 60 * 1000

            if (timeSinceLastReminder >= reminderInterval && timeSinceStart >= reminderInterval) {
              lastBreakReminderRef.current = Date.now()
              options.onBreakReminder?.()
              
              if (studySessionSettings.soundNotifications) {
                feedback.onTimerWarning()
              }
              
              toast('Consider taking a break soon! 🧘‍♂️', {
                icon: '💡',
                duration: 4000
              })
            }
          }

          // Warning notifications
          if (prev === 300) { // 5 minutes remaining
            if (studySessionSettings.soundNotifications) {
              feedback.onTimerWarning()
            }
            toast(`5 minutes remaining in ${sessionState === 'studying' ? 'study' : 'break'} session`, {
              icon: '⏰',
              duration: 3000
            })
          } else if (prev === 60) { // 1 minute remaining
            if (studySessionSettings.soundNotifications) {
              feedback.onTimerWarning()
            }
          }

          return prev - 1
        })
      }, 1000)

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      }
    }
  }, [sessionState, currentSession, shouldTakeLongBreak, studySessionSettings, feedback, options, startBreak])

  // Format time for display
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  // Get session progress percentage
  const getProgress = useCallback((): number => {
    if (!currentSession) return 0
    const totalSeconds = currentSession.duration * 60
    const elapsed = totalSeconds - timeRemaining
    return Math.min(100, (elapsed / totalSeconds) * 100)
  }, [currentSession, timeRemaining])

  // Calculate total study time today
  const getTodayStudyTime = useCallback((): string => {
    const hours = Math.floor(totalTimeStudied / 3600)
    const minutes = Math.floor((totalTimeStudied % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }, [totalTimeStudied])

  return {
    // Session state
    currentSession,
    sessionState,
    timeRemaining,
    formattedTimeRemaining: formatTime(timeRemaining),
    progress: getProgress(),

    // Controls
    startStudySession,
    startBreak,
    pauseSession,
    resumeSession,
    stopSession,
    skipSession,

    // Statistics
    totalTimeStudied,
    todayStudyTime: getTodayStudyTime(),
    sessionsCompleted,
    breaksTaken,
    shouldTakeLongBreak,

    // Settings
    isEnabled: studySessionSettings.sessionTimerEnabled,
    settings: studySessionSettings
  }
}