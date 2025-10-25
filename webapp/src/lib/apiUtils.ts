import { NextResponse } from 'next/server'

export interface ApiError {
  error: string
  message: string
  code?: string
  details?: unknown
}

export function createErrorResponse(
  error: string,
  message: string,
  status: number,
  code?: string,
  details?: unknown
): NextResponse<ApiError> {
  const errorResponse: ApiError = {
    error,
    message,
    ...(code && { code }),
    ...(details && { details })
  }
  
  return NextResponse.json(errorResponse, { status })
}

export function handleApiError(error: unknown, context: string): NextResponse<ApiError> {
  console.error(`API Error in ${context}:`, error)
  
  if (error instanceof Error) {
    // Handle known error types
    if (error.message.includes('ENOENT')) {
      return createErrorResponse(
        'File not found',
        'The requested file or directory does not exist',
        404,
        'FILE_NOT_FOUND'
      )
    }
    
    if (error.message.includes('EACCES')) {
      return createErrorResponse(
        'Permission denied',
        'Insufficient permissions to access the resource',
        403,
        'PERMISSION_DENIED'
      )
    }
    
    if (error.message.includes('EMFILE') || error.message.includes('ENFILE')) {
      return createErrorResponse(
        'Resource exhausted',
        'Too many files open, please try again later',
        503,
        'RESOURCE_EXHAUSTED'
      )
    }
  }
  
  // Generic server error
  return createErrorResponse(
    'Internal server error',
    'An unexpected error occurred',
    500,
    'INTERNAL_ERROR',
    process.env.NODE_ENV === 'development' ? error : undefined
  )
}

export function validateRequest(body: unknown, requiredFields: string[]): string | null {
  if (!body || typeof body !== 'object') {
    return 'Request body is required and must be an object'
  }
  
  const bodyObj = body as Record<string, unknown>
  
  for (const field of requiredFields) {
    if (!(field in bodyObj) || bodyObj[field] === undefined || bodyObj[field] === null) {
      return `Field '${field}' is required`
    }
  }
  
  return null
}

export function sanitizePath(pathSegments: string[]): string {
  // Remove any path traversal attempts
  const sanitized = pathSegments
    .filter(segment => segment !== '..' && segment !== '.')
    .join('/')
  
  return sanitized
}