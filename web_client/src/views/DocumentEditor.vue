<template>
  <div class="h-full flex flex-col bg-white">
    <!-- 工具栏和协作信息 -->
    <div class="flex items-center justify-between px-6 py-3 border-b border-gray-200">
      <div class="flex items-center gap-4">
        <h2 class="text-lg font-semibold text-gray-900">
          {{ documentStore.currentDocument?.name || '未命名文档' }}
        </h2>
        <span class="text-sm text-gray-500">
          {{ documentStore.currentDocument?.type.toUpperCase() }}
        </span>
      </div>
      
      <div class="flex items-center gap-4">
        <!-- 协作人数显示 -->
        <div class="flex items-center gap-2">
          <Users :size="18" class="text-gray-500" />
          <span class="text-sm text-gray-700">
            {{ visibleCollaborators.length }}
            <span v-if="documentStore.collaborators.length > maxVisibleCollaborators">
              +{{ documentStore.collaborators.length - maxVisibleCollaborators }}
            </span>
          </span>
          <!-- 协作人头像 -->
          <div class="flex -space-x-2">
            <div
              v-for="(collab, index) in visibleCollaborators"
              :key="collab.id"
              class="w-6 h-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white text-xs"
              :title="`用户 ${collab.userId}`"
            >
              {{ index + 1 }}
            </div>
          </div>
        </div>
        
        <!-- 添加协作者按钮 -->
        <button
          @click="showAddCollaboratorDialog = true"
          class="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          添加协作者
        </button>
      </div>
    </div>

    <!-- 编辑器区域 -->
    <div class="flex-1 overflow-auto p-6">
      <!-- TipTap编辑器（用于.md格式） -->
      <div
        v-if="documentStore.currentDocument?.type === 'md'"
        ref="editorContainer"
        class="prose max-w-none focus:outline-none"
      ></div>
      
      <!-- 文本编辑器（用于.txt格式） -->
      <textarea
        v-else-if="documentStore.currentDocument?.type === 'txt'"
        v-model="textContent"
        @input="handleTextInput"
        class="w-full h-full border-none outline-none resize-none font-mono text-sm"
        placeholder="开始输入..."
      ></textarea>
      
      <!-- 其他格式提示 -->
      <div
        v-else
        class="flex items-center justify-center h-full text-gray-400"
      >
        <p>{{ documentStore.currentDocument?.type.toUpperCase() }} 格式的编辑功能正在开发中...</p>
      </div>
    </div>

    <!-- 添加协作者对话框 -->
    <div
      v-if="showAddCollaboratorDialog"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showAddCollaboratorDialog = false"
    >
      <div class="bg-white rounded-lg p-6 w-96">
        <h3 class="text-lg font-semibold mb-4">添加协作者</h3>
        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">用户ID</label>
            <input
              v-model.number="newCollaboratorUserId"
              type="number"
              placeholder="请输入用户ID"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">权限</label>
            <select
              v-model="newCollaboratorPermission"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="read">只读</option>
              <option value="write">可编辑</option>
            </select>
          </div>
        </div>
        <div class="flex gap-2 justify-end mt-4">
          <button
            @click="showAddCollaboratorDialog = false"
            class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            取消
          </button>
          <button
            @click="handleAddCollaborator"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            添加
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { Users } from 'lucide-vue-next'
import { useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { useDocumentStore } from '../stores/document'
import { documentApi } from '../api/document'
import { useUserStore } from '../stores/user'

const route = useRoute()
const documentStore = useDocumentStore()
const userStore = useUserStore()

const editorContainer = ref<HTMLElement | null>(null)
const textContent = ref('')
const showAddCollaboratorDialog = ref(false)
const newCollaboratorUserId = ref<number | null>(null)
const newCollaboratorPermission = ref<'read' | 'write'>('read')
const maxVisibleCollaborators = 5

let ydoc: Y.Doc | null = null
let provider: WebsocketProvider | null = null
let editor: ReturnType<typeof useEditor> | null = null

const visibleCollaborators = computed(() => {
  return documentStore.collaborators.slice(0, maxVisibleCollaborators)
})

// 加载文档
async function loadDocument() {
  const docId = parseInt(route.params.id as string)
  if (!docId) return

  try {
    const document = await documentApi.getDocument(docId)
    documentStore.setCurrentDocument(document)
    
    const collaborators = await documentApi.getCollaborators(docId)
    documentStore.setCollaborators(collaborators)
    
    // 初始化Y.js协同编辑
    if (document.type === 'md') {
      initCollaborativeEditor(docId)
    } else if (document.type === 'txt') {
      initTextEditor(docId)
    }
  } catch (error) {
    console.error('加载文档失败:', error)
  }
}

// 初始化Markdown协同编辑器
async function initCollaborativeEditor(docId: number) {
  await nextTick()
  if (!editorContainer.value) return

  ydoc = new Y.Doc()
  const ytext = ydoc.getText('content')
  
  // WebSocket连接（需要根据实际后端地址配置）
  const wsUrl = import.meta.env.VITE_WS_URL || `ws://localhost:8080/ws/document/${docId}`
  provider = new WebsocketProvider(wsUrl, `document-${docId}`, ydoc)

  editor = useEditor({
    element: editorContainer.value,
    extensions: [
      StarterKit,
      Collaboration.configure({
        document: ydoc
      }),
      CollaborationCursor.configure({
        provider,
        user: {
          name: userStore.currentUser?.username || 'Anonymous',
          color: '#3b82f6'
        }
      })
    ],
    content: ytext.toString()
  })
}

// 初始化文本编辑器
function initTextEditor(docId: number) {
  ydoc = new Y.Doc()
  const ytext = ydoc.getText('content')
  
  const wsUrl = import.meta.env.VITE_WS_URL || `ws://localhost:8080/ws/document/${docId}`
  provider = new WebsocketProvider(wsUrl, `document-${docId}`, ydoc)

  // 监听Y.js文本变化
  ytext.observe(() => {
    textContent.value = ytext.toString()
  })

  // 初始化内容
  textContent.value = ytext.toString()
}

// 处理文本输入
function handleTextInput() {
  if (!ydoc || !textContent.value) return
  
  const ytext = ydoc.getText('content')
  const currentContent = ytext.toString()
  
  if (textContent.value !== currentContent) {
    // 简单的同步逻辑（实际应该使用Y.js的更新机制）
    ytext.delete(0, currentContent.length)
    ytext.insert(0, textContent.value)
  }
}

// 添加协作者
async function handleAddCollaborator() {
  if (!newCollaboratorUserId.value || !documentStore.currentDocument) return

  try {
    await documentApi.addCollaborator(documentStore.currentDocument.id, {
      userId: newCollaboratorUserId.value,
      permission: newCollaboratorPermission.value
    })
    
    // 重新加载协作者列表
    const collaborators = await documentApi.getCollaborators(documentStore.currentDocument.id)
    documentStore.setCollaborators(collaborators)
    
    showAddCollaboratorDialog.value = false
    newCollaboratorUserId.value = null
  } catch (error) {
    console.error('添加协作者失败:', error)
    alert('添加协作者失败')
  }
}

watch(() => route.params.id, loadDocument, { immediate: true })

onMounted(() => {
  loadDocument()
})

onUnmounted(() => {
  if (editor?.value) {
    editor.value.destroy()
  }
  if (provider) {
    provider.destroy()
  }
  if (ydoc) {
    ydoc.destroy()
  }
})
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

