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
    // 如果没有当前对话，创建一个新对话
    let chatId = aiStore.currentChatId
    if (!chatId) {
      chatId = aiStore.createChat()
    }

    // 添加用户消息
    const userMessage = {
      id: `msg-${Date.now()}`,
      role: 'user' as const,
      content,
      timestamp: new Date()
    }
    aiStore.addMessage(chatId, userMessage)

    // 设置加载状态和流式输出状态
    aiStore.setLoading(true)
    aiStore.setStreaming(true)

    // 添加初始的流式 AI 消息
    const aiMessage = {
      id: `msg-${Date.now() + 1}`,
      role: 'assistant' as const,
      content: '',
      timestamp: new Date(),
      isStreaming: true
    }
    aiStore.addMessage(chatId, aiMessage)

    // 发起真正的流式API请求
    initiateStreamingResponse(chatId, content)
  }

  function initiateStreamingResponse(chatId: string, userContent: string) {
    chatStream({
      message: userContent,
      modelId: aiStore.currentModel?.id || '',
      mode: aiStore.mode,
      documentId: undefined, // TODO: Add document context if needed
      context: undefined
    }, {
      onChunk: (chunk: AIStreamChunk) => {
        if (chunk.type === 'chunk') {
          aiStore.updateStreamingMessage(chatId, chunk.content)
        } else if (chunk.type === 'done') {
          aiStore.updateStreamingMessage(chatId, chunk.content)
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
