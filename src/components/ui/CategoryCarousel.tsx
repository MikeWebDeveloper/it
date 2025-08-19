'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useSwipeable } from 'react-swipeable'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CategoryCarouselProps {
  categories: string[]
  className?: string
  onCategoryClick?: (category: string) => void
  maxVisible?: number
}

export function CategoryCarousel({ 
  categories, 
  className, 
  onCategoryClick,
  maxVisible = 4 
}: CategoryCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const canScrollLeft = currentIndex > 0
  const canScrollRight = currentIndex < categories.length - maxVisible

  const scrollLeft = () => {
    if (canScrollLeft) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const scrollRight = () => {
    if (canScrollRight) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const visibleCategories = categories.slice(currentIndex, currentIndex + maxVisible)

  const handlers = useSwipeable({
    onSwipedLeft: () => scrollRight(),
    onSwipedRight: () => scrollLeft(),
    trackMouse: true,
    preventScrollOnSwipe: true
  })

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Left scroll button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={scrollLeft}
        disabled={!canScrollLeft}
        className={cn(
          'h-8 w-8 p-0 flex-shrink-0 transition-all duration-200',
          !canScrollLeft ? 'opacity-30 cursor-not-allowed' : 'hover:bg-accent hover:scale-110'
        )}
        aria-label="Scroll categories left"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {/* Categories container */}
      <div 
        {...handlers}
        className="flex-1 overflow-hidden cursor-grab active:cursor-grabbing"
        role="list" 
        aria-label="Available topics"
      >
        <motion.div 
          className="flex gap-2"
          animate={{ 
            x: 0
          }}
          transition={{ 
            type: "spring", 
            stiffness: 400, 
            damping: 35,
            mass: 0.8
          }}
        >
          {visibleCategories.map((category, index) => (
            <motion.div
              key={`${category}-${currentIndex + index}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                delay: index * 0.03,
                duration: 0.15,
                type: "spring",
                stiffness: 500
              }}
              role="listitem"
            >
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs whitespace-nowrap cursor-pointer hover:bg-primary/10 transition-all duration-200",
                  onCategoryClick && "hover:scale-105 active:scale-95"
                )}
                onClick={() => onCategoryClick?.(category)}
              >
                {category}
              </Badge>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Right scroll button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={scrollRight}
        disabled={!canScrollRight}
        className={cn(
          'h-8 w-8 p-0 flex-shrink-0 transition-all duration-200',
          !canScrollRight ? 'opacity-30 cursor-not-allowed' : 'hover:bg-accent hover:scale-110'
        )}
        aria-label="Scroll categories right"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>

      {/* Scroll indicators */}
      {categories.length > maxVisible && (
        <div className="flex gap-1 ml-2">
          {Array.from({ length: Math.ceil(categories.length / maxVisible) }).map((_, index) => (
            <div
              key={index}
              className={cn(
                'w-1.5 h-1.5 rounded-full transition-colors',
                Math.floor(currentIndex / maxVisible) === index 
                  ? 'bg-primary' 
                  : 'bg-muted-foreground/30'
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}