'use client'

import { useRouter, usePathname } from 'next/navigation'

export default function GlobalTabBar() {
  const router = useRouter()
  const pathname = usePathname()

  const getActiveTab = () => {
    if (pathname === '/') return 'terminal'
    if (pathname.startsWith('/browse')) return 'browse'
    if (pathname.startsWith('/file/')) return 'file'
    return 'terminal'
  }

  const activeTab = getActiveTab()

  const handleTabClick = (tab: string) => {
    if (tab === 'terminal') {
      router.push('/')
    } else if (tab === 'browse') {
      router.push('/browse')
    }
  }

  return (
    <div className="flex bg-white border-b border-gray-200 sticky top-0 z-50">
      <button
        onClick={() => handleTabClick('terminal')}
        className={`flex-1 py-3 px-4 text-center font-medium transition-colors touch-target ${
          activeTab === 'terminal'
            ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Terminal
      </button>
      <button
        onClick={() => handleTabClick('browse')}
        className={`flex-1 py-3 px-4 text-center font-medium transition-colors touch-target ${
          activeTab === 'browse'
            ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Browse
      </button>
      {activeTab === 'file' && (
        <div className="flex-1 py-3 px-4 text-center font-medium text-primary-600 border-b-2 border-primary-600 bg-primary-50">
          File
        </div>
      )}
    </div>
  )
}