'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MobileLayout from '@/components/layout/MobileLayout'
import MarkdownViewer from '@/components/content/MarkdownViewer'
import MetadataDisplay from '@/components/content/MetadataDisplay'
import MarkdownEditor from '@/components/content/MarkdownEditor'
import { KnowledgeFile } from '@/types/knowledge'

interface FileViewerClientProps {
  initialFile: KnowledgeFile
  filePath: string
}

export default function FileViewerClient({ initialFile, filePath }: FileViewerClientProps) {
  const [file, setFile] = useState<KnowledgeFile>(initialFile)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const displayTitle = file.metadata.title || filePath.split('/').pop() || 'Untitled'

  const handleEdit = () => {
    setIsEditing(true)
    setError(null)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setError(null)
  }

  const handleSave = async (content: string, metadata: KnowledgeFile['metadata'] | null) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/files/${filePath}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          metadata
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to save file')
      }

      const updatedFile = await response.json()
      setFile(updatedFile)
      setIsEditing(false)

      // Refresh the page to ensure we have the latest data
      router.refresh()
    } catch (error) {
      console.error('Error saving file:', error)
      setError(error instanceof Error ? error.message : 'Failed to save file')
    } finally {
      setIsLoading(false)
    }
  }

  if (isEditing) {
    return (
      <div className="mobile-container py-4 h-full overflow-auto">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        <MarkdownEditor
          file={file}
          onSave={handleSave}
          onCancel={handleCancelEdit}
          isLoading={isLoading}
        />
      </div>
    )
  }

  return (
    <div className="mobile-container py-4 h-full overflow-auto">
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {/* File header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900 mb-1">
                {displayTitle}
              </h1>
              <p className="text-sm text-gray-500">
                {filePath}
              </p>
            </div>
            <button
              onClick={handleEdit}
              className="ml-3 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Edit
            </button>
          </div>
        </div>

        {/* File content */}
        <div className="p-4">
          {/* Metadata display */}
          <MetadataDisplay metadata={file.metadata} />

          {/* Markdown content */}
          <MarkdownViewer content={file.content} />
        </div>
      </div>
    </div>
  )
}