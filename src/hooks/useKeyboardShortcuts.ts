'use client'

import { useEffect, useRef, useCallback } from 'react'
import { toast } from 'react-hot-toast'

export interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  metaKey?: boolean
  action: () => void
  description: string
  category?: string
  preventDefault?: boolean
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[]
  enabled?: boolean
  showToasts?: boolean
  scope?: 'global' | 'local'
}

export function useKeyboardShortcuts({
  shortcuts,
  enabled = true,
  showToasts = false,
  scope = 'local'
}: UseKeyboardShortcutsOptions) {
  const shortcutsRef = useRef<KeyboardShortcut[]>([])
  const enabledRef = useRef(enabled)

  // Update refs when props change
  useEffect(() => {
    shortcutsRef.current = shortcuts
    enabledRef.current = enabled
  }, [shortcuts, enabled])

  const handleKeyDown = useCallback((event: Event) => {
    const keyboardEvent = event as KeyboardEvent
    if (!enabledRef.current) return

    // Don't trigger shortcuts when user is typing in inputs
    const target = keyboardEvent.target as HTMLElement
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable ||
      target.closest('[role="textbox"]')
    ) {
      return
    }

    const matchedShortcut = shortcutsRef.current.find(shortcut => {
      const keyMatch = shortcut.key.toLowerCase() === keyboardEvent.key.toLowerCase()
      const ctrlMatch = !!shortcut.ctrlKey === keyboardEvent.ctrlKey
      const shiftMatch = !!shortcut.shiftKey === keyboardEvent.shiftKey
      const altMatch = !!shortcut.altKey === keyboardEvent.altKey
      const metaMatch = !!shortcut.metaKey === keyboardEvent.metaKey

      return keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch
    })

    if (matchedShortcut) {
      if (matchedShortcut.preventDefault !== false) {
        keyboardEvent.preventDefault()
        keyboardEvent.stopPropagation()
      }

      try {
        matchedShortcut.action()
        
        if (showToasts) {
          toast.success(`⌨️ ${matchedShortcut.description}`, {
            duration: 1000,
            position: 'bottom-center'
          })
        }
      } catch (error) {
        console.error('Error executing keyboard shortcut:', error)
        if (showToasts) {
          toast.error('Failed to execute shortcut')
        }
      }
    }
  }, [showToasts])

  useEffect(() => {
    if (!enabled) return

    const target = scope === 'global' ? document : document.body
    target.addEventListener('keydown', handleKeyDown, { capture: true })

    return () => {
      target.removeEventListener('keydown', handleKeyDown, { capture: true })
    }
  }, [enabled, scope, handleKeyDown])

  const getShortcutText = useCallback((shortcut: KeyboardShortcut) => {
    const keys: string[] = []
    
    if (shortcut.ctrlKey || shortcut.metaKey) {
      keys.push(navigator.platform.indexOf('Mac') > -1 ? '⌘' : 'Ctrl')
    }
    if (shortcut.altKey) {
      keys.push(navigator.platform.indexOf('Mac') > -1 ? '⌥' : 'Alt')
    }
    if (shortcut.shiftKey) {
      keys.push('⇧')
    }
    
    // Format key display
    let keyDisplay = shortcut.key
    switch (shortcut.key.toLowerCase()) {
      case 'arrowleft':
        keyDisplay = '←'
        break
      case 'arrowright':
        keyDisplay = '→'
        break
      case 'arrowup':
        keyDisplay = '↑'
        break
      case 'arrowdown':
        keyDisplay = '↓'
        break
      case ' ':
        keyDisplay = 'Space'
        break
      case 'enter':
        keyDisplay = '⏎'
        break
      case 'escape':
        keyDisplay = 'Esc'
        break
      case 'tab':
        keyDisplay = 'Tab'
        break
      case 'home':
        keyDisplay = 'Home'
        break
      case 'end':
        keyDisplay = 'End'
        break
      default:
        keyDisplay = shortcut.key.toUpperCase()
    }
    
    keys.push(keyDisplay)
    return keys.join(' + ')
  }, [])

  return {
    getShortcutText,
    shortcuts: shortcutsRef.current
  }
}

// Predefined shortcut sets for common use cases
export const createQuizShortcuts = (actions: {
  onPrevious: () => void
  onNext: () => void
  onAnswer: (index: number) => void
  onSubmit: () => void
  onExit: () => void
  onPause?: () => void
  onFirst?: () => void
  onLast?: () => void
  onHelp?: () => void
}) => {
  const shortcuts: KeyboardShortcut[] = [
    // Navigation
    {
      key: 'ArrowLeft',
      action: actions.onPrevious,
      description: 'Previous question',
      category: 'Navigation'
    },
    {
      key: 'ArrowRight',
      action: actions.onNext,
      description: 'Next question',
      category: 'Navigation'
    },
    {
      key: 'Home',
      action: actions.onFirst || (() => {}),
      description: 'First question',
      category: 'Navigation'
    },
    {
      key: 'End',
      action: actions.onLast || (() => {}),
      description: 'Last question',
      category: 'Navigation'
    },
    
    // Answer selection (1-9 for multiple choice)
    ...Array.from({ length: 9 }, (_, i) => ({
      key: (i + 1).toString(),
      action: () => actions.onAnswer(i),
      description: `Select answer ${i + 1}`,
      category: 'Answers'
    })),
    
    // Actions
    {
      key: 'Enter',
      action: actions.onSubmit,
      description: 'Submit answer / Continue',
      category: 'Actions'
    },
    {
      key: ' ',
      action: actions.onSubmit,
      description: 'Submit answer / Continue',
      category: 'Actions'
    },
    {
      key: 'Escape',
      action: actions.onExit,
      description: 'Exit quiz',
      category: 'Actions'
    },
    
    // Advanced actions
    ...(actions.onPause ? [{
      key: 'p',
      action: actions.onPause,
      description: 'Pause/Resume quiz',
      category: 'Actions'
    }] : []),
    
    ...(actions.onHelp ? [{
      key: '?',
      shiftKey: true,
      action: actions.onHelp,
      description: 'Show keyboard shortcuts',
      category: 'Help'
    }] : []),
    
    // Quick jump with Ctrl
    {
      key: 'ArrowLeft',
      ctrlKey: true,
      action: actions.onFirst || (() => {}),
      description: 'Jump to first question',
      category: 'Quick Navigation'
    },
    {
      key: 'ArrowRight',
      ctrlKey: true,
      action: actions.onLast || (() => {}),
      description: 'Jump to last question',
      category: 'Quick Navigation'
    }
  ]

  return shortcuts
}

export const createFlashcardShortcuts = (actions: {
  onPrevious: () => void
  onNext: () => void
  onFlip: () => void
  onExit: () => void
  onShuffle?: () => void
  onHelp?: () => void
}) => {
  const shortcuts: KeyboardShortcut[] = [
    // Navigation
    {
      key: 'ArrowLeft',
      action: actions.onPrevious,
      description: 'Previous card',
      category: 'Navigation'
    },
    {
      key: 'ArrowRight',
      action: actions.onNext,
      description: 'Next card',
      category: 'Navigation'
    },
    
    // Card actions
    {
      key: ' ',
      action: actions.onFlip,
      description: 'Flip card',
      category: 'Actions'
    },
    {
      key: 'Enter',
      action: actions.onFlip,
      description: 'Flip card',
      category: 'Actions'
    },
    {
      key: 'f',
      action: actions.onFlip,
      description: 'Flip card',
      category: 'Actions'
    },
    
    // Exit
    {
      key: 'Escape',
      action: actions.onExit,
      description: 'Exit flashcards',
      category: 'Actions'
    },
    
    // Advanced
    ...(actions.onShuffle ? [{
      key: 's',
      action: actions.onShuffle,
      description: 'Shuffle cards',
      category: 'Actions'
    }] : []),
    
    ...(actions.onHelp ? [{
      key: '?',
      shiftKey: true,
      action: actions.onHelp,
      description: 'Show keyboard shortcuts',
      category: 'Help'
    }] : [])
  ]

  return shortcuts
}

export const createGeneralShortcuts = (actions: {
  onHome?: () => void
  onStats?: () => void
  onFlashcards?: () => void
  onSettings?: () => void
  onHelp?: () => void
  onThemeToggle?: () => void
}) => {
  const shortcuts: KeyboardShortcut[] = [
    // Global navigation
    ...(actions.onHome ? [{
      key: 'h',
      ctrlKey: true,
      action: actions.onHome,
      description: 'Go to home',
      category: 'Navigation'
    }] : []),
    
    ...(actions.onStats ? [{
      key: 's',
      ctrlKey: true,
      action: actions.onStats,
      description: 'View statistics',
      category: 'Navigation'
    }] : []),
    
    ...(actions.onFlashcards ? [{
      key: 'f',
      ctrlKey: true,
      action: actions.onFlashcards,
      description: 'Open flashcards',
      category: 'Navigation'
    }] : []),
    
    // Settings and help
    ...(actions.onSettings ? [{
      key: ',',
      ctrlKey: true,
      action: actions.onSettings,
      description: 'Open settings',
      category: 'Settings'
    }] : []),
    
    ...(actions.onThemeToggle ? [{
      key: 't',
      ctrlKey: true,
      action: actions.onThemeToggle,
      description: 'Toggle theme',
      category: 'Settings'
    }] : []),
    
    ...(actions.onHelp ? [{
      key: '?',
      shiftKey: true,
      action: actions.onHelp,
      description: 'Show help',
      category: 'Help'
    }] : [])
  ]

  return shortcuts
}