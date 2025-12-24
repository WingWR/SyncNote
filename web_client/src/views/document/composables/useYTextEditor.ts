import { ref, onBeforeUnmount, nextTick } from 'vue'
import * as Y from 'yjs'
import { useYjsAutoSave } from './useYjsAutoSave'
import type { AITemporaryEdit } from '../../../stores/ai/types'
import { useAIStore } from '../../../stores/ai'

export function useYTextEditor(_ydoc: Y.Doc, docId: string) {
  const ytext = _ydoc.getText('content')
  const textContent = ref(ytext.toString())
  
  // 临时编辑状态
  let tempEditContainer: HTMLElement | null = null
  let tempTextOverlay: HTMLElement | null = null

  // 编辑锁定状态（用于AI编辑时的文档锁定）
  let isEditLocked = false

  // AI编辑状态跟踪
  let isAIEditing = false

  // 使用统一保存逻辑
  const { destroy: destroyAutoSave, pause: pauseAutoSave, resume: resumeAutoSave, manualSave } = useYjsAutoSave(_ydoc, docId)

  // Y.Text observer
  const observer = (event: Y.YTextEvent) => {
    // 只有非本地更新（即来自别人的更新）时，才同步到响应式 ref
    // 避免 handleTextInput 触发 ydoc 变更，ydoc 又触发 observer 的死循环
    if (event.transaction.local) return
    textContent.value = ytext.toString()
  }
  ytext.observe(observer)

  // 输入时同步到 Y.Text
  function handleTextInput() {
    const current = ytext.toString()

    if (textContent.value !== current) {
      _ydoc.transact(() => {
        ytext.delete(0, current.length)
        ytext.insert(0, textContent.value)
      })
    }
  }

  // 在当前光标位置插入文本并同步到 Y.Text
  function insertAtCursor(text: string) {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement | null
    if (!textarea) {
      return
    }

    const start = textarea.selectionStart
    const end = textarea.selectionEnd

    const before = textContent.value.slice(0, start)
    const after = textContent.value.slice(end)
    textContent.value = before + text + after

    handleTextInput()

    // 重置光标到插入文本之后
    requestAnimationFrame(() => {
      textarea.selectionStart = textarea.selectionEnd = start + text.length
    })
  }

  // 使用当前选区替换为指定文本
  function replaceSelection(text: string) {
    insertAtCursor(text)
  }

  // 获取当前光标位置
  // 注意：对于续写，应该返回选择文本的结束位置，而不是开始位置
  function getCursorPosition() {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement | null
    if (!textarea) return null
    // 对于续写，返回选择文本的结束位置
    // 对于普通插入，返回当前光标位置
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    // 如果有选中文本，返回结束位置；否则返回当前光标位置
    return { index: end > start ? end : start }
  }

  // 聚焦编辑器
  function focus() {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement | null
    if (textarea) {
      textarea.focus()
    }
  }

  // 锁定编辑（用于AI编辑时的文档锁定）
  function lockEdit() {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement | null
    if (textarea && !isEditLocked) {
      textarea.readOnly = true
      textarea.style.cursor = 'not-allowed'
      isEditLocked = true
    }
  }

  // 解锁编辑
  function unlockEdit() {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement | null
    if (textarea && isEditLocked) {
      textarea.readOnly = false
      textarea.style.cursor = ''
      isEditLocked = false
    }
  }

  // 渲染临时文本和按钮（textarea 模式）
  async function renderTemporaryEdit(tempEdit: AITemporaryEdit | null) {
    await nextTick()

    const textarea = document.querySelector('textarea') as HTMLTextAreaElement | null
    if (!textarea) return

    // 移除旧的临时编辑容器和覆盖层
    if (tempEditContainer) {
      tempEditContainer.remove()
      tempEditContainer = null
    }
    if (tempTextOverlay) {
      tempTextOverlay.remove()
      tempTextOverlay = null
    }

    // 恢复textarea的正常显示状态（清除AI编辑时的透明样式）
    textarea.style.color = ''
    textarea.style.caretColor = ''

    if (!tempEdit) {
      // AI编辑结束，恢复自动保存（只在非按钮点击的情况下调用）
      // 注意：按钮点击时已经在按钮处理逻辑中恢复了自动保存，这里不再重复调用
      if (isAIEditing) {
        isAIEditing = false
        resumeAutoSave()
      }

      // 确保编辑已解锁
      unlockEdit()

      // 清空临时文本：恢复原始内容，确保没有临时标记
      const cleanContent = textContent.value.replace(/\u200B/g, '') // 移除零宽空格标记
      if (textarea.value !== cleanContent) {
        textarea.value = cleanContent
        textContent.value = cleanContent
        handleTextInput()
      }

      // 最后清理临时UI元素（在所有其他处理之后）
      if (tempEditContainer) {
        (tempEditContainer as HTMLElement).remove()
        tempEditContainer = null
      }
      if (tempTextOverlay) {
        (tempTextOverlay as HTMLElement).remove()
        tempTextOverlay = null
      }

      // 最后恢复textarea的正常显示状态
      textarea.style.color = ''
      textarea.style.caretColor = ''

      return
    }

    // AI编辑开始，暂停自动保存
    if (!isAIEditing) {
      isAIEditing = true
      pauseAutoSave()
    }

    const editorWrapper = textarea.parentElement
    if (!editorWrapper) return

    // 获取插入点信息
    const insertionPoint = tempEdit.insertionPoint
    if (!insertionPoint || typeof insertionPoint.index !== 'number') return

    const insertionIndex = insertionPoint.index
    const beforeText = textContent.value.slice(0, insertionIndex)
    const afterText = textContent.value.slice(insertionIndex)

    // 创建临时文本覆盖层（不修改实际文档内容）
    tempTextOverlay = document.createElement('div')
    tempTextOverlay.className = 'ai-temp-text-overlay'
    tempTextOverlay.style.cssText = `
      position: absolute;
      pointer-events: none;
      background: transparent;
      color: #1e40af;
      font-family: ${getComputedStyle(textarea).fontFamily};
      font-size: ${getComputedStyle(textarea).fontSize};
      line-height: ${getComputedStyle(textarea).lineHeight};
      padding: ${getComputedStyle(textarea).padding};
      border: ${getComputedStyle(textarea).border};
      white-space: pre-wrap;
      word-wrap: break-word;
      overflow-wrap: break-word;
      z-index: 10;
      width: ${textarea.offsetWidth}px;
      height: ${textarea.offsetHeight}px;
    `

    // 计算覆盖层内容：前缀文本 + 临时文本（带背景色，如果为空显示占位符） + 后缀文本
    const displayContent = tempEdit.content || (tempEdit.isStreaming ? '...' : '')
    const tempTextWithStyle = `<span style="background-color: #dbeafe; border-radius: 2px; padding: 2px 0;">${displayContent}</span>`
    tempTextOverlay.innerHTML = beforeText + tempTextWithStyle + afterText

    editorWrapper.style.position = 'relative'
    editorWrapper.appendChild(tempTextOverlay)

    // 在AI临时编辑期间（包括流式输出中）隐藏原始textarea的光标和选择
    // 这样可以避免影响正常的手写编辑和保存
    textarea.style.color = 'transparent'
    textarea.style.caretColor = 'transparent'

    // 只在流式输出完成后显示按钮
    if (!tempEdit.isStreaming) {

      // 锁定编辑，防止用户在决策期间修改文档
      lockEdit()

      // 创建按钮容器
      tempEditContainer = document.createElement('div')
      tempEditContainer.className = 'ai-temp-edit-controls'
      tempEditContainer.style.cssText = `
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
      acceptBtn.onclick = () => {
        // 首先恢复自动保存（在更新文档之前）
        if (isAIEditing) {
          isAIEditing = false
          resumeAutoSave()
        }

        // 解锁编辑
        unlockEdit()

        // 使用正常的文本编辑方式：直接修改文本内容，就像手动输入一样
        if (tempEdit.mode === 'polish' && tempEdit.originalSelection && 'index' in tempEdit.originalSelection && 'endIndex' in tempEdit.originalSelection) {
          // 润色模式：替换选中的文本范围，就像用户删除了选中文本然后输入新内容
          const originalStart = tempEdit.originalSelection.index!
          const originalEnd = tempEdit.originalSelection.endIndex!

          // 直接修改文本内容：删除选中范围，插入新内容
          const beforeText = textContent.value.slice(0, originalStart)
          const afterText = textContent.value.slice(originalEnd)
          const finalText = beforeText + tempEdit.content + afterText

          textarea.value = finalText
          textContent.value = finalText
          handleTextInput()

          // 将光标移到润色文本末端
          const newCursorPos = originalStart + tempEdit.content.length
          textarea.setSelectionRange(newCursorPos, newCursorPos)
        } else if (tempEdit.originalSelection && 'endIndex' in tempEdit.originalSelection) {
          // 续写模式：在选中内容末尾插入，就像用户在该位置继续输入
          const insertPos = tempEdit.originalSelection.endIndex!

          // 直接修改文本内容：在指定位置插入新内容
          const beforeText = textContent.value.slice(0, insertPos)
          const afterText = textContent.value.slice(insertPos)
          const finalText = beforeText + tempEdit.content + afterText

          textarea.value = finalText
          textContent.value = finalText
          handleTextInput()

          // 将光标移到插入文本末端
          const newCursorPos = insertPos + tempEdit.content.length
          textarea.setSelectionRange(newCursorPos, newCursorPos)
        } else {
          // 降级到旧逻辑（不应该发生，但保持兼容性）
          console.warn('[AIEditBridge] No originalSelection available, using fallback')
          if (tempEdit.mode === 'polish') {
            const finalText = beforeText + tempEdit.content + afterText
            textarea.value = finalText
            textContent.value = finalText
            handleTextInput()
            const newCursorPos = beforeText.length + tempEdit.content.length
            textarea.setSelectionRange(newCursorPos, newCursorPos)
          } else {
            const finalText = beforeText + tempEdit.content + afterText
            textarea.value = finalText
            textContent.value = finalText
            handleTextInput()
            const newCursorPos = beforeText.length + tempEdit.content.length
            textarea.setSelectionRange(newCursorPos, newCursorPos)
          }
        }

        textarea.focus()

        // 调用 store 方法标记为已接受（这会触发renderTemporaryEdit(null)进行最终清理）
        const aiStore = useAIStore()
        aiStore.acceptTemporaryEdit()
      }

      const rejectBtn = document.createElement('button')
      rejectBtn.textContent = '不接受'
      rejectBtn.className = 'px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300'
      rejectBtn.onclick = () => {
        // 恢复自动保存
        if (isAIEditing) {
          isAIEditing = false
          resumeAutoSave()
        }

        // 解锁编辑
        unlockEdit()

        // 拒绝：恢复原始内容
        textarea.value = textContent.value

        // 根据模式设置光标位置
        if (tempEdit.mode === 'polish' && tempEdit.originalSelection && 'index' in tempEdit.originalSelection) {
          // 润色模式：光标回到原始选中范围的开始位置
          const originalIndex = tempEdit.originalSelection.index!
          textarea.setSelectionRange(originalIndex, originalIndex)
        } else {
          // 续写或其他模式：光标回到插入位置
          textarea.setSelectionRange(insertionIndex, insertionIndex)
        }

        textarea.focus()

        // 调用 store 方法标记为已拒绝（这会触发renderTemporaryEdit(null)进行最终清理）
        const aiStore = useAIStore()
        aiStore.rejectTemporaryEdit()
      }

      tempEditContainer.appendChild(acceptBtn)
      tempEditContainer.appendChild(rejectBtn)

      // 简化定位：将按钮放在textarea的右下角
      const textareaRect = textarea.getBoundingClientRect()

      // 按钮位置：textarea底部稍微向上偏移
      const buttonTop = textareaRect.height - 60 // 距离底部60px
      const buttonLeft = textareaRect.width - 150 // 距离右侧150px

      tempEditContainer.style.top = `${Math.max(0, buttonTop)}px`
      tempEditContainer.style.left = `${Math.max(0, buttonLeft)}px`
      tempEditContainer.style.position = 'absolute'
      tempEditContainer.style.zIndex = '1000'

      editorWrapper.appendChild(tempEditContainer)
    }
  }

  // 清理临时UI元素
  function cleanupTemporaryUI() {
    if (tempEditContainer) {
      tempEditContainer.remove()
      tempEditContainer = null
    }
    if (tempTextOverlay) {
      tempTextOverlay.remove()
      tempTextOverlay = null
    }
    // 注意：不再在这里恢复样式和解锁编辑，这些都由renderTemporaryEdit(null)统一处理
  }

  onBeforeUnmount(() => {
    cleanupTemporaryUI()
    destroyAutoSave()
    ytext.unobserve(observer)
  })

  return {
    textContent,
    handleTextInput,
    insertAtCursor,
    replaceSelection,
    getCursorPosition,
    focus,
    renderTemporaryEdit,
    manualSave,
    destroy: () => {
      cleanupTemporaryUI()
      destroyAutoSave()
      ytext.unobserve(observer)
    }
  }
}
