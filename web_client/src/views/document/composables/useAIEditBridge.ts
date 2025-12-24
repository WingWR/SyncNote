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

  // TipTap 按钮容器
  let tiptapButtonContainer: HTMLElement | null = null
  // 当前的临时文本元素引用，避免依赖DOM选择器
  let currentTemporaryTextElement: HTMLElement | null = null
  // 加载提示元素
  let loadingIndicatorElement: HTMLElement | null = null

  // 监听临时编辑状态（流式输出到编辑器）
  // 注意：不使用immediate，避免组件初始化时触发
  watch(
    () => aiStore.temporaryEdit,
    async (tempEdit: AITemporaryEdit | null) => {
      console.log('[AIEditBridge] Temporary edit changed:', tempEdit)

      if (!tempEdit) {
        // 清空临时文本和按钮
        if (options.textEditorHook?.renderTemporaryEdit) {
          options.textEditorHook.renderTemporaryEdit(null)
        }
        if (tiptapButtonContainer) {
          tiptapButtonContainer.remove()
          tiptapButtonContainer = null
        }
        // 重置临时文本元素引用和加载提示
        currentTemporaryTextElement = null
        hideLoadingIndicator()
        return
      }

      if (tempEdit.documentId !== options.docId) return

      // TipTap: 处理临时文本和加载提示
      if (options.tiptapEditor && tempEdit.insertionPoint) {
        if (tempEdit.isStreaming && tempEdit.content.length === 0) {
          // 刚开始等待AI输出时，显示加载提示
          console.log('[AIEditBridge] Showing loading indicator')
          await showLoadingIndicator(options.tiptapEditor, tempEdit)
        } else if (tempEdit.isStreaming && tempEdit.content.length > 0) {
          // 开始接收流式输出时，隐藏加载提示并渲染临时文本
          console.log('[AIEditBridge] Hiding loading indicator and rendering temporary text')
          hideLoadingIndicator()
          await renderTemporaryTextInTipTap(options.tiptapEditor, tempEdit)
        } else if (!tempEdit.isStreaming) {
          // 流式输出完成，隐藏加载提示并渲染临时文本和按钮
          console.log('[AIEditBridge] Stream completed, rendering final temporary text')
          hideLoadingIndicator()
          await renderTemporaryTextInTipTap(options.tiptapEditor, tempEdit)
          console.log('[AIEditBridge] Rendering TipTap buttons')
          await renderTipTapButtons(options.tiptapEditor, tempEdit)
        }
      }

      // textarea: 使用自定义渲染（内部会处理按钮显示时机）
      if (options.textEditorHook?.renderTemporaryEdit) {
        console.log('[AIEditBridge] Rendering textarea temporary text')
        options.textEditorHook.renderTemporaryEdit(tempEdit)
      }
    },
    { deep: true }
  )

  // 监听临时编辑状态变化（当它变为 null 时，说明被接受或拒绝了）
  // 实际的接受/拒绝逻辑在编辑器按钮中处理，这里只需要清理
  watch(
    () => aiStore.temporaryEdit,
    async (newTempEdit, oldTempEdit) => {
      // 如果临时编辑被清空，且之前有临时编辑，说明被接受或拒绝了
      if (!newTempEdit && oldTempEdit && oldTempEdit.documentId === options.docId) {
        // 清理工作已在编辑器按钮中完成，这里不需要额外操作
      }
    }
  )

  // 监听直接编辑操作（pendingEdit）
  watch(
    () => aiStore.pendingEdit,
    (op: AIEditOperation | null) => {
      if (!op) return
      if (op.documentId !== options.docId) return

      const { type, replacementText } = op

      // Markdown: TipTap 编辑器
      if (options.tiptapEditor) {
        const editor = options.tiptapEditor

        if (type === 'append') {
          editor.chain().focus().insertContent(replacementText).run()
        } else if (type === 'replace') {
          editor
            .chain()
            .focus()
            .insertContentAt(editor.state.selection, replacementText)
            .run()
        }
      }

      // 纯文本: textarea 编辑器
      if (options.textEditorHook) {
        if (type === 'append') {
          options.textEditorHook.insertAtCursor(replacementText)
        } else if (type === 'replace') {
          options.textEditorHook.replaceSelection(replacementText)
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

    const from = (tempEdit.insertionPoint as { from: number }).from

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
        console.error('[AIEditBridge] Failed to position loading indicator:', e)
        // 最后的fallback
        loadingIndicatorElement.style.position = 'fixed'
        loadingIndicatorElement.style.top = '50%'
        loadingIndicatorElement.style.left = '50%'
        loadingIndicatorElement.style.transform = 'translate(-50%, -50%)'
        document.body.appendChild(loadingIndicatorElement)
      }

      console.log('[AIEditBridge] Loading indicator shown')
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
      console.log('[AIEditBridge] Loading indicator hidden')
    }
  }

  /**
   * 在 TipTap 中渲染临时文本（使用 insertContentAt + 特殊样式）
   */
  async function renderTemporaryTextInTipTap(editor: Editor, tempEdit: AITemporaryEdit) {
    if (!tempEdit.insertionPoint || !('from' in tempEdit.insertionPoint)) return

    const from = (tempEdit.insertionPoint as { from: number }).from
    const content = tempEdit.content

    await nextTick()

    try {
      // 添加全局 CSS 样式（如果还没有）
      if (!document.getElementById('ai-tiptap-temp-style')) {
        const style = document.createElement('style')
        style.id = 'ai-tiptap-temp-style'
        style.textContent = `
          .ProseMirror .ai-temporary-text {
            background-color: #dbeafe !important;
            color: #1e40af !important;
            border-radius: 2px;
            padding: 2px 0;
          }
        `
        document.head.appendChild(style)
      }

      // 如果还没有临时文本元素，创建并插入
      if (!currentTemporaryTextElement) {
        console.log('[AIEditBridge] Creating new temporary text element')

        // 先清理可能残留的临时文本（只在初次创建时）
        clearTemporaryTextByDOM()

        // 插入新临时文本（使用span标签包装）
        if (content.length > 0) {
          const tempContent = `<span class="ai-temporary-text">${content}</span>`

          editor.chain()
            .focus()
            .setTextSelection({ from: from, to: from })
            .insertContent(tempContent)
            .run()

          // 获取刚插入的元素引用
          await nextTick()
          currentTemporaryTextElement = document.querySelector('.ai-temporary-text') as HTMLElement
          console.log('[AIEditBridge] Temporary text element created:', currentTemporaryTextElement)
        }
      } else {
        // 如果已经存在临时文本元素，直接更新其内容
        console.log('[AIEditBridge] Updating existing temporary text element')
        if (currentTemporaryTextElement) {
          currentTemporaryTextElement.textContent = content
        }
      }
    } catch (e) {
      console.error('[AIEditBridge] TipTap 临时文本渲染失败:', e)
    }
  }

  /**
   * 将临时编辑应用为正式文本
   */
  async function applyTemporaryEditAsFinal(tempEdit: AITemporaryEdit) {
    if (!tempEdit.insertionPoint || !('from' in tempEdit.insertionPoint)) return

    // TipTap
    if (options.tiptapEditor) {
      const editor = options.tiptapEditor

      try {
        console.log('[AIEditBridge] Applying', tempEdit.mode, 'edit as final:', tempEdit.content)

        let insertPosition: number

        if (tempEdit.mode === 'polish' && tempEdit.originalSelection && 'from' in tempEdit.originalSelection) {
          // 润色模式：在用户原始选择位置插入正式文本
          insertPosition = tempEdit.originalSelection.from!
          console.log('[AIEditBridge] Polish mode: inserting at original selection position', insertPosition)
        } else {
          // 续写模式：在临时文本插入位置插入正式文本
          insertPosition = (tempEdit.insertionPoint as { from: number }).from
          console.log('[AIEditBridge] Continue mode: inserting at insertion point', insertPosition)
        }

        // 在指定位置插入正式内容
        editor.chain()
          .focus()
          .setTextSelection({ from: insertPosition, to: insertPosition })
          .insertContent(tempEdit.content)
          .run()

        // 通过DOM删除临时文本span标签
        clearTemporaryTextByDOM()
        // 重置元素引用和清理加载提示
        currentTemporaryTextElement = null
        hideLoadingIndicator()

        console.log('[AIEditBridge] Applied temporary edit as final:', tempEdit.content)
      } catch (error) {
        console.error('[AIEditBridge] Failed to apply temporary edit as final:', error)
      }
    }

    // textarea
    if (options.textEditorHook) {
      // textarea 的临时文本已经在渲染时插入，这里只需要移除标记
      // 实际逻辑在 textEditorHook.renderTemporaryEdit 中处理
    }
  }

  /**
   * 删除临时编辑
   */
  async function removeTemporaryEdit(tempEdit: AITemporaryEdit) {
    if (!tempEdit.insertionPoint || !('from' in tempEdit.insertionPoint)) return

    // TipTap
    if (options.tiptapEditor) {
      const editor = options.tiptapEditor
      const currentDoc = editor.state.doc

      try {
        // 查找并删除所有临时文本（通过零宽度空格标记）
        const fullText = currentDoc.textContent

        console.log('[AIEditBridge] Remove: Full text length:', fullText.length)
        console.log('[AIEditBridge] Remove: Full text preview:', fullText.substring(0, 200) + '...')

        // 检查零宽度空格
        const zeroWidthIndices: number[] = []
        for (let i = 0; i < fullText.length; i++) {
          if (fullText.charCodeAt(i) === 8203) {
            zeroWidthIndices.push(i)
          }
        }
        console.log('[AIEditBridge] Remove: Zero-width spaces at:', zeroWidthIndices)

        // 查找所有零宽度空格对
        const tempRanges: Array<{ start: number, end: number }> = []
        let searchPos = 0

        while (true) {
          const startMarker = fullText.indexOf('\u200B', searchPos)
          if (startMarker === -1) break

          console.log('[AIEditBridge] Remove: Start marker at:', startMarker)

          const endMarker = fullText.indexOf('\u200B', startMarker + 1)
          if (endMarker === -1) {
            console.log('[AIEditBridge] Remove: No end marker found')
            break
          }

          console.log('[AIEditBridge] Remove: End marker at:', endMarker)

          tempRanges.push({ start: startMarker, end: endMarker + 1 })
          searchPos = endMarker + 1
        }

        console.log('[AIEditBridge] Remove: Found', tempRanges.length, 'temporary ranges to remove:', tempRanges)

        // 从后往前删除，避免位置偏移
        for (let i = tempRanges.length - 1; i >= 0; i--) {
          const range = tempRanges[i]!
          console.log('[AIEditBridge] Removing temporary text from', range.start, 'to', range.end)

          try {
            editor.chain()
              .focus()
              .setTextSelection({ from: range.start, to: range.end })
              .deleteSelection()
              .run()
          } catch (error) {
            console.error('[AIEditBridge] Failed to remove temporary text range:', error, range)
          }
        }

        // 删除临时文本
        clearTemporaryTextByDOM()
        // 重置元素引用和清理加载提示
        currentTemporaryTextElement = null
        hideLoadingIndicator()

        console.log('[AIEditBridge] Removed temporary edit')
      } catch (error) {
        console.error('[AIEditBridge] Failed to remove temporary edit:', error)
      }
    }

    // textarea
    if (options.textEditorHook?.renderTemporaryEdit) {
      options.textEditorHook.renderTemporaryEdit(null)
    }
  }

  /**
   * 在 TipTap 编辑器中渲染接受/拒绝按钮
   * 按钮应该位于临时文本的末端（文本输出完成后光标的位置）
   */
  async function renderTipTapButtons(editor: Editor, tempEdit: AITemporaryEdit) {
    if (!tempEdit.insertionPoint || !('from' in tempEdit.insertionPoint)) return

    await nextTick()

    // 移除旧按钮
    if (tiptapButtonContainer) {
      tiptapButtonContainer.remove()
      tiptapButtonContainer = null
    }

    // 只在流式输出完成后显示按钮
    if (tempEdit.isStreaming) {
      return
    }

    const editorElement = editor.view.dom as HTMLElement
    if (!editorElement) return

    // 计算插入点位置（按钮应该在插入点附近）
    const from = (tempEdit.insertionPoint as { from: number }).from

    // 创建按钮容器
    tiptapButtonContainer = document.createElement('div')
    tiptapButtonContainer.className = 'ai-tiptap-temp-controls'
    tiptapButtonContainer.style.cssText = `
      position: absolute;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      z-index: 1000;
      display: flex;
      gap: 8px;
    `

    const acceptBtn = document.createElement('button')
    acceptBtn.textContent = '接受'
    acceptBtn.className = 'px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600'
    acceptBtn.onclick = async () => {
      await applyTemporaryEditAsFinal(tempEdit)
      if (tiptapButtonContainer) {
        tiptapButtonContainer.remove()
        tiptapButtonContainer = null
      }
      aiStore.acceptTemporaryEdit()
    }

    const rejectBtn = document.createElement('button')
    rejectBtn.textContent = '不接受'
    rejectBtn.className = 'px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300'
    rejectBtn.onclick = async () => {
      await removeTemporaryEdit(tempEdit)
      if (tiptapButtonContainer) {
        tiptapButtonContainer.remove()
        tiptapButtonContainer = null
      }
      aiStore.rejectTemporaryEdit()
    }

    tiptapButtonContainer.appendChild(acceptBtn)
    tiptapButtonContainer.appendChild(rejectBtn)

    // 添加模型信息显示
    const modelInfo = document.createElement('div')
    modelInfo.className = 'text-xs text-gray-500 mt-2 px-1'
    modelInfo.textContent = `来自 ${aiStore.currentModel?.name || 'AI'} 模型`
    tiptapButtonContainer.appendChild(modelInfo)

    // 定位按钮：在插入点位置（避免挡住临时文本）
    try {
      // 检查编辑器视图是否可用
      if (!editor.view) {
        console.warn('[AIEditBridge] Editor view not available for button positioning')
        // 使用编辑器元素作为fallback
        const editorRect = editorElement.getBoundingClientRect()
        const wrapper = editorElement.parentElement
        if (wrapper) {
          wrapper.style.position = 'relative'
          const wrapperRect = wrapper.getBoundingClientRect()
          tiptapButtonContainer.style.top = `${editorRect.bottom - wrapperRect.top + 8}px`
          tiptapButtonContainer.style.left = `${editorRect.left - wrapperRect.left}px`
          wrapper.appendChild(tiptapButtonContainer)
        }
        return
      }

      // 尝试获取坐标
      let coords = null
      if (editor.view.coordsAtPos) {
        // TipTap API
        coords = editor.view.coordsAtPos(from)
      }

      if (coords) {
        const wrapper = editorElement.parentElement
        if (wrapper) {
          wrapper.style.position = 'relative'
          const wrapperRect = wrapper.getBoundingClientRect()
          // 将按钮放在插入点下方，避免挡住文本
          tiptapButtonContainer.style.top = `${coords.bottom - wrapperRect.top + 4}px`
          tiptapButtonContainer.style.left = `${coords.left - wrapperRect.left}px`
          wrapper.appendChild(tiptapButtonContainer)
        }
      } else {
        // 如果无法获取坐标，使用编辑器底部位置作为fallback
        const editorRect = editorElement.getBoundingClientRect()
        const wrapper = editorElement.parentElement
        if (wrapper) {
          wrapper.style.position = 'relative'
          const wrapperRect = wrapper.getBoundingClientRect()
          tiptapButtonContainer.style.top = `${editorRect.bottom - wrapperRect.top + 8}px`
          tiptapButtonContainer.style.left = `${editorRect.left - wrapperRect.left}px`
          wrapper.appendChild(tiptapButtonContainer)
        }
      }
    } catch (e) {
      console.error('[AIEditBridge] 按钮定位失败:', e)
      // 最后的fallback：将按钮放在屏幕底部
      const wrapper = editorElement.parentElement
      if (wrapper) {
        wrapper.style.position = 'relative'
        tiptapButtonContainer.style.position = 'fixed'
        tiptapButtonContainer.style.bottom = '20px'
        tiptapButtonContainer.style.right = '20px'
        tiptapButtonContainer.style.zIndex = '1000'
        document.body.appendChild(tiptapButtonContainer)
      }
    }
  }

  function clearTemporaryTextByDOM() {
    const tempElements = document.querySelectorAll('.ai-temporary-text')
    console.log('[AIEditBridge] Found DOM elements to remove:', tempElements.length)
    
    tempElements.forEach(element => {
      (element as HTMLElement).remove()
    })
  }
}
