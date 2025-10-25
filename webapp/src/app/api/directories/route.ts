import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dirPath = searchParams.get('path') || ''
    
    // Construct the full path to the directory (relative to project root)
    const fullPath = path.join(process.cwd(), '..', dirPath)
    
    // Check if directory exists
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json(
        { error: 'Directory not found', message: `Directory ${dirPath} does not exist` },
        { status: 404 }
      )
    }
    
    // Check if it's actually a directory
    const stats = fs.statSync(fullPath)
    if (!stats.isDirectory()) {
      return NextResponse.json(
        { error: 'Not a directory', message: `${dirPath} is not a directory` },
        { status: 400 }
      )
    }
    
    // Read directory contents
    const items = fs.readdirSync(fullPath)
    
    // Filter and categorize items
    const directoryContents = items
      .filter(item => !item.startsWith('.')) // Hide hidden files
      .map(item => {
        const itemPath = path.join(fullPath, item)
        const itemStats = fs.statSync(itemPath)
        const relativePath = path.join(dirPath, item)
        
        return {
          name: item,
          path: relativePath,
          type: itemStats.isDirectory() ? 'directory' : 'file',
          isMarkdown: item.endsWith('.md'),
          size: itemStats.size,
          modified: itemStats.mtime.toISOString()
        }
      })
      .sort((a, b) => {
        // Sort directories first, then files
        if (a.type !== b.type) {
          return a.type === 'directory' ? -1 : 1
        }
        return a.name.localeCompare(b.name)
      })
    
    return NextResponse.json({
      path: dirPath,
      contents: directoryContents
    })
    
  } catch (error) {
    console.error('Error reading directory:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to read directory' },
      { status: 500 }
    )
  }
}