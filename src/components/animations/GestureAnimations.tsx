'use client'

import { motion, PanInfo, useMotionValue, useTransform, animate } from 'framer-motion'
import { ReactNode, useState } from 'react'

interface SwipeableCardProps {
  children: ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  className?: string
}

export function SwipeableCard({ 
  children, 
  onSwipeLeft, 
  onSwipeRight, 
  className = "" 
}: SwipeableCardProps) {
  const x = useMotionValue(0)
  const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5])
  const rotate = useTransform(x, [-200, 200], [-10, 10])
  const [dragState, setDragState] = useState<'idle' | 'left' | 'right'>('idle')

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100
    
    if (info.offset.x > threshold) {
      // Swipe right
      animate(x, 300, { type: "spring", stiffness: 300, damping: 30 })
      onSwipeRight?.()
    } else if (info.offset.x < -threshold) {
      // Swipe left  
      animate(x, -300, { type: "spring", stiffness: 300, damping: 30 })
      onSwipeLeft?.()
    } else {
      // Return to center
      animate(x, 0, { type: "spring", stiffness: 300, damping: 30 })
    }
    setDragState('idle')
  }

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 50) {
      setDragState('right')
    } else if (info.offset.x < -50) {
      setDragState('left')
    } else {
      setDragState('idle')
    }
  }

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      style={{ x, opacity, rotate }}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: 0.95 }}
      className={`relative select-none cursor-grab active:cursor-grabbing ${className}`}
    >
      {children}
      
      {/* Swipe indicators */}
      <motion.div
        className="absolute inset-0 bg-green-500/20 rounded-lg flex items-center justify-start pl-6"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: dragState === 'right' ? 1 : 0,
          scale: dragState === 'right' ? 1 : 0.8
        }}
        transition={{ duration: 0.2 }}
      >
        <div className="text-green-600 font-bold text-lg">✓ Next</div>
      </motion.div>
      
      <motion.div
        className="absolute inset-0 bg-red-500/20 rounded-lg flex items-center justify-end pr-6"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: dragState === 'left' ? 1 : 0,
          scale: dragState === 'left' ? 1 : 0.8
        }}
        transition={{ duration: 0.2 }}
      >
        <div className="text-red-600 font-bold text-lg">← Previous</div>
      </motion.div>
    </motion.div>
  )
}

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: ReactNode
  className?: string
}

export function PullToRefresh({ onRefresh, children, className = "" }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const y = useMotionValue(0)
  const opacity = useTransform(y, [0, 60], [0, 1])
  const scale = useTransform(y, [0, 60], [0.8, 1])

  const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 80 && !isRefreshing) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
        animate(y, 0, { type: "spring", stiffness: 300, damping: 30 })
      }
    } else {
      animate(y, 0, { type: "spring", stiffness: 300, damping: 30 })
    }
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Pull to refresh indicator */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-16 flex items-center justify-center bg-primary/10 z-10"
        style={{ opacity, scale, y: y.get() - 60 }}
      >
        <motion.div
          animate={isRefreshing ? { rotate: 360 } : {}}
          transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
        >
          <div className="text-primary">↻</div>
        </motion.div>
        <span className="ml-2 text-primary text-sm">
          {isRefreshing ? 'Refreshing...' : 'Pull to refresh'}
        </span>
      </motion.div>

      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.3, bottom: 0 }}
        style={{ y }}
        onDragEnd={handleDragEnd}
        className="touch-pan-y"
      >
        {children}
      </motion.div>
    </div>
  )
}

interface TapToExpandProps {
  children: ReactNode
  expandedContent: ReactNode
  className?: string
}

export function TapToExpand({ children, expandedContent, className = "" }: TapToExpandProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <motion.div
      layout
      className={`overflow-hidden ${className}`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <motion.div layout>
        {children}
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ 
          opacity: isExpanded ? 1 : 0,
          height: isExpanded ? "auto" : 0
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {expandedContent}
      </motion.div>
    </motion.div>
  )
}

// Gesture helper for detecting touch patterns
export function useGestures() {
  const handleTouch = (callback: () => void, delay = 0) => {
    return {
      onTouchStart: () => {
        if (delay > 0) {
          setTimeout(callback, delay)
        } else {
          callback()
        }
      }
    }
  }

  const handleLongPress = (callback: () => void, duration = 500) => {
    let timer: NodeJS.Timeout

    return {
      onTouchStart: () => {
        timer = setTimeout(callback, duration)
      },
      onTouchEnd: () => {
        if (timer) clearTimeout(timer)
      },
      onTouchMove: () => {
        if (timer) clearTimeout(timer)
      }
    }
  }

  return { handleTouch, handleLongPress }
}