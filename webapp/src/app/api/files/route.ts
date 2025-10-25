import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { path: filePath, content } = body
    
    if (!filePath || !content) {
      return NextResponse.json(
        { error: 'Bad request', message: 'Path and content are required' },
        { status: 400 }
      )
    }
    
    // Construct the full path to the file (relative to project root)
    // In production, the knowledge base might be in a different location
    const knowledgeBaseRoot = process.env.KNOWLEDGE_BASE_ROOT || path.join(process.cwd(), '..')
    const fullPath = path.join(knowledgeBaseRoot, filePath)
    
    // Check if file already exists
    if (fs.existsSync(fullPath)) {
      return NextResponse.json(
        { error: 'File exists', message: `File ${filePath} already exists` },
        { status: 409 }
      )
    }
    
    // Ensure the directory exists
    const dirPath = path.dirname(fullPath)
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }
    
    // Write the file
    fs.writeFileSync(fullPath, content, 'utf8')
    
    return NextResponse.json({
      path: filePath,
      message: 'File created successfully'
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error creating file:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to create file' },
      { status: 500 }
    )
  }
}