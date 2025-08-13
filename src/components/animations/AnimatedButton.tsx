'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface AnimatedButtonProps extends Omit<React.ComponentPropsWithoutRef<typeof Button>, 
  'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd' | 'onTransitionEnd'> {
  children: React.ReactNode
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  scaleOnHover?: boolean
  scaleOnTap?: boolean
}

const MotionButton = motion.create(Button)

export const AnimatedButton = forwardRef<
  React.ElementRef<typeof Button>,
  AnimatedButtonProps
>(({ 
  children, 
  className, 
  scaleOnHover = true, 
  scaleOnTap = true,
  ...props 
}, ref) => {
  return (
    <MotionButton
      ref={ref}
      className={cn(className)}
      whileHover={scaleOnHover ? { 
        scale: 1.02,
        transition: { duration: 0.2, ease: "easeOut" }
      } : undefined}
      whileTap={scaleOnTap ? { 
        scale: 0.98,
        transition: { duration: 0.1, ease: "easeInOut" }
      } : undefined}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 17
      }}
      {...props}
    >
      {children}
    </MotionButton>
  )
})

AnimatedButton.displayName = "AnimatedButton"