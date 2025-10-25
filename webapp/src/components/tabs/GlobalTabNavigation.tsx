'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'

const TerminalTab = dynamic(() => import('./TerminalTab'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-black text-white">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
    </div>
  )
})

const BrowseTab = dynamic(() => import('./BrowseTab'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
    </div>
  )
})

type TabType = 'terminal' | 'browse' | 'content'

interface GlobalTabNavigationProps {
  children?: React.ReactNode
  showContentTab?: boolean
  contentTabLabel?: string
}

export default function GlobalTabNavigation({ 
  children, 
  showContentTab = false,
  contentTabLabel = 'Content'
}: GlobalTabNavigationProps) {
  const [activeTab, setActiveTab] = useState<TabType>('terminal')
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
    
    // Set initial tab based on current route
    if (pathname === '/') {
      setActiveTab('terminal')
    } else if (pathname.startsWith('/browse')) {
      setActiveTab('browse')
    } else if (showContentTab) {
      setActiveTab('content')
    }
  }, [pathname, showContentTab])

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    
    // Navigate to appropriate route when switching tabs
    if (tab === 'terminal') {
      router.push('/')
    } else if (tab === 'browse') {
      router.push('/browse')
    }
    // For content tab, stay on current page
  }

  return (
    <div className="flex flex-col h-full">
      {/* Tab Navigation */}
      <div className="flex bg-white border-b border-gray-200 sticky top-0 z-10">
        <button
          onClick={() => handleTabChange('terminal')}
          className={`flex-1 py-3 px-4 text-center font-medium transition-colors touch-target ${
            activeTab === 'terminal'
              ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Terminal
        </button>
        <button
          onClick={() => handleTabChange('browse')}
          className={`flex-1 py-3 px-4 text-center font-medium transition-colors touch-target ${
            activeTab === 'browse'
              ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Browse
        </button>
        {showContentTab && (
          <button
            onClick={() => handleTabChange('content')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors touch-target ${
              activeTab === 'content'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {contentTabLabel}
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="flex-1 relative overflow-hidden">
        {mounted && (
          <>
            <div
              className="absolute inset-0"
              style={{ display: activeTab === 'terminal' ? 'block' : 'none' }}
            >
              <TerminalTab />
            </div>
            <div
              className="absolute inset-0"
              style={{ display: activeTab === 'browse' ? 'block' : 'none' }}
            >
              <BrowseTab />
            </div>
            {showContentTab && (
              <div
                className="absolute inset-0"
                style={{ display: activeTab === 'content' ? 'block' : 'none' }}
              >
                {children}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}