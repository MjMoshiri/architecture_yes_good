import { NextRequest, NextResponse } from 'next/server'
import { logPerformanceMetrics } from '@/lib/performance'

export async function POST(request: NextRequest) {
  try {
    const metrics = await request.json()
    
    // Log performance metrics
    console.log('Client Performance Metrics:', {
      fcp: metrics.fcp ? `${metrics.fcp.toFixed(2)}ms` : 'N/A',
      lcp: metrics.lcp ? `${metrics.lcp.toFixed(2)}ms` : 'N/A',
      fid: metrics.fid ? `${metrics.fid.toFixed(2)}ms` : 'N/A',
      cls: metrics.cls ? metrics.cls.toFixed(4) : 'N/A',
      ttfb: metrics.ttfb ? `${metrics.ttfb.toFixed(2)}ms` : 'N/A',
      isMobile: metrics.isMobile,
      connectionType: metrics.connectionType
    })
    
    // Log server performance
    logPerformanceMetrics('Performance API')
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Performance logging error:', error)
    return NextResponse.json(
      { error: 'Failed to log performance metrics' },
      { status: 500 }
    )
  }
}