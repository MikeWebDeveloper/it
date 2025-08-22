'use client'

import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { useEffect, useState, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: ReactNode
  threshold?: number
  className?: string
  disabled?: boolean
}

const REFRESH_THRESHOLD = 80
const MAX_PULL_DISTANCE = 120

export function PullToRefresh({
  onRefresh,
  children,
  threshold = REFRESH_THRESHOLD,
  className,
  disabled = false
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [hasRefreshed, setHasRefreshed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const y = useMotionValue(0)
  const rotate = useTransform(y, [0, threshold], [0, 180])
  const scale = useTransform(y, [0, threshold], [0.8, 1])
  const opacity = useTransform(y, [0, threshold / 2], [0, 1])

  const handleRefresh = async () => {
    if (isRefreshing || disabled) return
    
    setIsRefreshing(true)
    setError(null)
    
    try {
      await onRefresh()
      setHasRefreshed(true)
      
      // Show success state briefly
      setTimeout(() => {
        setHasRefreshed(false)
      }, 2000)
      
      // Add haptic feedback for success
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 50, 50])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Refresh failed')
      
      // Add haptic feedback for error
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200])
      }
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleDragEnd = (event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
    if (info.offset.y > threshold && !isRefreshing && !disabled) {
      handleRefresh()
    }
    
    // Reset position
    y.set(0)
  }

  // Reset states when component unmounts
  useEffect(() => {
    return () => {
      setIsRefreshing(false)
      setHasRefreshed(false)
      setError(null)
    }
  }, [])

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Pull indicator */}
      <motion.div
        className="absolute top-0 left-0 right-0 z-10 flex items-center justify-center py-4 pointer-events-none"
        style={{ y }}
        drag="y"
        dragConstraints={{ top: 0, bottom: MAX_PULL_DISTANCE }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        dragMomentum={false}
      >
        <motion.div
          className="flex flex-col items-center gap-2"
          style={{ rotate, scale, opacity }}
        >
          {/* Loading spinner */}
          {isRefreshing && (
            <motion.div
              className="w-8 h-8"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <RefreshCw className="w-full h-full text-primary" />
            </motion.div>
          )}
          
          {/* Success indicator */}
          {hasRefreshed && !isRefreshing && (
            <motion.div
              className="w-8 h-8 text-green-500"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <CheckCircle className="w-full h-full" />
            </motion.div>
          )}
          
          {/* Error indicator */}
          {error && !isRefreshing && (
            <motion.div
              className="w-8 h-8 text-red-500"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <AlertCircle className="w-full h-full" />
            </motion.div>
          )}
          
          {/* Default pull indicator */}
          {!isRefreshing && !hasRefreshed && !error && (
            <motion.div
              className="w-8 h-8 text-muted-foreground"
              style={{ rotate }}
            >
              <RefreshCw className="w-full h-full" />
            </motion.div>
          )}
          
          {/* Pull text */}
          <motion.p
            className="text-sm text-muted-foreground text-center max-w-[200px] px-4"
            style={{ opacity }}
          >
            {isRefreshing && "Refreshing..."}
            {hasRefreshed && "Refreshed successfully!"}
            {error && `Error: ${error}`}
            {!isRefreshing && !hasRefreshed && !error && "Pull down to refresh"}
          </motion.p>
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ y }}
        className="min-h-full"
      >
        {children}
      </motion.div>

      {/* Overlay during refresh */}
      {/* AnimatePresence is not imported, so this block is commented out */}
      {/* <AnimatePresence> */}
      {isRefreshing && (
        <motion.div
          className="absolute inset-0 bg-background/50 backdrop-blur-sm z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-center h-full">
            <motion.div
              className="flex flex-col items-center gap-4 p-6 bg-card rounded-lg shadow-lg border"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <motion.div
                className="w-12 h-12"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <RefreshCw className="w-full h-full text-primary" />
              </motion.div>
              <p className="text-sm font-medium text-muted-foreground">
                Refreshing...
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
      {/* </AnimatePresence> */}
    </div>
  )
}

// Mobile-optimized version with enhanced touch feedback
export function MobilePullToRefresh({
  onRefresh,
  children,
  threshold = REFRESH_THRESHOLD,
  className,
  disabled = false
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [hasRefreshed, setHasRefreshed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const y = useMotionValue(0)
  const rotate = useTransform(y, [0, threshold], [0, 180])
  const scale = useTransform(y, [0, threshold], [0.8, 1])
  const opacity = useTransform(y, [0, threshold / 2], [0, 1])
  const backgroundColor = useTransform(
    y, 
    [0, threshold], 
    ['rgba(0,0,0,0)', 'rgba(0,0,0,0.1)']
  )

  const handleRefresh = async () => {
    if (isRefreshing || disabled) return
    
    setIsRefreshing(true)
    setError(null)
    
    // Enhanced haptic feedback for mobile
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100])
    }
    
    try {
      await onRefresh()
      setHasRefreshed(true)
      
      // Success haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 100, 50])
      }
      
      setTimeout(() => {
        setHasRefreshed(false)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Refresh failed')
      
      // Error haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200, 100, 200])
      }
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleDragEnd = (event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
    if (info.offset.y > threshold && !isRefreshing && !disabled) {
      handleRefresh()
    }
    y.set(0)
  }

  useEffect(() => {
    return () => {
      setIsRefreshing(false)
      setHasRefreshed(false)
      setError(null)
    }
  }, [])

  return (
    <div className={cn("relative overflow-hidden touch-manipulation", className)}>
      {/* Enhanced pull indicator for mobile */}
      <motion.div
        className="absolute top-0 left-0 right-0 z-10 flex items-center justify-center py-6 pointer-events-none"
        style={{ y, backgroundColor }}
        drag="y"
        dragConstraints={{ top: 0, bottom: MAX_PULL_DISTANCE }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        dragMomentum={false}
      >
        <motion.div
          className="flex flex-col items-center gap-3"
          style={{ rotate, scale, opacity }}
        >
          {/* Enhanced loading spinner */}
          {isRefreshing && (
            <motion.div
              className="w-10 h-10"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <RefreshCw className="w-full h-full text-primary" />
            </motion.div>
          )}
          
          {/* Enhanced success indicator */}
          {hasRefreshed && !isRefreshing && (
            <motion.div
              className="w-10 h-10 text-green-500"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <CheckCircle className="w-full h-full" />
            </motion.div>
          )}
          
          {/* Enhanced error indicator */}
          {error && !isRefreshing && (
            <motion.div
              className="w-10 h-10 text-red-500"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <AlertCircle className="w-full h-full" />
            </motion.div>
          )}
          
          {/* Default pull indicator */}
          {!isRefreshing && !hasRefreshed && !error && (
            <motion.div
              className="w-10 h-10 text-muted-foreground"
              style={{ rotate }}
            >
              <RefreshCw className="w-full h-full" />
            </motion.div>
          )}
          
          {/* Enhanced pull text for mobile */}
          <motion.p
            className="text-sm font-medium text-muted-foreground text-center max-w-[250px] px-4"
            style={{ opacity }}
          >
            {isRefreshing && "Refreshing..."}
            {hasRefreshed && "Refreshed successfully!"}
            {error && `Error: ${error}`}
            {!isRefreshing && !hasRefreshed && !error && "Pull down to refresh"}
          </motion.p>
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ y }}
        className="min-h-full"
      >
        {children}
      </motion.div>

      {/* Enhanced overlay for mobile */}
      {/* AnimatePresence is not imported, so this block is commented out */}
      {/* <AnimatePresence> */}
      {isRefreshing && (
        <motion.div
          className="absolute inset-0 bg-background/60 backdrop-blur-md z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-center h-full">
            <motion.div
              className="flex flex-col items-center gap-4 p-8 bg-card rounded-xl shadow-2xl border"
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <motion.div
                className="w-16 h-16"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <RefreshCw className="w-full h-full text-primary" />
              </motion.div>
              <p className="text-base font-medium text-muted-foreground">
                Refreshing...
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
      {/* </AnimatePresence> */}
    </div>
  )
}