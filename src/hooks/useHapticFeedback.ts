'use client'

import { useCallback } from 'react'
import { useQuizStore } from '@/store/useQuizStore'

export type HapticType = 
  | 'light'
  | 'medium' 
  | 'heavy'
  | 'success'
  | 'error'
  | 'warning'
  | 'selection'
  | 'impact'

interface HapticPattern {
  pattern: number[]
  description: string
}

// Haptic patterns for different actions (in milliseconds)
const HAPTIC_PATTERNS: Record<HapticType, HapticPattern> = {
  light: {
    pattern: [50],
    description: 'Light tap'
  },
  medium: {
    pattern: [100],
    description: 'Medium vibration'
  },
  heavy: {
    pattern: [200],
    description: 'Heavy vibration'
  },
  success: {
    pattern: [50, 50, 100],
    description: 'Success pattern'
  },
  error: {
    pattern: [100, 50, 100, 50, 100],
    description: 'Error pattern'
  },
  warning: {
    pattern: [50, 100, 50],
    description: 'Warning pattern'
  },
  selection: {
    pattern: [30],
    description: 'Selection tap'
  },
  impact: {
    pattern: [80],
    description: 'Impact feedback'
  }
}

export function useHapticFeedback() {
  const { audioHapticPreferences } = useQuizStore()

  // Check if vibration API is available
  const isSupported = useCallback(() => {
    return 'vibrate' in navigator && typeof navigator.vibrate === 'function'
  }, [])

  // Trigger haptic feedback
  const vibrate = useCallback((hapticType: HapticType, customIntensity?: number) => {
    if (!audioHapticPreferences.hapticsEnabled || !isSupported()) return false

    try {
      const pattern = HAPTIC_PATTERNS[hapticType]
      const intensity = customIntensity ?? audioHapticPreferences.hapticsIntensity
      
      // Scale pattern by intensity (0.0 - 1.0)
      const scaledPattern = pattern.pattern.map(duration => 
        Math.round(duration * Math.max(0.1, Math.min(1.0, intensity)))
      )
      
      // Trigger vibration
      navigator.vibrate(scaledPattern)
      return true
    } catch (error) {
      console.warn('Error triggering haptic feedback:', error)
      return false
    }
  }, [audioHapticPreferences.hapticsEnabled, audioHapticPreferences.hapticsIntensity, isSupported])

  // Convenience methods for common interactions
  const onCorrectAnswer = useCallback(() => {
    return vibrate('success')
  }, [vibrate])

  const onIncorrectAnswer = useCallback(() => {
    return vibrate('error')
  }, [vibrate])

  const onButtonPress = useCallback(() => {
    return vibrate('selection')
  }, [vibrate])

  const onNavigation = useCallback(() => {
    return vibrate('light')
  }, [vibrate])

  const onAchievement = useCallback(() => {
    // Create a celebration pattern
    if (!audioHapticPreferences.hapticsEnabled || !isSupported()) return false
    
    try {
      const intensity = audioHapticPreferences.hapticsIntensity
      const celebrationPattern = [
        Math.round(100 * intensity),
        50,
        Math.round(150 * intensity),
        50,
        Math.round(200 * intensity)
      ]
      
      navigator.vibrate(celebrationPattern)
      return true
    } catch (error) {
      console.warn('Error triggering celebration haptics:', error)
      return false
    }
  }, [audioHapticPreferences.hapticsEnabled, audioHapticPreferences.hapticsIntensity, isSupported])

  const onTimerWarning = useCallback(() => {
    return vibrate('warning')
  }, [vibrate])

  const onQuizComplete = useCallback(() => {
    // Create a completion pattern
    if (!audioHapticPreferences.hapticsEnabled || !isSupported()) return false
    
    try {
      const intensity = audioHapticPreferences.hapticsIntensity
      const completionPattern = [
        Math.round(80 * intensity),
        30,
        Math.round(80 * intensity),
        30,
        Math.round(120 * intensity)
      ]
      
      navigator.vibrate(completionPattern)
      return true
    } catch (error) {
      console.warn('Error triggering completion haptics:', error)
      return false
    }
  }, [audioHapticPreferences.hapticsEnabled, audioHapticPreferences.hapticsIntensity, isSupported])

  const onCardFlip = useCallback(() => {
    return vibrate('medium')
  }, [vibrate])

  // Stop any ongoing vibration
  const stopVibration = useCallback(() => {
    if (isSupported()) {
      try {
        navigator.vibrate(0)
        return true
      } catch (error) {
        console.warn('Error stopping vibration:', error)
        return false
      }
    }
    return false
  }, [isSupported])

  return {
    // Basic vibration
    vibrate,
    
    // Convenience methods
    onCorrectAnswer,
    onIncorrectAnswer,
    onButtonPress,
    onNavigation,
    onAchievement,
    onTimerWarning,
    onQuizComplete,
    onCardFlip,
    
    // Utility
    stopVibration,
    isSupported: isSupported(),
    isEnabled: audioHapticPreferences.hapticsEnabled,
    intensity: audioHapticPreferences.hapticsIntensity,
    
    // Pattern information for debugging/settings
    patterns: HAPTIC_PATTERNS
  }
}