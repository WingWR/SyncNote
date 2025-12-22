import { computed } from 'vue'
import { useAIStore } from '../../stores/ai'
import { useAIModels } from './useAIModels'
import { chatStream } from '../../api/ai'
import type { AIStreamChunk } from '../../api/ai'

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

  function sendMessage(content: string) {
    console.log('[CHAT] Starting sendMessage, currentChatId:', aiStore.currentChatId)

    // 如果没有当前对话，创建一个新对话
    let chatId = aiStore.currentChatId
    if (!chatId) {
      chatId = aiStore.createChat()
      console.log('[CHAT] Created new chat:', chatId)
    } else {
      console.log('[CHAT] Using existing chat:', chatId)
    }

    // 添加用户消息
    const userMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user' as const,
      content,
      timestamp: new Date()
    }
    console.log('[CHAT] Adding user message to chat:', chatId)
    aiStore.addMessage(chatId, userMessage)

    // 设置加载状态和流式输出状态
    aiStore.setLoading(true)
    aiStore.setStreaming(true)

    // 添加初始的流式 AI 消息
    const aiMessage = {
      id: `msg-assistant-${Date.now()}`,
      role: 'assistant' as const,
      content: '',
      timestamp: new Date(),
      isStreaming: true
    }
    console.log('[CHAT] Adding AI message to chat:', chatId)
    aiStore.addMessage(chatId, aiMessage)

    // 发起真正的流式API请求
    console.log('[CHAT] Initiating streaming response for chat:', chatId)
    initiateStreamingResponse(chatId, content)
  }

  function initiateStreamingResponse(chatId: string, userContent: string) {
    console.log('[CHAT] initiateStreamingResponse called with chatId:', chatId)
    chatStream({
      message: userContent,
      modelId: aiStore.currentModel?.id || '',
      mode: aiStore.mode,
      documentId: undefined, // TODO: Add document context if needed
      context: undefined
    }, {
      onChunk: (chunk: AIStreamChunk) => {
        console.log('[COMPOSABLE] Received chunk:', chunk)
        if (chunk.type === 'chunk') {
          console.log('[COMPOSABLE] Updating streaming message with delta:', chunk.content)
          aiStore.updateStreamingMessage(chatId, chunk.content) // Now chunk.content is delta
        } else if (chunk.type === 'done') {
          console.log('[COMPOSABLE] Stream completed')
          aiStore.setStreaming(false)
          aiStore.finalizeStreamingMessage(chatId)
          aiStore.setLoading(false)
        }
      },
      onComplete: () => {
        aiStore.setStreaming(false)
        aiStore.finalizeStreamingMessage(chatId)
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
    sendMessage,
    changeModel,
    changeMode
  }
}
