'use client'

import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { useEffect, useState, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { X, ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from './button'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  className?: string
  snapPoints?: number[] // Heights in percentage (0-100)
  defaultSnap?: number // Default snap point index
  showBackdrop?: boolean
  showHandle?: boolean
  closeOnBackdropClick?: boolean
  closeOnEscape?: boolean
  maxHeight?: string
}

const DEFAULT_SNAP_POINTS = [25, 50, 75, 100] // 25%, 50%, 75%, 100%
const DEFAULT_SNAP = 1 // Start at 50%

export function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
  className,
  snapPoints = DEFAULT_SNAP_POINTS,
  defaultSnap = DEFAULT_SNAP,
  showBackdrop = true,
  showHandle = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  maxHeight = '90vh'
}: BottomSheetProps) {
  const [currentSnap, setCurrentSnap] = useState(defaultSnap)
  const [isDragging, setIsDragging] = useState(false)

  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [closeOnEscape, isOpen, onClose])

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose()
    }
  }

  // Handle drag end
  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false)
    
    const currentHeight = info.point.y
    const viewportHeight = window.innerHeight
    const currentPercentage = ((viewportHeight - currentHeight) / viewportHeight) * 100
    
    // Find closest snap point
    let closestSnap = 0
    let minDistance = Math.abs(currentPercentage - snapPoints[0])
    
    snapPoints.forEach((point, index) => {
      const distance = Math.abs(currentPercentage - point)
      if (distance < minDistance) {
        minDistance = distance
        closestSnap = index
      }
    })
    
    // If dragged down too much, close the sheet
    if (currentPercentage < 10) {
      onClose()
      return
    }
    
    setCurrentSnap(closestSnap)
  }

  // Get current height based on snap point
  const getCurrentHeight = () => {
    return `${snapPoints[currentSnap]}%`
  }

  // Snap to specific point
  const snapTo = (index: number) => {
    if (index >= 0 && index < snapPoints.length) {
      setCurrentSnap(index)
    }
  }

  // Snap to next/previous point
  const snapNext = () => {
    if (currentSnap < snapPoints.length - 1) {
      setCurrentSnap(currentSnap + 1)
    }
  }

  const snapPrevious = () => {
    if (currentSnap > 0) {
      setCurrentSnap(currentSnap - 1)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          {showBackdrop && (
            <motion.div
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={handleBackdropClick}
            />
          )}

          {/* Bottom Sheet */}
          <motion.div
            className={cn(
              "relative w-full bg-background border-t border-border/50 rounded-t-2xl shadow-2xl",
              "overflow-hidden",
              className
            )}
            style={{ maxHeight }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              mass: 0.8
            }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.1}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            dragMomentum={false}
          >
            {/* Handle */}
            {showHandle && (
              <div className="flex items-center justify-center pt-3 pb-2">
                <motion.div
                  className="w-12 h-1.5 bg-muted-foreground/30 rounded-full cursor-grab active:cursor-grabbing"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                />
              </div>
            )}

            {/* Header */}
            {(title || showBackdrop) && (
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                {title && (
                  <h3 className="text-lg font-semibold text-foreground">
                    {title}
                  </h3>
                )}
                
                {/* Snap point indicators */}
                <div className="flex items-center gap-1">
                  {snapPoints.map((point, index) => (
                    <button
                      key={index}
                      onClick={() => snapTo(index)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all duration-200",
                        "hover:scale-125",
                        currentSnap === index
                          ? "bg-primary"
                          : "bg-muted-foreground/30"
                      )}
                      aria-label={`Snap to ${point}% height`}
                    />
                  ))}
                </div>

                {/* Close button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0 rounded-full hover:bg-muted"
                  aria-label="Close bottom sheet"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Content */}
            <motion.div
              className="overflow-y-auto"
              style={{ height: getCurrentHeight() }}
              animate={{ height: getCurrentHeight() }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                mass: 0.8
              }}
            >
              <div className="p-4">
                {children}
              </div>
            </motion.div>

            {/* Snap controls */}
            <div className="flex items-center justify-center gap-2 p-3 border-t border-border/50">
              <Button
                variant="outline"
                size="sm"
                onClick={snapPrevious}
                disabled={currentSnap === 0}
                className="h-8 px-3 text-xs"
              >
                <ChevronDown className="w-3 h-3 mr-1" />
                Smaller
              </Button>
              
              <span className="text-xs text-muted-foreground px-2">
                {snapPoints[currentSnap]}%
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={snapNext}
                disabled={currentSnap === snapPoints.length - 1}
                className="h-8 px-3 text-xs"
              >
                <ChevronUp className="w-3 h-3 mr-1" />
                Larger
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Mobile-optimized version with enhanced touch feedback
export function MobileBottomSheet({
  isOpen,
  onClose,
  children,
  title,
  className,
  snapPoints = DEFAULT_SNAP_POINTS,
  defaultSnap = DEFAULT_SNAP,
  showBackdrop = true,
  showHandle = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  maxHeight = '90vh'
}: BottomSheetProps) {
  const [currentSnap, setCurrentSnap] = useState(defaultSnap)
  const [isDragging, setIsDragging] = useState(false)

  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [closeOnEscape, isOpen, onClose])

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose()
    }
  }

  // Handle drag end with enhanced mobile feedback
  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false)
    
    const currentHeight = info.point.y
    const viewportHeight = window.innerHeight
    const currentPercentage = ((viewportHeight - currentHeight) / viewportHeight) * 100
    
    // Find closest snap point
    let closestSnap = 0
    let minDistance = Math.abs(currentPercentage - snapPoints[0])
    
    snapPoints.forEach((point, index) => {
      const distance = Math.abs(currentPercentage - point)
      if (distance < minDistance) {
        minDistance = distance
        closestSnap = index
      }
    })
    
    // If dragged down too much, close the sheet
    if (currentPercentage < 10) {
      // Add haptic feedback for closing
      if ('vibrate' in navigator) {
        navigator.vibrate(100)
      }
      onClose()
      return
    }
    
    // Add haptic feedback for snapping
    if (closestSnap !== currentSnap && 'vibrate' in navigator) {
      navigator.vibrate(50)
    }
    
    setCurrentSnap(closestSnap)
  }

  // Get current height based on snap point
  const getCurrentHeight = () => {
    return `${snapPoints[currentSnap]}%`
  }

  // Snap to specific point
  const snapTo = (index: number) => {
    if (index >= 0 && index < snapPoints.length) {
      setCurrentSnap(index)
      // Add haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(30)
      }
    }
  }

  // Snap to next/previous point
  const snapNext = () => {
    if (currentSnap < snapPoints.length - 1) {
      setCurrentSnap(currentSnap + 1)
      if ('vibrate' in navigator) {
        navigator.vibrate(30)
      }
    }
  }

  const snapPrevious = () => {
    if (currentSnap > 0) {
      setCurrentSnap(currentSnap - 1)
      if ('vibrate' in navigator) {
        navigator.vibrate(30)
      }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end touch-manipulation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Enhanced backdrop */}
          {showBackdrop && (
            <motion.div
              className="absolute inset-0 bg-black/30 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={handleBackdropClick}
            />
          )}

          {/* Enhanced Bottom Sheet */}
          <motion.div
            className={cn(
              "relative w-full bg-background/95 backdrop-blur-md border-t border-border/50 rounded-t-3xl shadow-2xl",
              "overflow-hidden",
              className
            )}
            style={{ maxHeight }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              mass: 0.8
            }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            dragMomentum={false}
          >
            {/* Enhanced handle */}
            {showHandle && (
              <div className="flex items-center justify-center pt-4 pb-3">
                <motion.div
                  className="w-16 h-1.5 bg-muted-foreground/40 rounded-full cursor-grab active:cursor-grabbing"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  animate={isDragging ? { scale: 1.2 } : { scale: 1 }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            )}

            {/* Enhanced header */}
            {(title || showBackdrop) && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
                {title && (
                  <h3 className="text-xl font-semibold text-foreground">
                    {title}
                  </h3>
                )}
                
                {/* Enhanced snap point indicators */}
                <div className="flex items-center gap-2">
                  {snapPoints.map((point, index) => (
                    <button
                      key={index}
                      onClick={() => snapTo(index)}
                      className={cn(
                        "w-3 h-3 rounded-full transition-all duration-200",
                        "hover:scale-125 active:scale-95",
                        currentSnap === index
                          ? "bg-primary shadow-md"
                          : "bg-muted-foreground/30"
                      )}
                      aria-label={`Snap to ${point}% height`}
                    />
                  ))}
                </div>

                {/* Enhanced close button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-10 w-10 p-0 rounded-full hover:bg-muted active:scale-95"
                  aria-label="Close bottom sheet"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            )}

            {/* Enhanced content */}
            <motion.div
              className="overflow-y-auto overscroll-contain"
              style={{ height: getCurrentHeight() }}
              animate={{ height: getCurrentHeight() }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                mass: 0.8
              }}
            >
              <div className="p-6">
                {children}
              </div>
            </motion.div>

            {/* Enhanced snap controls */}
            <div className="flex items-center justify-center gap-3 p-4 border-t border-border/50">
              <Button
                variant="outline"
                size="sm"
                onClick={snapPrevious}
                disabled={currentSnap === 0}
                className="h-10 px-4 text-sm font-medium"
              >
                <ChevronDown className="w-4 h-4 mr-2" />
                Smaller
              </Button>
              
              <span className="text-sm font-medium text-muted-foreground px-3">
                {snapPoints[currentSnap]}%
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={snapNext}
                disabled={currentSnap === snapPoints.length - 1}
                className="h-10 px-4 text-sm font-medium"
              >
                <ChevronUp className="w-4 h-4 mr-2" />
                Larger
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}