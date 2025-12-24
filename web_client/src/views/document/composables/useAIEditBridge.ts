import { watch, nextTick } from 'vue'
import type { Ref } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import { useAIStore } from '../../../stores/ai'
import type { AIEditOperation, AITemporaryEdit } from '../../../stores/ai/types'


interface TextEditorHook {
  textContent: Ref<string>
  insertAtCursor: (text: string) => void
  replaceSelection: (text: string) => void
  /**
   * 获取当前光标位置（用于临时编辑）
   */
  getCursorPosition: () => { index: number } | null
  /**
   * 聚焦编辑器
   */
  focus: () => void
  /**
   * 渲染临时文本和按钮（textarea 模式）
   */
  renderTemporaryEdit?: (tempEdit: AITemporaryEdit | null) => void
}

interface UseAIEditBridgeOptions {
  docId: string
  tiptapEditor?: Editor
  textEditorHook?: TextEditorHook
}

/**
 * 负责将 AI 产生的编辑操作（append/replace）应用到具体编辑器实现中
 * 充当 AI 与编辑器之间的中介者
 * 
 * 支持两种模式：
 * 1. 临时编辑模式（continue/polish）：流式输出到编辑器，用特殊样式显示，等待接受/拒绝
 * 2. 直接编辑模式（pendingEdit）：一次性应用编辑操作
 */
export function useAIEditBridge(options: UseAIEditBridgeOptions) {
  const aiStore = useAIStore()

  // 加载提示元素
  let loadingIndicatorElement: HTMLElement | null = null

  // 监听临时编辑状态（流式输出到编辑器）
  // 注意：不使用immediate，避免组件初始化时触发
  watch(
    () => aiStore.temporaryEdit,
    async (tempEdit: AITemporaryEdit | null) => {
      // 流式输出期间锁定编辑器
      if (options.tiptapEditor) {
        options.tiptapEditor.setEditable(!tempEdit?.isStreaming)
      }

      if (!tempEdit) {
        // 清空临时文本
        if (options.textEditorHook?.renderTemporaryEdit) {
          options.textEditorHook.renderTemporaryEdit(null)
        }
        // 清理加载提示
        hideLoadingIndicator()
        return
      }

      if (tempEdit.documentId !== options.docId) return

      // TipTap: 处理加载提示
      if (options.tiptapEditor && tempEdit.insertionPoint) {
        if (tempEdit.isStreaming && tempEdit.content.length === 0) {
          await showLoadingIndicator(options.tiptapEditor, tempEdit)
        } else if (tempEdit.isStreaming && tempEdit.content.length > 0) {
          hideLoadingIndicator()
          // 流式输出中不显示临时文本，只显示加载提示
        } else if (!tempEdit.isStreaming) {
          hideLoadingIndicator()
          // 按钮现在由DocumentEditor.vue中的组件处理
        }
      }

      // textarea: 使用自定义渲染（内部会处理按钮显示时机）
      if (options.textEditorHook?.renderTemporaryEdit) {
        options.textEditorHook.renderTemporaryEdit(tempEdit)
      }
    },
    { deep: true }
  )

  // 监听直接编辑操作（pendingEdit）
  watch(
    () => aiStore.pendingEdit,
    (op: AIEditOperation | null) => {
      console.log('[useAIEditBridge] Pending edit changed:', op)
      if (!op) return
      if (op.documentId !== options.docId) {
        console.log('[useAIEditBridge] Document ID mismatch:', op.documentId, 'vs', options.docId)
        return
      }

      const { type, replacementText } = op
      const extendedOp = op as any // 扩展操作，包含原始选区信息
      console.log('[useAIEditBridge] Processing pending edit:', type, replacementText)

      // Markdown: TipTap 编辑器
      if (options.tiptapEditor) {
        console.log('[useAIEditBridge] Processing with TipTap editor')
        const editor = options.tiptapEditor

        if (type === 'append') {
          console.log('[useAIEditBridge] Append operation')
          if (extendedOp.insertionPoint && 'from' in extendedOp.insertionPoint) {
            // 指定位置插入（续写模式）
            console.log('[useAIEditBridge] Inserting at specific position:', extendedOp.insertionPoint.from)
            editor.chain().focus()
              .setTextSelection({ from: extendedOp.insertionPoint.from, to: extendedOp.insertionPoint.from })
              .insertContent(replacementText)
              .run()
          } else {
            // 默认追加
            console.log('[useAIEditBridge] Default append')
            editor.chain().focus().insertContent(replacementText).run()
          }
        } else if (type === 'replace') {
          console.log('[useAIEditBridge] Replace operation')
          if (extendedOp.originalSelection && 'from' in extendedOp.originalSelection && 'to' in extendedOp.originalSelection) {
            // 替换指定范围（润色模式）
            console.log('[useAIEditBridge] Replacing selection:', extendedOp.originalSelection)
            editor.chain().focus()
              .setTextSelection({ from: extendedOp.originalSelection.from, to: extendedOp.originalSelection.to })
              .deleteSelection()
              .insertContent(replacementText)
              .run()
          } else {
            // 默认替换当前选区
            console.log('[useAIEditBridge] Default replace')
            editor
              .chain()
              .focus()
              .insertContentAt(editor.state.selection, replacementText)
              .run()
          }
        }
      }

      // 纯文本: textarea 编辑器
      if (options.textEditorHook) {
        console.log('[useAIEditBridge] Processing with textarea editor')
        if (type === 'append') {
          console.log('[useAIEditBridge] Append operation for textarea')
          if (extendedOp.insertionPoint && 'index' in extendedOp.insertionPoint) {
            // 在指定位置插入（续写模式）
            console.log('[useAIEditBridge] Inserting at specific position:', extendedOp.insertionPoint.index)
            const textarea = document.querySelector('textarea') as HTMLTextAreaElement
            if (textarea) {
              const insertPos = extendedOp.insertionPoint.index
              const before = options.textEditorHook.textContent.value.slice(0, insertPos)
              const after = options.textEditorHook.textContent.value.slice(insertPos)
              options.textEditorHook.textContent.value = before + replacementText + after
              // 移动光标到插入内容末尾
              const newCursorPos = insertPos + replacementText.length
              textarea.setSelectionRange(newCursorPos, newCursorPos)
            }
          } else {
            // 默认在光标位置插入
            console.log('[useAIEditBridge] Default append for textarea')
            options.textEditorHook.insertAtCursor(replacementText)
          }
        } else if (type === 'replace') {
          console.log('[useAIEditBridge] Replace operation for textarea')
          if (extendedOp.originalSelection && 'index' in extendedOp.originalSelection && 'endIndex' in extendedOp.originalSelection) {
            // 替换指定范围（润色模式）
            console.log('[useAIEditBridge] Replacing selection:', extendedOp.originalSelection)
            const start = extendedOp.originalSelection.index
            const end = extendedOp.originalSelection.endIndex
            const before = options.textEditorHook.textContent.value.slice(0, start)
            const after = options.textEditorHook.textContent.value.slice(end)
            options.textEditorHook.textContent.value = before + replacementText + after
            // 移动光标到替换内容末尾
            const newCursorPos = start + replacementText.length
            const textarea = document.querySelector('textarea') as HTMLTextAreaElement
            if (textarea) {
              textarea.setSelectionRange(newCursorPos, newCursorPos)
            }
          } else {
            // 默认替换当前选区
            console.log('[useAIEditBridge] Default replace for textarea')
            options.textEditorHook.replaceSelection(replacementText)
          }
        }
      }

      aiStore.clearPendingEdit()
    }
  )

  /**
   * 显示加载提示（在等待AI输出时）
   */
  async function showLoadingIndicator(editor: Editor, tempEdit: AITemporaryEdit) {
    if (!tempEdit.insertionPoint || !('from' in tempEdit.insertionPoint)) return

    await nextTick()

    try {
      // 如果已经存在加载提示，先移除
      if (loadingIndicatorElement) {
        loadingIndicatorElement.remove()
        loadingIndicatorElement = null
      }

      // 添加全局 CSS 样式（如果还没有）
      if (!document.getElementById('ai-loading-style')) {
        const style = document.createElement('style')
        style.id = 'ai-loading-style'
        style.textContent = `
          .ai-loading-indicator {
            position: absolute;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 60px;
            height: 60px;
            border: 10px solid #e5e7eb;
            border-top: 10px solid #3b82f6;
            border-radius: 50%;
            animation: ai-loading-spin 1s linear infinite;
            z-index: 999;
            background: white;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          @keyframes ai-loading-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `
        document.head.appendChild(style)
      }

      // 创建加载图标元素（作为浮动元素，不插入编辑器内容）
      loadingIndicatorElement = document.createElement('div')
      loadingIndicatorElement.className = 'ai-loading-indicator'
      loadingIndicatorElement.title = 'AI 正在思考中...'

      const editorElement = editor.view.dom as HTMLElement
      if (!editorElement) return

      // 定位加载图标到光标位置
      try {
        loadingIndicatorElement.style.position = 'fixed'
        loadingIndicatorElement.style.top = '50%'
        loadingIndicatorElement.style.left = '50%'
        loadingIndicatorElement.style.transform = 'translate(-50%, -50%)'
        document.body.appendChild(loadingIndicatorElement)
      } catch (e) {
        // 最后的fallback
        loadingIndicatorElement.style.position = 'fixed'
        loadingIndicatorElement.style.top = '50%'
        loadingIndicatorElement.style.left = '50%'
        loadingIndicatorElement.style.transform = 'translate(-50%, -50%)'
        document.body.appendChild(loadingIndicatorElement)
      }
    } catch (e) {
      console.error('[AIEditBridge] Failed to show loading indicator:', e)
    }
  }

  /**
   * 隐藏加载提示
   */
  function hideLoadingIndicator() {
    if (loadingIndicatorElement) {
      loadingIndicatorElement.remove()
      loadingIndicatorElement = null
    }
  }
}
