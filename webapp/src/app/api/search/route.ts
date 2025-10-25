import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import Fuse from 'fuse.js'

interface SearchResult {
  id: string
  title: string
  path: string
  score: number
  metadata: {
    tags?: string[]
    status?: 'draft' | 'learning' | 'complete'
    last_updated?: string
    prerequisites?: string[]
    todos?: string[]
  }
  excerpt: string
}

interface KnowledgeFile {
  id: string
  title: string
  path: string
  content: string
  metadata: Record<string, unknown>
}

// Get the knowledge base root directory (parent of webapp)
const KNOWLEDGE_BASE_ROOT = path.join(process.cwd(), '..')

function getAllMarkdownFiles(dir: string, baseDir: string = KNOWLEDGE_BASE_ROOT): KnowledgeFile[] {
  const files: KnowledgeFile[] = []
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      const relativePath = path.relative(baseDir, fullPath)
      
      // Skip webapp directory and other non-content directories
      if (entry.name === 'webapp' || entry.name === '.git' || entry.name === 'node_modules' || entry.name === '.next') {
        continue
      }
      
      if (entry.isDirectory()) {
        files.push(...getAllMarkdownFiles(fullPath, baseDir))
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        try {
          const fileContent = fs.readFileSync(fullPath, 'utf-8')
          const { data: metadata, content } = matter(fileContent)
          
          files.push({
            id: relativePath,
            title: metadata.title || entry.name.replace('.md', ''),
            path: relativePath,
            content,
            metadata
          })
        } catch (error) {
          console.error(`Error reading file ${fullPath}:`, error)
        }
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error)
  }
  
  return files
}

function createExcerpt(content: string, query: string, maxLength: number = 200): string {
  const queryLower = query.toLowerCase()
  const contentLower = content.toLowerCase()
  
  // Find the first occurrence of the query
  const index = contentLower.indexOf(queryLower)
  
  if (index === -1) {
    // If query not found, return beginning of content
    return content.substring(0, maxLength) + (content.length > maxLength ? '...' : '')
  }
  
  // Extract context around the match
  const start = Math.max(0, index - 50)
  const end = Math.min(content.length, index + query.length + 150)
  
  let excerpt = content.substring(start, end)
  
  if (start > 0) excerpt = '...' + excerpt
  if (end < content.length) excerpt = excerpt + '...'
  
  return excerpt
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
    }
    
    // Get all markdown files
    const allFiles = getAllMarkdownFiles(KNOWLEDGE_BASE_ROOT)
    
    // Configure Fuse.js for fuzzy search
    const fuse = new Fuse(allFiles, {
      keys: [
        { name: 'title', weight: 0.4 },
        { name: 'content', weight: 0.3 },
        { name: 'metadata.tags', weight: 0.2 },
        { name: 'path', weight: 0.1 }
      ],
      threshold: 0.6,
      includeScore: true,
      minMatchCharLength: 2
    })
    
    // Perform search
    const searchResults = fuse.search(query, { limit })
    
    // Format results
    const results: SearchResult[] = searchResults.map((result) => ({
      id: result.item.id,
      title: result.item.title,
      path: result.item.path,
      score: 1 - (result.score || 0), // Convert to relevance score (higher is better)
      metadata: {
        tags: Array.isArray(result.item.metadata.tags) ? result.item.metadata.tags as string[] : [],
        status: result.item.metadata.status as 'draft' | 'learning' | 'complete' | undefined,
        last_updated: result.item.metadata.last_updated as string | undefined,
        prerequisites: Array.isArray(result.item.metadata.prerequisites) ? result.item.metadata.prerequisites as string[] : undefined,
        todos: Array.isArray(result.item.metadata.todos) ? result.item.metadata.todos as string[] : undefined
      },
      excerpt: createExcerpt(result.item.content, query)
    }))
    
    return NextResponse.json({
      query,
      results,
      total: results.length
    })
    
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}