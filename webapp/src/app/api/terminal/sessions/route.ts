import { NextResponse } from 'next/server'
import { terminalSessionManager } from '@/lib/terminalSessionManager'

export async function GET(request: Request) {
  try {
    // Get client IP
    const forwarded = request.headers.get('x-forwarded-for')
    const clientIp = forwarded ? forwarded.split(',')[0] : '127.0.0.1'
    
    // Get all sessions for this user
    const userSessions = terminalSessionManager.getSessionsByIp(clientIp)
    
    const sessionData = userSessions.map(session => ({
      id: session.id,
      port: session.port,
      workingDirectory: session.workingDirectory,
      createdAt: session.createdAt,
      lastAccessed: session.lastAccessed,
      isActive: session.isActive
    }))
    
    return NextResponse.json({
      sessions: sessionData,
      totalSessions: sessionData.length
    })
  } catch (error) {
    console.error('Failed to get sessions:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get terminal sessions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId parameter required' },
        { status: 400 }
      )
    }
    
    await terminalSessionManager.terminateSession(sessionId)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete session:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete terminal session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}