'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MobileLayout from '@/components/layout/MobileLayout'

export default function AddPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('concepts')
  const [tags, setTags] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const categories = [
    { value: 'concepts', label: 'Concepts' },
    { value: 'products', label: 'Products' },
    { value: 'case-studies', label: 'Case Studies' },
    { value: 'paths', label: 'Learning Paths' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Create the file path based on category and title
      const fileName = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      const filePath = `${category}/${fileName}.md`

      // Create YAML front matter
      const frontMatter = [
        '---',
        `title: "${title}"`,
        `tags: [${tags.split(',').map(tag => `"${tag.trim()}"`).join(', ')}]`,
        `status: "draft"`,
        `last_updated: "${new Date().toISOString().split('T')[0]}"`,
        '---',
        '',
        content
      ].join('\n')

      const response = await fetch('/api/files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: filePath,
          content: frontMatter,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create file')
      }

      // Redirect to the new file
      router.push(`/file/${filePath}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <MobileLayout title="Add New Content">
      <div className="mobile-container py-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter a descriptive title"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <input
              type="text"
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter tags separated by commas"
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate multiple tags with commas (e.g., database, nosql, performance)
            </p>
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
              placeholder="Write your content in Markdown format..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Use Markdown syntax for formatting. The content will be saved with YAML front matter.
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed touch-target"
            >
              {loading ? 'Creating...' : 'Create File'}
            </button>
          </div>
        </form>
      </div>
    </MobileLayout>
  )
}