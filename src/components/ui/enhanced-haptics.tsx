'use client'

import { useEffect, useRef, useState } from 'react'

// Enhanced haptic feedback system
export class EnhancedHaptics {
  private static instance: EnhancedHaptics
  private isSupported: boolean
  private isEnabled: boolean
  private intensity: number
  private customPatterns: Map<string, number[]>

  constructor() {
    this.isSupported = 'vibrate' in navigator
    this.isEnabled = true
    this.intensity = 1.0
    this.customPatterns = new Map()
    
    // Initialize default patterns
    this.initializeDefaultPatterns()
  }

  static getInstance(): EnhancedHaptics {
    if (!EnhancedHaptics.instance) {
      EnhancedHaptics.instance = new EnhancedHaptics()
    }
    return EnhancedHaptics.instance
  }

  private initializeDefaultPatterns() {
    // Success patterns
    this.customPatterns.set('success', [50, 100, 50])
    this.customPatterns.set('success-strong', [100, 200, 100])
    this.customPatterns.set('success-gentle', [30, 60, 30])
    
    // Error patterns
    this.customPatterns.set('error', [200, 100, 200])
    this.customPatterns.set('error-strong', [300, 150, 300])
    this.customPatterns.set('error-gentle', [100, 50, 100])
    
    // Warning patterns
    this.customPatterns.set('warning', [150, 100, 150])
    this.customPatterns.set('warning-strong', [200, 150, 200])
    
    // Info patterns
    this.customPatterns.set('info', [50, 50, 50])
    this.customPatterns.set('info-strong', [100, 100, 100])
    
    // Navigation patterns
    this.customPatterns.set('navigate', [50, 25, 50])
    this.customPatterns.set('navigate-strong', [100, 50, 100])
    this.customPatterns.set('navigate-gentle', [25, 12, 25])
    
    // Selection patterns
    this.customPatterns.set('select', [30, 30])
    this.customPatterns.set('select-strong', [60, 60])
    this.customPatterns.set('select-gentle', [15, 15])
    
    // Completion patterns
    this.customPatterns.set('complete', [100, 50, 100, 50, 100])
    this.customPatterns.set('complete-strong', [200, 100, 200, 100, 200])
    this.customPatterns.set('complete-gentle', [50, 25, 50, 25, 50])
    
    // Gesture patterns
    this.customPatterns.set('swipe', [40, 20, 40])
    this.customPatterns.set('swipe-strong', [80, 40, 80])
    this.customPatterns.set('pinch', [60, 30, 60])
    this.customPatterns.set('rotate', [50, 25, 50, 25])
    this.customPatterns.set('long-press', [100, 50, 100])
    
    // Game patterns
    this.customPatterns.set('correct-answer', [50, 100, 50, 100, 50])
    this.customPatterns.set('incorrect-answer', [200, 100, 200])
    this.customPatterns.set('level-up', [100, 200, 100, 200, 100])
    this.customPatterns.set('achievement', [100, 50, 100, 50, 100, 50, 100])
    
    // UI patterns
    this.customPatterns.set('button-press', [20, 20])
    this.customPatterns.set('button-release', [10, 10])
    this.customPatterns.set('toggle-on', [50, 100, 50])
    this.customPatterns.set('toggle-off', [100, 50, 100])
    this.customPatterns.set('slider-move', [15, 15])
    this.customPatterns.set('scroll', [10, 10])
    
    // Accessibility patterns
    this.customPatterns.set('focus', [30, 30])
    this.customPatterns.set('focus-strong', [60, 60])
    this.customPatterns.set('alert', [200, 100, 200, 100, 200])
    this.customPatterns.set('notification', [100, 50, 100])
  }

  // Enable/disable haptics
  enable() {
    this.isEnabled = true
  }

  disable() {
    this.isEnabled = false
  }

  // Set intensity (0.0 to 2.0)
  setIntensity(intensity: number) {
    this.intensity = Math.max(0, Math.min(2, intensity))
  }

  // Get current intensity
  getIntensity(): number {
    return this.intensity
  }

  // Check if haptics are supported and enabled
  canVibrate(): boolean {
    return this.isSupported && this.isEnabled
  }

  // Basic vibration with intensity scaling
  vibrate(pattern: number | number[]): void {
    if (!this.canVibrate()) return

    if (Array.isArray(pattern)) {
      const scaledPattern = pattern.map(duration => Math.round(duration * this.intensity))
      navigator.vibrate(scaledPattern)
    } else {
      navigator.vibrate(Math.round(pattern * this.intensity))
    }
  }

  // Vibrate with custom pattern name
  vibratePattern(patternName: string): void {
    if (!this.canVibrate()) return

    const pattern = this.customPatterns.get(patternName)
    if (pattern) {
      this.vibrate(pattern)
    }
  }

  // Add custom pattern
  addPattern(name: string, pattern: number[]): void {
    this.customPatterns.set(name, pattern)
  }

  // Remove custom pattern
  removePattern(name: string): boolean {
    return this.customPatterns.delete(name)
  }

  // Get all available patterns
  getPatterns(): string[] {
    return Array.from(this.customPatterns.keys())
  }

  // Contextual haptic feedback
  success(intensity: 'gentle' | 'normal' | 'strong' = 'normal'): void {
    const patternName = `success${intensity !== 'normal' ? `-${intensity}` : ''}`
    this.vibratePattern(patternName)
  }

  error(intensity: 'gentle' | 'normal' | 'strong' = 'normal'): void {
    const patternName = `error${intensity !== 'normal' ? `-${intensity}` : ''}`
    this.vibratePattern(patternName)
  }

  warning(intensity: 'gentle' | 'normal' | 'strong' = 'normal'): void {
    const patternName = `warning${intensity !== 'normal' ? `-${intensity}` : ''}`
    this.vibratePattern(patternName)
  }

  info(intensity: 'gentle' | 'normal' | 'strong' = 'normal'): void {
    const patternName = `info${intensity !== 'normal' ? `-${intensity}` : ''}`
    this.vibratePattern(patternName)
  }

  navigate(intensity: 'gentle' | 'normal' | 'strong' = 'normal'): void {
    const patternName = `navigate${intensity !== 'normal' ? `-${intensity}` : ''}`
    this.vibratePattern(patternName)
  }

  select(intensity: 'gentle' | 'normal' | 'strong' = 'normal'): void {
    const patternName = `select${intensity !== 'normal' ? `-${intensity}` : ''}`
    this.vibratePattern(patternName)
  }

  complete(intensity: 'gentle' | 'normal' | 'strong' = 'normal'): void {
    const patternName = `complete${intensity !== 'normal' ? `-${intensity}` : ''}`
    this.vibratePattern(patternName)
  }

  // Gesture-specific feedback
  swipe(intensity: 'gentle' | 'normal' | 'strong' = 'normal'): void {
    const patternName = `swipe${intensity !== 'normal' ? `-${intensity}` : ''}`
    this.vibratePattern(patternName)
  }

  pinch(): void {
    this.vibratePattern('pinch')
  }

  rotate(): void {
    this.vibratePattern('rotate')
  }

  longPress(): void {
    this.vibratePattern('long-press')
  }

  // Game-specific feedback
  correctAnswer(): void {
    this.vibratePattern('correct-answer')
  }

  incorrectAnswer(): void {
    this.vibratePattern('incorrect-answer')
  }

  levelUp(): void {
    this.vibratePattern('level-up')
  }

  achievement(): void {
    this.vibratePattern('achievement')
  }

  // UI-specific feedback
  buttonPress(): void {
    this.vibratePattern('button-press')
  }

  buttonRelease(): void {
    this.vibratePattern('button-release')
  }

  toggleOn(): void {
    this.vibratePattern('toggle-on')
  }

  toggleOff(): void {
    this.vibratePattern('toggle-off')
  }

  sliderMove(): void {
    this.vibratePattern('slider-move')
  }

  scroll(): void {
    this.vibratePattern('scroll')
  }

  // Accessibility feedback
  focus(intensity: 'gentle' | 'normal' | 'strong' = 'normal'): void {
    const patternName = `focus${intensity !== 'normal' ? `-${intensity}` : ''}`
    this.vibratePattern(patternName)
  }

  alert(): void {
    this.vibratePattern('alert')
  }

  notification(): void {
    this.vibratePattern('notification')
  }

  // Progressive feedback (intensity increases with repetition)
  progressiveFeedback(action: string, count: number, maxIntensity: number = 3): void {
    if (!this.canVibrate()) return

    const intensity = Math.min(count, maxIntensity)
    const basePattern = this.customPatterns.get(action) || [50]
    const progressivePattern = basePattern.map(duration => 
      Math.round(duration * (1 + (intensity - 1) * 0.5))
    )
    
    this.vibrate(progressivePattern)
  }

  // Rhythmic feedback (repeating pattern)
  rhythmicFeedback(pattern: number[], repeatCount: number, interval: number = 100): void {
    if (!this.canVibrate()) return

    const fullPattern: number[] = []
    for (let i = 0; i < repeatCount; i++) {
      fullPattern.push(...pattern)
      if (i < repeatCount - 1) {
        fullPattern.push(interval)
      }
    }
    
    this.vibrate(fullPattern)
  }

  // Stop vibration
  stop(): void {
    if (this.isSupported) {
      navigator.vibrate(0)
    }
  }
}

// React hook for enhanced haptics
export function useEnhancedHaptics() {
  const hapticsRef = useRef<EnhancedHaptics>()
  
  useEffect(() => {
    hapticsRef.current = EnhancedHaptics.getInstance()
  }, [])

  return hapticsRef.current
}

// Haptic feedback provider component
export function HapticProvider({ 
  children, 
  defaultIntensity = 1.0,
  enabled = true 
}: { 
  children: ReactNode
  defaultIntensity?: number
  enabled?: boolean 
}) {
  const haptics = useEnhancedHaptics()
  
  useEffect(() => {
    if (haptics) {
      haptics.setIntensity(defaultIntensity)
      if (enabled) {
        haptics.enable()
      } else {
        haptics.disable()
      }
    }
  }, [haptics, defaultIntensity, enabled])

  return <>{children}</>
}

// Haptic button component
export function HapticButton({ 
  children, 
  onClick, 
  hapticType = 'button-press',
  hapticIntensity = 'normal',
  className,
  ...props 
}: {
  children: ReactNode
  onClick?: () => void
  hapticType?: string
  hapticIntensity?: 'gentle' | 'normal' | 'strong'
  className?: string
  [key: string]: any
}) {
  const haptics = useEnhancedHaptics()
  
  const handleClick = () => {
    if (haptics) {
      haptics.vibratePattern(hapticType)
    }
    onClick?.()
  }

  return (
    <button 
      className={className} 
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  )
}

// Haptic feedback for different actions
export const hapticActions = {
  // Quiz actions
  answerCorrect: (haptics: EnhancedHaptics) => haptics.correctAnswer(),
  answerIncorrect: (haptics: EnhancedHaptics) => haptics.incorrectAnswer(),
  questionComplete: (haptics: EnhancedHaptics) => haptics.complete(),
  quizComplete: (haptics: EnhancedHaptics) => haptics.achievement(),
  
  // Navigation actions
  navigateNext: (haptics: EnhancedHaptics) => haptics.navigate(),
  navigatePrevious: (haptics: EnhancedHaptics) => haptics.navigate(),
  goHome: (haptics: EnhancedHaptics) => haptics.navigate('strong'),
  
  // Selection actions
  selectOption: (haptics: EnhancedHaptics) => haptics.select(),
  toggleSetting: (haptics: EnhancedHaptics, isOn: boolean) => 
    isOn ? haptics.toggleOn() : haptics.toggleOff(),
  
  // Gesture actions
  swipeDetected: (haptics: EnhancedHaptics) => haptics.swipe(),
  pinchDetected: (haptics: EnhancedHaptics) => haptics.pinch(),
  rotateDetected: (haptics: EnhancedHaptics) => haptics.rotate(),
  longPressDetected: (haptics: EnhancedHaptics) => haptics.longPress(),
  
  // Feedback actions
  success: (haptics: EnhancedHaptics, intensity: 'gentle' | 'normal' | 'strong' = 'normal') => 
    haptics.success(intensity),
  error: (haptics: EnhancedHaptics, intensity: 'gentle' | 'normal' | 'strong' = 'normal') => 
    haptics.error(intensity),
  warning: (haptics: EnhancedHaptics, intensity: 'gentle' | 'normal' | 'strong' = 'normal') => 
    haptics.warning(intensity),
  
  // Accessibility actions
  focusElement: (haptics: EnhancedHaptics) => haptics.focus(),
  alertUser: (haptics: EnhancedHaptics) => haptics.alert(),
  notifyUser: (haptics: EnhancedHaptics) => haptics.notification()
}

// Export singleton instance
export const enhancedHaptics = EnhancedHaptics.getInstance()