import { NextResponse } from 'next/server'
import { terminalSessionManager } from '@/lib/terminalSessionManager'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const { sessionId, terminateAll } = body

    if (terminateAll) {
      // Get client IP and terminate all sessions for this user
      const forwarded = request.headers.get('x-forwarded-for')
      const clientIp = forwarded ? forwarded.split(',')[0] : '127.0.0.1'
      
      const userSessions = terminalSessionManager.getSessionsByIp(clientIp)
      for (const session of userSessions) {
        await terminalSessionManager.terminateSession(session.id)
      }
    } else if (sessionId) {
      // Terminate specific session
      await terminalSessionManager.terminateSession(sessionId)
    } else {
      return NextResponse.json(
        { error: 'No sessionId provided and terminateAll not specified' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to stop terminal:', error)
    return NextResponse.json(
      { 
        error: 'Failed to stop terminal session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}