'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// Performance optimization utilities for mobile devices

// Device capability detection
export const deviceCapabilities = {
  // Detect if device supports hardware acceleration
  supportsHardwareAcceleration: () => {
    if (typeof window === 'undefined') return false
    
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    return !!gl
  },

  // Detect device memory (if available)
  getDeviceMemory: () => {
    if (typeof navigator !== 'undefined' && 'deviceMemory' in navigator) {
      return (navigator as any).deviceMemory
    }
    return 4 // Default assumption
  },

  // Detect network connection quality
  getConnectionSpeed: () => {
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const connection = (navigator as any).connection
      return {
        effectiveType: connection.effectiveType || '4g',
        downlink: connection.downlink || 10,
        saveData: connection.saveData || false
      }
    }
    return { effectiveType: '4g', downlink: 10, saveData: false }
  },

  // Check if device prefers reduced motion
  prefersReducedMotion: () => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  },

  // Detect touch capability
  isTouchDevice: () => {
    if (typeof window === 'undefined') return false
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  },

  // Get viewport dimensions
  getViewportSize: () => {
    if (typeof window === 'undefined') return { width: 390, height: 844 }
    return {
      width: window.innerWidth,
      height: window.innerHeight
    }
  }
}

// Performance-aware animation configuration
export const getOptimizedAnimationConfig = () => {
  const deviceMemory = deviceCapabilities.getDeviceMemory()
  const connection = deviceCapabilities.getConnectionSpeed()
  const prefersReduced = deviceCapabilities.prefersReducedMotion()
  const isLowEnd = deviceMemory < 4 || connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g'

  if (prefersReduced) {
    return {
      duration: 0,
      ease: 'linear',
      stagger: 0,
      enableParallax: false,
      enableComplexAnimations: false
    }
  }

  if (isLowEnd) {
    return {
      duration: 0.2,
      ease: 'easeOut',
      stagger: 0.05,
      enableParallax: false,
      enableComplexAnimations: false
    }
  }

  return {
    duration: 0.4,
    ease: [0.25, 0.46, 0.45, 0.94],
    stagger: 0.1,
    enableParallax: true,
    enableComplexAnimations: true
  }
}

// Optimized touch event handling
export const createOptimizedTouchHandler = (
  onTouch: (event: TouchEvent) => void,
  options?: {
    passive?: boolean
    threshold?: number
    debounce?: number
  }
) => {
  const { passive = true, threshold = 10, debounce = 16 } = options || {}
  
  let lastTime = 0
  let startX = 0
  let startY = 0

  return (event: TouchEvent) => {
    const now = performance.now()
    
    // Debounce for performance
    if (now - lastTime < debounce) return
    lastTime = now

    const touch = event.touches[0]
    if (!touch) return

    // Check if movement exceeds threshold
    if (event.type === 'touchstart') {
      startX = touch.clientX
      startY = touch.clientY
      return
    }

    const deltaX = Math.abs(touch.clientX - startX)
    const deltaY = Math.abs(touch.clientY - startY)
    
    if (deltaX > threshold || deltaY > threshold) {
      onTouch(event)
    }
  }
}

// Viewport-based performance optimization
export const useViewportOptimization = () => {
  const viewport = deviceCapabilities.getViewportSize()
  const isMobile = viewport.width < 768
  const isSmall = viewport.width < 390

  return {
    shouldReduceAnimations: isSmall,
    shouldLazyLoad: isMobile,
    maxVisibleItems: isSmall ? 5 : isMobile ? 10 : 20,
    imageQuality: isSmall ? 60 : isMobile ? 75 : 90,
    enableVirtualization: isMobile && viewport.height < 700
  }
}

// Memory usage monitoring
export const memoryMonitor = {
  // Check if Memory API is available
  isSupported: () => 'memory' in performance,

  // Get current memory usage
  getUsage: () => {
    if (!memoryMonitor.isSupported()) return null
    
    const memory = (performance as any).memory
    return {
      used: Math.round(memory.usedJSHeapSize / 1048576), // MB
      total: Math.round(memory.totalJSHeapSize / 1048576), // MB
      limit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
      percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
    }
  },

  // Check if memory usage is high
  isHighUsage: (threshold: number = 80) => {
    const usage = memoryMonitor.getUsage()
    return usage ? usage.percentage > threshold : false
  },

  // Log memory usage for debugging
  log: (label: string = 'Memory Usage') => {
    const usage = memoryMonitor.getUsage()
    if (usage) {
      console.log(`${label}:`, `${usage.used}MB / ${usage.limit}MB (${usage.percentage.toFixed(1)}%)`)
    }
  }
}

// Performance timing utilities
export const performanceTiming = {
  // Mark performance timing point
  mark: (name: string) => {
    if ('performance' in window && 'mark' in performance) {
      performance.mark(name)
    }
  },

  // Measure time between two marks
  measure: (name: string, startMark: string, endMark?: string) => {
    if ('performance' in window && 'measure' in performance) {
      try {
        performance.measure(name, startMark, endMark)
        const entry = performance.getEntriesByName(name)[0]
        return entry.duration
      } catch (error) {
        console.warn('Performance measurement failed:', error)
        return 0
      }
    }
    return 0
  },

  // Get timing for specific metric
  getTiming: (metric: string) => {
    if ('performance' in window && 'getEntriesByName' in performance) {
      const entries = performance.getEntriesByName(metric)
      return entries.length > 0 ? entries[0].duration : 0
    }
    return 0
  },

  // Clear performance marks and measures
  clear: () => {
    if ('performance' in window) {
      if ('clearMarks' in performance) performance.clearMarks()
      if ('clearMeasures' in performance) performance.clearMeasures()
    }
  }
}

// Battery status optimization
export const batteryOptimization = {
  // Check battery status if available
  getBatteryStatus: async () => {
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery()
        return {
          level: battery.level,
          charging: battery.charging,
          dischargingTime: battery.dischargingTime,
          chargingTime: battery.chargingTime
        }
      } catch (error) {
        return null
      }
    }
    return null
  },

  // Check if device is in power saving mode
  isPowerSaving: async () => {
    const battery = await batteryOptimization.getBatteryStatus()
    return battery ? battery.level < 0.2 && !battery.charging : false
  },

  // Get power-aware configuration
  getPowerAwareConfig: async () => {
    const isPowerSaving = await batteryOptimization.isPowerSaving()
    
    if (isPowerSaving) {
      return {
        reduceAnimations: true,
        lowerFrameRate: true,
        disableBackground: true,
        reduceBrightness: true,
        minimalEffects: true
      }
    }

    return {
      reduceAnimations: false,
      lowerFrameRate: false,
      disableBackground: false,
      reduceBrightness: false,
      minimalEffects: false
    }
  }
}

// React hook for performance monitoring
import { useEffect, useState } from 'react'

export const usePerformanceMonitoring = (options?: {
  memoryThreshold?: number
  timingInterval?: number
}) => {
  const { memoryThreshold = 80, timingInterval = 5000 } = options || {}
  const [metrics, setMetrics] = useState({
    memory: null as any,
    isHighMemoryUsage: false,
    battery: null as any,
    isPowerSaving: false
  })

  useEffect(() => {
    const updateMetrics = async () => {
      const memory = memoryMonitor.getUsage()
      const battery = await batteryOptimization.getBatteryStatus()
      const isPowerSaving = await batteryOptimization.isPowerSaving()

      setMetrics({
        memory,
        isHighMemoryUsage: memory ? memory.percentage > memoryThreshold : false,
        battery,
        isPowerSaving
      })
    }

    updateMetrics()
    const interval = setInterval(updateMetrics, timingInterval)

    return () => clearInterval(interval)
  }, [memoryThreshold, timingInterval])

  return metrics
}