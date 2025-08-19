'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  Pause, 
  Square, 
  SkipForward, 
  Coffee, 
  BookOpen, 
  Timer,
  Settings,
  Clock,
  TrendingUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useStudySessionTimer } from '@/hooks/useStudySessionTimer'
import { cn } from '@/lib/utils'

interface StudySessionTimerProps {
  className?: string
  compact?: boolean
  showStats?: boolean
}

export function StudySessionTimer({ 
  className, 
  compact = false, 
  showStats = true 
}: StudySessionTimerProps) {
  
  const {
    sessionState,
    currentSession,
    timeRemaining,
    formattedTimeRemaining,
    progress,
    startStudySession,
    startBreak,
    pauseSession,
    resumeSession,
    stopSession,
    skipSession,
    sessionsCompleted,
    breaksTaken,
    todayStudyTime,
    shouldTakeLongBreak,
    isEnabled
  } = useStudySessionTimer({
    onSessionComplete: (session) => {
      console.log('Session completed:', session)
    },
    onBreakComplete: (session) => {
      console.log('Break completed:', session)
    },
    onBreakReminder: () => {
      console.log('Break reminder triggered')
    }
  })

  if (!isEnabled) {
    return (
      <Card className={cn('border-dashed', className)}>
        <CardContent className="p-6 text-center">
          <Timer className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground text-sm">
            Study Session Timer is disabled
          </p>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {}}
            className="mt-2"
          >
            <Settings className="w-4 h-4 mr-2" />
            Enable Timer
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {sessionState !== 'idle' && (
          <Badge 
            variant={sessionState === 'studying' ? 'default' : sessionState === 'break' ? 'secondary' : 'outline'}
            className="font-mono text-xs"
          >
            {formattedTimeRemaining}
          </Badge>
        )}
        
        {sessionState === 'idle' && (
          <Button
            size="sm"
            onClick={() => startStudySession()}
            className="h-8"
          >
            <Play className="w-3 h-3 mr-1" />
            Study
          </Button>
        )}
        
        {sessionState === 'paused' && (
          <Button
            size="sm"
            onClick={resumeSession}
            variant="outline"
            className="h-8"
          >
            <Play className="w-3 h-3" />
          </Button>
        )}
        
        {(sessionState === 'studying' || sessionState === 'break') && (
          <Button
            size="sm"
            onClick={pauseSession}
            variant="outline"
            className="h-8"
          >
            <Pause className="w-3 h-3" />
          </Button>
        )}
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4" />
            <span>Study Timer</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {}}
            className="h-6 w-6 p-0"
          >
            <Settings className="w-3 h-3" />
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Current Session Display */}
        <AnimatePresence mode="wait">
          {sessionState === 'idle' ? (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-4"
            >
              <div className="w-12 h-12 mx-auto mb-3 bg-muted/20 rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-3">Ready to start studying?</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => startStudySession()}>
                  <Play className="w-4 h-4 mr-2" />
                  Start Session
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => startBreak(shouldTakeLongBreak ? 'long' : 'short')}
                >
                  <Coffee className="w-4 h-4 mr-2" />
                  Take Break
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="active"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center"
            >
              {/* Session Type Badge */}
              <div className="mb-4">
                <Badge 
                  variant={sessionState === 'studying' ? 'default' : 'secondary'}
                  className="text-sm px-3 py-1"
                >
                  {sessionState === 'studying' && <BookOpen className="w-4 h-4 mr-1" />}
                  {sessionState === 'break' && <Coffee className="w-4 h-4 mr-1" />}
                  {sessionState === 'paused' && <Pause className="w-4 h-4 mr-1" />}
                  
                  {sessionState === 'studying' && 'Study Session'}
                  {sessionState === 'break' && `${currentSession?.breakType === 'long' ? 'Long' : 'Short'} Break`}
                  {sessionState === 'paused' && 'Paused'}
                </Badge>
              </div>

              {/* Timer Display */}
              <motion.div 
                className="text-3xl font-mono font-bold mb-2"
                animate={{ 
                  scale: timeRemaining <= 60 ? [1, 1.05, 1] : 1,
                  color: timeRemaining <= 60 ? '#ef4444' : undefined
                }}
                transition={{ 
                  scale: { duration: 1, repeat: timeRemaining <= 60 ? Infinity : 0 },
                  color: { duration: 0.3 }
                }}
              >
                {formattedTimeRemaining}
              </motion.div>

              {/* Progress Bar */}
              <div className="mb-3">
                <Progress 
                  value={progress} 
                  className="h-1.5"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round(progress)}% complete
                </p>
              </div>

              {/* Controls */}
              <div className="flex gap-2 justify-center">
                {sessionState === 'paused' ? (
                  <Button onClick={resumeSession} size="sm">
                    <Play className="w-4 h-4 mr-2" />
                    Resume
                  </Button>
                ) : (
                  <Button onClick={pauseSession} size="sm" variant="outline">
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </Button>
                )}
                
                <Button onClick={skipSession} size="sm" variant="outline">
                  <SkipForward className="w-4 h-4 mr-2" />
                  Complete
                </Button>
                
                <Button onClick={stopSession} size="sm" variant="destructive">
                  <Square className="w-4 h-4 mr-2" />
                  Stop
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Statistics */}
        {showStats && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border-t pt-3 mt-3"
          >
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="flex items-center justify-center mb-1">
                  <Clock className="w-3 h-3 text-muted-foreground mr-1" />
                  <span className="text-sm font-semibold">{todayStudyTime}</span>
                </div>
                <p className="text-xs text-muted-foreground">Today</p>
              </div>
              
              <div>
                <div className="flex items-center justify-center mb-1">
                  <TrendingUp className="w-3 h-3 text-muted-foreground mr-1" />
                  <span className="text-sm font-semibold">{sessionsCompleted}</span>
                </div>
                <p className="text-xs text-muted-foreground">Sessions</p>
              </div>
              
              <div>
                <div className="flex items-center justify-center mb-1">
                  <Coffee className="w-3 h-3 text-muted-foreground mr-1" />
                  <span className="text-sm font-semibold">{breaksTaken}</span>
                </div>
                <p className="text-xs text-muted-foreground">Breaks</p>
              </div>
            </div>

            {shouldTakeLongBreak && sessionState === 'idle' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800"
              >
                <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
                  💡 Consider taking a longer break after {breaksTaken} sessions!
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}