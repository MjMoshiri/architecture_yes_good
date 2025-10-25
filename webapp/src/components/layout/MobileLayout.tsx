'use client'

import { ReactNode } from 'react'
import Header from './Header'
import NavigationBar from './NavigationBar'

interface MobileLayoutProps {
  children: ReactNode
  title?: string
  showNavigation?: boolean
}

export default function MobileLayout({
  children,
  title = 'Knowledge Base',
  showNavigation = true
}: MobileLayoutProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <Header title={title} />

      {/* Main content area */}
      <main className="flex-1 overflow-auto pb-safe-bottom">
        {children}
      </main>

      {/* Bottom navigation */}
      {showNavigation && <NavigationBar />}
    </div>
  )
}