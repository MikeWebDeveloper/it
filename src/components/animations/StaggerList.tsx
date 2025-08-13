'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface StaggerListProps {
  children: ReactNode[]
  className?: string
  staggerDelay?: number
}

const containerVariants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.9
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1
  }
}

export function StaggerList({ children, className, staggerDelay = 0.1 }: StaggerListProps) {
  const modifiedVariants = {
    ...containerVariants,
    visible: {
      ...containerVariants.visible,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1
      }
    }
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={modifiedVariants}
      className={className}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}