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
      <!-- TipTap编辑器（用于.md格式） -->
      <div v-if="documentStore.currentDocument?.fileType === 'md'" class="prose max-w-none focus:outline-none">
        <editor-content :editor="editor" />
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
import { ref, onMounted, onUnmounted, watch, shallowRef } from 'vue'
import { nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { Users, Share2 } from 'lucide-vue-next'
import { useDocumentStore } from '../../stores/document'
import { useUserStore } from '../../stores/user'
import { getDocument, getCollaborators } from '../../api/document'

// 导入 TipTap 及相关扩展
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import { marked } from 'marked'

// 导入 Yjs 核心逻辑
import { useCollaborativeEditor } from './composables/useCollaborativeEditor'
import { useYjsAutoSave } from './composables/useYjsAutoSave'
import { useYTextEditor } from './composables/useYTextEditor'
import CollaboratorsManagementDialog from './components/CollaboratorsManagementDialog.vue'
import ShareLink from '../../components/document/ShareLink.vue'

const route = useRoute()
const docId = route.params.id as string
const documentStore = useDocumentStore()
const userStore = useUserStore()

// 1. 初始化协作底座 (Y.Doc 和 WebSocket)
const { ydoc, provider } = useCollaborativeEditor(docId)

// 2. 响应式变量
const editor = shallowRef<Editor | undefined>(undefined)
const textContent = ref('')
const handleTextInput = ref<any>(() => { })
const onlineUsers = ref<any[]>([])

const showShareDialog = ref(false)
const showCollaboratorsDialog = ref(false)

// 辅助函数：根据用户名生成颜色
function stringToColor(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 70%, 50%)`
}

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
  const username = userStore.currentUser?.username || 'Anonymous'

  if (type === 'md') {
    // 销毁旧的编辑器实例
    if (editor.value) {
      editor.value.destroy()
    }

    // 初始内容加载逻辑：如果 Yjs 文档为空且有 MinIO 内容 URL，则加载初始内容
    // 注意：这里使用不同的字段名，避免和 Collaboration 扩展冲突
    // Collaboration 扩展已经绑定了 'content' 字段，如果我们在同一个字段上操作 Text 类型可能会有冲突
    // 但实际上 Yjs 允许这样做，报错是因为在 initEditor 之前 ydoc 可能已经被 useYTextEditor 访问过 'content' 字段
    // 而 TipTap 的 Collaboration 扩展期望 'content' 是 XmlFragment 类型，但 useYTextEditor 把它当做 Text 类型
    // 解决方法：区分不同类型文档使用的 Yjs 字段名，或者在初始化前确保类型一致

    // 检查 ydoc 中 'content' 字段的类型
    // 如果之前被初始化为 Text (由 useYTextEditor)，这里初始化为 XmlFragment 会报错
    // 我们为 md 文档使用 'content-md' 字段，为 txt 文档使用 'content-txt' 字段，避免冲突

    // 初始化 TipTap 编辑器
    editor.value = new Editor({
      extensions: [
        StarterKit.configure({ history: false }), // 历史记录由 Yjs 接管
        Collaboration.configure({
          document: ydoc,
          field: 'content-xml' // 修改字段名，避免与 txt 模式的 Text 类型冲突
        }),
        CollaborationCursor.configure({
          provider,
          user: {
            name: username,
            color: stringToColor(username)
          }
        })
      ]
    })

    // 初始化自动保存
    const { destroy } = useYjsAutoSave(ydoc, docId)
    currentMdHook = { destroy }

    // 初始内容加载逻辑
    // 注意：Collaboration 扩展绑定的是 'content-xml' (XmlFragment)
    // 但我们检查初始内容时，可以检查这个 XmlFragment 是否为空
    const yXmlFragment = ydoc.getXmlFragment('content-xml')

    if (yXmlFragment.toJSON() === '' && documentStore.currentDocument?.contentUrl) {
      try {
        const res = await fetch(documentStore.currentDocument.contentUrl)
        if (res.ok) {
          const text = await res.text()
          // 使用 marked 解析 Markdown 为 HTML
          const html = await marked(text)
          // 注入内容，Collaboration 扩展会自动同步到 Yjs
          editor.value.commands.setContent(html)
        }
      } catch (e) {
        console.error('加载初始内容失败:', e)
      }
    }

  } else if (type === 'txt') {
    // txt 模式继续使用 content 字段 (Text 类型)
    // 或者为了彻底隔离，改用 content-txt
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
      documentStore.setCollaborators(res.data)
      console.log('协作者列表已更新')
    }
  } catch (error) {
    console.error('刷新协作者失败:', error)
  }
}
</script>

<style>
/* TipTap编辑器样式 */
.ProseMirror {
  outline: none;
  min-height: 100%;
}

.ProseMirror p {
  margin: 0.75em 0;
}

.ProseMirror h1,
.ProseMirror h2,
.ProseMirror h3 {
  font-weight: 600;
  margin-top: 1em;
  margin-bottom: 0.5em;
}

.ProseMirror h1 {
  font-size: 2em;
}

.ProseMirror h2 {
  font-size: 1.5em;
}

.ProseMirror h3 {
  font-size: 1.25em;
}

.ProseMirror ul,
.ProseMirror ol {
  padding-left: 1.5em;
  margin: 0.75em 0;
}

.ProseMirror code {
  background-color: #f3f4f6;
  padding: 0.2em 0.4em;
  border-radius: 0.25em;
  font-family: monospace;
}

.ProseMirror pre {
  background-color: #f3f4f6;
  padding: 1em;
  border-radius: 0.5em;
  overflow-x: auto;
  margin: 0.75em 0;
}

.ProseMirror pre code {
  background-color: transparent;
  padding: 0;
}
</style>