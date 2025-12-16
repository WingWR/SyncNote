// 前端文件编辑部分派生状态定义
import { computed } from 'vue'
import type { Document } from './types'

export function useDocumentGetters(state: {
  documents: { value: Document[] }
}) {
  const documentsWithPermission = computed(() => {
    return state.documents.value.filter(doc => doc.permission === 'write')
  })

  const documentsWithoutPermission = computed(() => {
    return state.documents.value.filter(
      doc => !doc.permission || doc.permission === 'read'
    )
  })

  return {
    documentsWithPermission,
    documentsWithoutPermission
  }
}
