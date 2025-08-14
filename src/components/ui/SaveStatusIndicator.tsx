'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Save, Check, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { SaveStatus } from '@/hooks/useAutoSave'
import { cn } from '@/lib/utils'

interface SaveStatusIndicatorProps {
  status: SaveStatus
  lastSaved: Date | null
  onManualSave?: () => void
  className?: string
  compact?: boolean
}

export function SaveStatusIndicator({
  status,
  lastSaved,
  onManualSave,
  className,
  compact = false
}: SaveStatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'saving':
        return {
          icon: Loader2,
          text: 'Saving...',
          variant: 'secondary' as const,
          iconClassName: 'text-blue-600 animate-spin',
          showSpinner: true
        }
      case 'saved':
        return {
          icon: Check,
          text: 'Saved',
          variant: 'secondary' as const,
          iconClassName: 'text-green-600',
          showSpinner: false
        }
      case 'error':
        return {
          icon: AlertCircle,
          text: 'Save failed',
          variant: 'destructive' as const,
          iconClassName: 'text-red-600',
          showSpinner: false
        }
      default:
        return {
          icon: Save,
          text: 'Auto-save enabled',
          variant: 'outline' as const,
          iconClassName: 'text-muted-foreground',
          showSpinner: false
        }
    }
  }

  const config = getStatusConfig()
  const StatusIcon = config.icon

  if (compact) {
    return (
      <motion.div
        className={cn('flex items-center gap-1', className)}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <StatusIcon className={cn('w-4 h-4', config.iconClassName)} />
        {status !== 'idle' && (
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {config.text}
          </span>
        )}
      </motion.div>
    )
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={status}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-2"
        >
          <Badge variant={config.variant} className="gap-1">
            <StatusIcon className={cn('w-3 h-3', config.iconClassName)} />
            {config.text}
          </Badge>
        </motion.div>
      </AnimatePresence>

      {/* Last saved timestamp */}
      {lastSaved && status !== 'saving' && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-muted-foreground hidden md:inline"
        >
          Saved {formatDistanceToNow(lastSaved, { addSuffix: true })}
        </motion.span>
      )}

      {/* Manual save button for error state */}
      {status === 'error' && onManualSave && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={onManualSave}
            className="h-6 px-2 text-xs"
          >
            Retry
          </Button>
        </motion.div>
      )}
    </div>
  )
}