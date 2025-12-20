<template>
  <div class="flex flex-col h-full bg-gray-50">
    <!-- 顶部操作栏 -->
    <div class="bg-white border-b border-gray-200 shrink-0">
      <div class="p-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800">文档管理</h3>
          <button @click="toggleTrash" :class="[
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
          <button v-if="!loading && displayDocuments.length > 0" @click="loadDocuments"
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

        <!-- 文档卡片列表 -->
        <div v-else class="grid gap-3">
          <div v-for="doc in displayDocuments" :key="doc.id"
            class="group relative bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer overflow-hidden"
            @click="!showTrash && openDocument(doc.id)">

            <!-- 文档卡片内容 -->
            <div class="p-4">
              <div class="flex gap-3">
                <!-- 文件图标 -->
                <div :class="[
                  'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                  getFileTypeColor(doc.fileType)
                ]">
                  <component :is="getFileIcon(doc.fileType)" :size="16" class="text-white" />
                </div>

                <!-- 文档信息 -->
                <div class="flex-1 min-w-0">
                  <!-- 第一行：文件名和文件类型 -->
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2 flex-1 min-w-0">
                      <h5 class="text-sm font-semibold text-gray-900 truncate leading-tight" :title="doc.fileName">
                        {{ doc.fileName }}
                      </h5>
                      <span class="inline-block text-xs text-gray-500 uppercase bg-gray-100 px-2 py-0.5 rounded shrink-0">
                        {{ doc.fileType }}
                      </span>
                    </div>

                    <!-- 操作按钮 -->
                    <button @click.stop="toggleDocumentMenu(doc.id, $event)"
                      class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors opacity-0 group-hover:opacity-100">
                      <MoreVerticalIcon :size="18" />
                    </button>
                  </div>

                  <!-- 第二行：文件大小、创建时间和权限状态 -->
                  <div class="flex items-start justify-between">
                    <!-- 左侧：文件大小和创建时间（与图标左边界对齐） -->
                    <div class="flex flex-col gap-1 text-xs text-gray-500 -ml-11 pl-11">
                      <span class="flex items-center gap-1">
                        <FileTextIcon :size="12" />
                        {{ formatFileSize(doc.fileSize) }}
                      </span>
                      <span class="flex items-center gap-1">
                        <ClockIcon :size="12" />
                        {{ formatDate(doc.updatedAt) }}
                      </span>
                    </div>

                    <!-- 右侧：权限状态 -->
                    <div v-if="doc.permission" class="flex flex-col items-center gap-0.5 self-start">
                      <component :is="doc.permission === 'WRITE' ? EditIcon : EyeIcon" :size="14" :class="[
                        doc.permission === 'WRITE' ? 'text-green-600' : 'text-blue-600'
                      ]" />
                      <span :class="[
                        'text-xs font-medium',
                        doc.permission === 'WRITE' ? 'text-green-700' : 'text-blue-700'
                      ]">
                        {{ doc.permission === 'WRITE' ? '可编辑' : '只读' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 操作菜单 -->
            <div v-if="activeDocumentMenu === doc.id"
              class="fixed w-40 bg-white rounded-lg shadow-xl border border-gray-200 z-[1000] overflow-hidden"
              :style="{ left: menuPosition.left + 'px', top: menuPosition.top + 'px' }">
              <div class="py-1">
                <button v-if="!showTrash" @click.stop="openDocument(doc.id)"
                  class="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                  <EditIcon :size="16" />
                  打开编辑
                </button>

                <button v-if="!showTrash" @click.stop="handleDelete(doc.id)"
                  class="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100">
                  <TrashIcon :size="16" />
                  移至回收站
                </button>

                <button v-if="showTrash" @click.stop="handlePermanentDelete(doc.id)"
                  class="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                  <XIcon :size="16" />
                  永久删除
                </button>
              </div>
            </div>
          </div>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import DocumentJoinButton from './controls/DocumentJoinButton.vue'
import DocumentCreateButton from './controls/DocumentCreateButton.vue'
import DocumentUploadButton from './controls/DocumentUploadButton.vue'
import DocumentJoinDialog from './dialogs/DocumentJoinDialog.vue'
import DocumentCreateDialog from './dialogs/DocumentCreateDialog.vue'
import { useDocumentManager } from '../../composables/document/useDocumentManager'
import { useDocumentStore } from '../../stores/document'
import {
  getDocuments,
  getTrashDocuments,
  deleteDocument,
  permanentDeleteDocument
} from '../../api/document'

// Icons
import {
  FileTextIcon,
  MoreVerticalIcon,
  EditIcon,
  EyeIcon,
  TrashIcon,
  XIcon,
  ClockIcon,
  RefreshCwIcon
} from 'lucide-vue-next'

const router = useRouter()
const documentStore = useDocumentStore()

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

// 确保fileInputRef被使用（模板中作为ref使用）
console.log('fileInputRef initialized:', !!fileInputRef.value)

// 列表状态
const loading = ref(false)
const showTrash = ref(false)
const activeDocumentMenu = ref<string | null>(null)
const menuPosition = ref({ left: 0, top: 0 })

// 计算属性
const displayDocuments = computed(() => {
  return showTrash.value
    ? documentStore.documents.filter(doc => doc.isDeleted)
    : documentStore.documents.filter(doc => !doc.isDeleted)
})

// 方法
const loadDocuments = async () => {
  loading.value = true
  try {
    const response = showTrash.value ? await getTrashDocuments() : await getDocuments()
    if (response.code === 200) {
      documentStore.setDocuments(response.data)
    }
  } catch (error) {
    console.error('加载文档失败:', error)
  } finally {
    loading.value = false
  }
}

const toggleTrash = () => {
  showTrash.value = !showTrash.value
  loadDocuments()
}

const openDocument = (id: string) => {
  router.push(`/home/document/${id}`)
}

const toggleDocumentMenu = (id: string, event?: Event) => {
  if (activeDocumentMenu.value === id) {
    activeDocumentMenu.value = null
  } else {
    activeDocumentMenu.value = id
    // 计算菜单位置
    if (event && event.target) {
      const rect = (event.target as HTMLElement).getBoundingClientRect()
      menuPosition.value = {
        left: rect.right + 8,
        top: rect.top
      }
    }
  }
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
  activeDocumentMenu.value = null
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
  activeDocumentMenu.value = null
}

const getFileIcon = (_fileType: string) => {
  return FileTextIcon // 简化处理，都使用文件图标
}

const getFileTypeColor = (fileType: string) => {
  const colors: Record<string, string> = {
    'txt': 'bg-gray-500',
    'md': 'bg-blue-500',
    'docx': 'bg-indigo-500',
    'pptx': 'bg-orange-500'
  }
  return colors[fileType] || 'bg-gray-500'
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`

  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 点击外部关闭菜单
const handleClickOutside = () => {
  activeDocumentMenu.value = null
}

// 生命周期
onMounted(() => {
  loadDocuments()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
