// Mobile-specific optimizations and performance utilities

export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

export function getConnectionType(): string {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return 'unknown'
  }
  
  const connection = (navigator as any).connection
  return connection?.effectiveType || 'unknown'
}

export function isSlowConnection(): boolean {
  const connectionType = getConnectionType()
  return ['slow-2g', '2g'].includes(connectionType)
}

// Lazy loading utility for mobile
export function createIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver | null {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null
  }
  
  return new IntersectionObserver(callback, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  })
}

// Debounce utility for search and input
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle utility for scroll events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Preload critical resources
export function preloadResource(href: string, as: string): void {
  if (typeof document === 'undefined') return
  
  const link = document.createElement('link')
  link.rel = 'preload'
  link.href = href
  link.as = as
  document.head.appendChild(link)
}

// Measure and report performance metrics
export interface PerformanceMetrics {
  fcp?: number // First Contentful Paint
  lcp?: number // Largest Contentful Paint
  fid?: number // First Input Delay
  cls?: number // Cumulative Layout Shift
  ttfb?: number // Time to First Byte
}

export function measurePerformance(): Promise<PerformanceMetrics> {
  return new Promise((resolve) => {
    // Ensure we're in browser environment
    if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') {
      resolve({})
      return
    }
    
    const metrics: PerformanceMetrics = {}
    
    // Measure FCP
    try {
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint')
        if (fcpEntry) {
          metrics.fcp = fcpEntry.startTime
        }
      })
      fcpObserver.observe({ entryTypes: ['paint'] })
    
      // Measure LCP
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        metrics.lcp = lastEntry.startTime
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
      
      // Measure FID
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const firstEntry = entries[0]
        metrics.fid = firstEntry.processingStart - firstEntry.startTime
      })
      fidObserver.observe({ entryTypes: ['first-input'] })
      
      // Measure CLS
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
          }
        }
        metrics.cls = clsValue
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })
    
    // Get TTFB from navigation timing
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (navigationEntry) {
      metrics.ttfb = navigationEntry.responseStart - navigationEntry.requestStart
    }
    
    // Resolve after a short delay to collect metrics
    setTimeout(() => {
      fcpObserver.disconnect()
      lcpObserver.disconnect()
      fidObserver.disconnect()
      clsObserver.disconnect()
      resolve(metrics)
    }, 3000)
  })
}

// Report performance metrics to console (development) or analytics (production)
export function reportPerformanceMetrics(metrics: PerformanceMetrics): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('Performance Metrics:', metrics)
  }
  
  // In production, you could send to analytics service
  // analytics.track('performance_metrics', metrics)
}

// Optimize images for mobile
export function getOptimizedImageSrc(
  src: string,
  width: number,
  quality: number = 75
): string {
  if (src.startsWith('http')) {
    return src // External images
  }
  
  // Use Next.js Image Optimization API
  const params = new URLSearchParams({
    url: src,
    w: width.toString(),
    q: quality.toString()
  })
  
  return `/_next/image?${params.toString()}`
}