'use client'

import { useRef, useCallback, useEffect } from 'react'
import { useQuizStore } from '@/store/useQuizStore'

export type SoundType = 
  | 'correct'
  | 'incorrect' 
  | 'navigation'
  | 'achievement'
  | 'button'
  | 'timer'
  | 'complete'
  | 'flip'

interface SoundConfig {
  frequency: number
  duration: number
  volume?: number
  type?: OscillatorType
  fadeOut?: boolean
}

// Sound configurations for different actions
const SOUND_CONFIGS: Record<SoundType, SoundConfig> = {
  correct: {
    frequency: 880, // A5 note
    duration: 200,
    type: 'sine',
    fadeOut: true
  },
  incorrect: {
    frequency: 220, // A3 note  
    duration: 300,
    type: 'sawtooth',
    fadeOut: true
  },
  navigation: {
    frequency: 440, // A4 note
    duration: 100,
    type: 'sine',
    fadeOut: true
  },
  achievement: {
    frequency: 660, // E5 note
    duration: 500,
    type: 'triangle',
    fadeOut: true
  },
  button: {
    frequency: 800,
    duration: 50,
    type: 'sine',
    fadeOut: false
  },
  timer: {
    frequency: 1000,
    duration: 150,
    type: 'square',
    fadeOut: true
  },
  complete: {
    frequency: 523, // C5 note
    duration: 400,
    type: 'triangle',
    fadeOut: true
  },
  flip: {
    frequency: 600,
    duration: 80,
    type: 'sine',
    fadeOut: true
  }
}

export function useSoundEffects() {
  const { audioHapticPreferences } = useQuizStore()
  const audioContextRef = useRef<AudioContext | null>(null)
  const isInitializedRef = useRef(false)

  // Initialize audio context on first user interaction
  const initializeAudioContext = useCallback(() => {
    if (isInitializedRef.current || !audioHapticPreferences.soundEnabled) return
    
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      isInitializedRef.current = true
    } catch (error) {
      console.warn('Web Audio API not supported:', error)
    }
  }, [audioHapticPreferences.soundEnabled])

  // Play a sound effect
  const playSound = useCallback((soundType: SoundType, customVolume?: number) => {
    if (!audioHapticPreferences.soundEnabled) return
    
    // Initialize audio context if needed
    if (!isInitializedRef.current) {
      initializeAudioContext()
    }
    
    if (!audioContextRef.current) return

    try {
      const config = SOUND_CONFIGS[soundType]
      const volume = customVolume ?? audioHapticPreferences.soundVolume
      
      // Create audio nodes
      const oscillator = audioContextRef.current.createOscillator()
      const gainNode = audioContextRef.current.createGain()
      
      // Configure oscillator
      oscillator.type = config.type || 'sine'
      oscillator.frequency.setValueAtTime(config.frequency, audioContextRef.current.currentTime)
      
      // Configure gain (volume)
      const finalVolume = Math.max(0, Math.min(1, volume * 0.3)) // Cap at 30% to prevent loudness
      gainNode.gain.setValueAtTime(finalVolume, audioContextRef.current.currentTime)
      
      // Add fade out effect if specified
      if (config.fadeOut) {
        gainNode.gain.exponentialRampToValueAtTime(
          0.001, 
          audioContextRef.current.currentTime + config.duration / 1000
        )
      } else {
        gainNode.gain.setValueAtTime(
          0,
          audioContextRef.current.currentTime + config.duration / 1000
        )
      }
      
      // Connect nodes
      oscillator.connect(gainNode)
      gainNode.connect(audioContextRef.current.destination)
      
      // Start and stop oscillator
      oscillator.start(audioContextRef.current.currentTime)
      oscillator.stop(audioContextRef.current.currentTime + config.duration / 1000)
      
    } catch (error) {
      console.warn('Error playing sound:', error)
    }
  }, [audioHapticPreferences.soundEnabled, audioHapticPreferences.soundVolume, initializeAudioContext])

  // Play complex sound sequences
  const playAchievementFanfare = useCallback(() => {
    if (!audioHapticPreferences.soundEnabled) return
    
    const notes = [523, 659, 784, 1047] // C5, E5, G5, C6
    notes.forEach((frequency, index) => {
      setTimeout(() => {
        if (audioContextRef.current) {
          try {
            const oscillator = audioContextRef.current.createOscillator()
            const gainNode = audioContextRef.current.createGain()
            
            oscillator.type = 'triangle'
            oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime)
            
            const volume = audioHapticPreferences.soundVolume * 0.2
            gainNode.gain.setValueAtTime(volume, audioContextRef.current.currentTime)
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 0.3)
            
            oscillator.connect(gainNode)
            gainNode.connect(audioContextRef.current.destination)
            
            oscillator.start(audioContextRef.current.currentTime)
            oscillator.stop(audioContextRef.current.currentTime + 0.3)
          } catch (error) {
            console.warn('Error playing fanfare note:', error)
          }
        }
      }, index * 100)
    })
  }, [audioHapticPreferences.soundEnabled, audioHapticPreferences.soundVolume])

  // Play timer warning sequence
  const playTimerWarning = useCallback(() => {
    if (!audioHapticPreferences.soundEnabled) return
    
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        playSound('timer')
      }, i * 200)
    }
  }, [audioHapticPreferences.soundEnabled, playSound])

  // Initialize audio context on mount
  useEffect(() => {
    if (audioHapticPreferences.soundEnabled) {
      // Listen for first user interaction to initialize
      const initOnInteraction = () => {
        initializeAudioContext()
        document.removeEventListener('click', initOnInteraction)
        document.removeEventListener('touchstart', initOnInteraction)
        document.removeEventListener('keydown', initOnInteraction)
      }
      
      document.addEventListener('click', initOnInteraction, { once: true })
      document.addEventListener('touchstart', initOnInteraction, { once: true })
      document.addEventListener('keydown', initOnInteraction, { once: true })
      
      return () => {
        document.removeEventListener('click', initOnInteraction)
        document.removeEventListener('touchstart', initOnInteraction)
        document.removeEventListener('keydown', initOnInteraction)
      }
    }
  }, [audioHapticPreferences.soundEnabled, initializeAudioContext])

  // Cleanup audio context on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close()
      }
    }
  }, [])

  return {
    playSound,
    playAchievementFanfare,
    playTimerWarning,
    isEnabled: audioHapticPreferences.soundEnabled,
    volume: audioHapticPreferences.soundVolume
  }
}