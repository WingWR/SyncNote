<template>
  <div class="p-4 border-b border-gray-200">
    <h3 class="text-sm font-semibold text-gray-700 mb-3">工作区</h3>
    
    <!-- 有权限的文档 -->
    <div v-if="documentStore.documentsWithPermission.length > 0" class="mb-4">
      <h4 class="text-xs font-medium text-gray-500 mb-2">已开放权限</h4>
      <div class="space-y-1">
        <button
          v-for="doc in documentStore.documentsWithPermission"
          :key="doc.id"
          @click="openDocument(doc.id)"
          :class="[
            'w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center gap-2',
            currentDocId === doc.id
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-700 hover:bg-gray-100'
          ]"
        >
          <FileText :size="16" />
          <span class="flex-1 truncate">{{ doc.name }}</span>
          <span class="text-xs text-gray-400">{{ getFileTypeIcon(doc.type) }}</span>
        </button>
      </div>
    </div>

    <!-- 没有权限的文档 -->
    <div v-if="documentStore.documentsWithoutPermission.length > 0">
      <h4 class="text-xs font-medium text-gray-500 mb-2">只读权限</h4>
      <div class="space-y-1">
        <button
          v-for="doc in documentStore.documentsWithoutPermission"
          :key="doc.id"
          @click="openDocument(doc.id)"
          :class="[
            'w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center gap-2',
            currentDocId === doc.id
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-700 hover:bg-gray-100'
          ]"
        >
          <FileText :size="16" />
          <span class="flex-1 truncate">{{ doc.name }}</span>
          <Lock :size="14" class="text-gray-400" />
        </button>
      </div>
    </div>

    <!-- 空状态 -->
    <div
      v-if="documentStore.documents.length === 0"
      class="text-center py-8 text-gray-400 text-sm"
    >
      <FileText :size="32" class="mx-auto mb-2 opacity-50" />
      <p>暂无文档</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { FileText, Lock } from 'lucide-vue-next'
import { useDocumentStore } from '../stores/document'

const route = useRoute()
const router = useRouter()
const documentStore = useDocumentStore()

const currentDocId = computed(() => {
  const docId = route.params.id
  return docId ? parseInt(docId as string) : null
})

function getFileTypeIcon(type: string) {
  const icons: Record<string, string> = {
    txt: '.txt',
    md: '.md',
    docx: '.docx',
    pptx: '.pptx'
  }
  return icons[type] || ''
}

function openDocument(docId: number) {
  router.push(`/home/document/${docId}`)
}
</script>

