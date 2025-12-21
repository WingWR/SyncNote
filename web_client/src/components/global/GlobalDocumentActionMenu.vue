<template>
  <DocumentActionMenu
    :visible="globalMenuStore.menuState.visible"
    :document-id="globalMenuStore.menuState.documentId"
    :show-trash="globalMenuStore.menuState.showTrash"
    :position="globalMenuStore.menuState.position"
    @open="handleOpen"
    @delete="handleDelete"
    @restore="handleRestore"
    @permanent-delete="handlePermanentDelete"
  />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useDocumentStore } from '../../stores/document'
import { useGlobalDocumentMenuStore } from '../../stores/globalDocumentMenu'
import { useDocumentActions } from '../../composables/document/useDocumentActions'
import { deleteDocument, permanentDeleteDocument, restoreDocument } from '../../api/document'
import DocumentActionMenu from '../document/DocumentActionMenu.vue'

const router = useRouter()
const documentStore = useDocumentStore()
const globalMenuStore = useGlobalDocumentMenuStore()
const { loadDocuments } = useDocumentActions()

const handleOpen = (id: string) => {
  globalMenuStore.hideMenu()
  router.push(`/home/document/${id}`)
}

const handleDelete = async (id: string) => {
  if (!confirm('确定要删除这个文档吗？')) return

  try {
    const response = await deleteDocument(id)
    if (response.code === 200) {
      documentStore.removeDocument(id)
    } else {
      alert(response.message || '删除失败')
    }
  } catch (error) {
    console.error('删除文档失败:', error)
    alert('删除失败')
  }
  globalMenuStore.hideMenu()
}

const handleRestore = async (id: string) => {
  if (!confirm('确定要恢复这个文档吗？')) return

  try {
    const response = await restoreDocument(id)
    if (response.code === 200) {
      // 更新前端状态
      documentStore.restoreDocument(id)
      // 刷新文档列表以显示恢复的文档
      await loadDocuments(false)
    } else {
      alert(response.message || '恢复失败')
    }
  } catch (error) {
    console.error('恢复文档失败:', error)
    alert('恢复失败')
  }
  globalMenuStore.hideMenu()
}

const handlePermanentDelete = async (id: string) => {
  if (!confirm('确定要永久删除这个文档吗？此操作不可恢复！')) return

  try {
    const response = await permanentDeleteDocument(id)
    if (response.code === 200) {
      documentStore.removeDocument(id)
    } else {
      alert(response.message || '永久删除失败')
    }
  } catch (error) {
    console.error('永久删除文档失败:', error)
    alert('永久删除失败')
  }
  globalMenuStore.hideMenu()
}
</script>
