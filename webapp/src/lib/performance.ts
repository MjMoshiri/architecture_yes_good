// Performance monitoring utilities for small server deployment

export interface PerformanceMetrics {
  memoryUsage: NodeJS.MemoryUsage
  uptime: number
  timestamp: number
}

export function getPerformanceMetrics(): PerformanceMetrics {
  return {
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime(),
    timestamp: Date.now()
  }
}

export function formatMemoryUsage(bytes: number): string {
  const mb = bytes / 1024 / 1024
  return `${mb.toFixed(2)} MB`
}

export function logPerformanceMetrics(context: string) {
  if (process.env.NODE_ENV === 'development') {
    const metrics = getPerformanceMetrics()
    console.log(`[${context}] Performance Metrics:`, {
      rss: formatMemoryUsage(metrics.memoryUsage.rss),
      heapUsed: formatMemoryUsage(metrics.memoryUsage.heapUsed),
      heapTotal: formatMemoryUsage(metrics.memoryUsage.heapTotal),
      uptime: `${metrics.uptime.toFixed(2)}s`
    })
  }
}

// Memory cleanup utility
export function forceGarbageCollection() {
  if (global.gc) {
    global.gc()
  }
}

// Request timeout wrapper
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 30000,
  errorMessage: string = 'Request timeout'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    )
  ])
}

// Simplified rate limiting for private network (more generous limits)
const requestCounts = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 1000, // Higher limit for private network
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const windowStart = now - windowMs
  
  // Clean up old entries
  for (const [key, data] of requestCounts.entries()) {
    if (data.resetTime < windowStart) {
      requestCounts.delete(key)
    }
  }
  
  const current = requestCounts.get(identifier)
  
  if (!current || current.resetTime < windowStart) {
    // New window
    requestCounts.set(identifier, { count: 1, resetTime: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1, resetTime: now + windowMs }
  }
  
  if (current.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: current.resetTime }
  }
  
  current.count++
  return { allowed: true, remaining: maxRequests - current.count, resetTime: current.resetTime }
}