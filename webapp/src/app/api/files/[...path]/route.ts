import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params
    const filePath = pathSegments.join('/')
    
    // Construct the full path to the file (relative to project root)
    const fullPath = path.join(process.cwd(), '..', filePath)
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json(
        { error: 'File not found', message: `File ${filePath} does not exist` },
        { status: 404 }
      )
    }
    
    // Check if it's actually a file (not a directory)
    const stats = fs.statSync(fullPath)
    if (!stats.isFile()) {
      return NextResponse.json(
        { error: 'Not a file', message: `${filePath} is not a file` },
        { status: 400 }
      )
    }
    
    // Read the file content
    const fileContent = fs.readFileSync(fullPath, 'utf8')
    
    // Parse markdown with front matter
    const { data: metadata, content } = matter(fileContent)
    
    return NextResponse.json({
      path: filePath,
      metadata,
      content,
      rawContent: fileContent
    })
    
  } catch (error) {
    console.error('Error reading file:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to read file' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params
    const filePath = pathSegments.join('/')
    
    // Get the request body
    const body = await request.json()
    const { content, metadata } = body
    
    if (!content && content !== '') {
      return NextResponse.json(
        { error: 'Bad request', message: 'Content is required' },
        { status: 400 }
      )
    }
    
    // Construct the full path to the file (relative to project root)
    const fullPath = path.join(process.cwd(), '..', filePath)
    
    // Validate that the file exists
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json(
        { error: 'File not found', message: `File ${filePath} does not exist` },
        { status: 404 }
      )
    }
    
    // Check if it's actually a file (not a directory)
    const stats = fs.statSync(fullPath)
    if (!stats.isFile()) {
      return NextResponse.json(
        { error: 'Not a file', message: `${filePath} is not a file` },
        { status: 400 }
      )
    }
    
    let fileContent: string
    
    // If metadata is provided, combine it with content using gray-matter
    if (metadata) {
      // Update last_updated timestamp
      const updatedMetadata = {
        ...metadata,
        last_updated: new Date().toISOString().split('T')[0]
      }
      
      // Use gray-matter to stringify with front matter
      fileContent = matter.stringify(content, updatedMetadata)
    } else {
      // If no metadata provided, assume content includes front matter
      fileContent = content
    }
    
    // Write the file
    fs.writeFileSync(fullPath, fileContent, 'utf8')
    
    // Parse the saved content to return structured response
    const { data: savedMetadata, content: savedContent } = matter(fileContent)
    
    return NextResponse.json({
      path: filePath,
      metadata: savedMetadata,
      content: savedContent,
      rawContent: fileContent,
      message: 'File saved successfully'
    })
    
  } catch (error) {
    console.error('Error saving file:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to save file' },
      { status: 500 }
    )
  }
}