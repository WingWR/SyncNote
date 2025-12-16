import api from '../index'
import type {
  Document,
  DocumentCollaborator,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  AddCollaboratorRequest
} from './types'

export function getDocuments() {
  return api.get<Document[]>('/documents')
}

export function getDocument(id: number) {
  return api.get<Document>(`/documents/${id}`)
}

export function createDocument(data: CreateDocumentRequest) {
  return api.post<Document>('/documents', data)
}

export function updateDocument(id: number, data: UpdateDocumentRequest) {
  return api.put<Document>(`/documents/${id}`, data)
}

export function deleteDocument(id: number) {
  return api.delete(`/documents/${id}`)
}

export function getCollaborators(documentId: number) {
  return api.get<DocumentCollaborator[]>(`/documents/${documentId}/collaborators`)
}

export function addCollaborator(documentId: number, data: AddCollaboratorRequest) {
  return api.post<DocumentCollaborator>(`/documents/${documentId}/collaborators`, data)
}

export function removeCollaborator(documentId: number, userId: number) {
  return api.delete(`/documents/${documentId}/collaborators/${userId}`)
}

export function joinSharedDocument(documentId: number) {
  return api.post<Document>(`/documents/${documentId}/join`)
}

export function uploadDocument(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return api.post<Document>('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
