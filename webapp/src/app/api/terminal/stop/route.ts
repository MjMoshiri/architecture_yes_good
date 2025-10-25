import { NextResponse } from 'next/server'

// Import the ttyd process from the start route
// In a real application, you'd use a proper session store
declare global {
  var ttydProcess: any
}

export async function POST() {
  try {
    // Access the global ttyd process (this is a simple approach for demo)
    // In production, you'd want to use a proper process manager
    if (global.ttydProcess) {
      global.ttydProcess.kill('SIGTERM')
      global.ttydProcess = null
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