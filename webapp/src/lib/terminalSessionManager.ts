import { ChildProcess, spawn } from 'child_process'
import { promises as fs } from 'fs'
import path from 'path'

interface TerminalSession {
  id: string
  userIp: string
  port: number
  process: ChildProcess | null
  workingDirectory: string
  createdAt: Date
  lastAccessed: Date
  isActive: boolean
}

interface SessionData {
  id: string
  userIp: string
  port: number
  workingDirectory: string
  createdAt: string
  lastAccessed: string
  isActive: boolean
}

class TerminalSessionManager {
  private sessions: Map<string, TerminalSession> = new Map()
  private sessionsByIp: Map<string, string[]> = new Map()
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes
  private readonly MAX_SESSIONS_PER_IP = 3
  private readonly BASE_PORT = 7680
  private readonly SESSION_FILE = path.join(process.cwd(), '.terminal-sessions.json')

  constructor() {
    this.loadSessions()
    this.startCleanupTimer()
  }

  async getOrCreateSession(userIp: string): Promise<TerminalSession> {
    // Clean up expired sessions first
    this.cleanupExpiredSessions()

    // Check for existing active session for this IP
    const existingSessions = this.sessionsByIp.get(userIp) || []
    for (const sessionId of existingSessions) {
      const session = this.sessions.get(sessionId)
      if (session && session.isActive && this.isSessionValid(session)) {
        session.lastAccessed = new Date()
        await this.saveSessions()
        return session
      }
    }

    // Create new session
    return this.createNewSession(userIp)
  }

  private async createNewSession(userIp: string): Promise<TerminalSession> {
    const sessionId = this.generateSessionId()
    const port = await this.findAvailablePort()
    
    const session: TerminalSession = {
      id: sessionId,
      userIp,
      port,
      process: null,
      workingDirectory: process.cwd(),
      createdAt: new Date(),
      lastAccessed: new Date(),
      isActive: false
    }

    // Start ttyd process for this session
    await this.startTtydProcess(session)

    // Store session
    this.sessions.set(sessionId, session)
    
    const userSessions = this.sessionsByIp.get(userIp) || []
    userSessions.push(sessionId)
    
    // Limit sessions per IP
    if (userSessions.length > this.MAX_SESSIONS_PER_IP) {
      const oldestSessionId = userSessions.shift()!
      await this.terminateSession(oldestSessionId)
    }
    
    this.sessionsByIp.set(userIp, userSessions)
    await this.saveSessions()

    return session
  }

  private async startTtydProcess(session: TerminalSession): Promise<void> {
    return new Promise((resolve, reject) => {
      // Create session-specific working directory if it doesn't exist
      const sessionDir = path.join(process.cwd(), '.terminal-sessions', session.id)
      
      try {
        require('fs').mkdirSync(sessionDir, { recursive: true })
      } catch (err) {
        // Directory might already exist
      }

      const ttydArgs = [
        '-i', '0.0.0.0',
        '-p', session.port.toString(),
        '-W', // Enable write access
        '-t', 'titleFixed=Terminal Session',
        '-t', `fontSize=14`,
        '-t', 'theme={"background": "#1a1a1a", "foreground": "#ffffff"}',
        'bash'
      ]

      const ttydProcess = spawn('ttyd', ttydArgs, {
        cwd: session.workingDirectory,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: {
          ...process.env,
          TERM: 'xterm-256color',
          SHELL: '/bin/bash'
        }
      })

      ttydProcess.stdout?.on('data', (data) => {
        console.log(`ttyd[${session.port}]:`, data.toString())
      })

      ttydProcess.stderr?.on('data', (data) => {
        console.error(`ttyd[${session.port}] error:`, data.toString())
      })

      ttydProcess.on('error', (error) => {
        console.error(`Failed to start ttyd for session ${session.id}:`, error)
        session.isActive = false
        reject(error)
      })

      ttydProcess.on('exit', (code) => {
        console.log(`ttyd process for session ${session.id} exited with code ${code}`)
        session.isActive = false
        session.process = null
      })

      // Give ttyd a moment to start
      setTimeout(async () => {
        const isRunning = await this.checkPortActive(session.port)
        if (isRunning) {
          session.process = ttydProcess
          session.isActive = true
          resolve()
        } else {
          reject(new Error(`ttyd failed to start on port ${session.port}`))
        }
      }, 2000)
    })
  }

  private async findAvailablePort(): Promise<number> {
    const net = require('net')
    
    for (let port = this.BASE_PORT; port < this.BASE_PORT + 100; port++) {
      const isAvailable = await new Promise<boolean>((resolve) => {
        const server = net.createServer()
        
        server.listen(port, '127.0.0.1', () => {
          server.close(() => resolve(true))
        })
        
        server.on('error', () => resolve(false))
      })
      
      if (isAvailable) {
        return port
      }
    }
    
    throw new Error('No available ports found')
  }

  private async checkPortActive(port: number): Promise<boolean> {
    const net = require('net')
    
    return new Promise((resolve) => {
      const socket = new net.Socket()
      
      socket.setTimeout(1000)
      
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

  async terminateSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId)
    if (!session) return

    if (session.process) {
      session.process.kill('SIGTERM')
      session.process = null
    }

    session.isActive = false
    
    // Remove from IP mapping
    const userSessions = this.sessionsByIp.get(session.userIp) || []
    const index = userSessions.indexOf(sessionId)
    if (index > -1) {
      userSessions.splice(index, 1)
      if (userSessions.length === 0) {
        this.sessionsByIp.delete(session.userIp)
      } else {
        this.sessionsByIp.set(session.userIp, userSessions)
      }
    }

    this.sessions.delete(sessionId)
    await this.saveSessions()
  }

  private isSessionValid(session: TerminalSession): boolean {
    const now = new Date()
    const timeSinceLastAccess = now.getTime() - session.lastAccessed.getTime()
    return timeSinceLastAccess < this.SESSION_TIMEOUT
  }

  private cleanupExpiredSessions(): void {
    const now = new Date()
    const expiredSessions: string[] = []

    for (const [sessionId, session] of this.sessions) {
      const timeSinceLastAccess = now.getTime() - session.lastAccessed.getTime()
      if (timeSinceLastAccess > this.SESSION_TIMEOUT) {
        expiredSessions.push(sessionId)
      }
    }

    expiredSessions.forEach(sessionId => {
      this.terminateSession(sessionId)
    })
  }

  private startCleanupTimer(): void {
    setInterval(() => {
      this.cleanupExpiredSessions()
    }, 5 * 60 * 1000) // Check every 5 minutes
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private async saveSessions(): Promise<void> {
    try {
      const sessionData: SessionData[] = Array.from(this.sessions.values())
        .filter(session => session.isActive)
        .map(session => ({
          id: session.id,
          userIp: session.userIp,
          port: session.port,
          workingDirectory: session.workingDirectory,
          createdAt: session.createdAt.toISOString(),
          lastAccessed: session.lastAccessed.toISOString(),
          isActive: session.isActive
        }))

      await fs.writeFile(this.SESSION_FILE, JSON.stringify(sessionData, null, 2))
    } catch (error) {
      console.error('Failed to save sessions:', error)
    }
  }

  private async loadSessions(): Promise<void> {
    try {
      const data = await fs.readFile(this.SESSION_FILE, 'utf-8')
      const sessionData: SessionData[] = JSON.parse(data)

      for (const data of sessionData) {
        const session: TerminalSession = {
          id: data.id,
          userIp: data.userIp,
          port: data.port,
          process: null,
          workingDirectory: data.workingDirectory,
          createdAt: new Date(data.createdAt),
          lastAccessed: new Date(data.lastAccessed),
          isActive: false // Will be reactivated if ttyd is still running
        }

        // Check if ttyd is still running on this port
        const isRunning = await this.checkPortActive(session.port)
        if (isRunning) {
          session.isActive = true
        }

        this.sessions.set(session.id, session)
        
        const userSessions = this.sessionsByIp.get(session.userIp) || []
        userSessions.push(session.id)
        this.sessionsByIp.set(session.userIp, userSessions)
      }
    } catch (error) {
      // File doesn't exist or is invalid, start fresh
      console.log('No existing sessions file found, starting fresh')
    }
  }

  getSessionInfo(sessionId: string): TerminalSession | undefined {
    return this.sessions.get(sessionId)
  }

  getAllSessions(): TerminalSession[] {
    return Array.from(this.sessions.values())
  }

  getSessionsByIp(userIp: string): TerminalSession[] {
    const sessionIds = this.sessionsByIp.get(userIp) || []
    return sessionIds.map(id => this.sessions.get(id)).filter(Boolean) as TerminalSession[]
  }
}

// Singleton instance
export const terminalSessionManager = new TerminalSessionManager()
export type { TerminalSession }