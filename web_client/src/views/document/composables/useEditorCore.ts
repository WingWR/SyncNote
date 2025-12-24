// composables/useEditorCore.ts
import { ref, shallowRef, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { Editor } from '@tiptap/vue-3'

import { useDocumentStore } from '../../../stores/document'
import { useUserStore } from '../../../stores/user'
import { useAIStore } from '../../../stores/ai'
import { useAIChat } from '../../../composables/ai/useAIChat'

import { getDocument, getCollaborators } from '../../../api/document'

import { useCollaborativeEditor } from './useCollaborativeEditor'
import { useYMarkdownEditor } from './useYMarkdownEditor'
import { useYTextEditor } from './useYTextEditor'
import { useAIEditBridge } from './useAIEditBridge'

export function useEditorCore() {
  const route = useRoute()
  const docId = ref(route.params.id as string)

  const documentStore = useDocumentStore()
  const userStore = useUserStore()
  const aiStore = useAIStore()

  /** Yjs */
  const { ydoc, provider, loadHistoryAndConnect } =
    useCollaborativeEditor(docId.value)

  /** 编辑器状态 */
  const editor = shallowRef<Editor>()
  const textareaRef = ref<HTMLTextAreaElement | null>(null)

  const textContent = ref('')
  const handleTextInput = ref<() => void>(() => {})
  const onlineUsers = ref<any[]>([])

  let currentMdHook: any = null
  let currentTxtHook: any = null

  /* ---------------- awareness ---------------- */

  function setupAwareness() {
    if (!provider) return

    provider.awareness.setLocalStateField('user', {
      name: userStore.currentUser?.username || '匿名用户',
      color:
        '#' +
        Math.floor(Math.random() * 16777215)
          .toString(16)
          .padStart(6, '0')
    })

    provider.awareness.on('change', () => {
      const states = provider.awareness.getStates()
      onlineUsers.value = Array.from(states.values())
        .map((s: any) => s.user)
        .filter(Boolean)
    })
  }

  /* ---------------- 编辑器初始化 ---------------- */

  async function initEditor() {
    const type = documentStore.currentDocument?.fileType

    if (type === 'md') {
      currentMdHook = useYMarkdownEditor(docId.value, ydoc, provider)
      await currentMdHook.init()
      editor.value = currentMdHook.editor.value

      if (editor.value) {
        useAIEditBridge({
          docId: docId.value,
          tiptapEditor: editor.value
        })

        aiStore.setEditorCallbacks({
          getInsertionPoint: () => null,
          focusEditor: () => editor.value?.commands.focus()
        })
      }
    }

    if (type === 'txt') {
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

      aiStore.setEditorCallbacks({
        getInsertionPoint: () => null,
        focusEditor: () => textareaRef.value?.focus()
      })
    }
  }

  /* ---------------- 文档加载 ---------------- */

  async function loadDocument() {
    try {
      const historyPromise = loadHistoryAndConnect()
      setupAwareness()

      const [docRes, collabRes] = await Promise.all([
        getDocument(docId.value),
        getCollaborators(docId.value)
      ])

      if (docRes.code === 200) {
        documentStore.setCurrentDocument(docRes.data)

        if (collabRes.code === 200) {
          documentStore.setCollaborators(collabRes.data)
        }

        await historyPromise
        await nextTick()
        await initEditor()
      } else {
        console.error('Failed to load document:', docRes)
      }
    } catch (error) {
      console.error('Error loading document:', error)
      throw error
    }
  }

  async function refreshCollaborators() {
    const collabRes = await getCollaborators(docId.value)
    if (collabRes.code === 200) {
      documentStore.setCollaborators(collabRes.data)
    }
  }

  /* ---------------- AI 功能 ---------------- */

  function getOriginalSelection() {
    const type = documentStore.currentDocument?.fileType

    if (type === 'md' && editor.value) {
      const { from, to } = editor.value.state.selection
      return { start: from, end: to }
    }

    if (type === 'txt' && textareaRef.value) {
      return {
        start: textareaRef.value.selectionStart,
        end: textareaRef.value.selectionEnd
      }
    }

    return null
  }

  function getSelectedText(): string {
    const type = documentStore.currentDocument?.fileType

    if (type === 'md' && editor.value) {
      const { from, to } = editor.value.state.selection
      return from !== to
        ? editor.value.state.doc.textBetween(from, to, ' ')
        : ''
    }

    if (type === 'txt' && textareaRef.value) {
      const { selectionStart, selectionEnd } = textareaRef.value
      return selectionStart !== selectionEnd
        ? textContent.value.slice(selectionStart, selectionEnd)
        : ''
    }

    return ''
  }

  function focusEditor() {
    const type = documentStore.currentDocument?.fileType
    if (type === 'md') editor.value?.commands.focus()
    if (type === 'txt') textareaRef.value?.focus()
  }

  function handleAIContinue() {
    try {
      const selectedText = getSelectedText()
      const selection = getOriginalSelection()
      if (!selectedText || !selection) {
        console.warn('No text selected for AI continue')
        return
      }

      const { sendMessage } = useAIChat()
      aiStore.setMode('continue')

      sendMessage(`请续写以下内容：${selectedText}`, {
        documentId: documentStore.currentDocument?.id,
        context: selectedText,
        originalSelection: {
          index: selection.start,
          endIndex: selection.end
        },
        focusEditor
      })
    } catch (error) {
      console.error('Error in handleAIContinue:', error)
    }
  }

  function handleAIPolish() {
    try {
      const selectedText = getSelectedText()
      const selection = getOriginalSelection()
      if (!selectedText || !selection) {
        console.warn('No text selected for AI polish')
        return
      }

      const { sendMessage } = useAIChat()
      aiStore.setMode('polish')

      sendMessage(`请润色以下内容：${selectedText}`, {
        documentId: documentStore.currentDocument?.id,
        context: selectedText,
        originalSelection: {
          index: selection.start,
          endIndex: selection.end
        },
        focusEditor
      })
    } catch (error) {
      console.error('Error in handleAIPolish:', error)
    }
  }

  /* ---------------- 保存 ---------------- */

  async function manualSave() {
    const type = documentStore.currentDocument?.fileType

    if (type === 'txt' && currentTxtHook) {
      currentTxtHook.handleTextInput()
    }

    try {
      if (type === 'md') return await currentMdHook?.manualSave()
      if (type === 'txt') return await currentTxtHook?.manualSave()
      return false
    } catch {
      return false
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      manualSave()
    }
  }

  /* ---------------- 生命周期 ---------------- */

  onMounted(async () => {
    document.addEventListener('keydown', handleKeyDown)
    aiStore.setTemporaryEdit(null)
    aiStore.setCurrentDocumentId(docId.value)
    try {
      await loadDocument()
    } catch (error) {
      console.error('Failed to load document:', error)
    }
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown)
    editor.value?.destroy()
    aiStore.setCurrentDocumentId(null)
    aiStore.setEditorCallbacks(null)
  })

  watch(
    () => currentTxtHook?.textContent.value,
    (v) => v !== undefined && (textContent.value = v)
  )

  return {
    editor,
    textareaRef,
    textContent,
    handleTextInput,
    onlineUsers,
    manualSave,
    handleAIContinue,
    handleAIPolish,
    refreshCollaborators
  }
}
