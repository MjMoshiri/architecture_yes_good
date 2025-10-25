'use client'

import Link from 'next/link'

interface SearchResult {
  id: string
  title: string
  path: string
  score: number
  metadata: {
    tags?: string[]
    status?: 'draft' | 'learning' | 'complete'
    last_updated?: string
    prerequisites?: string[]
    todos?: string[]
  }
  excerpt: string
}

interface SearchResultsProps {
  results: SearchResult[]
  query: string
}

function highlightText(text: string, query: string): string {
  if (!query) return text
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>')
}

function getStatusColor(status?: string): string {
  switch (status) {
    case 'complete':
      return 'bg-green-100 text-green-800'
    case 'learning':
      return 'bg-blue-100 text-blue-800'
    case 'draft':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function formatPath(path: string): string {
  // Remove file extension and format path nicely
  const withoutExt = path.replace(/\.md$/, '')
  const parts = withoutExt.split('/')
  
  if (parts.length > 2) {
    return `${parts[0]}/.../${parts[parts.length - 1]}`
  }
  
  return withoutExt
}

export default function SearchResults({ results, query }: SearchResultsProps) {
  if (results.length === 0) {
    return null
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Search Results
        </h2>
        <span className="text-sm text-gray-500">
          {results.length} result{results.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-3">
        {results.map((result) => (
          <Link
            key={result.id}
            href={`/file/${encodeURIComponent(result.path)}`}
            className="block bg-white rounded-lg p-4 shadow-sm border hover:shadow-md transition-shadow touch-target"
          >
            <div className="space-y-3">
              {/* Header with title and score */}
              <div className="flex items-start justify-between">
                <h3 
                  className="font-semibold text-gray-900 text-base leading-tight flex-1"
                  dangerouslySetInnerHTML={{ 
                    __html: highlightText(result.title, query) 
                  }}
                />
                <div className="ml-2 flex items-center">
                  <div className="text-xs text-gray-400">
                    {Math.round(result.score * 100)}%
                  </div>
                </div>
              </div>

              {/* Path */}
              <div className="text-sm text-gray-500 font-mono">
                {formatPath(result.path)}
              </div>

              {/* Excerpt */}
              <div 
                className="text-sm text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ 
                  __html: highlightText(result.excerpt, query) 
                }}
              />

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {/* Status */}
                {result.metadata.status && (
                  <span className={`
                    inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                    ${getStatusColor(result.metadata.status)}
                  `}>
                    {result.metadata.status}
                  </span>
                )}

                {/* Tags */}
                {result.metadata.tags && result.metadata.tags.length > 0 && (
                  <>
                    {result.metadata.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                      >
                        #{tag}
                      </span>
                    ))}
                    {result.metadata.tags.length > 3 && (
                      <span className="text-xs text-gray-400">
                        +{result.metadata.tags.length - 3} more
                      </span>
                    )}
                  </>
                )}

                {/* Last updated */}
                {result.metadata.last_updated && (
                  <span className="text-xs text-gray-400 ml-auto">
                    Updated {new Date(result.metadata.last_updated).toLocaleDateString()}
                  </span>
                )}
              </div>

              {/* Prerequisites indicator */}
              {result.metadata.prerequisites && result.metadata.prerequisites.length > 0 && (
                <div className="flex items-center text-xs text-orange-600">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Has prerequisites
                </div>
              )}

              {/* TODOs indicator */}
              {result.metadata.todos && result.metadata.todos.length > 0 && (
                <div className="flex items-center text-xs text-blue-600">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  {result.metadata.todos.length} todo{result.metadata.todos.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}