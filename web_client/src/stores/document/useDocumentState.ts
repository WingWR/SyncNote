// 前端文件编辑部分状态定义
import { ref } from 'vue'
import type { Document, DocumentCollaborator } from './types'

export function useDocumentState() {
  const documents = ref<Document[]>([])
  const currentDocument = ref<Document | null>(null)
  const collaborators = ref<DocumentCollaborator[]>([])

  return {
    documents,
    currentDocument,
    collaborators
  }
}
