'use client'

import { useCallback } from 'react'
import { useSoundEffects, SoundType } from './useSoundEffects'
import { useHapticFeedback, HapticType } from './useHapticFeedback'

export interface FeedbackAction {
  sound?: SoundType
  haptic?: HapticType
  delay?: number
}

export function useAudioHapticFeedback() {
  const { playSound, playAchievementFanfare, playTimerWarning, isEnabled: soundEnabled } = useSoundEffects()
  const { 
    vibrate,
    onCorrectAnswer: hapticCorrect,
    onIncorrectAnswer: hapticIncorrect,
    onButtonPress: hapticButton,
    onNavigation: hapticNav,
    onAchievement: hapticAchievement,
    onTimerWarning: hapticTimer,
    onQuizComplete: hapticComplete,
    onCardFlip: hapticFlip,
    isEnabled: hapticEnabled
  } = useHapticFeedback()

  // Combined feedback for specific actions
  const triggerFeedback = useCallback((action: FeedbackAction) => {
    const delay = action.delay || 0
    
    setTimeout(() => {
      if (action.sound) {
        playSound(action.sound)
      }
      if (action.haptic) {
        vibrate(action.haptic)
      }
    }, delay)
  }, [playSound, vibrate])

  // Predefined feedback combinations for common quiz interactions
  const onCorrectAnswer = useCallback(() => {
    playSound('correct')
    hapticCorrect()
  }, [playSound, hapticCorrect])

  const onIncorrectAnswer = useCallback(() => {
    playSound('incorrect')
    hapticIncorrect()
  }, [playSound, hapticIncorrect])

  const onQuestionNavigation = useCallback(() => {
    playSound('navigation')
    hapticNav()
  }, [playSound, hapticNav])

  const onButtonClick = useCallback(() => {
    playSound('button')
    hapticButton()
  }, [playSound, hapticButton])

  const onAchievementUnlock = useCallback(() => {
    playAchievementFanfare()
    hapticAchievement()
  }, [playAchievementFanfare, hapticAchievement])

  const onTimerWarning = useCallback(() => {
    playTimerWarning()
    hapticTimer()
  }, [playTimerWarning, hapticTimer])

  const onQuizComplete = useCallback(() => {
    playSound('complete')
    hapticComplete()
  }, [playSound, hapticComplete])

  const onFlashcardFlip = useCallback(() => {
    playSound('flip')
    hapticFlip()
  }, [playSound, hapticFlip])

  // Multiple choice selection feedback
  const onAnswerSelect = useCallback((isCorrectPreview?: boolean) => {
    if (isCorrectPreview !== undefined) {
      // Immediate feedback for practice mode
      if (isCorrectPreview) {
        onCorrectAnswer()
      } else {
        onIncorrectAnswer()
      }
    } else {
      // General selection feedback
      playSound('button')
      hapticButton()
    }
  }, [onCorrectAnswer, onIncorrectAnswer, playSound, hapticButton])

  // Keyboard shortcut feedback (lighter)
  const onKeyboardShortcut = useCallback(() => {
    if (soundEnabled) {
      playSound('button', 0.3) // Lower volume for keyboard actions
    }
    if (hapticEnabled) {
      vibrate('light', 0.5) // Lighter intensity for keyboard actions
    }
  }, [playSound, vibrate, soundEnabled, hapticEnabled])

  // Settings feedback
  const onSettingChange = useCallback(() => {
    playSound('button')
    vibrate('selection')
  }, [playSound, vibrate])

  // Error feedback (for form validation, etc.)
  const onError = useCallback(() => {
    playSound('incorrect')
    vibrate('error')
  }, [playSound, vibrate])

  // Success feedback (for form submission, etc.)
  const onSuccess = useCallback(() => {
    playSound('correct')
    vibrate('success')
  }, [playSound, vibrate])

  // Loading/Progress feedback
  const onProgress = useCallback(() => {
    vibrate('light')
  }, [vibrate])

  return {
    // Combined feedback methods
    triggerFeedback,
    
    // Quiz-specific feedback
    onCorrectAnswer,
    onIncorrectAnswer,
    onQuestionNavigation,
    onAnswerSelect,
    onQuizComplete,
    onAchievementUnlock,
    onTimerWarning,
    
    // Flashcard-specific feedback
    onFlashcardFlip,
    
    // UI interaction feedback
    onButtonClick,
    onKeyboardShortcut,
    onSettingChange,
    onError,
    onSuccess,
    onProgress,
    
    // Status information
    isAudioEnabled: soundEnabled,
    isHapticEnabled: hapticEnabled,
    isAnyEnabled: soundEnabled || hapticEnabled
  }
}