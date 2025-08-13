'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode } from 'react'

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95
  }
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function AnimatedPageWrapper({ children }: { children: ReactNode }) {
  return (
    <AnimatePresence mode="wait">
      <PageTransition>
        {children}
      </PageTransition>
    </AnimatePresence>
  )
}