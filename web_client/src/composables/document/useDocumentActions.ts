import { ref } from 'vue'
import { useDocumentStore } from '../../stores/document'
import {
  getDocuments,
  getTrashDocuments,
  deleteDocument,
  permanentDeleteDocument
} from '../../api/document'

/**
 * 文档操作相关的业务逻辑
 */
export function useDocumentActions() {
  const documentStore = useDocumentStore()
  const loading = ref(false)

  /**
   * 加载文档列表
   */
  const loadDocuments = async (showTrash: boolean = false) => {
    documentStore.setLoading(true)

    try {
      const response = showTrash ? await getTrashDocuments() : await getDocuments()
      if (response.code === 200) {
        documentStore.setDocuments(response.data)
      } 
    } catch (error: any) {
      console.error('加载文档失败:', error)

      let errorMessage = '加载文档失败'
      if (error.code === 'ECONNABORTED') {
        errorMessage = '网络连接超时，请检查网络连接或稍后重试'
      } else if (error.response) {
        errorMessage = `服务器错误 (${error.response.status})`
      }

      // 不重新抛出错误，保持 composable 层稳定
    } finally {
      documentStore.setLoading(false)
    }
  }

  /**
   * 删除文档（移到回收站）
   */
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个文档吗？')) return

    try {
      const response = await deleteDocument(id)
      if (response.code === 200) {
        documentStore.removeDocument(id)
      } 
    } catch (error: any) {
      console.error('删除文档失败:', error)

      let errorMessage = '删除文档失败'
      if (error.code === 'ECONNABORTED') {
        errorMessage = '网络连接超时，删除操作可能未完成'
      }
    }
  }

  /**
   * 永久删除文档
   */
  const handlePermanentDelete = async (id: string) => {
    if (!confirm('确定要永久删除这个文档吗？此操作不可恢复！')) return

    try {
      const response = await permanentDeleteDocument(id)
      if (response.code === 200) {
        documentStore.removeDocument(id)
      } 
    } catch (error: any) {
      console.error('永久删除文档失败:', error)

      let errorMessage = '永久删除失败'
      if (error.code === 'ECONNABORTED') {
        errorMessage = '网络连接超时，永久删除操作可能未完成'
      }
    }
  }

  /**
   * 切换回收站视图
   */
  const toggleTrash = async (currentShowTrash: boolean, loadDocumentsFn: (showTrash: boolean) => Promise<void>) => {
    const newShowTrash = !currentShowTrash
    await loadDocumentsFn(newShowTrash)
    return newShowTrash
  }

  return {
    loading,
    loadDocuments,
    handleDelete,
    handlePermanentDelete,
    toggleTrash
  }
}
