'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface AnimatedThemeToggleProps {
  variant?: 'default' | 'compact' | 'floating'
  size?: 'sm' | 'default' | 'lg'
  className?: string
  showLabel?: boolean
}

export function AnimatedThemeToggle({
  variant = 'default',
  size = 'sm',
  className,
  showLabel = false
}: AnimatedThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isToggling, setIsToggling] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleToggle = async () => {
    if (isToggling) return
    
    setIsToggling(true)
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    
    // Add a small delay for the animation to be visible
    setTimeout(() => {
      setTheme(newTheme)
      setTimeout(() => setIsToggling(false), 150)
    }, 100)
  }

  const isDark = mounted ? theme === 'dark' : false

  // Sun icon component
  const SunIcon = () => (
    <motion.svg
      key="sun"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ scale: 0, rotate: -90, opacity: 0 }}
      animate={{ 
        scale: 1, 
        rotate: 0, 
        opacity: 1,
      }}
      exit={{ scale: 0, rotate: 90, opacity: 0 }}
      transition={{ 
        duration: 0.5, 
        ease: [0.25, 0.46, 0.45, 0.94],
        scale: { duration: 0.3 },
        rotate: { duration: 0.6 }
      }}
    >
      <motion.circle 
        cx="12" 
        cy="12" 
        r="5"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      />
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <line x1="12" y1="1" x2="12" y2="3"/>
        <line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/>
        <line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </motion.g>
    </motion.svg>
  )

  // Moon icon component
  const MoonIcon = () => (
    <motion.svg
      key="moon"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ scale: 0, rotate: 90, opacity: 0 }}
      animate={{ 
        scale: 1, 
        rotate: 0, 
        opacity: 1,
      }}
      exit={{ scale: 0, rotate: -90, opacity: 0 }}
      transition={{ 
        duration: 0.5, 
        ease: [0.25, 0.46, 0.45, 0.94],
        scale: { duration: 0.3 },
        rotate: { duration: 0.6 }
      }}
    >
      <motion.path 
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      />
    </motion.svg>
  )

  // Background gradient variants
  const backgroundVariants = {
    light: {
      background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const }
    },
    dark: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const }
    }
  }

  const buttonSizeClasses = {
    sm: 'h-8 w-8 p-0',
    default: 'h-10 w-10 p-0',
    lg: 'h-12 w-12 p-0'
  }

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    default: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  if (variant === 'floating') {
    return (
      <motion.div
        className={cn('fixed bottom-6 right-6 z-50', className)}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          className="relative overflow-hidden rounded-full"
          variants={backgroundVariants}
          animate={isDark ? 'dark' : 'light'}
        >
          <Button
            variant="ghost"
            onClick={handleToggle}
            className={cn(
              'rounded-full border-0 text-white hover:bg-white/20 transition-colors',
              buttonSizeClasses[size]
            )}
            suppressHydrationWarning
            disabled={isToggling}
          >
            <div className={iconSizeClasses[size]}>
              <AnimatePresence mode="wait" initial={false}>
                {mounted ? (
                  isDark ? <MoonIcon /> : <SunIcon />
                ) : (
                  <SunIcon />
                )}
              </AnimatePresence>
            </div>
          </Button>
        </motion.div>
      </motion.div>
    )
  }

  if (variant === 'compact') {
    return (
      <Button
        variant="outline"
        size={size}
        onClick={handleToggle}
        className={cn(
          'rounded-full relative overflow-hidden transition-all duration-300',
          'hover:scale-105 active:scale-95',
          isDark 
            ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' 
            : 'bg-orange-50 border-orange-200 hover:bg-orange-100',
          className
        )}
        suppressHydrationWarning
        disabled={isToggling}
      >
        <motion.div
          className={iconSizeClasses[size]}
          animate={{ 
            rotateZ: isToggling ? 360 : 0,
            scale: isToggling ? 0.8 : 1
          }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {mounted ? (
              isDark ? <MoonIcon /> : <SunIcon />
            ) : (
              <SunIcon />
            )}
          </AnimatePresence>
        </motion.div>
      </Button>
    )
  }

  // Default variant
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button
        variant="outline"
        size={size}
        onClick={handleToggle}
        className={cn(
          'rounded-full relative overflow-hidden transition-all duration-300',
          'hover:scale-105 active:scale-95',
          isDark 
            ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' 
            : 'bg-orange-50 border-orange-200 hover:bg-orange-100'
        )}
        suppressHydrationWarning
        disabled={isToggling}
      >
        <motion.div
          className={iconSizeClasses[size]}
          animate={{ 
            rotateZ: isToggling ? 360 : 0,
            scale: isToggling ? 0.8 : 1
          }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {mounted ? (
              isDark ? <MoonIcon /> : <SunIcon />
            ) : (
              <SunIcon />
            )}
          </AnimatePresence>
        </motion.div>
      </Button>
      
      {showLabel && (
        <motion.span 
          className="text-sm font-medium text-muted-foreground"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          {mounted ? (isDark ? 'Dark' : 'Light') : 'Light'} Mode
        </motion.span>
      )}
    </div>
  )
}