import { computed } from 'vue'
import { useAIStore } from '../../stores/ai'
import { useAIModels } from './useAIModels'
import { chatStream } from '../../api/ai'
import type { AIStreamChunk } from '../../api/ai'

interface SendMessageOptions {
  documentId?: string
  context?: string
  /**
   * 获取当前编辑器光标位置（用于 continue/polish 模式）
   * 返回 { from, to } 用于 TipTap，或 { index } 用于 textarea
   */
  getInsertionPoint?: () => { from: number; to: number } | { index: number } | null
  /**
   * 原始选中范围（用于润色模式，需要替换选中的内容）
   */
  originalSelection?: { from: number; to: number } | { index: number; endIndex?: number } | null
  /**
   * 自动聚焦编辑器的回调（由编辑器层提供）
   */
  focusEditor?: () => void
}

export function useAIChat() {
  const aiStore = useAIStore()
  const { fetchModels } = useAIModels()

  // 初始化
  fetchModels()

  const currentChat = computed(() => aiStore.currentChat)
  const currentModel = computed(() => aiStore.currentModel)
  const availableModels = computed(() => aiStore.availableModels)
  const isLoading = computed(() => aiStore.isLoading)
  const isStreaming = computed(() => aiStore.isStreaming)
  const currentMode = computed(() => aiStore.mode)
  const currentDocumentId = computed(() => aiStore.currentDocumentId)

  function sendMessage(content: string, options?: SendMessageOptions) {
    console.log('[CHAT] Starting sendMessage, currentChatId:', aiStore.currentChatId)

    // 如果没有当前对话，创建一个新对话
    let chatId = aiStore.currentChatId
    if (!chatId) {
      chatId = aiStore.createChat()
      console.log('[CHAT] Created new chat:', chatId)
    } else {
      console.log('[CHAT] Using existing chat:', chatId)
    }

    // 记录当前文档（如果调用方显式传入，则优先使用）
    const effectiveDocumentId = options?.documentId ?? currentDocumentId.value ?? undefined
    if (effectiveDocumentId) {
      aiStore.setCurrentDocumentId(effectiveDocumentId)
    }

    // 添加用户消息
    const userMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user' as const,
      content,
      timestamp: new Date(),
      mode: aiStore.mode,
      documentId: effectiveDocumentId
    }
    console.log('[CHAT] Adding user message to chat:', chatId)
    aiStore.addMessage(chatId, userMessage)

    // 设置加载状态和流式输出状态
    aiStore.setLoading(true)
    aiStore.setStreaming(true)

    // 对于 continue/polish 模式，不添加聊天消息，只创建临时编辑状态
    let aiMessageId = ''

    if (aiStore.mode === 'continue' || aiStore.mode === 'polish') {
      // 不添加聊天消息，直接跳过
      aiMessageId = `msg-assistant-temp-${Date.now()}`
    } else {
      // 普通聊天模式，添加聊天消息
      const aiMessage = {
        id: `msg-assistant-${Date.now()}`,
        role: 'assistant' as const,
        content: '',
        timestamp: new Date(),
        isStreaming: true,
        mode: aiStore.mode,
        documentId: effectiveDocumentId
      }
      console.log('[CHAT] Adding AI message to chat:', chatId)
      aiStore.addMessage(chatId, aiMessage)
      aiMessageId = aiMessage.id
    }

    // 如果是 continue/polish 模式，创建临时编辑状态并自动聚焦编辑器
    if ((aiStore.mode === 'continue' || aiStore.mode === 'polish') && effectiveDocumentId) {
      // 优先使用传入的回调，否则从 store 获取
      const getInsertionPoint = options?.getInsertionPoint ?? aiStore.editorCallbacks?.getInsertionPoint
      const focusEditor = options?.focusEditor ?? aiStore.editorCallbacks?.focusEditor

      // 获取插入位置
      const insertionPoint = getInsertionPoint?.()
      let point: { from: number; to: number } | undefined
      if (insertionPoint) {
        if ('from' in insertionPoint && 'to' in insertionPoint) {
          point = { from: insertionPoint.from, to: insertionPoint.to }
        } else if ('index' in insertionPoint) {
          // textarea: index 转为 from/to
          point = { from: insertionPoint.index, to: insertionPoint.index }
        }
      }

      // 创建临时编辑状态
      const tempEdit: any = {
        documentId: effectiveDocumentId,
        messageId: aiMessageId,
        mode: aiStore.mode,
        content: '',
        isStreaming: true,
        insertionPoint: point
      }

      // 处理原始选中范围
      if (options.originalSelection) {
        if ('from' in options.originalSelection && 'to' in options.originalSelection) {
          // TipTap格式
          tempEdit.originalSelection = { from: options.originalSelection.from, to: options.originalSelection.to }
        } else if ('index' in options.originalSelection && 'endIndex' in options.originalSelection) {
          // Textarea格式
          tempEdit.originalSelection = { index: options.originalSelection.index, endIndex: options.originalSelection.endIndex }
        }
      }

      aiStore.setTemporaryEdit(tempEdit)

      // 自动聚焦编辑器
      focusEditor?.()
    }

    // 发起真正的流式API请求
    console.log('[CHAT] Initiating streaming response for chat:', chatId)
    initiateStreamingResponse(chatId, content, {
      documentId: effectiveDocumentId,
      context: options?.context
    })
  }

  function initiateStreamingResponse(
    chatId: string,
    userContent: string,
    { documentId, context }: SendMessageOptions
  ) {
    console.log('[CHAT] initiateStreamingResponse called with chatId:', chatId)
    chatStream({
      message: userContent,
      modelId: aiStore.currentModel?.id || '',
      mode: aiStore.mode,
      documentId,
      context
    }, {
      onChunk: (chunk: AIStreamChunk) => {
        console.log('[COMPOSABLE] Received chunk:', chunk)
        if (chunk.type === 'chunk') {
          const delta = chunk.content
          
          // 如果是 continue/polish 模式，只更新临时编辑状态（流式输出到编辑器），不更新聊天消息
          if (aiStore.mode === 'continue' || aiStore.mode === 'polish') {
            if (aiStore.temporaryEdit) {
              aiStore.updateTemporaryEditContent(delta)
            } else {
              console.warn('[COMPOSABLE] temporaryEdit not found, but mode is continue/polish')
            }
            // 不更新聊天消息，让输出直接到编辑器
            return
          }
          
          // 普通聊天模式，更新聊天消息
          console.log('[COMPOSABLE] Updating streaming message with delta:', delta)
          aiStore.updateStreamingMessage(chatId, delta)
        } else if (chunk.type === 'done') {
          console.log('[COMPOSABLE] Stream completed')
          aiStore.setStreaming(false)
          
          // 如果是 continue/polish 模式，完成临时编辑
          if (aiStore.mode === 'continue' || aiStore.mode === 'polish') {
            if (aiStore.temporaryEdit) {
              aiStore.finalizeTemporaryEdit()
            }
          } else {
            aiStore.finalizeStreamingMessage(chatId)
          }
          
          aiStore.setLoading(false)
        }
      },
      onComplete: () => {
        aiStore.setStreaming(false)
        
        // 如果是 continue/polish 模式，完成临时编辑
        if (aiStore.mode === 'continue' || aiStore.mode === 'polish') {
          if (aiStore.temporaryEdit) {
            aiStore.finalizeTemporaryEdit()
          }
        } else {
          aiStore.finalizeStreamingMessage(chatId)
        }
        
        aiStore.setLoading(false)
      },
      onError: (error: Error) => {
        console.error('Stream error:', error)
        aiStore.setStreaming(false)
        aiStore.finalizeStreamingMessage(chatId)
        aiStore.setLoading(false)

        // 添加错误消息
        const errorMessage = {
          id: `msg-error-${Date.now()}`,
          role: 'assistant' as const,
          content: '抱歉，AI服务暂时不可用，请稍后再试。',
          timestamp: new Date()
        }
        aiStore.addMessage(chatId, errorMessage)
      }
    })
  }

  function changeModel(modelId: string) {
    const model = aiStore.availableModels.find(m => m.id === modelId)
    if (model) {
      aiStore.setCurrentModel(model)
    }
  }

  function changeMode(mode: 'chat' | 'polish' | 'continue') {
    aiStore.setMode(mode)
  }

  return {
    currentChat,
    currentModel,
    availableModels,
    isLoading,
    isStreaming,
    currentMode,
    currentDocumentId,
    sendMessage,
    changeModel,
    changeMode
  }
}
