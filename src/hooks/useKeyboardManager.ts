/**
 * useKeyboardManager Hook
 * 
 * Comprehensive keyboard management for mobile and desktop applications.
 * Handles keyboard events, viewport adjustments, and accessibility features.
 * 
 * @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Visual_Viewport_API
 * @see https://react.dev/reference/react/useEffect
 * 
 * Features:
 * - Smart keyboard detection and handling
 * - Viewport adjustments for mobile keyboards
 * - Accessibility keyboard navigation
 * - Custom keyboard shortcuts
 * - Focus management
 * - Keyboard event prevention
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'

interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  metaKey?: boolean
  action: () => void
  description: string
  preventDefault?: boolean
}

interface KeyboardManagerOptions {
  enableShortcuts?: boolean
  enableViewportAdjustment?: boolean
  enableFocusManagement?: boolean
  enableAccessibility?: boolean
  viewportAdjustmentDelay?: number
  focusTrapSelector?: string
  onKeyboardShow?: () => void
  onKeyboardHide?: () => void
  onViewportChange?: (height: number) => void
}

interface KeyboardState {
  isKeyboardVisible: boolean
  viewportHeight: number
  activeElement: HTMLElement | null
  lastFocusedElement: HTMLElement | null
  isShiftPressed: boolean
  isCtrlPressed: boolean
  isAltPressed: boolean
  isMetaPressed: boolean
}

export function useKeyboardManager(options: KeyboardManagerOptions = {}) {
  const {
    enableShortcuts = true,
    enableViewportAdjustment = true,
    enableFocusManagement = true,
    enableAccessibility = true,
    viewportAdjustmentDelay = 300,
    focusTrapSelector = '[data-focus-trap]',
    onKeyboardShow,
    onKeyboardHide,
    onViewportChange
  } = options

  // State management
  const [keyboardState, setKeyboardState] = useState<KeyboardState>({
    isKeyboardVisible: false,
    viewportHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
    activeElement: null,
    lastFocusedElement: null,
    isShiftPressed: false,
    isCtrlPressed: false,
    isAltPressed: false,
    isMetaPressed: false
  })

  // Refs for cleanup and management
  const shortcutsRef = useRef<Map<string, KeyboardShortcut>>(new Map())
  const viewportAdjustmentTimeoutRef = useRef<NodeJS.Timeout>()
  const focusTrapRef = useRef<HTMLElement | null>(null)
  const initialViewportHeightRef = useRef<number>(0)

  // Initialize viewport height on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      initialViewportHeightRef.current = window.innerHeight
      setKeyboardState(prev => ({
        ...prev,
        viewportHeight: window.innerHeight
      }))
    }
  }, [])

  // Visual Viewport API for accurate keyboard detection
  useEffect(() => {
    if (!enableViewportAdjustment || typeof window === 'undefined') return

    const handleViewportChange = () => {
      if ('visualViewport' in window) {
        const visualViewport = (window as any).visualViewport
        const newHeight = visualViewport.height
        const heightDifference = initialViewportHeightRef.current - newHeight

        // Consider keyboard visible if height difference is significant (>150px)
        const isKeyboardVisible = heightDifference > 150

        setKeyboardState(prev => ({
          ...prev,
          isKeyboardVisible,
          viewportHeight: newHeight
        }))

        // Trigger callbacks
        if (isKeyboardVisible !== prev.isKeyboardVisible) {
          if (isKeyboardVisible) {
            onKeyboardShow?.()
          } else {
            onKeyboardHide?.()
          }
        }

        onViewportChange?.(newHeight)

        // Adjust viewport with delay for smooth transitions
        if (viewportAdjustmentTimeoutRef.current) {
          clearTimeout(viewportAdjustmentTimeoutRef.current)
        }

        viewportAdjustmentTimeoutRef.current = setTimeout(() => {
          if (isKeyboardVisible) {
            // Scroll to active element when keyboard appears
            const activeElement = document.activeElement as HTMLElement
            if (activeElement && activeElement.scrollIntoView) {
              activeElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
              })
            }
          }
        }, viewportAdjustmentDelay)
      }
    }

    if ('visualViewport' in window) {
      const visualViewport = (window as any).visualViewport
      visualViewport.addEventListener('resize', handleViewportChange)
      visualViewport.addEventListener('scroll', handleViewportChange)

      return () => {
        visualViewport.removeEventListener('resize', handleViewportChange)
        visualViewport.removeEventListener('scroll', handleViewportChange)
      }
    }
  }, [enableViewportAdjustment, viewportAdjustmentDelay, onKeyboardShow, onKeyboardHide, onViewportChange])

  // Keyboard event handling
  useEffect(() => {
    if (!enableShortcuts) return

    const handleKeyDown = (event: KeyboardEvent) => {
      const { key, ctrlKey, shiftKey, altKey, metaKey } = event
      
      // Update modifier key states
      setKeyboardState(prev => ({
        ...prev,
        isShiftPressed: shiftKey,
        isCtrlPressed: ctrlKey,
        isAltPressed: altKey,
        isMetaPressed: metaKey
      }))

      // Check for registered shortcuts
      const shortcutKey = generateShortcutKey(key, ctrlKey, shiftKey, altKey, metaKey)
      const shortcut = shortcutsRef.current.get(shortcutKey)
      
      if (shortcut) {
        if (shortcut.preventDefault) {
          event.preventDefault()
        }
        shortcut.action()
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      const { key, ctrlKey, shiftKey, altKey, metaKey } = event
      
      // Update modifier key states
      setKeyboardState(prev => ({
        ...prev,
        isShiftPressed: shiftKey,
        isCtrlPressed: ctrlKey,
        isAltPressed: altKey,
        isMetaPressed: metaKey
      }))
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [enableShortcuts])

  // Focus management
  useEffect(() => {
    if (!enableFocusManagement) return

    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement
      setKeyboardState(prev => ({
        ...prev,
        activeElement: target,
        lastFocusedElement: prev.activeElement
      }))

      // Focus trap management
      if (focusTrapRef.current && !focusTrapRef.current.contains(target)) {
        focusTrapRef.current.focus()
      }
    }

    const handleFocusOut = (event: FocusEvent) => {
      // Only update if focus is leaving the document
      if (!event.relatedTarget) {
        setKeyboardState(prev => ({
          ...prev,
          activeElement: null
        }))
      }
    }

    document.addEventListener('focusin', handleFocusIn)
    document.addEventListener('focusout', handleFocusOut)

    return () => {
      document.removeEventListener('focusin', handleFocusIn)
      document.removeEventListener('focusout', handleFocusOut)
    }
  }, [enableFocusManagement])

  // Accessibility enhancements
  useEffect(() => {
    if (!enableAccessibility) return

    // Add keyboard navigation attributes
    const addAccessibilityAttributes = () => {
      const interactiveElements = document.querySelectorAll(
        'button, [role="button"], a, input, select, textarea, [tabindex]'
      )

      interactiveElements.forEach((element) => {
        if (element instanceof HTMLElement) {
          // Ensure proper tabindex
          if (!element.hasAttribute('tabindex')) {
            element.setAttribute('tabindex', '0')
          }

          // Add keyboard interaction hints
          if (!element.hasAttribute('aria-label') && !element.textContent?.trim()) {
            const title = element.getAttribute('title')
            if (title) {
              element.setAttribute('aria-label', title)
            }
          }
        }
      })
    }

    // Run after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', addAccessibilityAttributes)
    } else {
      addAccessibilityAttributes()
    }

    return () => {
      document.removeEventListener('DOMContentLoaded', addAccessibilityAttributes)
    }
  }, [enableAccessibility])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (viewportAdjustmentTimeoutRef.current) {
        clearTimeout(viewportAdjustmentTimeoutRef.current)
      }
    }
  }, [])

  // Utility functions
  const generateShortcutKey = useCallback((
    key: string,
    ctrlKey: boolean,
    shiftKey: boolean,
    altKey: boolean,
    metaKey: boolean
  ): string => {
    const parts = []
    if (ctrlKey) parts.push('Ctrl')
    if (shiftKey) parts.push('Shift')
    if (altKey) parts.push('Alt')
    if (metaKey) parts.push('Meta')
    parts.push(key.toUpperCase())
    return parts.join('+')
  }, [])

  // Public API
  const registerShortcut = useCallback((shortcut: KeyboardShortcut) => {
    const key = generateShortcutKey(
      shortcut.key,
      shortcut.ctrlKey || false,
      shortcut.shiftKey || false,
      shortcut.altKey || false,
      shortcut.metaKey || false
    )
    shortcutsRef.current.set(key, shortcut)
  }, [generateShortcutKey])

  const unregisterShortcut = useCallback((key: string) => {
    shortcutsRef.current.delete(key)
  }, [])

  const setFocusTrap = useCallback((element: HTMLElement | null) => {
    focusTrapRef.current = element
  }, [])

  const focusElement = useCallback((selector: string) => {
    const element = document.querySelector(selector) as HTMLElement
    if (element && element.focus) {
      element.focus()
      return true
    }
    return false
  }, [])

  const focusNextElement = useCallback(() => {
    const focusableElements = document.querySelectorAll(
      'button, [role="button"], a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    const currentIndex = Array.from(focusableElements).findIndex(
      el => el === document.activeElement
    )
    
    if (currentIndex >= 0 && currentIndex < focusableElements.length - 1) {
      (focusableElements[currentIndex + 1] as HTMLElement).focus()
      return true
    }
    return false
  }, [])

  const focusPreviousElement = useCallback(() => {
    const focusableElements = document.querySelectorAll(
      'button, [role="button"], a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    const currentIndex = Array.from(focusableElements).findIndex(
      el => el === document.activeElement
    )
    
    if (currentIndex > 0) {
      (focusableElements[currentIndex - 1] as HTMLElement).focus()
      return true
    }
    return false
  }, [])

  // Memoized values
  const isKeyboardVisible = useMemo(() => keyboardState.isKeyboardVisible, [keyboardState.isKeyboardVisible])
  const viewportHeight = useMemo(() => keyboardState.viewportHeight, [keyboardState.viewportHeight])
  const activeElement = useMemo(() => keyboardState.activeElement, [keyboardState.activeElement])
  const modifierKeys = useMemo(() => ({
    shift: keyboardState.isShiftPressed,
    ctrl: keyboardState.isCtrlPressed,
    alt: keyboardState.isAltPressed,
    meta: keyboardState.isMetaPressed
  }), [keyboardState.isShiftPressed, keyboardState.isCtrlPressed, keyboardState.isAltPressed, keyboardState.isMetaPressed])

  return {
    // State
    isKeyboardVisible,
    viewportHeight,
    activeElement,
    modifierKeys,
    
    // Actions
    registerShortcut,
    unregisterShortcut,
    setFocusTrap,
    focusElement,
    focusNextElement,
    focusPreviousElement,
    
    // Utilities
    generateShortcutKey
  }
}

// Default keyboard shortcuts for common actions
export const defaultKeyboardShortcuts: KeyboardShortcut[] = [
  {
    key: 'Tab',
    action: () => {}, // Handled by browser
    description: 'Navigate between focusable elements',
    preventDefault: false
  },
  {
    key: 'Escape',
    action: () => {
      // Close modals, dropdowns, etc.
      const escapeEvent = new CustomEvent('keyboard-escape')
      document.dispatchEvent(escapeEvent)
    },
    description: 'Close modal or cancel action',
    preventDefault: true
  },
  {
    key: 'Enter',
    action: () => {
      // Trigger primary action
      const enterEvent = new CustomEvent('keyboard-enter')
      document.dispatchEvent(enterEvent)
    },
    description: 'Activate primary action',
    preventDefault: false
  },
  {
    key: 'Space',
    action: () => {
      // Toggle or activate
      const spaceEvent = new CustomEvent('keyboard-space')
      document.dispatchEvent(spaceEvent)
    },
    description: 'Toggle or activate element',
    preventDefault: true
  }
]

// Hook for common keyboard shortcuts
export function useCommonKeyboardShortcuts() {
  const { registerShortcut, unregisterShortcut } = useKeyboardManager({
    enableShortcuts: true,
    enableViewportAdjustment: true,
    enableFocusManagement: true,
    enableAccessibility: true
  })

  useEffect(() => {
    // Register default shortcuts
    defaultKeyboardShortcuts.forEach(shortcut => {
      registerShortcut(shortcut)
    })

    return () => {
      // Cleanup shortcuts
      defaultKeyboardShortcuts.forEach(shortcut => {
        const key = shortcut.key
        unregisterShortcut(key)
      })
    }
  }, [registerShortcut, unregisterShortcut])

  return { registerShortcut, unregisterShortcut }
}