import type { Ref } from 'vue'
import type { AIState, AIMessage, AIChat, AIModel, AIEditOperation, AITemporaryEdit, AIError } from './types'

export function useAIActions(state: Ref<AIState>) {
  function setLoading(loading: boolean) {
    state.value.isLoading = loading
  }

  function setStreaming(streaming: boolean) {
    state.value.isStreaming = streaming
  }

  function setMode(mode: 'chat' | 'polish' | 'continue') {
    state.value.mode = mode
  }

  function setCurrentDocumentId(docId: string | null) {
    state.value.currentDocumentId = docId
  }

  function setCurrentModel(model: AIModel) {
    state.value.currentModel = model
  }

  function setAvailableModels(models: AIModel[]) {
    state.value.availableModels = models
  }

  function setPendingEdit(op: AIEditOperation | null) {
    state.value.pendingEdit = op
  }

  function clearPendingEdit() {
    state.value.pendingEdit = null
  }

  function markMessageAsSuggestion(messageId: string, accepted: boolean) {
    const chat = state.value.chats.find((c: AIChat) => c.id === state.value.currentChatId)
    if (!chat) return
    const msg = chat.messages.find((m: AIMessage) => m.id === messageId)
    if (!msg) return
    msg.isSuggestion = true
    msg.accepted = accepted
    msg.rejected = !accepted
  }

  /**
   * 根据某条 AI 消息生成待执行的文档编辑操作（命令对象）
   * 真正的应用逻辑由 useAIEditBridge 在编辑器中执行
   */
  function createPendingEditFromMessage(messageId: string) {
    // 在所有对话中查找该消息，保证唯一性
    const chat = state.value.chats.find((c: AIChat) =>
      c.messages.some((m: AIMessage) => m.id === messageId)
    )
    if (!chat) return

    const msg = chat.messages.find((m: AIMessage) => m.id === messageId)
    if (!msg || msg.role !== 'assistant') return

    const documentId = msg.documentId ?? state.value.currentDocumentId
    if (!documentId) return

    // 根据消息的模式决定操作类型
    let opType: AIEditOperation['type'] | null = null
    if (msg.mode === 'continue') {
      opType = 'append'
    } else if (msg.mode === 'polish') {
      opType = 'replace'
    }

    if (!opType) return

    const op: AIEditOperation = {
      type: opType,
      documentId,
      // 对于续写：在当前光标处追加全文内容；
      // 对于润色：使用当前选区做替换，targetText 可选（以后可以从 context 填充）
      replacementText: msg.content
    }

    state.value.pendingEdit = op
  }

  function addMessage(chatId: string, message: AIMessage) {
    console.log('[STORE] Adding message:', { chatId, role: message.role, isStreaming: message.isStreaming })
    const chat = state.value.chats.find((c: AIChat) => c.id === chatId)
    if (chat) {
      chat.messages.push(message)
      chat.updatedAt = new Date()
      console.log('[STORE] Message added, total messages:', chat.messages.length)
    }
  }

  function updateStreamingMessage(chatId: string, delta: string) {
    console.log('[STORE] Updating streaming message:', { chatId, delta })
    console.log('[STORE] Available chats:', state.value.chats.map(c => ({ id: c.id, messageCount: c.messages.length })))
    const chat = state.value.chats.find((c: AIChat) => c.id === chatId)
    if (chat && chat.messages.length > 0) {
      const lastMessageIndex = chat.messages.length - 1
      const lastMessage = chat.messages[lastMessageIndex]
      if (lastMessage) {
        console.log('[STORE] Last message before update:', { role: lastMessage.role, isStreaming: lastMessage.isStreaming, contentLength: lastMessage.content.length, id: lastMessage.id })
        if (lastMessage.role === 'assistant' && lastMessage.isStreaming) {
          // Create a new message object to ensure reactivity
          const updatedMessage = {
            ...lastMessage,
            content: lastMessage.content + delta
          }
          // Direct assignment should work with Vue 3 reactivity
          chat.messages[lastMessageIndex] = updatedMessage
          chat.updatedAt = new Date()
          console.log('[STORE] Message updated, new content length:', updatedMessage.content.length)
        } else {
          console.log('[STORE] Message not updated - conditions not met')
        }
      }
    } else {
      console.log('[STORE] Chat or messages not found')
    }
  }

  function finalizeStreamingMessage(chatId: string) {
    console.log('[STORE] Finalizing streaming message:', chatId)
    const chat = state.value.chats.find((c: AIChat) => c.id === chatId)
    if (chat && chat.messages.length > 0) {
      const lastMessageIndex = chat.messages.length - 1
      const lastMessage = chat.messages[lastMessageIndex]
      if (lastMessage && lastMessage.role === 'assistant' && lastMessage.isStreaming) {
        // Create a new message object to ensure reactivity
        const finalizedMessage = {
          ...lastMessage,
          isStreaming: false
        }
        // Direct assignment should work with Vue 3 reactivity
        chat.messages[lastMessageIndex] = finalizedMessage
        chat.updatedAt = new Date()
        console.log('[STORE] Message finalized, isStreaming set to false')
      }
    }
  }

  function createChat(): string {
    const chatId = `chat-${Date.now()}`
    const newChat: AIChat = {
      id: chatId,
      title: '新对话',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    state.value.chats.unshift(newChat)
    state.value.currentChatId = chatId
    return chatId
  }

  function setCurrentChat(chatId: string | null) {
    state.value.currentChatId = chatId
  }

  /**
   * 设置临时编辑状态（流式输出到编辑器）
   */
  function setTemporaryEdit(tempEdit: AITemporaryEdit | null) {
    state.value.temporaryEdit = tempEdit
  }

  /**
   * 更新临时编辑的文本内容（流式追加）
   */
  function updateTemporaryEditContent(delta: string) {
    if (state.value.temporaryEdit) {
      state.value.temporaryEdit.content += delta
    }
  }

  /**
   * 完成临时编辑（流式结束）
   */
  function finalizeTemporaryEdit() {
    if (state.value.temporaryEdit) {
      state.value.temporaryEdit.isStreaming = false
    }
  }

  /**
   * 接受临时编辑：将临时文本转为正式文本
   */
  function acceptTemporaryEdit() {
    if (!state.value.temporaryEdit) return

    const tempEdit = state.value.temporaryEdit
    const chat = state.value.chats.find((c: AIChat) => c.id === state.value.currentChatId)
    if (chat) {
      const msg = chat.messages.find((m: AIMessage) => m.id === tempEdit.messageId)
      if (msg) {
        msg.accepted = true
        msg.rejected = false
        msg.isSuggestion = true
      }
    }

    // 清空临时编辑，实际应用由 useAIEditBridge 处理
    state.value.temporaryEdit = null
  }

  /**
   * 拒绝临时编辑：删除临时文本
   */
  function rejectTemporaryEdit() {
    if (!state.value.temporaryEdit) return

    const tempEdit = state.value.temporaryEdit
    const chat = state.value.chats.find((c: AIChat) => c.id === state.value.currentChatId)
    if (chat) {
      const msg = chat.messages.find((m: AIMessage) => m.id === tempEdit.messageId)
      if (msg) {
        msg.accepted = false
        msg.rejected = true
        msg.isSuggestion = true
      }
    }

    // 清空临时编辑，实际删除由 useAIEditBridge 处理
    state.value.temporaryEdit = null
  }

  /**
   * 注册编辑器回调（由 DocumentEditor 调用）
   */
  function setEditorCallbacks(callbacks: {
    getInsertionPoint: () => { from: number; to: number } | { index: number } | null
    focusEditor: () => void
  } | null) {
    state.value.editorCallbacks = callbacks
  }

  // 错误状态管理 - 解耦错误处理逻辑
  function addError(error: Omit<AIError, 'timestamp'>) {
    const errorObj: AIError = {
      ...error,
      timestamp: new Date()
    }
    state.value.errors.push(errorObj)

    // 只保留最近10个错误
    if (state.value.errors.length > 10) {
      state.value.errors = state.value.errors.slice(-10)
    }
  }

  function clearErrors() {
    state.value.errors = []
  }

  function clearError(type: AIError['type']) {
    state.value.errors = state.value.errors.filter(e => e.type !== type)
  }

  return {
    setLoading,
    setStreaming,
    setMode,
    setCurrentDocumentId,
    setCurrentModel,
    setAvailableModels,
    setPendingEdit,
    clearPendingEdit,
    createPendingEditFromMessage,
    markMessageAsSuggestion,
    addMessage,
    updateStreamingMessage,
    finalizeStreamingMessage,
    createChat,
    setCurrentChat,
    setTemporaryEdit,
    updateTemporaryEditContent,
    finalizeTemporaryEdit,
    acceptTemporaryEdit,
    rejectTemporaryEdit,
    setEditorCallbacks,
    // 错误处理方法
    addError,
    clearErrors,
    clearError
  }
}
