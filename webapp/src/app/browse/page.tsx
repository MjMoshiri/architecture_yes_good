'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import MobileLayout from '@/components/layout/MobileLayout'

interface DirectoryItem {
  name: string
  path: string
  type: 'directory' | 'file'
  isMarkdown: boolean
  size: number
  modified: string
}

interface DirectoryContents {
  path: string
  contents: DirectoryItem[]
}

export default function BrowsePage() {
  const [currentPath, setCurrentPath] = useState('')
  const [contents, setContents] = useState<DirectoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDirectory = async (path: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/directories?path=${encodeURIComponent(path)}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to load directory')
      }
      
      const data: DirectoryContents = await response.json()
      setContents(data.contents)
      setCurrentPath(data.path)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDirectory('')
  }, [])

  const navigateToDirectory = (path: string) => {
    loadDirectory(path)
  }

  const navigateUp = () => {
    const pathParts = currentPath.split('/').filter(Boolean)
    pathParts.pop()
    const parentPath = pathParts.join('/')
    loadDirectory(parentPath)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="mobile-container py-4">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading directory...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mobile-container py-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error</h3>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={() => loadDirectory('')}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm"
          >
            Go to Root
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mobile-container py-4 h-full overflow-auto">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">Browse Files</h1>
        <div className="flex items-center mt-2 text-sm text-gray-600">
          <span>📁</span>
          <span className="ml-1">/{currentPath || 'root'}</span>
        </div>
      </div>

      {/* Navigation */}
      {currentPath && (
        <div className="mb-4">
          <button
            onClick={navigateUp}
            className="flex items-center px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-200"
          >
            <span className="mr-2">←</span>
            Up one level
          </button>
        </div>
      )}

      {/* Directory Contents */}
      <div className="space-y-2">
        {contents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>This directory is empty</p>
          </div>
        ) : (
          contents.map((item) => (
            <div
              key={item.path}
              className="bg-white rounded-lg border p-4 hover:bg-gray-50"
            >
              {item.type === 'directory' ? (
                <button
                  onClick={() => navigateToDirectory(item.path)}
                  className="w-full text-left"
                >
                  <div className="flex items-center">
                    <span className="text-lg mr-3">📁</span>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">Directory</p>
                    </div>
                    <span className="text-gray-400">→</span>
                  </div>
                </button>
              ) : (
                <Link href={`/file/${item.path}`} className="block">
                  <div className="flex items-center">
                    <span className="text-lg mr-3">
                      {item.isMarkdown ? '📄' : '📋'}
                    </span>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <div className="flex items-center text-sm text-gray-500 space-x-3">
                        <span>{formatFileSize(item.size)}</span>
                        <span>{formatDate(item.modified)}</span>
                      </div>
                    </div>
                    <span className="text-gray-400">→</span>
                  </div>
                </Link>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}