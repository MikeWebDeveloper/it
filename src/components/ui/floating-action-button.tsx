'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './button'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface FloatingActionButtonProps {
  icon: ReactNode
  label?: string
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  className?: string
  showLabel?: boolean
  disabled?: boolean
}

const positionClasses = {
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4'
}

const sizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-14 h-14',
  lg: 'w-16 h-16'
}

const variantClasses = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-lg hover:shadow-xl',
  success: 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl',
  warning: 'bg-yellow-600 text-white hover:bg-yellow-700 shadow-lg hover:shadow-xl',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl'
}

export function FloatingActionButton({
  icon,
  label,
  onClick,
  variant = 'primary',
  size = 'md',
  position = 'bottom-right',
  className,
  showLabel = false,
  disabled = false
}: FloatingActionButtonProps) {
  return (
    <motion.div
      className={cn(
        'fixed z-50',
        positionClasses[position],
        'transition-all duration-300'
      )}
      initial={{ opacity: 0, scale: 0, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0, y: 20 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 20
      }}
    >
      <motion.div
        className="flex items-center gap-2"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Main button */}
        <Button
          onClick={onClick}
          disabled={disabled}
          className={cn(
            'rounded-full p-0 border-0 shadow-lg hover:shadow-xl',
            'transition-all duration-200 ease-out',
            'focus:ring-2 focus:ring-offset-2 focus:ring-ring',
            'active:scale-95',
            sizeClasses[size],
            variantClasses[variant],
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
          aria-label={label}
        >
          <motion.div
            className="flex items-center justify-center w-full h-full"
            whileHover={{ rotate: 5 }}
            whileTap={{ rotate: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            {icon}
          </motion.div>
        </Button>

        {/* Label tooltip - only show on larger screens or when explicitly enabled */}
        <AnimatePresence>
          {(showLabel || window.innerWidth > 768) && label && (
            <motion.div
              initial={{ opacity: 0, x: -10, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -10, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className={cn(
                'bg-background/90 backdrop-blur-sm border border-border/50',
                'px-3 py-2 rounded-lg shadow-lg',
                'text-sm font-medium whitespace-nowrap',
                'hidden sm:block' // Only show on larger screens by default
              )}
            >
              {label}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Touch ripple effect */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        initial={{ scale: 0, opacity: 0 }}
        whileTap={{ scale: 1.5, opacity: 0.2 }}
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  )
}

// Mobile-specific floating action button with haptic feedback
export function MobileFloatingActionButton({
  icon,
  label,
  onClick,
  variant = 'primary',
  size = 'md',
  position = 'bottom-right',
  className,
  disabled = false
}: Omit<FloatingActionButtonProps, 'showLabel'>) {
  const handleClick = () => {
    // Add haptic feedback for mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }
    onClick()
  }

  return (
    <motion.div
      className={cn(
        'fixed z-50 sm:hidden', // Only show on mobile
        positionClasses[position],
        'transition-all duration-300'
      )}
      initial={{ opacity: 0, scale: 0, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0, y: 20 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 20
      }}
    >
      <motion.div
        className="flex flex-col items-center gap-2"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Main button */}
        <Button
          onClick={handleClick}
          disabled={disabled}
          className={cn(
            'rounded-full p-0 border-0 shadow-lg hover:shadow-xl',
            'transition-all duration-200 ease-out',
            'focus:ring-2 focus:ring-offset-2 focus:ring-ring',
            'active:scale-95',
            sizeClasses[size],
            variantClasses[variant],
            disabled && 'opacity-50 cursor-not-allowed',
            'touch-manipulation', // Optimize for touch
            className
          )}
          aria-label={label}
        >
          <motion.div
            className="flex items-center justify-center w-full h-full"
            whileHover={{ rotate: 5 }}
            whileTap={{ rotate: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            {icon}
          </motion.div>
        </Button>

        {/* Label below button for mobile */}
        {label && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className={cn(
              'bg-background/90 backdrop-blur-sm border border-border/50',
              'px-2 py-1 rounded-md shadow-md',
              'text-xs font-medium text-center whitespace-nowrap',
              'max-w-[80px]'
            )}
          >
            {label}
          </motion.div>
        )}
      </motion.div>

      {/* Enhanced touch ripple effect */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        initial={{ scale: 0, opacity: 0 }}
        whileTap={{ scale: 2, opacity: 0.1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  )
}