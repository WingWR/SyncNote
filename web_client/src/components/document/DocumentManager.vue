<template>
  <div class="flex flex-col h-full bg-gray-50">
    <!-- 顶部操作栏 -->
    <div class="bg-white border-b border-gray-200 shrink-0">
      <div class="p-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800">文档管理</h3>
          <button @click="() => toggleTrash()" :class="[
            'flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-all font-medium',
            showTrash
              ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
          ]">
            <TrashIcon :size="16" />
            {{ showTrash ? '返回文档' : '回收站' }}
          </button>
        </div>

        <!-- 操作按钮组 -->
        <div class="grid grid-cols-3 gap-2">
          <DocumentCreateButton @click="showCreateDialog = true" />
          <DocumentUploadButton @click="triggerUpload" />
          <DocumentJoinButton @click="showJoinDialog = true" />
        </div>
        <input type="file" ref="fileInputRef" class="hidden" accept=".txt,.md,.docx,.pptx" @change="handleUpload" />
      </div>
    </div>

    <!-- 文档列表区域 -->
    <div class="flex-1 overflow-hidden flex flex-col">
      <!-- 列表统计 -->
      <div class="px-4 py-3 bg-white border-b border-gray-200 shrink-0">
        <div class="flex items-center justify-between text-sm">
          <span class="text-gray-600">
            {{ showTrash ? '回收站' : '全部文档' }}
            <span class="ml-2 text-gray-400">({{ displayDocuments.length }})</span>
          </span>
          <button v-if="!loading && displayDocuments.length > 0" @click="() => loadDocuments(showTrash)"
            class="text-blue-600 hover:text-blue-700 text-xs flex items-center gap-1">
            <RefreshCwIcon :size="14" />
            刷新
          </button>
        </div>
      </div>

      <!-- 文档列表 -->
      <div class="flex-1 overflow-y-auto p-4">
        <!-- 加载状态 -->
        <div v-if="loading" class="flex flex-col items-center justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
          <p class="text-sm text-gray-500">加载中...</p>
        </div>

        <!-- 空状态 -->
        <div v-else-if="displayDocuments.length === 0" class="flex flex-col items-center justify-center py-12">
          <FileTextIcon :size="48" class="text-gray-300 mb-3" />
          <p class="text-sm text-gray-500 mb-1">{{ showTrash ? '回收站为空' : '还没有文档' }}</p>
          <p v-if="!showTrash" class="text-xs text-gray-400">点击上方按钮创建或上传文档</p>
        </div>

        <!-- 文档列表 -->
        <div v-else class="grid gap-3">
          <DocumentListItem
            v-for="doc in displayDocuments"
            :key="doc.id"
            :doc="doc"
            :show-trash="showTrash"
            @open="openDocument"
            @toggle-menu="toggleDocumentMenu"
          />
        </div>

      </div>
    </div>

    <!-- 对话框 -->
    <DocumentJoinDialog v-model:visible="showJoinDialog" v-model:documentId="documentIdInput" @join="joinDocument" />
    <DocumentCreateDialog v-model:visible="showCreateDialog" v-model:name="newDocumentName"
      v-model:type="newDocumentType" @create="createDocumentHandler" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import DocumentJoinButton from './controls/DocumentJoinButton.vue'
import DocumentCreateButton from './controls/DocumentCreateButton.vue'
import DocumentUploadButton from './controls/DocumentUploadButton.vue'
import DocumentJoinDialog from './dialogs/DocumentJoinDialog.vue'
import DocumentCreateDialog from './dialogs/DocumentCreateDialog.vue'
import DocumentListItem from './DocumentListItem.vue'
import { useDocumentManager } from '../../composables/document/useDocumentManager'
import { useDocumentActions } from '../../composables/document/useDocumentActions'
import { useDocumentStore } from '../../stores/document'
import { useGlobalDocumentMenuStore } from '../../stores/globalDocumentMenu'

// Icons
import {
  TrashIcon,
  FileTextIcon,
  RefreshCwIcon
} from 'lucide-vue-next'

const router = useRouter()
const documentStore = useDocumentStore()
const globalMenuStore = useGlobalDocumentMenuStore()

// 使用文档管理器
const {
  showJoinDialog,
  showCreateDialog,
  documentIdInput,
  newDocumentName,
  newDocumentType,
  fileInputRef,
  triggerUpload,
  handleUpload,
  joinDocument,
  createDocumentHandler
} = useDocumentManager()

// 使用文档操作
const { loading, loadDocuments, toggleTrash: toggleTrashAction } = useDocumentActions()

// 确保fileInputRef被使用（模板中作为ref使用）
console.log('fileInputRef initialized:', !!fileInputRef.value)

// 列表状态
const showTrash = ref(false)

// 计算属性
const displayDocuments = computed(() => {
  return showTrash.value
    ? documentStore.documents.filter(doc => doc.isDeleted)
    : documentStore.documents.filter(doc => !doc.isDeleted)
})

// 方法
const toggleTrash = async () => {
  showTrash.value = await toggleTrashAction(showTrash.value, loadDocuments)
}

const openDocument = (id: string) => {
  // 关闭全局操作菜单，确保菜单状态被正确清理
  globalMenuStore.hideMenu()

  // 使用nextTick确保状态更新后再跳转
  nextTick(() => {
    router.push(`/home/document/${id}`)
  })
}

const toggleDocumentMenu = (id: string, event?: Event) => {
  if (globalMenuStore.menuState.documentId === id) {
    globalMenuStore.hideMenu()
  } else {
    // 计算菜单位置
    if (event && event.target) {
      const rect = (event.target as HTMLElement).getBoundingClientRect()
      const position = {
        left: rect.right + 8,
        top: rect.top
      }
      globalMenuStore.showMenu(id, showTrash.value, position)
    }
  }
}



// 生命周期
onMounted(() => {
  loadDocuments()
})
</script>



