'use client'

import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useState, useRef, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { AnimatePresence } from 'framer-motion'

interface AdvancedGesturesProps {
  children: ReactNode
  onPinch?: (scale: number) => void
  onRotate?: (rotation: number) => void
  onLongPress?: () => void
  onMultiTouch?: (touches: number) => void
  onSwipe?: (direction: string, velocity: number) => void
  onDoubleTap?: () => void
  className?: string
  enabled?: boolean
  longPressDelay?: number
  pinchThreshold?: number
  rotationThreshold?: number
}

export function AdvancedGestures({
  children,
  onPinch,
  onRotate,
  onLongPress,
  onMultiTouch,
  onSwipe,
  onDoubleTap,
  className,
  enabled = true,
  longPressDelay = 500,
  pinchThreshold = 0.1,
  rotationThreshold = 5
}: AdvancedGesturesProps) {
  const [isLongPressing, setIsLongPressing] = useState(false)
  const [touchCount, setTouchCount] = useState(0)
  const [lastTap, setLastTap] = useState(0)
  const [gestureState, setGestureState] = useState<'idle' | 'pinching' | 'rotating' | 'swiping'>('idle')
  
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const touchStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const initialDistance = useRef(0)
  const initialAngle = useRef(0)
  
  // Motion values for gestures
  const scale = useMotionValue(1)
  const rotation = useMotionValue(0)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  // Spring values for smooth animations
  const springScale = useSpring(scale, { stiffness: 300, damping: 30 })
  const springRotation = useSpring(rotation, { stiffness: 300, damping: 30 })
  const springX = useSpring(x, { stiffness: 300, damping: 30 })
  const springY = useSpring(y, { stiffness: 300, damping: 30 })

  // Calculate distance between two points
  const getDistance = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
  }

  // Calculate angle between two points
  const getAngle = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI
  }

  // Handle touch start
  const handleTouchStart = (event: React.TouchEvent) => {
    if (!enabled) return
    
    const touches = event.touches
    setTouchCount(touches.length)
    
    if (touches.length === 1) {
      // Single touch - start long press timer
      const touch = touches[0]
      touchStartPos.current = { x: touch.clientX, y: touch.clientY }
      
      longPressTimer.current = setTimeout(() => {
        setIsLongPressing(true)
        onLongPress?.()
        // Add haptic feedback
        if ('vibrate' in navigator) {
          navigator.vibrate([100, 50, 100])
        }
      }, longPressDelay)
      
    } else if (touches.length === 2) {
      // Two touches - start pinch/rotate
      const touch1 = touches[0]
      const touch2 = touches[1]
      
      initialDistance.current = getDistance(
        { x: touch1.clientX, y: touch1.clientY },
        { x: touch2.clientX, y: touch2.clientY }
      )
      
      initialAngle.current = getAngle(
        { x: touch1.clientX, y: touch1.clientY },
        { x: touch2.clientX, y: touch2.clientY }
      )
      
      setGestureState('pinching')
    }
    
    onMultiTouch?.(touches.length)
  }

  // Handle touch move
  const handleTouchMove = (event: React.TouchEvent) => {
    if (!enabled) return
    
    const touches = event.touches
    
    if (touches.length === 1 && gestureState === 'idle') {
      // Single touch move - check for swipe
      const touch = touches[0]
      const deltaX = touch.clientX - touchStartPos.current.x
      const deltaY = touch.clientY - touchStartPos.current.y
      
      if (Math.abs(deltaX) > 50 || Math.abs(deltaY) > 50) {
        // Cancel long press
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current)
        }
        
        const direction = Math.abs(deltaX) > Math.abs(deltaY) 
          ? (deltaX > 0 ? 'right' : 'left')
          : (deltaY > 0 ? 'down' : 'up')
        
        const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / 100
        
        onSwipe?.(direction, velocity)
        setGestureState('swiping')
      }
      
    } else if (touches.length === 2 && gestureState === 'pinching') {
      // Two touches move - handle pinch and rotate
      const touch1 = touches[0]
      const touch2 = touches[1]
      
      const currentDistance = getDistance(
        { x: touch1.clientX, y: touch1.clientY },
        { x: touch2.clientX, y: touch2.clientY }
      )
      
      const currentAngle = getAngle(
        { x: touch1.clientX, y: touch1.clientY },
        { x: touch2.clientX, y: touch2.clientY }
      )
      
      // Handle pinch
      const scaleChange = currentDistance / initialDistance.current
      if (Math.abs(scaleChange - 1) > pinchThreshold) {
        const newScale = scale.get() * scaleChange
        scale.set(Math.max(0.5, Math.min(3, newScale)))
        onPinch?.(newScale)
      }
      
      // Handle rotation
      const angleChange = currentAngle - initialAngle.current
      if (Math.abs(angleChange) > rotationThreshold) {
        const newRotation = rotation.get() + angleChange
        rotation.set(newRotation)
        onRotate?.(newRotation)
        setGestureState('rotating')
      }
    }
  }

  // Handle touch end
  const handleTouchEnd = () => {
    if (!enabled) return
    
    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }
    
    // Check for double tap
    const now = Date.now()
    if (now - lastTap < 300) {
      onDoubleTap?.()
      // Add haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 50, 50])
      }
    }
    setLastTap(now)
    
    // Reset gesture state
    setGestureState('idle')
    setIsLongPressing(false)
    setTouchCount(0)
    
    // Reset motion values with spring animation
    scale.set(1)
    rotation.set(0)
    x.set(0)
    y.set(0)
  }

  // Handle mouse events for desktop
  const handleMouseDown = (event: React.MouseEvent) => {
    if (!enabled) return
    
    touchStartPos.current = { x: event.clientX, y: event.clientY }
    
    longPressTimer.current = setTimeout(() => {
      setIsLongPressing(true)
      onLongPress?.()
    }, longPressDelay)
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!enabled || !isLongPressing) return
    
    const deltaX = event.clientX - touchStartPos.current.x
    const deltaY = event.clientY - touchStartPos.current.y
    
    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      // Cancel long press on mouse move
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
      }
      setIsLongPressing(false)
    }
  }

  const handleMouseUp = () => {
    if (!enabled) return
    
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }
    setIsLongPressing(false)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
      }
    }
  }, [])

  if (!enabled) {
    return <div className={className}>{children}</div>
  }

  return (
    <div className={cn("relative touch-manipulation", className)}>
      {/* Gesture area */}
      <motion.div
        className="absolute inset-0 z-10"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      
      {/* Content with gesture transformations */}
      <motion.div
        className="relative z-0"
        style={{
          scale: springScale,
          rotate: springRotation,
          x: springX,
          y: springY
        }}
      >
        {children}
      </motion.div>
      
      {/* Visual feedback overlays */}
      <AnimatePresence>
        {isLongPressing && (
          <motion.div
            className="absolute inset-0 bg-primary/10 rounded-lg border-2 border-primary/30 pointer-events-none z-20"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <span className="text-primary text-lg font-bold">⏱️</span>
              </motion.div>
            </div>
          </motion.div>
        )}
        
        {gestureState === 'pinching' && (
          <motion.div
            className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium pointer-events-none z-20"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            Pinching
          </motion.div>
        )}
        
        {gestureState === 'rotating' && (
          <motion.div
            className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium pointer-events-none z-20"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            Rotating
          </motion.div>
        )}
        
        {touchCount > 0 && (
          <motion.div
            className="absolute bottom-4 left-4 bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm font-medium pointer-events-none z-20"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            {touchCount} touch{touchCount > 1 ? 'es' : ''}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Pinch to zoom component
export function PinchToZoom({
  children,
  className,
  minScale = 0.5,
  maxScale = 3,
  onScaleChange
}: {
  children: ReactNode
  className?: string
  minScale?: number
  maxScale?: number
  onScaleChange?: (scale: number) => void
}) {
  const scale = useMotionValue(1)
  const springScale = useSpring(scale, { stiffness: 300, damping: 30 })
  
  const handlePinch = (newScale: number) => {
    const clampedScale = Math.max(minScale, Math.min(maxScale, newScale))
    scale.set(clampedScale)
    onScaleChange?.(clampedScale)
  }

  return (
    <AdvancedGestures
      onPinch={handlePinch}
      className={className}
    >
      <motion.div
        style={{ scale: springScale }}
        className="origin-center"
      >
        {children}
      </motion.div>
    </AdvancedGestures>
  )
}

// Rotate component
export function RotateGesture({
  children,
  className,
  onRotationChange
}: {
  children: ReactNode
  className?: string
  onRotationChange?: (rotation: number) => void
}) {
  const rotation = useMotionValue(0)
  const springRotation = useSpring(rotation, { stiffness: 300, damping: 30 })
  
  const handleRotate = (newRotation: number) => {
    rotation.set(newRotation)
    onRotationChange?.(newRotation)
  }

  return (
    <AdvancedGestures
      onRotate={handleRotate}
      className={className}
    >
      <motion.div
        style={{ rotate: springRotation }}
        className="origin-center"
      >
        {children}
      </motion.div>
    </AdvancedGestures>
  )
}

// Long press component
export function LongPress({
  children,
  className,
  delay = 500,
  onLongPress
}: {
  children: ReactNode
  className?: string
  delay?: number
  onLongPress?: () => void
}) {
  return (
    <AdvancedGestures
      onLongPress={onLongPress}
      longPressDelay={delay}
      className={className}
    >
      {children}
    </AdvancedGestures>
  )
}

// Multi-touch component
export function MultiTouch({
  children,
  className,
  onTouchCountChange
}: {
  children: ReactNode
  className?: string
  onTouchCountChange?: (count: number) => void
}) {
  return (
    <AdvancedGestures
      onMultiTouch={onTouchCountChange}
      className={className}
    >
      {children}
    </AdvancedGestures>
  )
}