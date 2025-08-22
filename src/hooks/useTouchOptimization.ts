/**
 * useTouchOptimization Hook
 * 
 * Comprehensive touch optimization for mobile applications.
 * Handles touch targets, spacing, feedback, and accessibility.
 * 
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Touch_events
 * @see https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA
 * @see https://www.w3.org/WAI/WCAG21/quickref/#target-size
 * @see https://react.dev/reference/react/useEffect
 * 
 * Features:
 * - Touch target size optimization (44x44px minimum)
 * - Touch-friendly spacing between elements
 * - Touch feedback and visual cues
 * - Accessibility improvements for touch
 * - Performance optimization for touch events
 * - Cross-device touch compatibility
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'

interface TouchTarget {
  element: HTMLElement
  originalSize: { width: number; height: number }
  originalPadding: { top: number; right: number; bottom: number; left: number }
  originalMargin: { top: number; right: number; bottom: number; left: number }
  isOptimized: boolean
}

interface TouchOptimizationOptions {
  enableTargetOptimization?: boolean
  enableSpacingOptimization?: boolean
  enableTouchFeedback?: boolean
  enableAccessibility?: boolean
  enablePerformanceOptimization?: boolean
  minTouchTargetSize?: number
  touchSpacing?: number
  touchFeedbackDuration?: number
  enableHapticFeedback?: boolean
  onTouchTargetOptimized?: (target: TouchTarget) => void
  onTouchFeedback?: (element: HTMLElement, type: 'press' | 'release' | 'hover') => void
}

interface TouchState {
  isTouching: boolean
  touchStartTime: number
  touchStartPosition: { x: number; y: number }
  currentTouchPosition: { x: number; y: number }
  touchDuration: number
  touchDistance: number
  isLongPress: boolean
  isMultiTouch: boolean
  touchCount: number
}

export function useTouchOptimization(options: TouchOptimizationOptions = {}) {
  const {
    enableTargetOptimization = true,
    enableSpacingOptimization = true,
    enableTouchFeedback = true,
    enableAccessibility = true,
    enablePerformanceOptimization = true,
    minTouchTargetSize = 44,
    touchSpacing = 8,
    touchFeedbackDuration = 150,
    enableHapticFeedback = true,
    onTouchTargetOptimized,
    onTouchFeedback
  } = options

  // State management
  const [touchState, setTouchState] = useState<TouchState>({
    isTouching: false,
    touchStartTime: 0,
    touchStartPosition: { x: 0, y: 0 },
    currentTouchPosition: { x: 0, y: 0 },
    touchDuration: 0,
    touchDistance: 0,
    isLongPress: false,
    isMultiTouch: false,
    touchCount: 0
  })

  // Refs for cleanup and management
  const touchTargetsRef = useRef<Map<HTMLElement, TouchTarget>>(new Map())
  const touchFeedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const longPressTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const touchEventThrottleRef = useRef<number>(0)
  const lastTouchTimeRef = useRef<number>(0)

  // Initialize touch optimization
  useEffect(() => {
    if (enableTargetOptimization) {
      optimizeTouchTargets()
    }

    if (enableSpacingOptimization) {
      optimizeTouchSpacing()
    }

    if (enableAccessibility) {
      enhanceTouchAccessibility()
    }

    return () => {
      // Restore original element properties
      touchTargetsRef.current.forEach((target) => {
        restoreTouchTarget(target)
      })
    }
  }, [enableTargetOptimization, enableSpacingOptimization, enableAccessibility])

  // Touch target optimization
  const optimizeTouchTargets = useCallback(() => {
    const interactiveElements = document.querySelectorAll(
      'button, [role="button"], a, input, select, textarea, [tabindex], [data-touch-target]'
    )

    interactiveElements.forEach((element) => {
      if (element instanceof HTMLElement) {
        const rect = element.getBoundingClientRect()
        const computedStyle = window.getComputedStyle(element)
        
        // Check if element needs optimization
        if (rect.width < minTouchTargetSize || rect.height < minTouchTargetSize) {
          const target: TouchTarget = {
            element,
            originalSize: { width: rect.width, height: rect.height },
            originalPadding: {
              top: parseFloat(computedStyle.paddingTop),
              right: parseFloat(computedStyle.paddingRight),
              bottom: parseFloat(computedStyle.paddingBottom),
              left: parseFloat(computedStyle.paddingLeft)
            },
            originalMargin: {
              top: parseFloat(computedStyle.marginTop),
              right: parseFloat(computedStyle.marginRight),
              bottom: parseFloat(computedStyle.marginBottom),
              left: parseFloat(computedStyle.marginLeft)
            },
            isOptimized: false
          }

          // Calculate required padding to meet minimum size
          const requiredWidthPadding = Math.max(0, (minTouchTargetSize - rect.width) / 2)
          const requiredHeightPadding = Math.max(0, (minTouchTargetSize - rect.height) / 2)

          // Apply optimization
          element.style.padding = `${target.originalPadding.top + requiredHeightPadding}px ${target.originalPadding.right + requiredWidthPadding}px ${target.originalPadding.bottom + requiredHeightPadding}px ${target.originalPadding.left + requiredWidthPadding}px`
          
          // Add touch target indicator
          element.setAttribute('data-touch-optimized', 'true')
          element.setAttribute('aria-label', `${element.getAttribute('aria-label') || element.textContent || 'Touch target'}`)
          
          target.isOptimized = true
          touchTargetsRef.current.set(element, target)
          
          onTouchTargetOptimized?.(target)
        }
      }
    })
  }, [minTouchTargetSize, onTouchTargetOptimized])

  // Touch spacing optimization
  const optimizeTouchSpacing = useCallback(() => {
    const interactiveElements = document.querySelectorAll(
      'button, [role="button"], a, input, select, textarea, [tabindex]'
    )

    interactiveElements.forEach((element, index) => {
      if (element instanceof HTMLElement && index > 0) {
        const previousElement = interactiveElements[index - 1] as HTMLElement
        const currentRect = element.getBoundingClientRect()
        const previousRect = previousElement.getBoundingClientRect()
        
        // Check vertical spacing
        const verticalDistance = currentRect.top - (previousRect.top + previousRect.height)
        if (verticalDistance < touchSpacing) {
          element.style.marginTop = `${touchSpacing - verticalDistance}px`
        }
        
        // Check horizontal spacing
        const horizontalDistance = currentRect.left - (previousRect.left + previousRect.width)
        if (horizontalDistance < touchSpacing) {
          element.style.marginLeft = `${touchSpacing - horizontalDistance}px`
        }
      }
    })
  }, [touchSpacing])

  // Touch accessibility enhancement
  const enhanceTouchAccessibility = useCallback(() => {
    const interactiveElements = document.querySelectorAll(
      'button, [role="button"], a, input, select, textarea, [tabindex]'
    )

    interactiveElements.forEach((element) => {
      if (element instanceof HTMLElement) {
        // Ensure proper ARIA attributes
        if (!element.hasAttribute('role')) {
          if (element.tagName === 'BUTTON') {
            element.setAttribute('role', 'button')
          } else if (element.tagName === 'A') {
            element.setAttribute('role', 'link')
          }
        }

        // Add touch-specific ARIA attributes
        if (!element.hasAttribute('aria-label')) {
          const title = element.getAttribute('title')
          const textContent = element.textContent?.trim()
          if (title) {
            element.setAttribute('aria-label', title)
          } else if (textContent) {
            element.setAttribute('aria-label', textContent)
          }
        }

        // Add touch interaction hints
        element.setAttribute('data-touch-enabled', 'true')
        
        // Ensure proper tabindex
        if (!element.hasAttribute('tabindex')) {
          element.setAttribute('tabindex', '0')
        }
      }
    })
  }, [])

  // Touch event handling with performance optimization
  useEffect(() => {
    if (!enableTouchFeedback) return

    const handleTouchStart = (event: TouchEvent) => {
      // Throttle touch events for performance
      const now = Date.now()
      if (now - lastTouchTimeRef.current < touchEventThrottleRef.current) {
        return
      }
      lastTouchTimeRef.current = now

      const touch = event.touches[0]
      const target = event.target as HTMLElement
      
      setTouchState(prev => ({
        ...prev,
        isTouching: true,
        touchStartTime: now,
        touchStartPosition: { x: touch.clientX, y: touch.clientY },
        currentTouchPosition: { x: touch.clientX, y: touch.clientY },
        touchCount: event.touches.length,
        isMultiTouch: event.touches.length > 1
      }))

      // Start long press detection
      longPressTimeoutRef.current = setTimeout(() => {
        setTouchState(prev => ({ ...prev, isLongPress: true }))
        onTouchFeedback?.(target, 'press')
        
        // Haptic feedback for long press
        if (enableHapticFeedback && 'vibrate' in navigator) {
          navigator.vibrate(100)
        }
      }, 500)

      // Visual feedback
      if (target) {
        target.style.transform = 'scale(0.95)'
        target.style.transition = `transform ${touchFeedbackDuration}ms ease-out`
        onTouchFeedback?.(target, 'press')
      }
    }

    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0]
      const target = event.target as HTMLElement
      
      setTouchState(prev => {
        const newPosition = { x: touch.clientX, y: touch.clientY }
        const distance = Math.sqrt(
          Math.pow(newPosition.x - prev.touchStartPosition.x, 2) +
          Math.pow(newPosition.y - prev.touchStartPosition.y, 2)
        )
        
        return {
          ...prev,
          currentTouchPosition: newPosition,
          touchDistance: distance
        }
      })

      // Cancel long press if moved too far
      if (touchState.touchDistance > 10) {
        if (longPressTimeoutRef.current) {
          clearTimeout(longPressTimeoutRef.current)
        }
        setTouchState(prev => ({ ...prev, isLongPress: false }))
      }
    }

    const handleTouchEnd = (event: TouchEvent) => {
      const target = event.target as HTMLElement
      
      // Clear timeouts
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current)
      }
      if (touchFeedbackTimeoutRef.current) {
        clearTimeout(touchFeedbackTimeoutRef.current)
      }

      // Calculate touch duration
      const touchDuration = Date.now() - touchState.touchStartTime
      
      setTouchState(prev => ({
        ...prev,
        isTouching: false,
        touchDuration,
        isLongPress: false
      }))

      // Visual feedback
      if (target) {
        target.style.transform = 'scale(1)'
        target.style.transition = `transform ${touchFeedbackDuration}ms ease-out`
        onTouchFeedback?.(target, 'release')
      }

      // Haptic feedback for touch release
      if (enableHapticFeedback && 'vibrate' in navigator) {
        navigator.vibrate(20)
      }
    }

    // Add touch event listeners
    document.addEventListener('touchstart', handleTouchStart, { passive: false })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [enableTouchFeedback, touchFeedbackDuration, enableHapticFeedback, onTouchFeedback, touchState.touchStartPosition, touchState.touchDistance])

  // Performance optimization
  useEffect(() => {
    if (!enablePerformanceOptimization) return

    // Set touch event throttle based on device performance
    const setTouchThrottle = () => {
      if ('navigator' in window && 'hardwareConcurrency' in navigator) {
        const cores = (navigator as { hardwareConcurrency?: number }).hardwareConcurrency || 4
        touchEventThrottleRef.current = cores < 4 ? 16 : 8 // 60fps vs 120fps
      } else {
        touchEventThrottleRef.current = 16 // Default 60fps
      }
    }

    setTouchThrottle()

    // Adjust throttle on visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        touchEventThrottleRef.current = 100 // Reduce updates when hidden
      } else {
        setTouchThrottle()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [enablePerformanceOptimization])

  // Utility functions
  const restoreTouchTarget = useCallback((target: TouchTarget) => {
    const { element, originalPadding, originalMargin } = target
    
    element.style.padding = `${originalPadding.top}px ${originalPadding.right}px ${originalPadding.bottom}px ${originalPadding.left}px`
    element.style.margin = `${originalMargin.top}px ${originalMargin.right}px ${originalMargin.bottom}px ${originalMargin.left}px`
    element.removeAttribute('data-touch-optimized')
    element.removeAttribute('data-touch-enabled')
    
    target.isOptimized = false
  }, [])

  const getTouchTargetInfo = useCallback((element: HTMLElement) => {
    return touchTargetsRef.current.get(element)
  }, [])

  const isTouchTargetOptimized = useCallback((element: HTMLElement) => {
    const target = touchTargetsRef.current.get(element)
    return target?.isOptimized || false
  }, [])

  const optimizeElement = useCallback((element: HTMLElement) => {
    if (element && !touchTargetsRef.current.has(element)) {
      const rect = element.getBoundingClientRect()
      if (rect.width < minTouchTargetSize || rect.height < minTouchTargetSize) {
        optimizeTouchTargets()
      }
    }
  }, [minTouchTargetSize, optimizeTouchTargets])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (touchFeedbackTimeoutRef.current) {
        clearTimeout(touchFeedbackTimeoutRef.current)
      }
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current)
      }
    }
  }, [])

  // Memoized values
  const touchTargets = useMemo(() => Array.from(touchTargetsRef.current.values()), [])
  const optimizedTargetCount = useMemo(() => touchTargets.filter(t => t.isOptimized).length, [touchTargets])
  const touchPerformance = useMemo(() => ({
    throttleRate: touchEventThrottleRef.current,
    isOptimized: touchEventThrottleRef.current <= 16
  }), [])

  return {
    // State
    touchState,
    touchTargets,
    optimizedTargetCount,
    touchPerformance,
    
    // Actions
    optimizeElement,
    getTouchTargetInfo,
    isTouchTargetOptimized,
    restoreTouchTarget,
    
    // Utilities
    optimizeTouchTargets,
    optimizeTouchSpacing,
    enhanceTouchAccessibility
  }
}

// Hook for common touch optimizations
export function useCommonTouchOptimizations() {
  return useTouchOptimization({
    enableTargetOptimization: true,
    enableSpacingOptimization: true,
    enableTouchFeedback: true,
    enableAccessibility: true,
    enablePerformanceOptimization: true,
    minTouchTargetSize: 44,
    touchSpacing: 8,
    touchFeedbackDuration: 150,
    enableHapticFeedback: true
  })
}

// Touch target size constants
export const TOUCH_TARGET_SIZES = {
  MINIMUM: 44, // WCAG 2.1 AA requirement
  RECOMMENDED: 48, // Material Design recommendation
  LARGE: 56, // For important actions
  EXTRA_LARGE: 64 // For critical actions
} as const

// Touch spacing constants
export const TOUCH_SPACING = {
  MINIMUM: 4, // Minimum spacing between elements
  RECOMMENDED: 8, // Recommended spacing
  COMFORTABLE: 12, // Comfortable spacing
  GENEROUS: 16 // Generous spacing for important elements
} as const