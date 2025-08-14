'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Star, Lock, Target, Zap, Clock, BookOpen, Award } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserProgress } from '@/types/quiz'
import { 
  ACHIEVEMENT_DEFINITIONS, 
  AchievementDefinition,
  getRarityColor, 
  getRarityBackground,
  getAchievementProgress,
  getTotalAchievementPoints
} from '@/lib/achievements'
import { cn } from '@/lib/utils'

interface AchievementsPanelProps {
  userProgress: UserProgress
  className?: string
}

const categoryIcons = {
  streak: Zap,
  accuracy: Target,
  speed: Clock,
  topic: BookOpen,
  milestone: Award
}

export function AchievementsPanel({ userProgress, className }: AchievementsPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  const unlockedAchievements = userProgress.achievements
  const unlockedIds = new Set(unlockedAchievements.map(a => a.id))
  
  const allAchievements = ACHIEVEMENT_DEFINITIONS.map(def => ({
    definition: def,
    unlocked: unlockedIds.has(def.id),
    unlockedAt: unlockedAchievements.find(a => a.id === def.id)?.unlockedAt,
    progress: getAchievementProgress(def, userProgress)
  }))

  const filteredAchievements = selectedCategory === 'all' 
    ? allAchievements 
    : allAchievements.filter(a => a.definition.category === selectedCategory)

  const totalPoints = getTotalAchievementPoints(unlockedAchievements)
  const maxPoints = ACHIEVEMENT_DEFINITIONS.reduce((sum, def) => sum + def.points, 0)
  const completionRate = (unlockedAchievements.length / ACHIEVEMENT_DEFINITIONS.length) * 100

  const categories = ['all', ...new Set(ACHIEVEMENT_DEFINITIONS.map(def => def.category))]

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header Stats */}
      <Card className="bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 dark:from-yellow-950/20 dark:via-amber-950/20 dark:to-orange-950/20 border-yellow-200 dark:border-yellow-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Achievement Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                  {totalPoints}
                </span>
                <span className="text-sm text-yellow-600 dark:text-yellow-400">
                  / {maxPoints}
                </span>
              </div>
              <p className="text-xs text-yellow-600 dark:text-yellow-400">
                Achievement Points
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300 mb-1">
                {unlockedAchievements.length}
                <span className="text-sm text-yellow-600 dark:text-yellow-400">
                  / {ACHIEVEMENT_DEFINITIONS.length}
                </span>
              </div>
              <p className="text-xs text-yellow-600 dark:text-yellow-400">
                Achievements Unlocked
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300 mb-1">
                {Math.round(completionRate)}%
              </div>
              <p className="text-xs text-yellow-600 dark:text-yellow-400">
                Completion Rate
              </p>
            </div>
          </div>
          
          <div className="mt-4">
            <Progress 
              value={completionRate} 
              className="h-2 bg-yellow-200 dark:bg-yellow-900/30"
            />
          </div>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all" className="text-xs">
            All
          </TabsTrigger>
          {categories.slice(1).map(category => {
            const IconComponent = categoryIcons[category as keyof typeof categoryIcons] || Award
            return (
              <TabsTrigger key={category} value={category} className="text-xs">
                <IconComponent className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline capitalize">{category}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-4">
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredAchievements.map((achievement, index) => (
                <AchievementCard
                  key={achievement.definition.id}
                  achievement={achievement}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface AchievementCardProps {
  achievement: {
    definition: AchievementDefinition
    unlocked: boolean
    unlockedAt?: string
    progress: number
  }
  index: number
}

function AchievementCard({ achievement, index }: AchievementCardProps) {
  const { definition, unlocked, unlockedAt, progress } = achievement
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className={cn(
        'h-full transition-all duration-300 relative overflow-hidden',
        unlocked 
          ? getRarityBackground(definition.rarity)
          : 'bg-muted/50 border-muted',
        isHovered && unlocked && 'shadow-lg'
      )}>
        {/* Locked overlay */}
        {!unlocked && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <Lock className="w-8 h-8 text-muted-foreground/50" />
          </div>
        )}

        {/* Shine effect for unlocked achievements */}
        {unlocked && isHovered && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          />
        )}

        <CardContent className="p-4 space-y-3">
          {/* Icon and Rarity */}
          <div className="flex items-center justify-between">
            <motion.div
              className="text-3xl"
              animate={unlocked ? { 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              } : {}}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
                ease: 'easeInOut'
              }}
            >
              {definition.icon}
            </motion.div>
            <div className="text-right">
              <Badge 
                variant="outline" 
                className={cn(
                  'text-xs capitalize border-current mb-1',
                  unlocked 
                    ? getRarityColor(definition.rarity)
                    : 'text-muted-foreground'
                )}
              >
                {definition.rarity}
              </Badge>
              {unlocked && (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500" />
                  <span className="text-xs font-medium">
                    {definition.points}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Title and Description */}
          <div>
            <h3 className={cn(
              'font-semibold mb-1',
              unlocked ? 'text-foreground' : 'text-muted-foreground'
            )}>
              {definition.title}
            </h3>
            <p className={cn(
              'text-sm leading-relaxed',
              unlocked ? 'text-muted-foreground' : 'text-muted-foreground/70'
            )}>
              {definition.description}
            </p>
          </div>

          {/* Progress */}
          {!unlocked && progress > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span>{Math.round(progress * 100)}%</span>
              </div>
              <Progress value={progress * 100} className="h-1" />
            </div>
          )}

          {/* Unlock Date */}
          {unlocked && unlockedAt && (
            <div className="text-xs text-muted-foreground">
              Unlocked {new Date(unlockedAt).toLocaleDateString()}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}