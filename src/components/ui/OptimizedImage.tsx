'use client'

import Image from 'next/image'
import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { deviceCapabilities } from '@/lib/performance'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
  sizes?: string
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality,
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
  sizes,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Get device-appropriate quality
  const getOptimizedQuality = useCallback(() => {
    if (quality) return quality
    
    const connection = deviceCapabilities.getConnectionSpeed()
    const viewport = deviceCapabilities.getViewportSize()
    
    // Lower quality for slow connections or small screens
    if (connection.saveData || connection.effectiveType === '2g') return 50
    if (connection.effectiveType === '3g' || viewport.width < 768) return 65
    if (viewport.width < 1024) return 75
    return 85
  }, [quality])

  // Get responsive sizes if not provided
  const getResponsiveSizes = useCallback(() => {
    if (sizes) return sizes
    
    return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
  }, [sizes])

  const handleLoad = useCallback(() => {
    setIsLoading(false)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }, [onError])

  // Generate low-quality placeholder if not provided
  const getBlurDataURL = useCallback(() => {
    if (blurDataURL) return blurDataURL
    
    // Generate simple blur placeholder
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="${width || 400}" height="${height || 300}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="system-ui" font-size="14">
          Loading...
        </text>
      </svg>
    `)}`
  }, [blurDataURL, width, height])

  if (hasError) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-muted/50 text-muted-foreground text-sm rounded",
          className
        )}
        style={{ 
          width: width || 'auto', 
          height: height || 'auto',
          minHeight: 100 
        }}
      >
        Failed to load image
      </div>
    )
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        quality={getOptimizedQuality()}
        placeholder={placeholder}
        blurDataURL={placeholder === 'blur' ? getBlurDataURL() : undefined}
        sizes={getResponsiveSizes()}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        {...props}
      />
      
      {/* Loading skeleton */}
      {isLoading && (
        <div 
          className="absolute inset-0 bg-muted/20 animate-pulse flex items-center justify-center text-muted-foreground text-xs"
        >
          Loading...
        </div>
      )}
    </div>
  )
}