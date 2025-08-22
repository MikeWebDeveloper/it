'use client'

import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { useEffect, useState, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Home, ArrowLeft, ArrowRight } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'

interface GestureNavigationProps {
  children: ReactNode
  onNavigate: (direction: 'left' | 'right' | 'up' | 'down') => void
  onGoHome?: () => void
  onGoBack?: () => void
  className?: string
  enabled?: boolean
  showHints?: boolean
  threshold?: number
}

const DEFAULT_THRESHOLD = 100
const HAPTIC_THRESHOLD = 50

export function GestureNavigation({
  children,
  onNavigate,
  onGoHome,
  onGoBack,
  className,
  enabled = true,
  showHints = true,
  threshold = DEFAULT_THRESHOLD
}: GestureNavigationProps) {
  const [showHint, setShowHint] = useState(false)
  const [lastDirection, setLastDirection] = useState<string | null>(null)
  
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  // Transform values for visual feedback
  const rotateX = useTransform(y, [-threshold, 0, threshold], [-15, 0, 15])
  const rotateY = useTransform(x, [-threshold, 0, threshold], [15, 0, -15])
  const scale = useTransform(
    x,
    (latestX) => {
      const distance = Math.abs(latestX)
      return Math.max(0.95, 1 - distance / (threshold * 2))
    }
  )

  // Show hints after a delay
  useEffect(() => {
    if (!showHints || !enabled) return
    
    const timer = setTimeout(() => {
      setShowHint(true)
    }, 3000)
    
    return () => clearTimeout(timer)
  }, [showHints, enabled])

  // Handle gesture end
  const handleDragEnd = (event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
    const { offset, velocity } = info
    const absX = Math.abs(offset.x)
    const absY = Math.abs(offset.y)
    
    // Determine if gesture meets threshold
    const meetsThreshold = absX > threshold || absY > threshold
    const meetsVelocity = Math.abs(velocity.x) > 0.5 || Math.abs(velocity.y) > 0.5
    
    if (meetsThreshold || meetsVelocity) {
      let direction: 'left' | 'right' | 'up' | 'down' | null = null
      
      if (absX > absY) {
        // Horizontal gesture
        direction = offset.x > 0 ? 'right' : 'left'
      } else {
        // Vertical gesture
        direction = offset.y > 0 ? 'down' : 'up'
      }
      
      if (direction) {
        // Add haptic feedback
        if ('vibrate' in navigator) {
          navigator.vibrate(50)
        }
        
        setLastDirection(direction)
        onNavigate(direction)
        
        // Hide hint after successful navigation
        setShowHint(false)
      }
    }
    
    // Reset position
    x.set(0)
    y.set(0)
  }

  // Handle haptic feedback during drag
  const handleDrag = (event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
    const { offset } = info
    const absX = Math.abs(offset.x)
    const absY = Math.abs(offset.y)
    
    // Provide haptic feedback when crossing threshold
    if ((absX > HAPTIC_THRESHOLD || absY > HAPTIC_THRESHOLD) && 'vibrate' in navigator) {
      navigator.vibrate(10)
    }
  }

  if (!enabled) {
    return <div className={className}>{children}</div>
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Gesture area */}
      <motion.div
        className="absolute inset-0 z-10"
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        onDrag={handleDrag}
        dragMomentum={false}
        style={{ x, y }}
      >
        {/* Visual feedback overlay */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ rotateX, rotateY, scale }}
        >
          {/* Gesture hints */}
          <AnimatePresence>
            {showHint && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="grid grid-cols-3 grid-rows-3 gap-4 p-4">
                  {/* Top row */}
                  <div className="flex items-center justify-center">
                    {onGoHome && (
                      <motion.div
                        className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Home className="w-4 h-4 text-primary" />
                      </motion.div>
                    )}
                  </div>
                  <motion.div
                    className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center"
                    animate={{ y: [-2, 2, -2] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <ChevronLeft className="w-4 h-4 text-blue-500 rotate-90" />
                  </motion.div>
                  <div className="flex items-center justify-center">
                    {onGoBack && (
                      <motion.div
                        className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                      >
                        <ArrowLeft className="w-4 h-4 text-orange-500" />
                      </motion.div>
                    )}
                  </div>
                  
                  {/* Middle row */}
                  <motion.div
                    className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center"
                    animate={{ x: [-2, 2, -2] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <ChevronLeft className="w-4 h-4 text-green-500" />
                  </motion.div>
                  <div className="w-8 h-8 bg-muted/20 rounded-full flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">👆</span>
                  </div>
                  <motion.div
                    className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center"
                    animate={{ x: [2, -2, 2] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <ChevronRight className="w-4 h-4 text-green-500" />
                  </motion.div>
                  
                  {/* Bottom row */}
                  <div className="flex items-center justify-center"></div>
                  <motion.div
                    className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center"
                    animate={{ y: [2, -2, 2] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <ChevronRight className="w-4 h-4 text-blue-500 rotate-90" />
                  </motion.div>
                  <div className="flex items-center justify-center"></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ rotateX, rotateY, scale }}
        className="relative z-0"
      >
        {children}
      </motion.div>

      {/* Direction indicator */}
      <AnimatePresence>
        {lastDirection && (
          <motion.div
            className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20"
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium shadow-lg">
              Swiped {lastDirection}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Mobile-optimized version with enhanced touch feedback
export function MobileGestureNavigation({
  children,
  onNavigate,
  onGoHome,
  onGoBack,
  className,
  enabled = true,
  showHints = true,
  threshold = DEFAULT_THRESHOLD
}: GestureNavigationProps) {
  const [showHint, setShowHint] = useState(false)
  const [lastDirection, setLastDirection] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  // Enhanced transform values for mobile
  const rotateX = useTransform(y, [-threshold, 0, threshold], [-20, 0, 20])
  const rotateY = useTransform(x, [-threshold, 0, threshold], [20, 0, -20])
  const scale = useTransform(
    x,
    (latestX) => {
      const distance = Math.abs(latestX)
      return Math.max(0.9, 1 - distance / (threshold * 1.5))
    }
  )
  
  // Background color change based on gesture
  const backgroundColor = useTransform(
    [x, y],
    ([latestX, latestY]) => {
      const distance = Math.sqrt(latestX ** 2 + latestY ** 2)
      const intensity = Math.min(distance / threshold, 1)
      return `rgba(0, 0, 0, ${intensity * 0.1})`
    }
  )

  // Show hints after a delay
  useEffect(() => {
    if (!showHints || !enabled) return
    
    const timer = setTimeout(() => {
      setShowHint(true)
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [showHints, enabled])

  // Handle gesture end with enhanced mobile feedback
  const handleDragEnd = (event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
    setIsDragging(false)
    const { offset, velocity } = info
    const absX = Math.abs(offset.x)
    const absY = Math.abs(offset.y)
    
    // Determine if gesture meets threshold
    const meetsThreshold = absX > threshold || absY > threshold
    const meetsVelocity = Math.abs(velocity.x) > 0.3 || Math.abs(velocity.y) > 0.3
    
    if (meetsThreshold || meetsVelocity) {
      let direction: 'left' | 'right' | 'up' | 'down' | null = null
      
      if (absX > absY) {
        // Horizontal gesture
        direction = offset.x > 0 ? 'right' : 'left'
      } else {
        // Vertical gesture
        direction = offset.y > 0 ? 'down' : 'up'
      }
      
      if (direction) {
        // Enhanced haptic feedback for mobile
        if ('vibrate' in navigator) {
          navigator.vibrate([50, 25, 50])
        }
        
        setLastDirection(direction)
        onNavigate(direction)
        
        // Hide hint after successful navigation
        setShowHint(false)
      }
    }
    
    // Reset position
    x.set(0)
    y.set(0)
  }

  // Enhanced haptic feedback during drag
  const handleDrag = (event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
    const { offset } = info
    const absX = Math.abs(offset.x)
    const absY = Math.abs(offset.y)
    
    // Provide progressive haptic feedback
    if (absX > HAPTIC_THRESHOLD || absY > HAPTIC_THRESHOLD) {
      if ('vibrate' in navigator) {
        const intensity = Math.min(Math.max(absX, absY) / threshold, 1)
        navigator.vibrate(Math.floor(intensity * 20))
      }
    }
  }

  if (!enabled) {
    return <div className={className}>{children}</div>
  }

  return (
    <div className={cn("relative overflow-hidden touch-manipulation", className)}>
      {/* Enhanced gesture area for mobile */}
      <motion.div
        className="absolute inset-0 z-10"
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        onDrag={handleDrag}
        dragMomentum={false}
        style={{ x, y }}
      >
        {/* Enhanced visual feedback overlay */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ rotateX, rotateY, scale, backgroundColor }}
        >
          {/* Enhanced gesture hints for mobile */}
          <AnimatePresence>
            {showHint && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="grid grid-cols-3 grid-rows-3 gap-6 p-6">
                  {/* Top row */}
                  <div className="flex items-center justify-center">
                    {onGoHome && (
                      <motion.div
                        className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center border-2 border-primary/30"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Home className="w-6 h-6 text-primary" />
                      </motion.div>
                    )}
                  </div>
                  <motion.div
                    className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center border-2 border-blue-500/30"
                    animate={{ y: [-3, 3, -3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <ChevronLeft className="w-6 h-6 text-blue-500 rotate-90" />
                  </motion.div>
                  <div className="flex items-center justify-center">
                    {onGoBack && (
                      <motion.div
                        className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center border-2 border-orange-500/30"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                      >
                        <ArrowLeft className="w-6 h-6 text-orange-500" />
                      </motion.div>
                    )}
                  </div>
                  
                  {/* Middle row */}
                  <motion.div
                    className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-500/30"
                    animate={{ x: [-3, 3, -3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <ChevronLeft className="w-6 h-6 text-green-500" />
                  </motion.div>
                  <div className="w-12 h-12 bg-muted/20 rounded-full flex items-center justify-center border-2 border-muted/30">
                    <span className="text-lg">👆</span>
                  </div>
                  <motion.div
                    className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-500/30"
                    animate={{ x: [3, -3, 3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <ChevronRight className="w-6 h-6 text-green-500" />
                  </motion.div>
                  
                  {/* Bottom row */}
                  <div className="flex items-center justify-center"></div>
                  <motion.div
                    className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center border-2 border-blue-500/30"
                    animate={{ y: [3, -3, 3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <ChevronRight className="w-6 h-6 text-blue-500 rotate-90" />
                  </motion.div>
                  <div className="flex items-center justify-center"></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ rotateX, rotateY, scale }}
        className="relative z-0"
      >
        {children}
      </motion.div>

      {/* Enhanced direction indicator for mobile */}
      <AnimatePresence>
        {lastDirection && (
          <motion.div
            className="absolute top-6 left-1/2 transform -translate-x-1/2 z-20"
            initial={{ opacity: 0, y: -30, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.8 }}
            transition={{ duration: 0.4, type: "spring", stiffness: 200, damping: 20 }}
          >
            <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-base font-medium shadow-xl border border-primary/20">
              Swiped {lastDirection}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drag indicator */}
      {isDragging && (
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center border-2 border-primary/40">
            <span className="text-2xl">👆</span>
          </div>
        </motion.div>
      )}
    </div>
  )
}