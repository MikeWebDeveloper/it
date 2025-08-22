'use client'

import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion'
import { useEffect, useState, ReactNode } from 'react'
import { cn } from '@/lib/utils'

// Particle effect component
export function ParticleEffect({ 
  children, 
  className,
  particleCount = 20,
  duration = 2000 
}: { 
  children: ReactNode
  className?: string
  particleCount?: number
  duration?: number 
}) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([])

  useEffect(() => {
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 200 - 100,
      y: Math.random() * 200 - 100,
      delay: Math.random() * 0.5
    }))
    setParticles(newParticles)
  }, [particleCount])

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {children}
      
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-2 h-2 bg-primary rounded-full pointer-events-none"
            style={{
              left: '50%',
              top: '50%',
              x: particle.x,
              y: particle.y
            }}
            initial={{ 
              scale: 0, 
              opacity: 1,
              x: 0,
              y: 0
            }}
            animate={{ 
              scale: [0, 1, 0],
              opacity: [1, 1, 0],
              x: particle.x,
              y: particle.y
            }}
            transition={{
              duration: duration / 1000,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

// Morphing shape component
export function MorphingShape({ 
  className,
  size = 100,
  duration = 3000 
}: { 
  className?: string
  size?: number
  duration?: number 
}) {
  const [shape, setShape] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setShape((prev) => (prev + 1) % 4)
    }, duration)
    return () => clearInterval(interval)
  }, [duration])

  const shapes = [
    // Circle
    "rounded-full",
    // Square
    "rounded-none",
    // Diamond
    "rotate-45 rounded-none",
    // Hexagon
    "rounded-none transform rotate-12"
  ]

  return (
    <motion.div
      className={cn(
        "bg-gradient-to-br from-primary via-primary/80 to-primary/60",
        "flex items-center justify-center text-white font-bold",
        shapes[shape],
        className
      )}
      style={{ width: size, height: size }}
      animate={{
        scale: [1, 1.1, 1],
        rotate: [0, 180, 360],
        borderRadius: shape === 0 ? "50%" : "0%"
      }}
      transition={{
        duration: duration / 1000,
        ease: "easeInOut"
      }}
    >
      <motion.span
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        {shape + 1}
      </motion.span>
    </motion.div>
  )
}

// Floating elements with parallax effect
export function FloatingElements({ 
  children, 
  className,
  elementCount = 5 
}: { 
  children: ReactNode
  className?: string
  elementCount?: number 
}) {
  const [elements, setElements] = useState<Array<{ id: number; x: number; y: number; delay: number; size: number }>>([])

  useEffect(() => {
    const newElements = Array.from({ length: elementCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50,
      delay: Math.random() * 2,
      size: Math.random() * 20 + 10
    }))
    setElements(newElements)
  }, [elementCount])

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {children}
      
      {elements.map((element) => (
        <motion.div
          key={element.id}
          className="absolute bg-primary/20 rounded-full pointer-events-none"
          style={{
            width: element.size,
            height: element.size,
            left: `${50 + element.x}%`,
            top: `${50 + element.y}%`
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{
            duration: 3 + element.delay,
            repeat: Infinity,
            ease: "easeInOut",
            delay: element.delay
          }}
        />
      ))}
    </div>
  )
}

// Magnetic effect component
export function MagneticEffect({ 
  children, 
  className,
  strength = 0.3 
}: { 
  children: ReactNode
  className?: string
  strength?: number 
}) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const rotateX = useTransform(y, [-100, 100], [strength, -strength])
  const rotateY = useTransform(x, [-100, 100], [-strength, strength])

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const mouseX = event.clientX - centerX
    const mouseY = event.clientY - centerY
    
    x.set(mouseX)
    y.set(mouseY)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      className={cn("perspective-1000", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  )
}

// Glitch effect component
export function GlitchEffect({ 
  children, 
  className,
  intensity = 0.1 
}: { 
  children: ReactNode
  className?: string
  intensity?: number 
}) {
  const [isGlitching, setIsGlitching] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < intensity) {
        setIsGlitching(true)
        setTimeout(() => setIsGlitching(false), 100)
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [intensity])

  return (
    <div className={cn("relative", className)}>
      {children}
      
      <AnimatePresence>
        {isGlitching && (
          <>
            <motion.div
              className="absolute inset-0 bg-red-500/20 mix-blend-multiply pointer-events-none"
              initial={{ x: -2, opacity: 0 }}
              animate={{ x: 2, opacity: 1 }}
              exit={{ x: 0, opacity: 0 }}
              transition={{ duration: 0.1 }}
            />
            <motion.div
              className="absolute inset-0 bg-blue-500/20 mix-blend-multiply pointer-events-none"
              initial={{ x: 2, opacity: 0 }}
              animate={{ x: -2, opacity: 1 }}
              exit={{ x: 0, opacity: 0 }}
              transition={{ duration: 0.1 }}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// Liquid wave effect
export function LiquidWave({ 
  className,
  waveCount = 3,
  duration = 4000 
}: { 
  className?: string
  waveCount?: number
  duration?: number 
}) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {Array.from({ length: waveCount }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 bg-primary/20 rounded-full"
          animate={{
            scale: [0, 1.5, 0],
            opacity: [0.8, 0.3, 0]
          }}
          transition={{
            duration: duration / 1000,
            repeat: Infinity,
            delay: (i * duration) / (waveCount * 1000),
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  )
}

// 3D flip card
export function FlipCard3D({ 
  front, 
  back, 
  className,
  isFlipped = false 
}: { 
  front: ReactNode
  back: ReactNode
  className?: string
  isFlipped?: boolean 
}) {
  return (
    <div className={cn("relative w-full h-full perspective-1000", className)}>
      <motion.div
        className="relative w-full h-full preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        <div className="absolute inset-0 backface-hidden">
          {front}
        </div>
        <div className="absolute inset-0 backface-hidden rotate-y-180">
          {back}
        </div>
      </motion.div>
    </div>
  )
}

// Staggered reveal animation
export function StaggeredReveal({ 
  children, 
  className,
  staggerDelay = 0.1,
  direction = 'up' 
}: { 
  children: ReactNode
  className?: string
  staggerDelay?: number
  direction?: 'up' | 'down' | 'left' | 'right' 
}) {
  const directions = {
    up: { y: 50, x: 0 },
    down: { y: -50, x: 0 },
    left: { x: 50, y: 0 },
    right: { x: -50, y: 0 }
  }

  const { x, y } = directions[direction]

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={{
        hidden: { opacity: 0, x, y },
        visible: {
          opacity: 1,
          x: 0,
          y: 0,
          transition: {
            duration: 0.6,
            staggerChildren: staggerDelay,
            ease: "easeOut"
          }
        }
      }}
    >
      {children}
    </motion.div>
  )
}

// Hover lift effect with shadow
export function HoverLift({ 
  children, 
  className,
  liftDistance = 8 
}: { 
  children: ReactNode
  className?: string
  liftDistance?: number 
}) {
  return (
    <motion.div
      className={cn("transition-all duration-300", className)}
      whileHover={{
        y: -liftDistance,
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
        transition: { type: "spring", stiffness: 300, damping: 20 }
      }}
    >
      {children}
    </motion.div>
  )
}

// Pulse ring effect
export function PulseRing({ 
  children, 
  className,
  ringCount = 3,
  duration = 2000 
}: { 
  children: ReactNode
  className?: string
  ringCount?: number
  duration?: number 
}) {
  return (
    <div className={cn("relative", className)}>
      {children}
      
      {Array.from({ length: ringCount }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 border-2 border-primary rounded-full pointer-events-none"
          animate={{
            scale: [1, 2, 1],
            opacity: [0.8, 0, 0]
          }}
          transition={{
            duration: duration / 1000,
            repeat: Infinity,
            delay: (i * duration) / (ringCount * 1000),
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  )
}