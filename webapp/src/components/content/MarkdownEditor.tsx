'use client'

import { useState, useEffect } from 'react'
import { KnowledgeFile } from '@/types/knowledge'

interface MarkdownEditorProps {
  file: KnowledgeFile
  onSave: (content: string, metadata: KnowledgeFile['metadata'] | null) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export default function MarkdownEditor({ 
  file, 
  onSave, 
  onCancel, 
  isLoading = false 
}: MarkdownEditorProps) {
  const [content, setContent] = useState(file.content)
  const [metadata, setMetadata] = useState(file.metadata)
  const [editMode, setEditMode] = useState<'visual' | 'raw'>('visual')
  const [rawContent, setRawContent] = useState(file.rawContent)
  const [hasChanges, setHasChanges] = useState(false)

  // Track changes
  useEffect(() => {
    const contentChanged = content !== file.content
    const metadataChanged = JSON.stringify(metadata) !== JSON.stringify(file.metadata)
    const rawChanged = rawContent !== file.rawContent
    
    setHasChanges(contentChanged || metadataChanged || rawChanged)
  }, [content, metadata, rawContent, file])

  const handleSave = async () => {
    try {
      if (editMode === 'raw') {
        // In raw mode, save the raw content as-is
        await onSave(rawContent, null)
      } else {
        // In visual mode, save content and metadata separately
        await onSave(content, metadata)
      }
    } catch (error) {
      console.error('Error saving file:', error)
    }
  }

  const handleMetadataChange = (key: string, value: string | string[] | undefined) => {
    setMetadata(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    handleMetadataChange('tags', tags)
  }

  const handleTodosChange = (todosString: string) => {
    const todos = todosString.split('\n').map(todo => todo.trim()).filter(todo => todo.length > 0)
    handleMetadataChange('todos', todos)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Editor Header */}
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Edit: {metadata.title || file.path.split('/').pop()}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setEditMode(editMode === 'visual' ? 'raw' : 'visual')}
              className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={isLoading}
            >
              {editMode === 'visual' ? 'Raw' : 'Visual'}
            </button>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSave}
              disabled={!hasChanges || isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
          {hasChanges && (
            <span className="text-sm text-orange-600 font-medium">
              Unsaved changes
            </span>
          )}
        </div>
      </div>

      {editMode === 'visual' ? (
        <div className="divide-y divide-gray-100">
          {/* Metadata Section */}
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Metadata</h3>
            <div className="space-y-3">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={metadata.title || ''}
                  onChange={(e) => handleMetadataChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Enter title..."
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={metadata.status || 'draft'}
                  onChange={(e) => handleMetadataChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="learning">Learning</option>
                  <option value="complete">Complete</option>
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={metadata.tags?.join(', ') || ''}
                  onChange={(e) => handleTagsChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="tag1, tag2, tag3..."
                />
              </div>

              {/* Prerequisites */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prerequisites (comma-separated)
                </label>
                <input
                  type="text"
                  value={metadata.prerequisites?.join(', ') || ''}
                  onChange={(e) => {
                    const prerequisites = e.target.value.split(',').map(p => p.trim()).filter(p => p.length > 0)
                    handleMetadataChange('prerequisites', prerequisites.length > 0 ? prerequisites : undefined)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="prerequisite1, prerequisite2..."
                />
              </div>

              {/* TODOs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  TODOs (one per line)
                </label>
                <textarea
                  value={metadata.todos?.join('\n') || ''}
                  onChange={(e) => handleTodosChange(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="TODO item 1&#10;TODO item 2&#10;TODO item 3..."
                />
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Content</h3>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={20}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
              placeholder="Write your markdown content here..."
            />
          </div>
        </div>
      ) : (
        /* Raw Mode */
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Raw Markdown with Front Matter</h3>
          <textarea
            value={rawContent}
            onChange={(e) => setRawContent(e.target.value)}
            rows={25}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
            placeholder="---&#10;title: Your Title&#10;tags: [tag1, tag2]&#10;status: draft&#10;---&#10;&#10;Your markdown content here..."
          />
        </div>
      )}
    </div>
  )
}