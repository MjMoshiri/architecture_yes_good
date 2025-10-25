'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import MobileLayout from '@/components/layout/MobileLayout'

export default function TerminalPage() {
  const [terminalUrl, setTerminalUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sessionInfo, setSessionInfo] = useState<{
    port: number;
    workingDirectory: string;
    sessionId: string;
    isExistingSession?: boolean;
  } | null>(null)
  const [isExistingSession, setIsExistingSession] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const startTerminalSession = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/terminal/start', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start terminal session')
      }

      setTerminalUrl(data.url)
      setSessionInfo(data)
      setIsExistingSession(data.isExistingSession || false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const checkTtydAndStartSession = async () => {
      try {
        const checkResponse = await fetch('/api/terminal/check')
        const checkData = await checkResponse.json()

        if (!checkData.ttydAvailable) {
          setError(`ttyd is not installed. Please install it first:\n\n${JSON.stringify(checkData.installInstructions, null, 2)}`)
          setIsLoading(false)
          return
        }

        // ttyd is available, start the session
        startTerminalSession()
      } catch {
        setError('Failed to check ttyd availability')
        setIsLoading(false)
      }
    }

    // Check ttyd availability first, then start terminal session
    checkTtydAndStartSession()

    // Handle page visibility changes to maintain session
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !terminalUrl) {
        // Page became visible and we don't have a terminal URL, reconnect
        startTerminalSession()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup on unmount - but don't terminate the session, just disconnect
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      // Don't call stopTerminalSession here to keep session alive
    }
  }, [terminalUrl, startTerminalSession])







  const restartTerminal = () => {
    setTerminalUrl(null)
    setSessionInfo(null)
    setIsExistingSession(false)
    startTerminalSession()
  }



  if (isLoading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center h-screen-safe bg-black text-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p>
              {sessionInfo ? 'Restoring terminal session...' : 'Starting terminal session...'}
            </p>
          </div>
        </div>
      </MobileLayout>
    )
  }

  if (error) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center h-screen-safe bg-black text-white">
          <div className="text-center p-6">
            <div className="text-red-400 mb-4">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg font-semibold">Terminal Error</p>
            </div>
            <p className="text-gray-300 mb-4">{error}</p>
            <button
              onClick={restartTerminal}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </MobileLayout>
    )
  }

  return (
    <MobileLayout showNavigation={false}>
      <div className="flex flex-col h-screen-safe bg-black">
        {/* Terminal Header */}
        <div className="flex items-center justify-between p-3 bg-gray-900 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <h1 className="text-white font-semibold">Gemini Terminal</h1>
            {isExistingSession && (
              <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">
                Session Restored
              </span>
            )}
            {sessionInfo && (
              <span className="text-gray-400 text-xs">
                Port: {sessionInfo.port}
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            <a
              href="/terminal/sessions"
              className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
            >
              Sessions
            </a>
            <button
              onClick={restartTerminal}
              className="px-3 py-1 bg-gray-700 text-white rounded text-xs hover:bg-gray-600"
            >
              New Session
            </button>
          </div>
        </div>

        {/* Session Info */}
        {sessionInfo && (
          <div className="px-3 py-2 bg-gray-800 border-b border-gray-700 text-xs text-gray-300">
            <div className="flex items-center justify-between">
              <span>Working Directory: {sessionInfo.workingDirectory}</span>
              <span>Session ID: {sessionInfo.sessionId?.slice(-8)}</span>
            </div>
          </div>
        )}

        {/* Terminal iframe */}
        {terminalUrl && (
          <iframe
            ref={iframeRef}
            src={terminalUrl}
            className="flex-1 w-full border-0"
            style={{
              background: 'black',
              colorScheme: 'dark'
            }}
            title="Terminal"
          />
        )}
      </div>
    </MobileLayout>
  )
}