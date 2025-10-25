'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

const navigationItems = [
  {
    name: 'Search',
    href: '/search',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    name: 'Browse',
    href: '/browse',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
      </svg>
    ),
  },
  {
    name: 'Terminal',
    href: '/terminal',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    name: 'Add',
    href: '/add',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
]

export default function NavigationBar() {
  const pathname = usePathname()

  return (
    <nav className="bg-white border-t border-gray-200 pb-safe-bottom">
      <div className="flex justify-around max-w-md mx-auto">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center py-2 px-1 xs:px-3 touch-target min-w-0 flex-1 transition-colors ${
                isActive
                  ? 'text-primary-600'
                  : 'text-gray-500 hover:text-gray-700 active:text-gray-800'
              }`}
              aria-label={`Navigate to ${item.name}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="mb-1" aria-hidden="true">
                {item.icon}
              </div>
              <span className="text-xs font-medium truncate w-full text-center">
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}