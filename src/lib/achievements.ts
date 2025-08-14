import { Achievement, UserProgress, QuizStatistics } from '@/types/quiz'

export interface AchievementDefinition {
  id: string
  title: string
  description: string
  icon: string
  category: 'streak' | 'accuracy' | 'speed' | 'topic' | 'milestone'
  requirements: {
    type: 'streak' | 'sessions' | 'accuracy' | 'time' | 'topic_mastery' | 'questions' | 'perfect_streak'
    value: number
    topic?: string
  }
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  points: number
}

// Achievement definitions
export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  // Streak achievements
  {
    id: 'streak_3',
    title: 'Getting Started',
    description: 'Complete quizzes for 3 days in a row',
    icon: '🔥',
    category: 'streak',
    requirements: { type: 'streak', value: 3 },
    rarity: 'common',
    points: 10
  },
  {
    id: 'streak_7',
    title: 'Week Warrior',
    description: 'Complete quizzes for 7 days in a row',
    icon: '⚡',
    category: 'streak',
    requirements: { type: 'streak', value: 7 },
    rarity: 'rare',
    points: 25
  },
  {
    id: 'streak_30',
    title: 'Month Master',
    description: 'Complete quizzes for 30 days in a row',
    icon: '👑',
    category: 'streak',
    requirements: { type: 'streak', value: 30 },
    rarity: 'legendary',
    points: 100
  },

  // Milestone achievements
  {
    id: 'first_quiz',
    title: 'First Steps',
    description: 'Complete your first quiz',
    icon: '🎯',
    category: 'milestone',
    requirements: { type: 'sessions', value: 1 },
    rarity: 'common',
    points: 5
  },
  {
    id: 'quiz_10',
    title: 'Getting the Hang of It',
    description: 'Complete 10 quizzes',
    icon: '📚',
    category: 'milestone',
    requirements: { type: 'sessions', value: 10 },
    rarity: 'common',
    points: 15
  },
  {
    id: 'quiz_50',
    title: 'Quiz Enthusiast',
    description: 'Complete 50 quizzes',
    icon: '🎓',
    category: 'milestone',
    requirements: { type: 'sessions', value: 50 },
    rarity: 'rare',
    points: 50
  },
  {
    id: 'quiz_100',
    title: 'Century Club',
    description: 'Complete 100 quizzes',
    icon: '💯',
    category: 'milestone',
    requirements: { type: 'sessions', value: 100 },
    rarity: 'epic',
    points: 100
  },

  // Accuracy achievements
  {
    id: 'perfect_score',
    title: 'Flawless Victory',
    description: 'Score 100% on any quiz',
    icon: '⭐',
    category: 'accuracy',
    requirements: { type: 'accuracy', value: 100 },
    rarity: 'rare',
    points: 20
  },
  {
    id: 'perfect_streak_5',
    title: 'Perfection Streak',
    description: 'Score 100% on 5 quizzes in a row',
    icon: '🌟',
    category: 'accuracy',
    requirements: { type: 'perfect_streak', value: 5 },
    rarity: 'epic',
    points: 75
  },
  {
    id: 'high_accuracy',
    title: 'Sharp Shooter',
    description: 'Maintain 90%+ accuracy over 20 quizzes',
    icon: '🎯',
    category: 'accuracy',
    requirements: { type: 'accuracy', value: 90 },
    rarity: 'rare',
    points: 40
  },

  // Topic mastery achievements
  {
    id: 'security_master',
    title: 'Security Expert',
    description: 'Master Security topics',
    icon: '🛡️',
    category: 'topic',
    requirements: { type: 'topic_mastery', value: 1, topic: 'Security' },
    rarity: 'epic',
    points: 60
  },
  {
    id: 'networking_master',
    title: 'Network Ninja',
    description: 'Master Networking topics',
    icon: '🌐',
    category: 'topic',
    requirements: { type: 'topic_mastery', value: 1, topic: 'Networking' },
    rarity: 'epic',
    points: 60
  },
  {
    id: 'hardware_master',
    title: 'Hardware Hero',
    description: 'Master Hardware topics',
    icon: '⚙️',
    category: 'topic',
    requirements: { type: 'topic_mastery', value: 1, topic: 'Hardware' },
    rarity: 'epic',
    points: 60
  },

  // Speed achievements
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Complete a timed quiz in under 5 minutes',
    icon: '💨',
    category: 'speed',
    requirements: { type: 'time', value: 300000 }, // 5 minutes in ms
    rarity: 'rare',
    points: 30
  },

  // Questions answered achievements
  {
    id: 'questions_100',
    title: 'Curious Mind',
    description: 'Answer 100 questions correctly',
    icon: '🧠',
    category: 'milestone',
    requirements: { type: 'questions', value: 100 },
    rarity: 'common',
    points: 20
  },
  {
    id: 'questions_500',
    title: 'Knowledge Seeker',
    description: 'Answer 500 questions correctly',
    icon: '📖',
    category: 'milestone',
    requirements: { type: 'questions', value: 500 },
    rarity: 'rare',
    points: 60
  },
  {
    id: 'questions_1000',
    title: 'Wisdom Keeper',
    description: 'Answer 1000 questions correctly',
    icon: '🏆',
    category: 'milestone',
    requirements: { type: 'questions', value: 1000 },
    rarity: 'legendary',
    points: 150
  }
]

// Get rarity color
export function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'common':
      return 'text-gray-600 dark:text-gray-400'
    case 'rare':
      return 'text-blue-600 dark:text-blue-400'
    case 'epic':
      return 'text-purple-600 dark:text-purple-400'
    case 'legendary':
      return 'text-yellow-600 dark:text-yellow-400'
    default:
      return 'text-gray-600 dark:text-gray-400'
  }
}

// Get rarity background
export function getRarityBackground(rarity: string): string {
  switch (rarity) {
    case 'common':
      return 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600'
    case 'rare':
      return 'bg-blue-100 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600'
    case 'epic':
      return 'bg-purple-100 dark:bg-purple-900/20 border-purple-300 dark:border-purple-600'
    case 'legendary':
      return 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-600'
    default:
      return 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600'
  }
}

// Check achievements based on current progress and latest quiz
export function checkAchievements(
  userProgress: UserProgress,
  latestQuiz?: QuizStatistics,
  perfectStreakCount: number = 0
): Achievement[] {
  const newAchievements: Achievement[] = []
  const existingAchievementIds = new Set(userProgress.achievements.map(a => a.id))

  for (const def of ACHIEVEMENT_DEFINITIONS) {
    // Skip if already unlocked
    if (existingAchievementIds.has(def.id)) continue

    let isUnlocked = false

    switch (def.requirements.type) {
      case 'streak':
        isUnlocked = userProgress.streak >= def.requirements.value
        break

      case 'sessions':
        isUnlocked = userProgress.totalSessionsCompleted >= def.requirements.value
        break

      case 'questions':
        isUnlocked = userProgress.totalCorrect >= def.requirements.value
        break

      case 'accuracy':
        if (def.id === 'perfect_score' && latestQuiz) {
          isUnlocked = latestQuiz.accuracy === 100
        } else if (def.id === 'high_accuracy') {
          const overallAccuracy = userProgress.totalQuestions > 0 
            ? (userProgress.totalCorrect / userProgress.totalQuestions) * 100 
            : 0
          isUnlocked = overallAccuracy >= def.requirements.value && userProgress.totalSessionsCompleted >= 20
        }
        break

      case 'perfect_streak':
        isUnlocked = perfectStreakCount >= def.requirements.value
        break

      case 'topic_mastery':
        if (def.requirements.topic) {
          const topicProgress = userProgress.topicProgress[def.requirements.topic]
          isUnlocked = topicProgress?.masteryLevel === 'advanced'
        }
        break

      case 'time':
        if (latestQuiz && latestQuiz.mode === 'timed') {
          isUnlocked = latestQuiz.timeSpent <= def.requirements.value
        }
        break
    }

    if (isUnlocked) {
      const achievement: Achievement = {
        id: def.id,
        title: def.title,
        description: def.description,
        icon: def.icon,
        unlockedAt: new Date().toISOString(),
        category: def.category
      }
      newAchievements.push(achievement)
    }
  }

  return newAchievements
}

// Get achievement progress (0-1)
export function getAchievementProgress(def: AchievementDefinition, userProgress: UserProgress): number {
  switch (def.requirements.type) {
    case 'streak':
      return Math.min(userProgress.streak / def.requirements.value, 1)
    
    case 'sessions':
      return Math.min(userProgress.totalSessionsCompleted / def.requirements.value, 1)
    
    case 'questions':
      return Math.min(userProgress.totalCorrect / def.requirements.value, 1)
    
    case 'accuracy':
      if (def.id === 'high_accuracy') {
        const overallAccuracy = userProgress.totalQuestions > 0 
          ? (userProgress.totalCorrect / userProgress.totalQuestions) * 100 
          : 0
        return Math.min(overallAccuracy / def.requirements.value, 1)
      }
      return 0
    
    case 'topic_mastery':
      if (def.requirements.topic) {
        const topicProgress = userProgress.topicProgress[def.requirements.topic]
        return topicProgress?.masteryLevel === 'advanced' ? 1 : 0
      }
      return 0
    
    default:
      return 0
  }
}

// Get total achievement points
export function getTotalAchievementPoints(achievements: Achievement[]): number {
  return achievements.reduce((total, achievement) => {
    const def = ACHIEVEMENT_DEFINITIONS.find(d => d.id === achievement.id)
    return total + (def?.points || 0)
  }, 0)
}