import type { Metadata, Viewport } from 'next'
import './globals.css'
import GlobalTabBar from '@/components/tabs/GlobalTabBar'

export const metadata: Metadata = {
  title: 'Knowledge Base Mobile',
  description: 'Mobile-friendly knowledge base webapp',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Knowledge Base',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#3b82f6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body>
        <div className="h-screen-safe bg-gray-50 flex flex-col">
          <GlobalTabBar />
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}