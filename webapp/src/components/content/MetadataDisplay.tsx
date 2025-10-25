'use client'

interface MetadataDisplayProps {
  metadata: Record<string, unknown>
  className?: string
}

export default function MetadataDisplay({ metadata, className = '' }: MetadataDisplayProps) {
  if (!metadata || Object.keys(metadata).length === 0) {
    return null
  }

  const formatValue = (value: unknown): string => {
    if (Array.isArray(value)) {
      return value.join(', ')
    }
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2)
    }
    return String(value)
  }

  const getStatusColor = (status: unknown) => {
    const statusStr = typeof status === 'string' ? status.toLowerCase() : ''
    switch (statusStr) {
      case 'complete':
        return 'bg-green-100 text-green-800'
      case 'learning':
        return 'bg-yellow-100 text-yellow-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  return (
    <div className={`bg-gray-50 rounded-lg p-4 mb-4 ${className}`}>
      <h3 className="text-sm font-medium text-gray-700 mb-3">File Information</h3>
      
      <div className="space-y-2">
        {Object.entries(metadata).map(([key, value]) => (
          <div key={key} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide min-w-20">
              {key.replace(/_/g, ' ')}:
            </span>
            
            {key === 'status' ? (
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
                {formatValue(value)}
              </span>
            ) : key === 'tags' && Array.isArray(value) ? (
              <div className="flex flex-wrap gap-1">
                {value.map((tag, index) => (
                  <span 
                    key={index}
                    className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : key === 'todos' && Array.isArray(value) ? (
              <div className="space-y-1">
                {value.map((todo, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-orange-500 text-xs mt-0.5">•</span>
                    <span className="text-sm text-gray-700">{todo}</span>
                  </div>
                ))}
              </div>
            ) : key === 'prerequisites' && Array.isArray(value) ? (
              <div className="space-y-1">
                {value.map((prereq, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-purple-500 text-xs mt-0.5">→</span>
                    <span className="text-sm text-gray-700">{prereq}</span>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-sm text-gray-700 break-words">
                {formatValue(value)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}