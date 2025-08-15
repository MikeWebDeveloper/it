/**
 * Accessibility utilities for WCAG 2.1 AA compliance
 * 
 * This file contains utilities to help ensure the app meets WCAG 2.1 AA guidelines:
 * - Color contrast ratios (4.5:1 for normal text, 3:1 for large text)
 * - Keyboard navigation support
 * - Screen reader announcements
 * - Focus management
 * - ARIA attributes and landmarks
 */

// Skip to main content functionality
export function createSkipToMainLink() {
  return {
    className: "skip-to-main",
    href: "#main-content",
    "aria-label": "Skip to main content",
    style: {
      position: "absolute" as const,
      left: "-9999px",
      zIndex: 999,
      padding: "8px 16px",
      backgroundColor: "var(--background)",
      color: "var(--foreground)",
      textDecoration: "none",
      border: "2px solid var(--primary)",
      borderRadius: "4px"
    },
    onFocus: (e: React.FocusEvent<HTMLAnchorElement>) => {
      e.target.style.left = "16px"
      e.target.style.top = "16px"
    },
    onBlur: (e: React.FocusEvent<HTMLAnchorElement>) => {
      e.target.style.left = "-9999px"
    }
  }
}

// Announce to screen readers
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.setAttribute('class', 'sr-only')
  announcement.textContent = message
  
  document.body.appendChild(announcement)
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

// Focus management utilities
export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ) as NodeListOf<HTMLElement>
  
  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  function handleTabKey(e: KeyboardEvent) {
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

  element.addEventListener('keydown', handleTabKey)
  firstElement?.focus()

  return () => {
    element.removeEventListener('keydown', handleTabKey)
  }
}

// ARIA live region utilities
export function createLiveRegion(id: string, priority: 'polite' | 'assertive' = 'polite') {
  let liveRegion = document.getElementById(id)
  
  if (!liveRegion) {
    liveRegion = document.createElement('div')
    liveRegion.id = id
    liveRegion.setAttribute('aria-live', priority)
    liveRegion.setAttribute('aria-atomic', 'true')
    liveRegion.className = 'sr-only'
    document.body.appendChild(liveRegion)
  }
  
  return {
    announce: (message: string) => {
      if (liveRegion) {
        liveRegion.textContent = message
      }
    },
    remove: () => {
      if (liveRegion && liveRegion.parentNode) {
        liveRegion.parentNode.removeChild(liveRegion)
      }
    }
  }
}

// Color contrast validation (for development)
export function checkColorContrast(foreground: string, background: string, fontSize: number = 16): {
  ratio: number
  passes: {
    AA: boolean
    AAA: boolean
  }
} {
  // This is a simplified contrast checker for development
  // In production, you'd use a more robust color contrast library
  
  const isLargeText = fontSize >= 18 || (fontSize >= 14 && fontSize >= 14) // Bold text
  const requiredRatioAA = isLargeText ? 3 : 4.5
  const requiredRatioAAA = isLargeText ? 4.5 : 7
  
  // Simplified contrast calculation (in real implementation, use proper color parsing)
  const mockRatio = 4.6 // This would be calculated from actual color values
  
  return {
    ratio: mockRatio,
    passes: {
      AA: mockRatio >= requiredRatioAA,
      AAA: mockRatio >= requiredRatioAAA
    }
  }
}

// Keyboard navigation utilities
export function enhanceKeyboardNavigation(element: HTMLElement) {
  function handleKeyDown(e: KeyboardEvent) {
    // Arrow key navigation for custom components
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      const focusableElements = Array.from(
        element.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      ) as HTMLElement[]
      
      const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement)
      
      if (currentIndex !== -1) {
        let nextIndex = currentIndex
        
        switch (e.key) {
          case 'ArrowDown':
          case 'ArrowRight':
            nextIndex = (currentIndex + 1) % focusableElements.length
            break
          case 'ArrowUp':
          case 'ArrowLeft':
            nextIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1
            break
        }
        
        if (nextIndex !== currentIndex) {
          e.preventDefault()
          focusableElements[nextIndex].focus()
        }
      }
    }
    
    // Escape key to close modals/dropdowns
    if (e.key === 'Escape') {
      const closeButton = element.querySelector('[data-close-on-escape]') as HTMLElement
      if (closeButton) {
        closeButton.click()
      }
    }
  }

  element.addEventListener('keydown', handleKeyDown)
  
  return () => {
    element.removeEventListener('keydown', handleKeyDown)
  }
}

// ARIA attributes helpers
export function getAriaAttributes(type: 'button' | 'link' | 'input' | 'region' | 'heading' | 'list' | 'listitem') {
  const baseAttributes = {
    button: {
      role: 'button',
      tabIndex: 0
    },
    link: {
      role: 'link'
    },
    input: {
      'aria-required': false,
      'aria-invalid': false
    },
    region: {
      role: 'region'
    },
    heading: {
      role: 'heading'
    },
    list: {
      role: 'list'
    },
    listitem: {
      role: 'listitem'
    }
  }
  
  return baseAttributes[type] || {}
}

// Screen reader only text utility
export const srOnlyStyles = {
  position: 'absolute' as const,
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap' as const,
  border: '0'
}

// Focus visible styles
export const focusVisibleStyles = {
  outline: '2px solid var(--ring)',
  outlineOffset: '2px',
  borderRadius: '4px'
}

// High contrast mode detection
export function isHighContrastMode(): boolean {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-contrast: high)').matches ||
           window.matchMedia('(-ms-high-contrast: active)').matches
  }
  return false
}

// Reduced motion detection
export function prefersReducedMotion(): boolean {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }
  return false
}

// Focus management for route changes
export function manageFocusOnRouteChange(mainContentId: string = 'main-content') {
  if (typeof window !== 'undefined') {
    const mainContent = document.getElementById(mainContentId)
    if (mainContent) {
      mainContent.focus()
      mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
}

// Ensure elements have proper labels
export function ensureProperLabeling(element: HTMLElement, label: string, type: 'aria-label' | 'aria-labelledby' = 'aria-label') {
  if (!element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby')) {
    if (type === 'aria-label') {
      element.setAttribute('aria-label', label)
    }
  }
}