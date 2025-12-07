import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Document {
  id: number
  ownerId: number
  name: string
  type: 'txt' | 'md' | 'docx' | 'pptx'
  sizeBytes: number
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  permission?: 'read' | 'write'
}

export interface DocumentCollaborator {
  id: number
  documentId: number
  userId: number
  permission: 'read' | 'write'
  joinedAt: string
}

export const useDocumentStore = defineStore('document', () => {
  const documents = ref<Document[]>([])
  const currentDocument = ref<Document | null>(null)
  const collaborators = ref<DocumentCollaborator[]>([])

  const documentsWithPermission = computed(() => {
    return documents.value.filter(doc => doc.permission === 'write')
  })

  const documentsWithoutPermission = computed(() => {
    return documents.value.filter(doc => !doc.permission || doc.permission === 'read')
  })

  function setDocuments(docs: Document[]) {
    documents.value = docs
  }

  function setCurrentDocument(doc: Document | null) {
    currentDocument.value = doc
  }

  function setCollaborators(collabs: DocumentCollaborator[]) {
    collaborators.value = collabs
  }

  function addDocument(doc: Document) {
    documents.value.push(doc)
  }

  function updateDocument(doc: Document) {
    const index = documents.value.findIndex(d => d.id === doc.id)
    if (index !== -1) {
      documents.value[index] = doc
    }
  }

  function removeDocument(docId: number) {
    documents.value = documents.value.filter(d => d.id !== docId)
  }

  return {
    documents,
    currentDocument,
    collaborators,
    documentsWithPermission,
    documentsWithoutPermission,
    setDocuments,
    setCurrentDocument,
    setCollaborators,
    addDocument,
    updateDocument,
    removeDocument
  }
})


