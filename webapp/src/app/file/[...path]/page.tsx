import FileViewerClient from './FileViewerClient'
import { KnowledgeFile } from '@/types/knowledge'

interface FilePageProps {
  params: Promise<{
    path: string[]
  }>
}

async function getFileContent(filePath: string): Promise<KnowledgeFile | null> {
  try {
    const baseUrl = process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : process.env.NEXT_PUBLIC_BASE_URL || ''

    const response = await fetch(`${baseUrl}/api/files/${filePath}`, {
      cache: 'no-store' // Always fetch fresh content
    })

    if (!response.ok) {
      console.error(`Failed to fetch file: ${response.status}`)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching file:', error)
    return null
  }
}

export default async function FilePage({ params }: FilePageProps) {
  const { path } = await params
  const filePath = path.join('/')

  const fileData = await getFileContent(filePath)

  if (!fileData) {
    return (
      <div className="mobile-container py-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-center py-8">
            <div className="text-red-500 text-4xl mb-4">📄</div>
            <h1 className="text-lg font-semibold text-gray-900 mb-2">
              File Not Found
            </h1>
            <p className="text-gray-600 mb-4">
              Could not load: {filePath}
            </p>
            <p className="text-sm text-gray-500">
              The file may not exist or there was an error loading it.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return <FileViewerClient initialFile={fileData} filePath={filePath} />
}