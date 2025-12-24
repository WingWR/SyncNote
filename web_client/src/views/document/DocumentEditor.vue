<template>
  <div class="h-full flex flex-col bg-white">
    <!-- 文档标题和工具栏区域 -->
    <EditorToolbar
      :max-visible-collaborators="5"
      :online-users="onlineUsers"
      @show-add-dialog="showCollaboratorsDialog = true"
      @show-share-dialog="showShareDialog = true"
      @ai-continue="handleAIContinue"
      @ai-polish="handleAIPolish"
    />

    <!-- 编辑器区域 -->
      <div class="flex-1 overflow-auto p-6">
        <!-- TipTap编辑器（用于.md格式） -->
        <div v-if="documentStore.currentDocument?.fileType === 'md'" class="prose max-w-none focus:outline-none">
          <editor-content :editor="editor" />
        </div>

        <!-- 文本编辑器（用于.txt格式） -->
        <textarea v-else-if="documentStore.currentDocument?.fileType === 'txt'" ref="textareaRef" v-model="textContent"
          @input="handleTextInput" class="w-full h-full border-none outline-none resize-none font-mono text-sm"
          placeholder="开始输入...">
        </textarea>

      <!-- 其他格式提示 -->
      <div v-else class="flex items-center justify-center h-full text-gray-400">
        <p>正在初始化编辑器...</p>
      </div>
    </div>

    <!-- AI临时编辑控件 -->
    <AITemporaryEditControls
      v-if="aiStore.temporaryEdit && aiStore.temporaryEdit.documentId === docId"
      :temp-edit="aiStore.temporaryEdit"
      :model-name="aiStore.currentModel?.name"
      :insertion-point="getInsertionPointForControls()"
      :editor-element="getEditorElement()"
      :tiptap-editor="editor"
      :text-editor-hook="getTextEditorHook()"
      @accepted="handleAITempEditAccepted"
      @rejected="handleAITempEditRejected"
    />

    <!-- 分享链接对话框 -->
    <ShareLink v-model:visible="showShareDialog" :document-id="documentStore.currentDocument?.id || ''" />

    <CollaboratorsManagementDialog v-model:visible="showCollaboratorsDialog"
      :document-id="documentStore.currentDocument?.id || null"
      :document-owner-id="documentStore.currentDocument?.ownerId"
      :current-user-permission="documentStore.currentDocument?.permission" @refresh="refreshCollaborators" />

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, shallowRef, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useDocumentStore } from '../../stores/document'
import { useUserStore } from '../../stores/user'
import { getDocument, getCollaborators } from '../../api/document'

// 导入 TipTap 及相关扩展
import { Editor, EditorContent } from '@tiptap/vue-3'

// 导入 Yjs 核心逻辑
import { useCollaborativeEditor } from './composables/useCollaborativeEditor'
import { useYMarkdownEditor } from './composables/useYMarkdownEditor'
import { useYTextEditor } from './composables/useYTextEditor'
import { useAIEditBridge } from './composables/useAIEditBridge'
import { useAIStore } from '../../stores/ai'
import { useAIChat } from '../../composables/ai/useAIChat'
import CollaboratorsManagementDialog from './components/CollaboratorsManagementDialog.vue'
import ShareLink from '../../components/document/ShareLink.vue'
import EditorToolbar from './components/EditorToolbar.vue'
import AITemporaryEditControls from './components/AITemporaryEditControls.vue'

const route = useRoute()
const docId = ref(route.params.id as string)
const documentStore = useDocumentStore()
const userStore = useUserStore()
const aiStore = useAIStore()

// 1. 初始化协作底座 (Y.Doc 和 WebSocket)
const { ydoc, provider, loadHistoryAndConnect } = useCollaborativeEditor(docId.value)

// 2. 响应式变量
const editor = shallowRef<Editor | undefined>(undefined)
const textContent = ref('')
const handleTextInput = ref<any>(() => { })
const onlineUsers = ref<any[]>([])

const showShareDialog = ref(false)
const showCollaboratorsDialog = ref(false)

// 引用编辑器元素
const textareaRef = ref<HTMLTextAreaElement | null>(null)

// 3. 核心功能：初始化对应的编辑器逻辑
let currentMdHook: any = null
let currentTxtHook: any = null

const setupAwareness = () => {
  if (!provider) return

  provider.awareness.setLocalStateField('user', {
    name: userStore.currentUser?.username || '匿名用户',
    color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
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
    // 使用 Markdown 编辑器 composable
    currentMdHook = useYMarkdownEditor(docId.value, ydoc, provider)
    await currentMdHook.init()
    editor.value = currentMdHook.editor.value

    if (editor.value) {
      useAIEditBridge({
        docId: docId.value,
        tiptapEditor: editor.value
      })

      // 注册编辑器回调到 AI store
      aiStore.setEditorCallbacks({
        getInsertionPoint: () => getInsertionPoint(),
        focusEditor: () => focusEditor()
      })
    }
  } else if (type === 'txt') {
    // txt 模式继续使用 content 字段 (Text 类型)
    currentTxtHook = useYTextEditor(ydoc, docId.value)
    textContent.value = currentTxtHook.textContent.value
    handleTextInput.value = currentTxtHook.handleTextInput

    useAIEditBridge({
      docId: docId.value,
      textEditorHook: {
        textContent: currentTxtHook.textContent,
        insertAtCursor: currentTxtHook.insertAtCursor,
        replaceSelection: currentTxtHook.replaceSelection,
        getCursorPosition: currentTxtHook.getCursorPosition,
        focus: currentTxtHook.focus,
        renderTemporaryEdit: currentTxtHook.renderTemporaryEdit
      }
    })

    // 注册编辑器回调到 AI store
    aiStore.setEditorCallbacks({
      getInsertionPoint: () => getInsertionPoint(),
      focusEditor: () => focusEditor()
    })
  }
}

// 5. 加载文档及元数据
async function loadDocument() {
  const historyPromise = loadHistoryAndConnect();
  setupAwareness();

  try {
    const [docResponse, collabs] = await Promise.all([
      getDocument(docId.value),
      getCollaborators(docId.value)
    ]);

    if (docResponse.code === 200) {
      documentStore.setCurrentDocument(docResponse.data);
      // 先把协作者存进去，保证 UI 响应
      if (collabs.code === 200) {
        documentStore.setCollaborators(collabs.data);
      }

      // 最后等待内容注入
      await historyPromise;
      await nextTick()
      await initEditor() // 初始化对应的 Yjs 编辑器
    }
  } catch (error) {
    console.error('Document load error:', error)
  }
}

// 6. 同步纯文本变更
watch(() => currentTxtHook?.textContent.value, (newVal) => {
  if (newVal !== undefined) textContent.value = newVal
})

// 手动保存文档
async function manualSave() {

  // 确保文本内容同步到Yjs
  if (documentStore.currentDocument?.fileType === 'txt' && currentTxtHook) {
    currentTxtHook.handleTextInput()
  }

  // 根据文档类型调用对应的保存方法
  const type = documentStore.currentDocument?.fileType
  if (type === 'md' && currentMdHook) {
    try {
      const success = await currentMdHook.manualSave()
      return success
    } catch (error) {
      return false
    }
  } else if (type === 'txt' && currentTxtHook) {
    try {
      const success = await currentTxtHook.manualSave()
      return success
    } catch (error) {
      return false
    }
  } else {
    return false
  }
}

// 键盘事件处理函数
function handleKeyDown(event: KeyboardEvent) {
  // Ctrl+S 或 Cmd+S 保存文档
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault() // 阻止浏览器默认的保存行为

    // 直接使用Yjs进行保存，解耦合保存逻辑
    manualSave().then((success) => {
      if (success) {
        console.log('[ManualSave] Manual save completed successfully')
      } else {
        console.error('[ManualSave] Manual save failed')
      }
    })
  }
}

onMounted(() => {
  // 添加键盘事件监听
  document.addEventListener('keydown', handleKeyDown)

  // 清理可能残留的AI临时编辑状态，确保编辑器从干净状态开始
  aiStore.setTemporaryEdit(null)

  // 告知 AI 模块当前文档 ID，便于续写/润色时携带上下文
  aiStore.setCurrentDocumentId(docId.value)
  loadDocument()
})

onUnmounted(() => {
  // 移除键盘事件监听
  document.removeEventListener('keydown', handleKeyDown)

  if (editor.value) editor.value.destroy()
  aiStore.setCurrentDocumentId(null)
  aiStore.setEditorCallbacks(null) // 清理编辑器回调
})

// 获取当前选中范围（用于保存原始选择）
function getOriginalSelection(): { start: number; end: number } | null {
  const type = documentStore.currentDocument?.fileType

  if (type === 'md' && editor.value) {
    // TipTap 编辑器
    const { from, to } = editor.value.state.selection
    return { start: from, end: to }
  } else if (type === 'txt' && textareaRef.value) {
    // textarea 编辑器
    const start = textareaRef.value.selectionStart
    const end = textareaRef.value.selectionEnd
    return { start, end }
  }

  return null
}

// 获取当前插入点位置（用于 AI 续写/润色）
function getInsertionPoint(): { from: number; to: number } | { index: number } | null {
  const type = documentStore.currentDocument?.fileType
  const currentMode = aiStore.mode

  if (type === 'md' && editor.value) {
    // TipTap 编辑器
    const { from, to } = editor.value.state.selection
    return { from, to }
  } else if (type === 'txt' && textareaRef.value) {
    // textarea 编辑器
    const start = textareaRef.value.selectionStart
    const end = textareaRef.value.selectionEnd

    if (currentMode === 'polish') {
      // 润色模式：返回选中范围，用于替换
      return { index: start }
    } else {
      // 续写或其他模式：返回结束位置
      return { index: end > start ? end : start }
    }
  }

  return null
}

// 聚焦到文档编辑器
function focusEditor(): void {
  const type = documentStore.currentDocument?.fileType

  if (type === 'md' && editor.value) {
    editor.value.commands.focus()
  } else if (type === 'txt' && textareaRef.value) {
    textareaRef.value.focus()
  }
}

// 获取当前选中的文本
function getSelectedText(): string {
  const type = documentStore.currentDocument?.fileType

  if (type === 'md' && editor.value) {
    // TipTap 编辑器
    const { from, to } = editor.value.state.selection
    if (from !== to) {
      return editor.value.state.doc.textBetween(from, to, ' ')
    }
  } else if (type === 'txt' && textareaRef.value) {
    // textarea 编辑器
    const start = textareaRef.value.selectionStart
    const end = textareaRef.value.selectionEnd
    if (start !== end) {
      return textContent.value.slice(start, end)
    }
  }

  return ''
}

// 处理 AI 续写
function handleAIContinue() {
  const selectedText = getSelectedText()
  if (!selectedText) {
    alert('请先在文档中选择需要续写的文本')
    return
  }

  // 保存原始选中范围（用于续写）
  const originalSelection = getOriginalSelection()
  if (!originalSelection) {
    alert('无法获取选中范围')
    return
  }

  // 单开一段落：在选中内容末尾插入换行符
  if (documentStore.currentDocument?.fileType === 'md') {
    // TipTap编辑器
    if (editor.value) {
      editor.value.chain()
        .setTextSelection({ from: originalSelection.end, to: originalSelection.end })
        .insertContent('\n')
        .run()
    }
  } else {
    // textarea编辑器
    const textarea = document.querySelector('textarea')
    if (textarea) {
      const end = textarea.selectionEnd
      const value = textarea.value
      textarea.value = value.substring(0, end) + '\n' + value.substring(end)
      textarea.selectionStart = textarea.selectionEnd = end + 1
    }
  }

  // 更新插入点为新段落的开始位置
  const newInsertionPoint = originalSelection.end + 1

  const { sendMessage } = useAIChat()
  aiStore.setMode('continue')

  sendMessage(`请续写以下内容：${selectedText}`, {
    documentId: docId.value,
    context: selectedText,
    getInsertionPoint: () => {
      // 根据编辑器类型返回不同的插入点格式
      if (documentStore.currentDocument?.fileType === 'md') {
        return { from: newInsertionPoint, to: newInsertionPoint } // TipTap格式
      } else {
        return { index: newInsertionPoint } // textarea格式
      }
    },
    originalSelection: { index: originalSelection.start, endIndex: originalSelection.end }, // 保存原始选中范围
    focusEditor: () => focusEditor()
  })
}

// 处理 AI 润色
function handleAIPolish() {
  const selectedText = getSelectedText()
  if (!selectedText) {
    alert('请先在文档中选择需要润色的文本')
    return
  }

  // 保存原始选中范围（用于润色替换）
  const originalSelection = getOriginalSelection()
  if (!originalSelection) {
    alert('无法获取选中范围')
    return
  }

  const { sendMessage } = useAIChat()
  aiStore.setMode('polish')

  sendMessage(`请修改一下以下内容，让这段内容更加通顺有文学感，只输出修改之后的内容，不要生成说明等等信息，并在润色文本的最后加上换行：${selectedText}`, {
    documentId: docId.value,
    context: selectedText,
    getInsertionPoint: () => ({ index: originalSelection.start }), // 润色时在选中开始位置插入
    originalSelection: { index: originalSelection.start, endIndex: originalSelection.end }, // 保存完整选中范围
    focusEditor: () => focusEditor()
  })
}

// 刷新协作者
async function refreshCollaborators() {
  const res = await getCollaborators(docId.value)
  if (res.code === 200) documentStore.setCollaborators(res.data)
}

// 获取编辑器元素（用于AI控件定位）
function getEditorElement(): HTMLElement | null {
  const type = documentStore.currentDocument?.fileType

  if (type === 'md' && editor.value) {
    return editor.value.view.dom as HTMLElement
  } else if (type === 'txt' && textareaRef.value) {
    return textareaRef.value
  }

  return null
}

// 获取插入点坐标（用于AI控件定位）
function getInsertionPointForControls(): { x: number; y: number } | null {
  const tempEdit = aiStore.temporaryEdit
  if (!tempEdit?.insertionPoint) return null

  const editorElement = getEditorElement()
  if (!editorElement) return null

  const type = documentStore.currentDocument?.fileType

  if (type === 'md' && editor.value && 'from' in tempEdit.insertionPoint) {
    // TipTap编辑器：获取光标坐标
    try {
      const coords = editor.value.view.coordsAtPos(tempEdit.insertionPoint.from!)
      const wrapper = editorElement.parentElement
      if (wrapper) {
        const wrapperRect = wrapper.getBoundingClientRect()
        return {
          x: coords.left - wrapperRect.left,
          y: coords.bottom - wrapperRect.top + 4
        }
      }
    } catch (e) {
      console.error('[DocumentEditor] Failed to get insertion point coords:', e)
    }
  } else if (type === 'txt' && textareaRef.value) {
    // textarea：使用简单的定位
    const wrapper = editorElement.parentElement
    if (wrapper) {
      const editorRect = editorElement.getBoundingClientRect()
      const wrapperRect = wrapper.getBoundingClientRect()
      return {
        x: editorRect.left - wrapperRect.left,
        y: editorRect.bottom - wrapperRect.top + 8
      }
    }
  }

  return null
}

// 获取文本编辑器钩子（用于textarea模式）
function getTextEditorHook() {
  const type = documentStore.currentDocument?.fileType

  if (type === 'txt' && currentTxtHook) {
    return {
      textContent: currentTxtHook.textContent,
      insertAtCursor: currentTxtHook.insertAtCursor,
      replaceSelection: currentTxtHook.replaceSelection,
      renderTemporaryEdit: currentTxtHook.renderTemporaryEdit
    }
  }

  return undefined
}

// 处理AI临时编辑接受
function handleAITempEditAccepted() {
  console.log('[DocumentEditor] Handling AI temp edit accepted')
  aiStore.acceptTemporaryEdit()
}

// 处理AI临时编辑拒绝
function handleAITempEditRejected() {
  aiStore.rejectTemporaryEdit()
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

/* AI临时文本样式 */
.ProseMirror .ai-temporary-text {
  background-color: #dbeafe !important;
  color: #1e40af !important;
  border-radius: 2px;
  padding: 2px 0;
}
</style>
