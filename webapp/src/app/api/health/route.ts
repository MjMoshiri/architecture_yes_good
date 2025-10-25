import { NextResponse } from 'next/server'
import { getPerformanceMetrics, formatMemoryUsage } from '@/lib/performance'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const metrics = getPerformanceMetrics()
    const knowledgeBaseRoot = path.join(process.cwd(), '..')
    
    // Check if knowledge base directory is accessible
    const knowledgeBaseExists = fs.existsSync(knowledgeBaseRoot)
    
    // Basic health checks
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: metrics.uptime,
      memory: {
        rss: formatMemoryUsage(metrics.memoryUsage.rss),
        heapUsed: formatMemoryUsage(metrics.memoryUsage.heapUsed),
        heapTotal: formatMemoryUsage(metrics.memoryUsage.heapTotal),
        external: formatMemoryUsage(metrics.memoryUsage.external)
      },
      knowledgeBase: {
        accessible: knowledgeBaseExists,
        path: knowledgeBaseRoot
      },
      environment: process.env.NODE_ENV || 'development'
    }
    
    return NextResponse.json(health)
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    )
  }
}