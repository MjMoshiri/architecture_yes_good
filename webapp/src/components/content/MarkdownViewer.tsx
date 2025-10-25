'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownViewerProps {
  content: string
  className?: string
}

export default function MarkdownViewer({ content, className = '' }: MarkdownViewerProps) {
  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          // Customize heading styles for mobile
          h1: ({ children }) => (
            <h1 className="text-xl font-bold text-gray-900 mb-4 mt-6 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-semibold text-gray-800 mb-3 mt-5">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-medium text-gray-700 mb-2 mt-4">
              {children}
            </h3>
          ),
          // Style paragraphs for mobile readability
          p: ({ children }) => (
            <p className="text-gray-700 mb-3 leading-relaxed">
              {children}
            </p>
          ),
          // Style lists
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-3 space-y-1 text-gray-700">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-3 space-y-1 text-gray-700">
              {children}
            </ol>
          ),
          // Style code blocks
          code: ({ children, ...props }) => {
            const inline = !props.className?.includes('language-')
            return inline ? (
              <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-gray-800">
                {children}
              </code>
            ) : (
              <code className="block bg-gray-100 p-3 rounded-lg text-sm font-mono text-gray-800 overflow-x-auto">
                {children}
              </code>
            )
          },
          // Style blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-200 pl-4 py-2 mb-3 bg-blue-50 text-gray-700 italic">
              {children}
            </blockquote>
          ),
          // Style links
          a: ({ href, children }) => (
            <a 
              href={href} 
              className="text-blue-600 underline hover:text-blue-800"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          // Style tables for mobile
          table: ({ children }) => (
            <div className="overflow-x-auto mb-3">
              <table className="min-w-full border border-gray-200 text-sm">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-gray-200 px-2 py-1 bg-gray-50 font-medium text-left">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-200 px-2 py-1">
              {children}
            </td>
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}