<template>
  <div class="p-4 border-b border-gray-200">
    <h3 class="text-sm font-semibold text-gray-700 mb-3">文档管理</h3>
    <div class="space-y-2">
      <button
        @click="showJoinDialog = true"
        class="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <UserPlus :size="16" />
        <span>加入共享文件</span>
      </button>
      <button
        @click="showCreateDialog = true"
        class="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <FilePlus :size="16" />
        <span>新建文件</span>
      </button>
      <button
        @click="triggerFileUpload"
        class="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Upload :size="16" />
        <span>导入文件</span>
      </button>
      <input
        ref="fileInputRef"
        type="file"
        accept=".txt,.md,.docx,.pptx"
        class="hidden"
        @change="handleFileUpload"
      />
    </div>
  </div>

  <!-- 加入共享文件对话框 -->
  <div
    v-if="showJoinDialog"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click.self="showJoinDialog = false"
  >
    <div class="bg-white rounded-lg p-6 w-96">
      <h3 class="text-lg font-semibold mb-4">加入共享文件</h3>
      <input
        v-model="documentIdInput"
        type="text"
        placeholder="请输入文档ID"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
      />
      <div class="flex gap-2 justify-end">
        <button
          @click="showJoinDialog = false"
          class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          取消
        </button>
        <button
          @click="handleJoinDocument"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          加入
        </button>
      </div>
    </div>
  </div>

  <!-- 新建文件对话框 -->
  <div
    v-if="showCreateDialog"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click.self="showCreateDialog = false"
  >
    <div class="bg-white rounded-lg p-6 w-96">
      <h3 class="text-lg font-semibold mb-4">新建文件</h3>
      <input
        v-model="newDocumentName"
        type="text"
        placeholder="请输入文档名称"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3"
      />
      <select
        v-model="newDocumentType"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
      >
        <option value="txt">文本文件 (.txt)</option>
        <option value="md">Markdown (.md)</option>
        <option value="docx">Word文档 (.docx)</option>
        <option value="pptx">PowerPoint (.pptx)</option>
      </select>
      <div class="flex gap-2 justify-end">
        <button
          @click="showCreateDialog = false"
          class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          取消
        </button>
        <button
          @click="handleCreateDocument"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          创建
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { UserPlus, FilePlus, Upload } from 'lucide-vue-next'
import { useDocumentStore } from '../stores/document'
import { documentApi } from '../api/document'
import { useRouter } from 'vue-router'

const documentStore = useDocumentStore()
const router = useRouter()

const showJoinDialog = ref(false)
const showCreateDialog = ref(false)
const documentIdInput = ref('')
const newDocumentName = ref('')
const newDocumentType = ref<'txt' | 'md' | 'docx' | 'pptx'>('txt')
const fileInputRef = ref<HTMLInputElement | null>(null)

async function handleJoinDocument() {
  if (!documentIdInput.value) return
  
  try {
    const docId = parseInt(documentIdInput.value)
    const document = await documentApi.joinSharedDocument(docId)
    documentStore.addDocument(document)
    showJoinDialog.value = false
    documentIdInput.value = ''
    router.push(`/home/document/${document.id}`)
  } catch (error) {
    console.error('加入文档失败:', error)
    alert('加入文档失败，请检查文档ID是否正确')
  }
}

async function handleCreateDocument() {
  if (!newDocumentName.value.trim()) return

  try {
    const document = await documentApi.createDocument({
      name: newDocumentName.value,
      type: newDocumentType.value
    })
    documentStore.addDocument(document)
    showCreateDialog.value = false
    newDocumentName.value = ''
    router.push(`/home/document/${document.id}`)
  } catch (error) {
    console.error('创建文档失败:', error)
    alert('创建文档失败')
  }
}

function triggerFileUpload() {
  fileInputRef.value?.click()
}

async function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  try {
    const document = await documentApi.uploadDocument(file)
    documentStore.addDocument(document)
    router.push(`/home/document/${document.id}`)
  } catch (error) {
    console.error('上传文件失败:', error)
    alert('上传文件失败')
  }
}
</script>

