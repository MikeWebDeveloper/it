'use client'

import { useEffect, useCallback } from 'react'
import { announceToScreenReader, createLiveRegion } from '@/lib/accessibility'

/**
 * Hook for managing accessibility features and screen reader announcements
 * Provides utilities for WCAG 2.1 AA compliance
 */
export function useAccessibility() {
  // Initialize live regions on mount
  useEffect(() => {
    const statusRegion = createLiveRegion('status-announcements', 'assertive')
    const politeRegion = createLiveRegion('polite-announcements', 'polite')
    
    return () => {
      statusRegion.remove()
      politeRegion.remove()
    }
  }, [])

  // Announce messages to screen readers
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const regionId = priority === 'assertive' ? 'status-announcements' : 'polite-announcements'
    const region = document.getElementById(regionId)
    
    if (region) {
      // Clear previous announcement
      region.textContent = ''
      // Add slight delay to ensure screen readers pick up the change
      setTimeout(() => {
        region.textContent = message
      }, 100)
    } else {
      // Fallback to creating temporary announcement
      announceToScreenReader(message, priority)
    }
  }, [])

  // Announce navigation changes
  const announceNavigation = useCallback((pageName: string) => {
    announce(`Navigated to ${pageName}`, 'assertive')
  }, [announce])

  // Announce form validation errors
  const announceError = useCallback((error: string) => {
    announce(`Error: ${error}`, 'assertive')
  }, [announce])

  // Announce success messages
  const announceSuccess = useCallback((message: string) => {
    announce(`Success: ${message}`, 'polite')
  }, [announce])

  // Announce quiz state changes
  const announceQuizState = useCallback((state: string, details?: string) => {
    const message = details ? `${state}. ${details}` : state
    announce(message, 'polite')
  }, [announce])

  // Focus management for dynamic content
  const focusElement = useCallback((selector: string, scrollToElement: boolean = true) => {
    const element = document.querySelector(selector) as HTMLElement
    if (element) {
      element.focus()
      if (scrollToElement) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [])

  // Manage focus for modal/dialog opening
  const manageFocusForModal = useCallback((modalSelector: string) => {
    const modal = document.querySelector(modalSelector) as HTMLElement
    if (modal) {
      const firstFocusable = modal.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement
      
      if (firstFocusable) {
        firstFocusable.focus()
      }
    }
  }, [])

  // Handle keyboard navigation for custom components
  const handleKeyboardNavigation = useCallback((
    event: KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    onNavigate: (newIndex: number) => void
  ) => {
    let newIndex = currentIndex

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault()
        newIndex = (currentIndex + 1) % items.length
        break
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault()
        newIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1
        break
      case 'Home':
        event.preventDefault()
        newIndex = 0
        break
      case 'End':
        event.preventDefault()
        newIndex = items.length - 1
        break
      default:
        return
    }

    onNavigate(newIndex)
    items[newIndex]?.focus()
  }, [])

  return {
    announce,
    announceNavigation,
    announceError,
    announceSuccess,
    announceQuizState,
    focusElement,
    manageFocusForModal,
    handleKeyboardNavigation
  }
}

/**
 * Hook for managing focus states and accessibility attributes
 */
export function useFocusManagement() {
  const handleFocusVisible = useCallback((event: React.FocusEvent) => {
    // Add focus-visible class for keyboard navigation
    if (event.target instanceof HTMLElement) {
      event.target.classList.add('focus-visible')
    }
  }, [])

  const handleFocusBlur = useCallback((event: React.FocusEvent) => {
    // Remove focus-visible class
    if (event.target instanceof HTMLElement) {
      event.target.classList.remove('focus-visible')
    }
  }, [])

  const trapFocus = useCallback((containerRef: React.RefObject<HTMLElement>) => {
    const container = containerRef.current
    if (!container) return

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    container.addEventListener('keydown', handleTabKey)
    firstElement?.focus()

    return () => {
      container.removeEventListener('keydown', handleTabKey)
    }
  }, [])

  return {
    handleFocusVisible,
    handleFocusBlur,
    trapFocus
  }
}

/**
 * Hook for detecting user preferences related to accessibility
 */
export function useAccessibilityPreferences() {
  const prefersReducedMotion = useCallback(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    }
    return false
  }, [])

  const prefersHighContrast = useCallback(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-contrast: high)').matches ||
             window.matchMedia('(-ms-high-contrast: active)').matches
    }
    return false
  }, [])

  const prefersLargeText = useCallback(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(min-resolution: 192dpi)').matches
    }
    return false
  }, [])

  useEffect(() => {
    // Apply reduced motion class to document if user prefers reduced motion
    if (prefersReducedMotion()) {
      document.documentElement.classList.add('reduce-motion')
    }

    // Apply high contrast class if user prefers high contrast
    if (prefersHighContrast()) {
      document.documentElement.classList.add('high-contrast')
    }
  }, [prefersReducedMotion, prefersHighContrast])

  return {
    prefersReducedMotion,
    prefersHighContrast,
    prefersLargeText
  }
}