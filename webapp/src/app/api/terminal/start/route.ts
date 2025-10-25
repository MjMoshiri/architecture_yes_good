import { NextResponse } from 'next/server'
import { terminalSessionManager } from '@/lib/terminalSessionManager'

export async function POST(request: Request) {
  try {
    // Get client IP for session management
    const forwarded = request.headers.get('x-forwarded-for')
    const clientIp = forwarded ? forwarded.split(',')[0] : '127.0.0.1'

    // Get or create a persistent session for this user
    const session = await terminalSessionManager.getOrCreateSession(clientIp)
    
    if (!session.isActive) {
      return NextResponse.json(
        { 
          error: 'Failed to create terminal session',
          details: 'ttyd process could not be started'
        },
        { status: 500 }
      )
    }

    // Get the server's network address for access
    const serverHost = process.env.SERVER_HOST || 'localhost'
    const terminalUrl = `http://${serverHost}:${session.port}`
    
    return NextResponse.json({
      url: terminalUrl,
      port: session.port,
      sessionId: session.id,
      workingDirectory: session.workingDirectory,
      isExistingSession: session.lastAccessed.getTime() < Date.now() - 5000 // Consider existing if older than 5 seconds
    })

  } catch (error) {
    console.error('Failed to start terminal:', error)
    return NextResponse.json(
      { 
        error: 'Failed to start terminal session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

