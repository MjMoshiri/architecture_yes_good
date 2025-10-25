export interface KnowledgeFile {
  path: string;
  metadata: {
    title?: string;
    tags?: string[];
    prerequisites?: string[];
    status?: 'draft' | 'learning' | 'complete';
    last_updated?: string;
    todos?: string[];
    [key: string]: unknown;
  };
  content: string;
  rawContent: string;
}

export interface SearchResult {
  id: string;
  title: string;
  path: string;
  score: number;
  metadata: {
    tags: string[];
    status: 'draft' | 'learning' | 'complete';
    last_updated: string;
    prerequisites?: string[];
    todos?: string[];
  };
  excerpt: string;
}

export interface DirectoryNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: DirectoryNode[];
}

export interface ErrorResponse {
  error: string;
  message: string;
  code?: number;
  details?: object;
}