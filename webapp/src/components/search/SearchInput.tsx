'use client'

import { useState, useRef } from 'react'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
  loading?: boolean
  placeholder?: string
}

export default function SearchInput({
  value,
  onChange,
  onClear,
  loading = false,
  placeholder = "Search knowledge base..."
}: SearchInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const handleClear = () => {
    onClear()
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      inputRef.current?.blur()
    }
  }

  return (
    <div className="relative">
      <div className={`
        relative flex items-center bg-white rounded-lg border-2 transition-colors
        ${isFocused ? 'border-primary-500' : 'border-gray-200'}
        ${loading ? 'opacity-75' : ''}
      `}>
        {/* Search Icon */}
        <div className="absolute left-3 text-gray-400">
          {loading ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={loading}
          className="
            w-full pl-10 pr-10 py-3 text-base
            bg-transparent border-none outline-none
            placeholder-gray-400 text-gray-900
            touch-target
          "
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />

        {/* Clear Button */}
        {value && (
          <button
            onClick={handleClear}
            disabled={loading}
            className="
              absolute right-3 p-1 text-gray-400 hover:text-gray-600
              transition-colors touch-target
            "
            aria-label="Clear search"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Search Suggestions or Recent Searches could go here */}
    </div>
  )
}