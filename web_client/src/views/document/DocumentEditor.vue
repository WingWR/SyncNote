<template>
  <div class="h-full flex flex-col bg-white">
    <!-- 工具栏和协作信息 -->
    <div class="flex items-center justify-between px-6 py-3 border-b border-gray-200">
      <div class="flex items-center gap-4">
        <h2 class="text-lg font-semibold text-gray-900">
          {{ documentStore.currentDocument?.fileName || '未命名文档' }}
        </h2>
        <span class="text-sm text-gray-500">
          {{ documentStore.currentDocument?.fileType.toUpperCase() }}
        </span>
      </div>

      <div class="flex items-center gap-3">
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
            <div v-for="(collab, index) in visibleCollaborators" :key="collab.id"
              class="w-6 h-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white text-xs"
              :title="`用户 ${collab.userId}`">
              {{ index + 1 }}
            </div>
          </div>
        </div>

        <!-- 分享按钮 -->
        <button @click="showShareDialog = true"
          class="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1">
          <Share2 :size="16" />
          分享
        </button>

        <!-- 管理协作者按钮 -->
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
        placeholder="开始输入..."></textarea>

      <!-- 其他格式提示 -->
      <div v-else class="flex items-center justify-center h-full text-gray-400">
        <p>{{ documentStore.currentDocument?.fileType.toUpperCase() }} 格式的编辑功能正在开发中...</p>
      </div>
    </div>

    <!-- 分享链接对话框 -->
    <div v-if="showShareDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showShareDialog = false">
      <div class="bg-white rounded-lg p-6 w-[500px]">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold flex items-center gap-2">
            <Share2 :size="20" class="text-green-600" />
            分享文档
          </h3>
          <button @click="showShareDialog = false" class="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <p class="text-sm text-gray-600 mb-2">
              任何拥有此链接的人都可以通过该链接加入为协作者（只读权限）
            </p>
            <div class="flex gap-2">
              <input :value="shareLink" readonly
                class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 font-mono" />
              <button @click="copyShareLink"
                class="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap">
                复制链接
              </button>
            </div>
          </div>

          <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p class="text-xs text-blue-800">
              <strong>提示：</strong>通过链接加入的用户默认获得只读权限，您可以在"管理协作者"中调整权限。
            </p>
          </div>
        </div>

        <div class="flex justify-end mt-4">
          <button @click="showShareDialog = false"
            class="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            关闭
          </button>
        </div>
      </div>
    </div>

    <!-- 协作者管理对话框 -->
    <CollaboratorsManagementDialog v-model:visible="showCollaboratorsDialog"
      :document-id="documentStore.currentDocument?.id || null"
      :document-owner-id="documentStore.currentDocument?.ownerId"
      :current-user-permission="documentStore.currentDocument?.permission"
      @add-collaborator="showAddCollaboratorDialog = true" @refresh="refreshCollaborators" />

    <!-- 添加协作者对话框 -->
    <div v-if="showAddCollaboratorDialog"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showAddCollaboratorDialog = false">
      <div class="bg-white rounded-lg p-6 w-96">
        <h3 class="text-lg font-semibold mb-4">添加协作者</h3>
        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">用户ID</label>
            <input v-model.number="newCollaboratorUserId" type="number" placeholder="请输入用户ID"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">权限</label>
            <select v-model="newCollaboratorPermission" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="read">只读</option>
              <option value="write">可编辑</option>
            </select>
          </div>
        </div>
        <div class="flex gap-2 justify-end mt-4">
          <button @click="showAddCollaboratorDialog = false"
            class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            取消
          </button>
          <button @click="handleAddCollaborator" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
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
import { Users, Share2 } from 'lucide-vue-next'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { debounce } from 'lodash-es'
import { useDocumentStore } from '../../stores/document/index'
import { useSidebarStore } from '../../stores/sidebar'
import { getDocument, getCollaborators, addCollaborator } from '../../api/document'
import CollaboratorsManagementDialog from './components/CollaboratorsManagementDialog.vue'
import { marked } from 'marked'

const route = useRoute()
const documentStore = useDocumentStore()
const sidebarStore = useSidebarStore()

const textContent = ref('')
const isSaving = ref(false) // 用于在界面上显示“保存中...”状态
const showCollaboratorsDialog = ref(false)
const showAddCollaboratorDialog = ref(false)
const showShareDialog = ref(false)
const newCollaboratorUserId = ref<string | null>(null)
const newCollaboratorPermission = ref<'READ' | 'WRITE'>('READ')
const maxVisibleCollaborators = 5
const shareLink = computed(() => {
  if (!documentStore.currentDocument) return ''
  const baseUrl = window.location.origin
  return `${baseUrl}/home/document/join/${documentStore.currentDocument.id}`
})

/**
 * 核心保存函数
 * 逻辑：将当前内容同步到后端或 MinIO
 */
async function saveDocumentContent() {
  if (!documentStore.currentDocument) return

  isSaving.value = true
  try {
    const content = textContent.value
    console.log('正在自动保存内容至后端...', content)

    // TODO: 调用修改文档 API，例如：
    // await uploadToMinIO(documentStore.currentDocument.id, content)

    console.log('保存成功')
  } catch (error) {
    console.error('自动保存失败:', error)
  } finally {
    isSaving.value = false
  }
}

/**
 * 创建防抖版本的保存函数
 * 特点：只有在停止输入 1000ms (1秒) 后才会执行
 */
const debouncedSave = debounce(() => {
  saveDocumentContent()
}, 1000)

const editor = useEditor({
  extensions: [StarterKit],
  content: '', // 给用户一个加载提示，避免纯白屏
  // 当编辑器内容发生变化时触发
  onUpdate: () => {
    // 如果是单机模式，我们把 HTML 转回 Markdown 存储
    // 如果是协同模式，通常由后端通过 Y-js 直接持久化，前端可能不需要手动保存
    debouncedSave()
  }
})
const visibleCollaborators = computed(() => {
  return documentStore.collaborators.slice(0, maxVisibleCollaborators)
})


// 加载文档
async function loadDocument() {
  const docId = route.params.id as string
  if (!docId) return

  try {
    const docResponse = await getDocument(docId)
    if (docResponse.code === 200) {
      documentStore.setCurrentDocument(docResponse.data)

      const collaboratorsResponse = await getCollaborators(docId)
      if (collaboratorsResponse.code === 200) {
        documentStore.setCollaborators(collaboratorsResponse.data)
      }

      // 初始化编辑器（暂时关闭协同编辑，直接从 MinIO 加载内容） TODO: 恢复协同编辑
      if (docResponse.data.fileType === 'md') {
        initCollaborativeEditor(docResponse.data.contentUrl)
      } else if (docResponse.data.fileType === 'txt') {
        initTextEditor(docResponse.data.contentUrl)
      }
    } else {
      alert(docResponse.message || '加载文档失败')
    }
  } catch (error) {
    console.error('加载文档失败:', error)
    alert('加载文档失败')
  }
}

// 初始化Markdown编辑器（协同编辑暂时注释，直接加载 MinIO 内容） TODO: 使用 Y.js 进行协同
async function initCollaborativeEditor(contentUrl?: string) {
  await nextTick()
  if (!editor.value) {
    console.warn('Tiptap 实例尚未就绪，稍后重试...')
    return
  }

  let initialContent = ''
  if (contentUrl) {
    try {
      const response = await fetch(contentUrl)
      if (response.ok) {
        initialContent = await response.text()
      }
    } catch (error) {
      console.error('加载 MinIO 初始内容失败:', error)
    }
  }
  try {
    // 3. 异步兼容处理：不管 marked 返回是 string 还是 Promise<string>
    // 使用 await 都能确保拿到的 html 是最终的字符串
    const html = await marked(initialContent)

    // 4. 内容注入
    editor.value.commands.setContent(html)

  } catch (parseError) {
    console.error('Markdown 解析失败:', parseError)
  }
}

// 初始化文本编辑器（协同编辑暂时注释，直接加载 MinIO 内容） TODO: 使用 Y.js 进行协同
function initTextEditor(contentUrl?: string) {
  textContent.value = ''
  if (contentUrl) {
    try {
      fetch(contentUrl)
        .then((resp) => (resp.ok ? resp.text() : Promise.resolve('')))
        .then((text) => {
          textContent.value = text || ''
        })
        .catch((error) => {
          console.error('加载 MinIO 初始内容失败:', error)
        })
    } catch (error) {
      console.error('加载 MinIO 初始内容失败:', error)
    }
  }
}

// 处理文本输入
function handleTextInput() {
  // 本地编辑，无协同同步（后续接入 Y.js 同步） TODO: 同步到后端
}

// 添加协作者
async function handleAddCollaborator() {
  if (!newCollaboratorUserId.value || !documentStore.currentDocument) return

  try {
    const response = await addCollaborator(documentStore.currentDocument.id, {
      userId: newCollaboratorUserId.value,
      permission: newCollaboratorPermission.value
    })

    if (response.code === 200) {
      // 重新加载协作者列表
      await refreshCollaborators()

      showAddCollaboratorDialog.value = false
      newCollaboratorUserId.value = null
      newCollaboratorPermission.value = 'READ'
    } else {
      alert(response.message || '添加协作者失败')
    }
  } catch (error) {
    console.error('添加协作者失败:', error)
    alert('添加协作者失败')
  }
}

// 刷新协作者列表
async function refreshCollaborators() {
  if (!documentStore.currentDocument) return

  try {
    const collaboratorsResponse = await getCollaborators(documentStore.currentDocument.id)
    if (collaboratorsResponse.code === 200) {
      documentStore.setCollaborators(collaboratorsResponse.data)
    }
  } catch (error) {
    console.error('刷新协作者列表失败:', error)
  }
}

// 复制分享链接
function copyShareLink() {
  if (!shareLink.value) return

  navigator.clipboard.writeText(shareLink.value).then(() => {
    alert('分享链接已复制到剪贴板！')
  }).catch((error) => {
    console.error('复制失败:', error)
    // 备用方案：使用传统方法
    const textarea = document.createElement('textarea')
    textarea.value = shareLink.value
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    try {
      document.execCommand('copy')
      alert('分享链接已复制到剪贴板！')
    } catch (err) {
      alert('复制失败，请手动复制链接')
    }
    document.body.removeChild(textarea)
  })
}

watch(() => route.params.id, loadDocument, { immediate: true })

onMounted(() => {
  // 进入编辑器时关闭sidebar面板，避免操作菜单被覆盖
  sidebarStore.closePanel()
  loadDocument()
})

onUnmounted(() => {
  if (editor?.value) {
    editor.value.destroy()
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
