<template>
  <div class="h-full flex flex-col bg-white">
    <div class="flex items-center justify-between px-6 py-3 border-b border-gray-200">
      <div class="flex items-center gap-4">
        <h2 class="text-lg font-semibold text-gray-900">
          {{ documentStore.currentDocument?.fileName || '未命名文档' }}
        </h2>
        <span class="text-sm text-gray-500 uppercase">
          {{ documentStore.currentDocument?.fileType }}
        </span>
      </div>

      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2">
          <Users :size="18" class="text-gray-500" />
          <span class="text-sm text-gray-700">
            {{ onlineUsers.length }}
          </span>
          <div class="flex -space-x-2">
            <div v-for="(user, index) in onlineUsers.slice(0, 3)" :key="index"
              class="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold"
              :style="{ backgroundColor: user.color || '#3b82f6' }" :title="user.name">
              {{ user.name.charAt(0).toUpperCase() }}
            </div>
          </div>
        </div>

        <button @click="showShareDialog = true"
          class="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1">
          <Share2 :size="16" /> 分享
        </button>

        <button @click="showCollaboratorsDialog = true"
          class="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          管理协作者
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-auto p-6">
      <div v-if="documentStore.currentDocument?.fileType === 'md'" ref="mdEditorContainer"
        class="prose max-w-none focus:outline-none">
      </div>

      <textarea v-else-if="documentStore.currentDocument?.fileType === 'txt'" v-model="textContent"
        @input="handleTextInput" class="w-full h-full border-none outline-none resize-none font-mono text-sm"
        placeholder="开始输入...">
      </textarea>

      <div v-else class="flex items-center justify-center h-full text-gray-400">
        <p>正在初始化编辑器...</p>
      </div>
    </div>

    <CollaboratorsManagementDialog v-model:visible="showCollaboratorsDialog"
      :document-id="documentStore.currentDocument?.id || null"
      :document-owner-id="documentStore.currentDocument?.ownerId"
      :current-user-permission="documentStore.currentDocument?.permission" @refresh="refreshCollaborators" />

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { Users, Share2 } from 'lucide-vue-next'
import { useDocumentStore } from '../../stores/document'
import { useUserStore } from '../../stores/user'
import { getDocument, getCollaborators } from '../../api/document'

// 导入 Yjs 核心逻辑
import { useCollaborativeEditor } from './composables/useCollaborativeEditor'
import { useYMarkdownEditor } from './composables/useYMarkdownEditor'
import { useYTextEditor } from './composables/useYTextEditor'
import CollaboratorsManagementDialog from './components/CollaboratorsManagementDialog.vue'

const route = useRoute()
const docId = route.params.id as string
const documentStore = useDocumentStore()
const userStore = useUserStore()

// 1. 初始化协作底座 (Y.Doc 和 WebSocket)
const { ydoc, provider } = useCollaborativeEditor(docId)

// 2. 响应式变量
const editor = ref<any>(null)
const mdEditorContainer = ref<HTMLElement | null>(null)
const textContent = ref('')
const handleTextInput = ref<any>(() => { })
const onlineUsers = ref<any[]>([])

const showShareDialog = ref(false)
const showCollaboratorsDialog = ref(false)

// 3. 核心功能：初始化对应的编辑器逻辑
let currentMdHook: any = null
let currentTxtHook: any = null

const setupAwareness = () => {
  if (!provider) return

  provider.awareness.setLocalStateField('user', {
    name: userStore.currentUser?.username || '匿名用户',
    color: '#' + Math.floor(Math.random() * 16777215).toString(16)
  })

  provider.awareness.on('change', () => {
    const states = provider.awareness.getStates()
    // 转换为数组并过滤掉空值
    onlineUsers.value = Array.from(states.values())
      .map((s: any) => s.user)
      .filter(Boolean)
  })
}

async function initEditor() {
  const type = documentStore.currentDocument?.fileType

  if (type === 'md') {
    if (mdEditorContainer.value){
      currentMdHook = useYMarkdownEditor(mdEditorContainer.value, docId, ydoc, provider)
      await currentMdHook.init()
      editor.value = currentMdHook.editor.value
    }
  } else if (type === 'txt') {
    currentTxtHook = useYTextEditor(ydoc, docId)
    textContent.value = currentTxtHook.textContent.value
    handleTextInput.value = currentTxtHook.handleTextInput
  }
}

// 5. 加载文档及元数据
async function loadDocument() {
  try {
    const docResponse = await getDocument(docId)
    if (docResponse.code === 200) {
      documentStore.setCurrentDocument(docResponse.data)

      // 等待 Vue 更新 DOM，确保 v-if 里的 ref="mdEditorContainer" 可用
      await nextTick()
      await initEditor() // 初始化对应的 Yjs 编辑器
      setupAwareness()   // 初始化在线人数统计

      // 加载协作者列表 (用于管理对话框)
      const collabs = await getCollaborators(docId)
      if (collabs.code === 200) documentStore.setCollaborators(collabs.data)
    }
  } catch (error) {
    console.error('Document load error:', error)
  }
}

// 6. 同步纯文本变更
watch(() => currentTxtHook?.textContent.value, (newVal) => {
  if (newVal !== undefined) textContent.value = newVal
})

onMounted(() => {
  setupAwareness()
  loadDocument()
})

onUnmounted(() => {
  if (editor.value) {
    editor.value.destroy()
  }
  if (currentMdHook?.destroy) currentMdHook.destroy()
  if (currentTxtHook?.destroy) currentTxtHook.destroy()

  // 销毁 Yjs 连接
  if (provider) provider.destroy()
  if (ydoc) ydoc.destroy()
})

// 刷新协作者
async function refreshCollaborators() {
  if (!docId) return
  try {
    const res = await getCollaborators(docId)
    if (res.code === 200) {
      // 更新 Pinia Store 中的协作者数据，
      // 这样弹窗里的列表会自动更新
      documentStore.setCollaborators(res.data)
      console.log('协作者列表已更新')
    }
  } catch (error) {
    console.error('刷新协作者失败:', error)
  }
}
</script>