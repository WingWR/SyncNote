import type { Document, DocumentCollaborator } from '../../stores/document/types'

export interface CreateDocumentRequest {
  name: string
  type: 'txt' | 'md' | 'docx' | 'pptx'
}

export interface UpdateDocumentRequest {
  name?: string
}

export interface AddCollaboratorRequest {
  userId: number
  permission: 'read' | 'write'
}

// 如果需要，可以导出 Document、DocumentCollaborator
export type { Document, DocumentCollaborator }
