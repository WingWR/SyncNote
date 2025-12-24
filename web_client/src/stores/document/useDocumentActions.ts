// 前端文件编辑部分行为定义
import type { Document, DocumentCollaborator, DocumentError } from './types'

export function useDocumentActions(state: {
  documents: { value: Document[] }
  currentDocument: { value: Document | null }
  collaborators: { value: DocumentCollaborator[] }
  errors: { value: DocumentError[] }
  isLoading: { value: boolean }
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

  function removeDocument(docId: string) {
    state.documents.value = state.documents.value.filter(d => d.id !== docId)
  }

  function restoreDocument(docId: string) {
    const doc = state.documents.value.find(d => d.id === docId)
    if (doc) {
      doc.isDeleted = false
    }
  }

  // 错误状态管理 - 解耦错误处理逻辑
  function addError(error: Omit<DocumentError, 'timestamp'>) {
    const errorObj: DocumentError = {
      ...error,
      timestamp: new Date()
    }
    state.errors.value.push(errorObj)

    // 只保留最近10个错误
    if (state.errors.value.length > 10) {
      state.errors.value = state.errors.value.slice(-10)
    }
  }

  function clearErrors() {
    state.errors.value = []
  }

  function clearError(type: DocumentError['type']) {
    state.errors.value = state.errors.value.filter(e => e.type !== type)
  }

  function setLoading(loading: boolean) {
    state.isLoading.value = loading
  }

  return {
    setDocuments,
    setCurrentDocument,
    setCollaborators,
    addDocument,
    updateDocument,
    removeDocument,
    restoreDocument,
    // 错误处理方法
    addError,
    clearErrors,
    clearError,
    setLoading
  }
}
