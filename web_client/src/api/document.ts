import api from './index'
import type { Document, DocumentCollaborator } from '../stores/document/types'

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

export const documentApi = {
  getDocuments() {
    return api.get<Document[]>('/documents')
  },

  getDocument(id: number) {
    return api.get<Document>(`/documents/${id}`)
  },

  createDocument(data: CreateDocumentRequest) {
    return api.post<Document>('/documents', data)
  },

  updateDocument(id: number, data: UpdateDocumentRequest) {
    return api.put<Document>(`/documents/${id}`, data)
  },

  deleteDocument(id: number) {
    return api.delete(`/documents/${id}`)
  },

  getCollaborators(documentId: number) {
    return api.get<DocumentCollaborator[]>(`/documents/${documentId}/collaborators`)
  },

  addCollaborator(documentId: number, data: AddCollaboratorRequest) {
    return api.post<DocumentCollaborator>(`/documents/${documentId}/collaborators`, data)
  },

  removeCollaborator(documentId: number, userId: number) {
    return api.delete(`/documents/${documentId}/collaborators/${userId}`)
  },

  joinSharedDocument(documentId: number) {
    return api.post<Document>(`/documents/${documentId}/join`)
  },

  uploadDocument(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return api.post<Document>('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}


