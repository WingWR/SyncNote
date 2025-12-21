<template>
  <div class="p-4">
    <!-- 加载状态 -->
    <div v-if="loading" class="flex items-center justify-center py-4">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      <span class="ml-2 text-sm text-gray-500">加载中...</span>
    </div>

    <!-- 文档列表 -->
    <DocumentList
      v-else
      :documentsWithPermission="documentsWithPermission"
      :documentsWithoutPermission="documentsWithoutPermission"
      :currentDocId="currentDocId"
      :openDocument="openDocument"
      :getFileTypeIcon="getFileTypeIcon"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import DocumentList from './DocumentList.vue'
import { useWorkspace } from '../../composables/workspace/useWorkspace'
import { useDocumentActions } from '../../composables/document/useDocumentActions'
import { useUserStore } from '../../stores/user'

const { documentStore, currentDocId, openDocument, getFileTypeIcon } = useWorkspace()
const { loading, loadDocuments } = useDocumentActions()
const userStore = useUserStore()

// 重新计算权限分组，基于所有者关系
const documentsWithPermission = computed(() => {
  return documentStore.documents.filter(doc => doc.ownerId === userStore.currentUser?.id)
})

const documentsWithoutPermission = computed(() => {
  return documentStore.documents.filter(doc => doc.ownerId !== userStore.currentUser?.id)
})

// 组件挂载时加载文档数据
onMounted(async () => {
  try {
    await loadDocuments()
  } catch (error) {
    console.error('Failed to load documents:', error)
  }
})

</script>
