'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Keyboard, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { KeyboardShortcut } from '@/hooks/useKeyboardShortcuts'
import { cn } from '@/lib/utils'

interface KeyboardShortcutsHelpProps {
  shortcuts: KeyboardShortcut[]
  isOpen: boolean
  onClose: () => void
  title?: string
  className?: string
}

export function KeyboardShortcutsHelp({
  shortcuts,
  isOpen,
  onClose,
  title = 'Keyboard Shortcuts',
  className
}: KeyboardShortcutsHelpProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose()
        }
      }

      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  const getShortcutText = (shortcut: KeyboardShortcut) => {
    const keys: string[] = []
    
    if (shortcut.ctrlKey || shortcut.metaKey) {
      keys.push(mounted && navigator.platform.indexOf('Mac') > -1 ? '⌘' : 'Ctrl')
    }
    if (shortcut.altKey) {
      keys.push(mounted && navigator.platform.indexOf('Mac') > -1 ? '⌥' : 'Alt')
    }
    if (shortcut.shiftKey) {
      keys.push('⇧')
    }
    
    // Format key display
    let keyDisplay = shortcut.key
    switch (shortcut.key.toLowerCase()) {
      case 'arrowleft':
        keyDisplay = '←'
        break
      case 'arrowright':
        keyDisplay = '→'
        break
      case 'arrowup':
        keyDisplay = '↑'
        break
      case 'arrowdown':
        keyDisplay = '↓'
        break
      case ' ':
        keyDisplay = 'Space'
        break
      case 'enter':
        keyDisplay = '⏎'
        break
      case 'escape':
        keyDisplay = 'Esc'
        break
      case 'tab':
        keyDisplay = 'Tab'
        break
      case 'home':
        keyDisplay = 'Home'
        break
      case 'end':
        keyDisplay = 'End'
        break
      default:
        keyDisplay = shortcut.key.toUpperCase()
    }
    
    keys.push(keyDisplay)
    return keys
  }

  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce((groups, shortcut) => {
    const category = shortcut.category || 'General'
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(shortcut)
    return groups
  }, {} as Record<string, KeyboardShortcut[]>)

  const categoryColors: Record<string, string> = {
    'Navigation': 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    'Answers': 'bg-green-500/10 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
    'Actions': 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    'Quick Navigation': 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    'Settings': 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
    'Help': 'bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800'
  }

  const getCategoryColor = (category: string) => {
    return categoryColors[category] || 'bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 25
            }}
            className={cn(
              'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50',
              'w-full max-w-4xl max-h-[90vh] overflow-hidden',
              'mx-4',
              className
            )}
          >
            <Card className="h-full shadow-2xl border-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Keyboard className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {title}
                      <Badge variant="secondary" className="text-xs">
                        <Zap className="w-3 h-3 mr-1" />
                        {shortcuts.length} shortcuts
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Press these keys to navigate faster and boost your productivity
                    </p>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>

              <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="space-y-6">
                  {Object.entries(groupedShortcuts).map(([category, categoryShortcuts], categoryIndex) => (
                    <motion.div
                      key={category}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: categoryIndex * 0.1 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={cn('text-xs font-medium', getCategoryColor(category))}
                        >
                          {category}
                        </Badge>
                        <div className="flex-1 h-px bg-border" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {categoryShortcuts.map((shortcut, index) => {
                          const keys = getShortcutText(shortcut)
                          return (
                            <motion.div
                              key={`${category}-${index}`}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: categoryIndex * 0.1 + index * 0.05 }}
                              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                            >
                              <span className="text-sm font-medium text-foreground">
                                {shortcut.description}
                              </span>
                              
                              <div className="flex items-center gap-1">
                                {keys.map((key, keyIndex) => (
                                  <kbd
                                    key={keyIndex}
                                    className="inline-flex items-center justify-center px-2 py-1 text-xs font-mono font-medium text-muted-foreground bg-muted border border-border rounded shadow-sm min-w-[24px] h-6"
                                  >
                                    {key}
                                  </kbd>
                                ))}
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Footer tip */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8 p-4 bg-muted/50 rounded-lg border text-center"
                >
                  <p className="text-sm text-muted-foreground">
                    💡 <strong>Pro tip:</strong> These shortcuts work throughout the app. 
                    Press <kbd className="px-1.5 py-0.5 text-xs bg-background border rounded">Esc</kbd> to close this dialog.
                  </p>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Compact shortcut indicator component
export function ShortcutIndicator({ 
  shortcut, 
  className 
}: { 
  shortcut: string
  className?: string 
}) {
  return (
    <kbd className={cn(
      'inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-mono font-medium',
      'text-muted-foreground bg-muted border border-border rounded shadow-sm',
      className
    )}>
      {shortcut}
    </kbd>
  )
}