'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trophy, Star } from 'lucide-react'
import { Achievement } from '@/types/quiz'
import { ACHIEVEMENT_DEFINITIONS, getRarityColor, getRarityBackground } from '@/lib/achievements'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import { useAudioHapticFeedback } from '@/hooks/useAudioHapticFeedback'

interface AchievementNotificationProps {
  achievement: Achievement
  onClose: () => void
  autoClose?: boolean
  autoCloseDelay?: number
}

export function AchievementNotification({
  achievement,
  onClose,
  autoClose = true,
  autoCloseDelay = 5000
}: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)
  const feedback = useAudioHapticFeedback()
  
  const achievementDef = ACHIEVEMENT_DEFINITIONS.find(def => def.id === achievement.id)
  
  const handleClose = useCallback(() => {
    setIsVisible(false)
    setTimeout(onClose, 300) // Wait for exit animation
  }, [onClose])

  // Trigger achievement feedback when notification appears
  useEffect(() => {
    feedback.onAchievementUnlock()
  }, [feedback])

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        handleClose()
      }, autoCloseDelay)
      
      return () => clearTimeout(timer)
    }
  }, [autoClose, autoCloseDelay, handleClose])

  if (!achievementDef) return null

  // Confetti particles
  const confettiParticles = Array.from({ length: 20 }, (_, i) => i)

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -50 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 25,
            duration: 0.5
          }}
          className="fixed top-4 right-4 z-[100] max-w-sm w-full"
        >
          <motion.div
            className={cn(
              'relative overflow-hidden rounded-lg border-2 shadow-xl backdrop-blur-sm',
              getRarityBackground(achievementDef.rarity)
            )}
            whileHover={{ scale: 1.02 }}
            layout
          >
            {/* Confetti Effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {confettiParticles.map((i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    background: achievementDef.rarity === 'legendary' 
                      ? 'linear-gradient(45deg, #fbbf24, #f59e0b)'
                      : achievementDef.rarity === 'epic'
                      ? 'linear-gradient(45deg, #a855f7, #8b5cf6)'
                      : achievementDef.rarity === 'rare'
                      ? 'linear-gradient(45deg, #3b82f6, #2563eb)'
                      : 'linear-gradient(45deg, #6b7280, #4b5563)'
                  }}
                  initial={{
                    x: '50%',
                    y: '50%',
                    scale: 0,
                    rotate: 0
                  }}
                  animate={{
                    x: `${20 + Math.random() * 60}%`,
                    y: `${10 + Math.random() * 80}%`,
                    scale: [0, 1, 0],
                    rotate: 360
                  }}
                  transition={{
                    duration: 2 + Math.random(),
                    delay: i * 0.1,
                    ease: 'easeOut'
                  }}
                />
              ))}
            </div>

            {/* Shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{
                duration: 1.5,
                delay: 0.5,
                ease: 'easeInOut'
              }}
            />

            {/* Content */}
            <div className="relative p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 15,
                      delay: 0.2
                    }}
                    className="p-2 bg-white/20 rounded-full"
                  >
                    <Trophy className="w-5 h-5 text-yellow-500" />
                  </motion.div>
                  <div>
                    <motion.p
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-xs font-medium text-foreground/80"
                    >
                      Achievement Unlocked!
                    </motion.p>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Badge 
                        variant="outline" 
                        className={cn(
                          'text-xs capitalize border-current',
                          getRarityColor(achievementDef.rarity)
                        )}
                      >
                        {achievementDef.rarity}
                      </Badge>
                    </motion.div>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="h-auto p-1 hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Achievement Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      delay: 0.6
                    }}
                    className="text-3xl"
                  >
                    {achievement.icon}
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-foreground">
                      {achievement.title}
                    </h3>
                    <p className="text-sm text-foreground/70">
                      {achievement.description}
                    </p>
                  </div>
                </div>

                {/* Points earned */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 }}
                  className="flex items-center gap-1 pt-2"
                >
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium text-foreground">
                    +{achievementDef.points} points
                  </span>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface AchievementNotificationManagerProps {
  achievements: Achievement[]
  onAchievementsShown: () => void
}

export function AchievementNotificationManager({
  achievements,
  onAchievementsShown
}: AchievementNotificationManagerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isShowing, setIsShowing] = useState(false)

  useEffect(() => {
    if (achievements.length > 0 && !isShowing) {
      setIsShowing(true)
      setCurrentIndex(0)
      
      // Also show a toast notification for multiple achievements
      if (achievements.length > 1) {
        toast.success(`🏆 ${achievements.length} achievements unlocked!`, {
          duration: 3000,
        })
      }
    }
  }, [achievements, isShowing])

  const handleClose = () => {
    if (currentIndex < achievements.length - 1) {
      // Show next achievement
      setCurrentIndex(currentIndex + 1)
    } else {
      // All achievements shown
      setIsShowing(false)
      setCurrentIndex(0)
      onAchievementsShown()
    }
  }

  if (!isShowing || achievements.length === 0) return null

  return (
    <AchievementNotification
      achievement={achievements[currentIndex]}
      onClose={handleClose}
      autoClose={true}
      autoCloseDelay={4000}
    />
  )
}