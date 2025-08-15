'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ImageIcon,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  AlertCircle,
  Expand
} from 'lucide-react'

interface ExhibitDisplayProps {
  exhibit: {
    src: string
    alt: string
    caption?: string
    width?: number
    height?: number
  }
  className?: string
}

export function ExhibitDisplay({ exhibit, className }: ExhibitDisplayProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)

  const handleImageLoad = () => {
    setIsLoading(false)
    setHasError(false)
  }

  const handleImageError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5))
  }

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = exhibit.src
    link.download = `exhibit-${exhibit.alt.replace(/\s+/g, '-').toLowerCase()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
    if (!isExpanded) {
      setScale(1)
      setRotation(0)
    }
  }

  if (hasError) {
    return (
      <Card className={cn("border-2 border-dashed border-muted-foreground/25", className)}>
        <CardContent className="flex flex-col items-center justify-center p-6 space-y-3">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
            <AlertCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Exhibit image not available
            </p>
            <p className="text-xs text-muted-foreground/70">
              {exhibit.alt}
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            <ImageIcon className="w-3 h-3 mr-1" />
            Missing Image
          </Badge>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className={cn("overflow-hidden", className)}>
          <CardContent className="p-0">
            {/* Header with controls */}
            <div className="flex items-center justify-between p-3 bg-muted/30 border-b">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-muted-foreground" />
                <Badge variant="secondary" className="text-xs">
                  Exhibit
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleExpanded}
                  className="h-7 w-7 p-0"
                  aria-label="Expand exhibit to full screen"
                  title="Expand exhibit"
                >
                  <Expand className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownload}
                  className="h-7 w-7 p-0"
                  aria-label="Download exhibit image"
                  title="Download exhibit"
                >
                  <Download className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Image container */}
            <div className="relative bg-background">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-muted-foreground">Loading exhibit...</p>
                  </div>
                </div>
              )}
              
              <div className={cn(
                "relative overflow-hidden",
                isLoading && "min-h-[200px]"
              )}>
                <Image
                  src={exhibit.src}
                  alt={exhibit.alt}
                  width={exhibit.width || 800}
                  height={exhibit.height || 600}
                  className={cn(
                    "w-full h-auto transition-opacity duration-300",
                    isLoading ? "opacity-0" : "opacity-100"
                  )}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
                />
              </div>

              {/* Caption */}
              {exhibit.caption && (
                <div className="p-3 bg-muted/50 border-t">
                  <p className="text-xs text-muted-foreground">
                    {exhibit.caption}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Expanded modal */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={toggleExpanded}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-[90vw] max-h-[90vh] bg-background rounded-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  <span className="font-medium">Exhibit</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={handleZoomOut}>
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground min-w-[60px] text-center">
                    {Math.round(scale * 100)}%
                  </span>
                  <Button variant="ghost" size="sm" onClick={handleZoomIn}>
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleRotate}>
                    <RotateCw className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleDownload}>
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Modal content */}
              <div className="overflow-auto max-h-[calc(90vh-120px)]">
                <div className="flex items-center justify-center p-4">
                  <div
                    className="transition-transform duration-200"
                    style={{
                      transform: `scale(${scale}) rotate(${rotation}deg)`,
                      transformOrigin: 'center'
                    }}
                  >
                    <Image
                      src={exhibit.src}
                      alt={exhibit.alt}
                      width={exhibit.width || 800}
                      height={exhibit.height || 600}
                      className="max-w-none"
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                    />
                  </div>
                </div>
              </div>

              {/* Modal footer */}
              {exhibit.caption && (
                <div className="p-4 border-t bg-muted/30">
                  <p className="text-sm text-muted-foreground">
                    {exhibit.caption}
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}