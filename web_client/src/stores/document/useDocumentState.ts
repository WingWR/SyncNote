// 前端文件编辑部分状态定义
import { ref } from 'vue'
import type { Document, DocumentCollaborator } from './types'

export interface DocumentError {
  type: 'load' | 'create' | 'delete' | 'update' | 'restore' | 'network'
  message: string
  timestamp: Date
}

export function useDocumentState() {
  const documents = ref<Document[]>([])
  const currentDocument = ref<Document | null>(null)
  const collaborators = ref<DocumentCollaborator[]>([])

  // 错误状态管理 - 解耦错误处理逻辑
  const errors = ref<DocumentError[]>([])
  const isLoading = ref(false)

  return {
    documents,
    currentDocument,
    collaborators,
    errors,
    isLoading
  }
}
