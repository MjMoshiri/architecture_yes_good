'use client'

import { useState, useEffect } from 'react'
import MobileLayout from '@/components/layout/MobileLayout'
import SearchResults from '@/components/search/SearchResults'
import SearchInput from '@/components/search/SearchInput'

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

interface SearchResponse {
  query: string
  results: SearchResult[]
  total: number
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      setHasSearched(false)
      return
    }

    setLoading(true)
    setError(null)
    setHasSearched(true)

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=20`)
      
      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data: SearchResponse = await response.json()
      setResults(data.results)
    } catch {
      setError('Failed to search. Please try again.')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query !== '') {
        performSearch(query)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery)
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    setHasSearched(false)
    setError(null)
  }

  return (
    <MobileLayout title="Search Knowledge Base">
      <div className="mobile-container py-4">
        <SearchInput
          value={query}
          onChange={handleSearch}
          onClear={handleClear}
          loading={loading}
        />

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {loading && (
          <div className="mt-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-4 shadow-sm border animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && hasSearched && results.length === 0 && (
          <div className="mt-8 text-center">
            <div className="text-gray-400 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-gray-500">No results found for &ldquo;{query}&rdquo;</p>
            <p className="text-gray-400 text-sm mt-1">Try different keywords or check your spelling</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <SearchResults results={results} query={query} />
        )}

        {!hasSearched && !loading && (
          <div className="mt-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Search Your Knowledge Base</h2>
            <p className="text-gray-500 text-sm">
              Enter keywords to find relevant content from your knowledge files
            </p>
          </div>
        )}
      </div>
    </MobileLayout>
  )
}