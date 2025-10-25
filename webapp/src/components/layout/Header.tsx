'use client'

interface HeaderProps {
  title: string
  showBack?: boolean
  onBack?: () => void
  actions?: React.ReactNode
}

export default function Header({ title, showBack = false, onBack, actions }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 pt-safe-top">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left side - Back button or spacer */}
        <div className="flex items-center">
          {showBack && (
            <button
              onClick={onBack}
              className="touch-target -ml-2 mr-2 text-primary-600"
              aria-label="Go back"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Center - Title */}
        <h1 className="text-lg font-semibold text-gray-900 truncate">
          {title}
        </h1>
        
        {/* Right side - Actions */}
        <div className="flex items-center">
          {actions}
        </div>
      </div>
    </header>
  )
}