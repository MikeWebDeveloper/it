'use client'

import { useMemo, useCallback } from 'react'
import { Question } from '@/types/quiz'
import { useQuizStore } from '@/store/useQuizStore'

export interface QuestionWithScore extends Question {
  priorityScore: number
  weaknessScore: number
  recencyScore: number
  difficultyScore: number
}

export interface AdaptiveOrderingOptions {
  mode: 'practice' | 'review'
  maxQuestions?: number
  focusOnWeakAreas?: boolean
  balanceDifficulty?: boolean
  reviewIncorrectAnswers?: boolean
  prioritizeRecentTopics?: boolean
}

// Default scoring weights for different factors
const SCORING_WEIGHTS = {
  weakness: 0.4,      // Prioritize topics user struggles with
  recency: 0.3,       // Prioritize recently studied topics for review
  difficulty: 0.2,    // Balance easy/medium/hard questions
  randomness: 0.1     // Add some randomness for variety
}

export function useAdaptiveQuestionOrdering() {
  const { userProgress, learningStats } = useQuizStore()

  // Calculate question difficulty based on overall user performance
  const calculateQuestionDifficulty = useCallback((question: Question): number => {
    // Simple heuristic: estimate difficulty based on topic performance
    const topicProgress = userProgress.topicProgress[question.topic]
    if (!topicProgress) return 0.5 // Unknown difficulty - assume medium

    const accuracy = topicProgress.correctAnswers / topicProgress.questionsAnswered
    
    // Invert accuracy to get difficulty score (low accuracy = high difficulty)
    if (accuracy >= 0.9) return 0.2  // Easy
    if (accuracy >= 0.75) return 0.5 // Medium  
    if (accuracy >= 0.6) return 0.8  // Hard
    return 1.0 // Very hard
  }, [userProgress.topicProgress])

  // Calculate weakness score for a question (higher = more need for practice)
  const calculateWeaknessScore = useCallback((question: Question): number => {
    const topicProgress = userProgress.topicProgress[question.topic]
    const topicLearning = learningStats.topicLearningProgress[question.topic]
    
    if (!topicProgress && !topicLearning) {
      return 1.0 // Never studied - high priority
    }

    let weaknessScore = 0

    // Factor 1: Overall topic accuracy (lower = higher weakness)
    if (topicProgress) {
      const accuracy = topicProgress.correctAnswers / topicProgress.questionsAnswered
      weaknessScore += (1 - accuracy) * 0.6
    }

    // Factor 2: Mastery level (beginner = higher weakness)
    const masteryLevel = topicProgress?.masteryLevel || topicLearning?.masteryLevel || 'beginner'
    const masteryScores = { beginner: 1.0, intermediate: 0.5, advanced: 0.1 }
    weaknessScore += masteryScores[masteryLevel] * 0.4

    return Math.min(1.0, weaknessScore)
  }, [userProgress.topicProgress, learningStats.topicLearningProgress])

  // Calculate recency score (how recently was this topic studied)
  const calculateRecencyScore = useCallback((question: Question): number => {
    const topicLearning = learningStats.topicLearningProgress[question.topic]
    
    if (!topicLearning || !topicLearning.lastStudied) {
      return 1.0 // Never studied - high priority
    }

    const lastStudiedDate = new Date(topicLearning.lastStudied)
    const daysSinceStudied = Math.floor((Date.now() - lastStudiedDate.getTime()) / (1000 * 60 * 60 * 24))
    
    // Optimal review intervals using spaced repetition principles
    if (daysSinceStudied <= 1) return 0.1      // Just studied
    if (daysSinceStudied <= 3) return 0.3      // Review soon
    if (daysSinceStudied <= 7) return 0.6      // Good time to review
    if (daysSinceStudied <= 14) return 0.8     // Should review
    return 1.0                                  // Urgent review needed
  }, [learningStats.topicLearningProgress])

  // Calculate overall priority score for adaptive ordering
  const calculatePriorityScore = useCallback((
    question: Question,
    options: AdaptiveOrderingOptions
  ): number => {
    const weaknessScore = calculateWeaknessScore(question)
    const recencyScore = calculateRecencyScore(question)
    const difficultyScore = calculateQuestionDifficulty(question)
    const randomScore = Math.random()

    let finalScore = 0

    // Apply mode-specific weighting
    if (options.mode === 'review') {
      // Review mode prioritizes recently studied and weak areas
      finalScore += weaknessScore * 0.5
      finalScore += recencyScore * 0.4
      finalScore += (1 - difficultyScore) * 0.1 // Slightly favor easier questions in review
    } else {
      // Practice mode uses balanced approach
      finalScore += weaknessScore * SCORING_WEIGHTS.weakness
      finalScore += recencyScore * SCORING_WEIGHTS.recency
      finalScore += difficultyScore * SCORING_WEIGHTS.difficulty
    }

    // Add randomness for variety
    finalScore += randomScore * SCORING_WEIGHTS.randomness

    // Apply user preferences
    if (options.focusOnWeakAreas) {
      finalScore = finalScore * 0.7 + weaknessScore * 0.3
    }

    if (options.prioritizeRecentTopics) {
      finalScore = finalScore * 0.7 + recencyScore * 0.3
    }

    return Math.min(1.0, finalScore)
  }, [calculateWeaknessScore, calculateRecencyScore, calculateQuestionDifficulty])

  // Create adaptively ordered question set
  const createAdaptiveQuestionSet = useCallback((
    allQuestions: Question[],
    options: AdaptiveOrderingOptions
  ): QuestionWithScore[] => {
    // Score all questions
    const questionsWithScores: QuestionWithScore[] = allQuestions.map(question => ({
      ...question,
      priorityScore: calculatePriorityScore(question, options),
      weaknessScore: calculateWeaknessScore(question),
      recencyScore: calculateRecencyScore(question),
      difficultyScore: calculateQuestionDifficulty(question)
    }))

    // Sort by priority score (highest first)
    const sortedQuestions = questionsWithScores.sort((a, b) => b.priorityScore - a.priorityScore)

    // Apply additional filtering/balancing
    let finalQuestions = sortedQuestions

    // Filter for review mode - focus on previously answered questions
    if (options.reviewIncorrectAnswers && options.mode === 'review') {
      const incorrectTopics = new Set<string>()
      
      // Find topics where user has made mistakes
      Object.entries(userProgress.topicProgress).forEach(([topic, progress]) => {
        const accuracy = progress.correctAnswers / progress.questionsAnswered
        if (accuracy < 0.8) { // Less than 80% accuracy
          incorrectTopics.add(topic)
        }
      })
      
      if (incorrectTopics.size > 0) {
        finalQuestions = finalQuestions.filter(q => incorrectTopics.has(q.topic))
      }
    }

    // Ensure difficulty balance if requested
    if (options.balanceDifficulty) {
      const easyQuestions = finalQuestions.filter(q => q.difficultyScore < 0.4)
      const mediumQuestions = finalQuestions.filter(q => q.difficultyScore >= 0.4 && q.difficultyScore < 0.7)
      const hardQuestions = finalQuestions.filter(q => q.difficultyScore >= 0.7)
      
      // Balanced distribution: 30% easy, 50% medium, 20% hard
      const targetEasy = Math.ceil((options.maxQuestions || finalQuestions.length) * 0.3)
      const targetMedium = Math.ceil((options.maxQuestions || finalQuestions.length) * 0.5)
      const targetHard = Math.floor((options.maxQuestions || finalQuestions.length) * 0.2)
      
      finalQuestions = [
        ...easyQuestions.slice(0, targetEasy),
        ...mediumQuestions.slice(0, targetMedium),
        ...hardQuestions.slice(0, targetHard)
      ].sort((a, b) => b.priorityScore - a.priorityScore)
    }

    // Limit to max questions
    if (options.maxQuestions && finalQuestions.length > options.maxQuestions) {
      finalQuestions = finalQuestions.slice(0, options.maxQuestions)
    }

    return finalQuestions
  }, [calculatePriorityScore, calculateWeaknessScore, calculateRecencyScore, calculateQuestionDifficulty, userProgress.topicProgress])

  // Get weak topics that need attention
  const getWeakTopics = useCallback((): string[] => {
    const weakTopics: string[] = []
    
    Object.entries(userProgress.topicProgress).forEach(([topic, progress]) => {
      const accuracy = progress.correctAnswers / progress.questionsAnswered
      if (accuracy < 0.7 || progress.masteryLevel === 'beginner') {
        weakTopics.push(topic)
      }
    })
    
    return weakTopics.sort((a, b) => {
      const progressA = userProgress.topicProgress[a]
      const progressB = userProgress.topicProgress[b]
      const accuracyA = progressA.correctAnswers / progressA.questionsAnswered
      const accuracyB = progressB.correctAnswers / progressB.questionsAnswered
      return accuracyA - accuracyB // Sort by accuracy (lowest first)
    })
  }, [userProgress.topicProgress])

  // Get topics that haven't been studied recently
  const getTopicsForReview = useCallback((): string[] => {
    const topicsForReview: string[] = []
    const now = Date.now()
    
    Object.entries(learningStats.topicLearningProgress).forEach(([topic, progress]) => {
      const lastStudied = new Date(progress.lastStudied).getTime()
      const daysSince = Math.floor((now - lastStudied) / (1000 * 60 * 60 * 24))
      
      if (daysSince >= 3) { // Haven't studied in 3+ days
        topicsForReview.push(topic)
      }
    })
    
    return topicsForReview.sort((a, b) => {
      const progressA = learningStats.topicLearningProgress[a]
      const progressB = learningStats.topicLearningProgress[b]
      const daysA = Math.floor((now - new Date(progressA.lastStudied).getTime()) / (1000 * 60 * 60 * 24))
      const daysB = Math.floor((now - new Date(progressB.lastStudied).getTime()) / (1000 * 60 * 60 * 24))
      return daysB - daysA // Sort by days since study (most recent first)
    })
  }, [learningStats.topicLearningProgress])

  // Get study recommendations based on user data
  const getStudyRecommendations = useMemo(() => {
    const weakTopics = getWeakTopics()
    const reviewTopics = getTopicsForReview()
    
    const recommendations = {
      weakTopics: weakTopics.slice(0, 3), // Top 3 weak topics
      reviewTopics: reviewTopics.slice(0, 3), // Top 3 topics for review
      suggestion: ''
    }
    
    if (weakTopics.length > 0) {
      recommendations.suggestion = `Focus on improving ${weakTopics[0]} - your accuracy is below 70%`
    } else if (reviewTopics.length > 0) {
      recommendations.suggestion = `Review ${reviewTopics[0]} - it's been a while since you studied it`
    } else {
      recommendations.suggestion = 'Great job! Continue practicing to maintain your knowledge'
    }
    
    return recommendations
  }, [getWeakTopics, getTopicsForReview])

  return {
    createAdaptiveQuestionSet,
    getWeakTopics,
    getTopicsForReview,
    getStudyRecommendations,
    calculateWeaknessScore,
    calculateRecencyScore,
    calculateQuestionDifficulty
  }
}