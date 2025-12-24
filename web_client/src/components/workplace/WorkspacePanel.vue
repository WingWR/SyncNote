<template>
  <div class="p-4">
    <!-- 加载状态 -->
    <div v-if="documentStore.isLoading" class="flex items-center justify-center py-4">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      <span class="ml-2 text-sm text-gray-500">加载中...</span>
    </div>

    <!-- 错误提示 -->
    <div v-else-if="documentStore.errors.length > 0" class="mb-4">
      <div class="bg-red-50 border border-red-200 rounded-md p-3">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">
              加载文档失败
            </h3>
            <div class="mt-2 text-sm text-red-700">
              <ul class="list-disc pl-5 space-y-1">
                <li v-for="error in documentStore.errors.filter(e => e.type === 'load')" :key="error.timestamp">
                  {{ error.message }}
                </li>
              </ul>
            </div>
            <div class="mt-4">
              <div class="-mx-2 -my-1.5 flex">
                <button
                  @click="retryLoadDocuments"
                  class="bg-red-50 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                >
                  重试
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 文档列表 -->
    <DocumentList
      v-else-if="!documentStore.isLoading && documentStore.errors.filter(e => e.type === 'load').length === 0"
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

// 重试加载文档
async function retryLoadDocuments() {
  await loadDocuments()
}

// 组件挂载时加载文档数据
onMounted(async () => {
  await loadDocuments()
})

</script>
