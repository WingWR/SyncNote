// 前端文件编辑部分行为定义
import type { Document, DocumentCollaborator } from './types'

export function useDocumentActions(state: {
  documents: { value: Document[] }
  currentDocument: { value: Document | null }
  collaborators: { value: DocumentCollaborator[] }
}) {
  function setDocuments(docs: Document[]) {
    state.documents.value = docs
  }

  function setCurrentDocument(doc: Document | null) {
    state.currentDocument.value = doc
  }

  function setCollaborators(collabs: DocumentCollaborator[]) {
    state.collaborators.value = collabs
  }

  function addDocument(doc: Document) {
    state.documents.value.push(doc)
  }

  function updateDocument(doc: Document) {
    const index = state.documents.value.findIndex(d => d.id === doc.id)
    if (index !== -1) {
      state.documents.value[index] = doc
    }
  }

  function removeDocument(docId: number) {
    state.documents.value = state.documents.value.filter(d => d.id !== docId)
  }

  return {
    setDocuments,
    setCurrentDocument,
    setCollaborators,
    addDocument,
    updateDocument,
    removeDocument
  }
}
