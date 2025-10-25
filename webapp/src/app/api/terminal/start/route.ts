import { NextResponse } from 'next/server'
import { spawn, ChildProcess } from 'child_process'
import path from 'path'

// Store the ttyd process globally (in production, you'd want to use a proper session store)
let ttydProcess: ChildProcess | null = null
let terminalPort: number | null = null

export async function POST() {
  try {
    // Use the existing ttyd service running on port 7683
    const port = 7683
    terminalPort = port

    // Check if ttyd is running on the expected port
    const isRunning = await checkTtydRunning(port)
    if (!isRunning) {
      return NextResponse.json(
        { 
          error: 'ttyd service not running. Please start ttyd on port 7683.',
          details: 'Run: ttyd -i 0.0.0.0 -p 7683 -W bash'
        },
        { status: 500 }
      )
    }

    // Get the server's network address for Tailscale access
    const serverHost = process.env.SERVER_HOST || 'localhost'
    const terminalUrl = `http://${serverHost}:${port}`
    
    return NextResponse.json({
      url: terminalUrl,
      port: port
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

async function checkTtydRunning(port: number): Promise<boolean> {
  const net = require('net')
  
  return new Promise((resolve) => {
    const socket = new net.Socket()
    
    socket.setTimeout(2000)
    
    socket.on('connect', () => {
      socket.destroy()
      resolve(true)
    })
    
    socket.on('timeout', () => {
      socket.destroy()
      resolve(false)
    })
    
    socket.on('error', () => {
      resolve(false)
    })
    
    socket.connect(port, '127.0.0.1')
  })
}

async function findAvailablePort(startPort: number): Promise<number> {
  const net = require('net')
  
  return new Promise((resolve, reject) => {
    const server = net.createServer()
    
    server.listen(startPort, '127.0.0.1', () => {
      const port = server.address()?.port
      server.close(() => {
        resolve(port || startPort)
      })
    })
    
    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        // Port is in use, try the next one
        resolve(findAvailablePort(startPort + 1))
      } else {
        reject(err)
      }
    })
  })
}