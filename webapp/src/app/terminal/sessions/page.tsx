'use client'

import { useState, useEffect } from 'react'
import MobileLayout from '@/components/layout/MobileLayout'
import Link from 'next/link'

interface TerminalSession {
  id: string
  port: number
  workingDirectory: string
  createdAt: string
  lastAccessed: string
  isActive: boolean
}

export default function TerminalSessionsPage() {
  const [sessions, setSessions] = useState<TerminalSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/terminal/sessions')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load sessions')
      }
      
      setSessions(data.sessions)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  const terminateSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/terminal/sessions?sessionId=${sessionId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to terminate session')
      }
      
      // Reload sessions
      loadSessions()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const terminateAllSessions = async () => {
    try {
      const response = await fetch('/api/terminal/stop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ terminateAll: true }),
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to terminate all sessions')
      }
      
      // Reload sessions
      loadSessions()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getSessionAge = (createdAt: string) => {
    const now = new Date()
    const created = new Date(createdAt)
    const diffMs = now.getTime() - created.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center h-screen-safe bg-black text-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading sessions...</p>
          </div>
        </div>
      </MobileLayout>
    )
  }

  return (
    <MobileLayout>
      <div className="min-h-screen-safe bg-black text-white">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Terminal Sessions</h1>
            <div className="flex space-x-2">
              <Link
                href="/terminal"
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                New Terminal
              </Link>
              {sessions.length > 0 && (
                <button
                  onClick={terminateAllSessions}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Terminate All
                </button>
              )}
            </div>
          </div>
          
          {error && (
            <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
        </div>

        {/* Sessions List */}
        <div className="p-4">
          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-lg">No active terminal sessions</p>
                <p className="text-sm">Start a new terminal to create a session</p>
              </div>
              <Link
                href="/terminal"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Start Terminal
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-gray-900 border border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold">
                          Session {session.id.slice(-8)}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs ${
                          session.isActive 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-600 text-gray-300'
                        }`}>
                          {session.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="text-gray-400 text-xs">
                          Port {session.port}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-300 space-y-1">
                        <p>
                          <span className="text-gray-400">Working Directory:</span>{' '}
                          {session.workingDirectory}
                        </p>
                        <p>
                          <span className="text-gray-400">Created:</span>{' '}
                          {getSessionAge(session.createdAt)} ({formatDate(session.createdAt)})
                        </p>
                        <p>
                          <span className="text-gray-400">Last Accessed:</span>{' '}
                          {formatDate(session.lastAccessed)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      {session.isActive && (
                        <Link
                          href="/terminal"
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        >
                          Connect
                        </Link>
                      )}
                      <button
                        onClick={() => terminateSession(session.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                      >
                        Terminate
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  )
}