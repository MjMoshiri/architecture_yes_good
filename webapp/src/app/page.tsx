'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import MobileLayout from '@/components/layout/MobileLayout'

const TerminalTab = dynamic(() => import('@/components/tabs/TerminalTab'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-black text-white">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
    </div>
  )
})

export default function HomePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="h-full">
      {mounted && <TerminalTab />}
    </div>
  )
}