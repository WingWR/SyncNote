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

    <!-- 编辑器区域 -->
    <div class="flex-1 overflow-auto p-6">
      <div v-if="documentStore.currentDocument?.fileType === 'md'" ref="mdEditorContainer"
        class="prose max-w-none focus:outline-none">
      </div>

      <!-- 文本编辑器（用于.txt格式） -->
      <textarea v-else-if="documentStore.currentDocument?.fileType === 'txt'" v-model="textContent"
        @input="handleTextInput" class="w-full h-full border-none outline-none resize-none font-mono text-sm"
        placeholder="开始输入...">
      </textarea>

      <!-- 其他格式提示 -->
      <div v-else class="flex items-center justify-center h-full text-gray-400">
        <p>正在初始化编辑器...</p>
      </div>
    </div>

    <!-- 分享链接对话框 -->
    <ShareLink v-model:visible="showShareDialog" :document-id="documentStore.currentDocument?.id || ''" />

    <CollaboratorsManagementDialog v-model:visible="showCollaboratorsDialog"
      :document-id="documentStore.currentDocument?.id || null"
      :document-owner-id="documentStore.currentDocument?.ownerId"
      :current-user-permission="documentStore.currentDocument?.permission" @refresh="refreshCollaborators" />

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch} from 'vue'
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
import ShareLink from '../../components/document/ShareLink.vue'

const route = useRoute()
const documentStore = useDocumentStore()
const userStore = useUserStore()

// 协作编辑器状态
let ydoc: any = null
let provider: any = null
let docId = route.params.id as string

// 初始化协作底座的函数
async function initCollaborativeEditor(editorDocId: string) {
  const result = useCollaborativeEditor(editorDocId)
  ydoc = result.ydoc
  provider = result.provider
  docId = editorDocId

  // 手动初始化协作连接
  await result.loadHistoryAndConnect()
  return result
}

// 1. 初始化协作底座 (Y.Doc 和 WebSocket)
initCollaborativeEditor(docId)

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

  // 确保协作编辑器已初始化
  if (!ydoc || !provider) {
    throw new Error('协作编辑器未初始化，无法创建编辑器实例')
  }

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
    // 确保协作编辑器已初始化
    if (!ydoc || !provider) {
      await initCollaborativeEditor(docId)
    }

    const docResponse = await getDocument(docId)
    if (docResponse.code === 200) {
      documentStore.setCurrentDocument(docResponse.data)

      await nextTick()
      await initEditor() // 初始化对应的 Yjs 编辑器
      setupAwareness()   // 初始化在线人数统计

      // 加载协作者列表 (用于管理对话框)
      const collabs = await getCollaborators(docId)
      if (collabs.code === 200) documentStore.setCollaborators(collabs.data)

      // 调试：检查 DOM 结构
      await nextTick()
      console.log('🔍 DOM 检查:')
      console.log('mdEditorContainer:', mdEditorContainer.value)
      console.log('mdEditorContainer children:', mdEditorContainer.value?.children)
      console.log('是否有 ProseMirror 类:', mdEditorContainer.value?.querySelector('.ProseMirror'))
    }
  } catch (error) {
    console.error('Document load error:', error)
  }
}

// 6. 同步纯文本变更
watch(() => currentTxtHook?.textContent.value, (newVal) => {
  if (newVal !== undefined) textContent.value = newVal
})

// 清理编辑器和协作连接的函数
async function cleanupEditor() {
  // 清理编辑器实例
  if (editor.value) {
    editor.value.destroy()
    editor.value = null
  }
  if (currentMdHook?.destroy) currentMdHook.destroy()
  if (currentTxtHook?.destroy) currentTxtHook.destroy()

  // 清理Yjs连接和awareness监听器
  if (provider) {
    // 清理awareness监听器
    if (provider.awareness) {
      provider.awareness.off('change')
    }
    provider.disconnect()
    provider.destroy()
  }
  if (ydoc) {
    ydoc.destroy()
  }

  // 重置状态
  currentMdHook = null
  currentTxtHook = null
  onlineUsers.value = []
  ydoc = null
  provider = null
}

// 监听路由参数变化，当文档ID变化时重新加载文档
watch(() => route.params.id, async (newId, oldId) => {
  if (newId && newId !== oldId) {
    console.log('文档ID变化，从', oldId, '到', newId)

    // 清理旧的编辑器实例和协作连接
    await cleanupEditor()

    // 更新文档ID并重新加载文档
    docId = newId as string
    await loadDocument()
  }
})

onMounted(async () => {
  await loadDocument()
})

onUnmounted(() => {
  cleanupEditor()
})

// 刷新协作者
async function refreshCollaborators() {
  if (!docId) return
  try {
    const res = await getCollaborators(docId)
    if (res.code === 200) {
      documentStore.setCollaborators(res.data)
      console.log('协作者列表已更新')
    }
  } catch (error) {
    console.error('刷新协作者失败:', error)
  }
}
</script>

<style scoped>
/* 使用 :deep() 让样式穿透到 TipTap 生成的元素 */
:deep(.ProseMirror) {
  outline: none !important;
  border: none !important;
  min-height: 100%;
  padding: 0;
}

:deep(.ProseMirror:focus) {
  outline: none !important;
  box-shadow: none !important;
}

/* 段落样式 */
:deep(.ProseMirror p) {
  margin: 1em 0;
  line-height: 1.6;
  color: #374151;
}

:deep(.ProseMirror p:first-child) {
  margin-top: 0;
}

:deep(.ProseMirror p:last-child) {
  margin-bottom: 0;
}

/* 标题样式 */
:deep(.ProseMirror h1) {
  font-size: 2.25em;
  font-weight: 700;
  margin: 1em 0 0.5em 0;
  line-height: 1.2;
  color: #111827;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 0.3em;
}

:deep(.ProseMirror h2) {
  font-size: 1.875em;
  font-weight: 700;
  margin: 1em 0 0.5em 0;
  line-height: 1.3;
  color: #111827;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.3em;
}

:deep(.ProseMirror h3) {
  font-size: 1.5em;
  font-weight: 600;
  margin: 1em 0 0.5em 0;
  line-height: 1.4;
  color: #111827;
}

:deep(.ProseMirror h4) {
  font-size: 1.25em;
  font-weight: 600;
  margin: 1em 0 0.5em 0;
  line-height: 1.4;
  color: #374151;
}

:deep(.ProseMirror h5) {
  font-size: 1.125em;
  font-weight: 600;
  margin: 1em 0 0.5em 0;
  line-height: 1.4;
  color: #374151;
}

:deep(.ProseMirror h6) {
  font-size: 1em;
  font-weight: 600;
  margin: 1em 0 0.5em 0;
  line-height: 1.4;
  color: #6b7280;
}

/* 有序列表 */
:deep(.ProseMirror ol) {
  list-style-type: decimal;
  padding-left: 2em;
  margin: 1em 0;
  color: #374151;
}

:deep(.ProseMirror ol ol) {
  list-style-type: lower-alpha;
}

:deep(.ProseMirror ol ol ol) {
  list-style-type: lower-roman;
}

/* 无序列表 */
:deep(.ProseMirror ul) {
  list-style-type: disc;
  padding-left: 2em;
  margin: 1em 0;
  color: #374151;
}

:deep(.ProseMirror ul ul) {
  list-style-type: circle;
}

:deep(.ProseMirror ul ul ul) {
  list-style-type: square;
}

/* 列表项 */
:deep(.ProseMirror li) {
  margin: 0.25em 0;
  line-height: 1.6;
}

:deep(.ProseMirror li > p) {
  margin: 0;
}

/* 代码块 */
:deep(.ProseMirror pre) {
  background-color: #1f2937;
  color: #f3f4f6;
  padding: 1em;
  border-radius: 0.5em;
  overflow-x: auto;
  margin: 1em 0;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.875em;
  line-height: 1.5;
}

:deep(.ProseMirror pre code) {
  background: none;
  color: inherit;
  padding: 0;
  font-size: inherit;
}

/* 行内代码 */
:deep(.ProseMirror code) {
  background-color: #f3f4f6;
  color: #e11d48;
  padding: 0.2em 0.4em;
  border-radius: 0.25em;
  font-size: 0.875em;
  font-family: 'Courier New', Courier, monospace;
}

/* 引用块 */
:deep(.ProseMirror blockquote) {
  border-left: 4px solid #3b82f6;
  padding-left: 1em;
  margin: 1em 0;
  color: #6b7280;
  font-style: italic;
  background-color: #f9fafb;
  padding: 0.5em 1em;
  border-radius: 0 0.25em 0.25em 0;
}

/* 文本格式 */
:deep(.ProseMirror strong) {
  font-weight: 700;
  color: #111827;
}

:deep(.ProseMirror em) {
  font-style: italic;
}

:deep(.ProseMirror s) {
  text-decoration: line-through;
  color: #9ca3af;
}

/* 水平分割线 */
:deep(.ProseMirror hr) {
  border: none;
  border-top: 2px solid #e5e7eb;
  margin: 2em 0;
}

/* 链接 */
:deep(.ProseMirror a) {
  color: #3b82f6;
  text-decoration: underline;
  cursor: pointer;
}

:deep(.ProseMirror a:hover) {
  color: #2563eb;
}

/* 协作光标样式 */
:deep(.collaboration-cursor__caret) {
  position: relative;
  margin-left: -1px;
  margin-right: -1px;
  border-left: 2px solid;
  word-break: normal;
  pointer-events: none;
}

:deep(.collaboration-cursor__label) {
  position: absolute;
  top: -1.4em;
  left: -1px;
  font-size: 10px;
  font-style: normal;
  font-weight: 600;
  line-height: 1;
  user-select: none;
  white-space: nowrap;
  padding: 2px 4px;
  border-radius: 3px;
  pointer-events: none;
  z-index: 10;
}
</style>
