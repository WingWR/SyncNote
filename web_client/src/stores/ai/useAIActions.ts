import type { Ref } from 'vue'
import type { AIState, AIMessage, AIChat, AIModel } from './types'

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

  function setCurrentModel(model: AIModel) {
    state.value.currentModel = model
  }

  function setAvailableModels(models: AIModel[]) {
    state.value.availableModels = models
  }

  function addMessage(chatId: string, message: AIMessage) {
    const chat = state.value.chats.find((c: AIChat) => c.id === chatId)
    if (chat) {
      chat.messages.push(message)
      chat.updatedAt = new Date()
    }
  }

  function updateStreamingMessage(chatId: string, content: string) {
    const chat = state.value.chats.find((c: AIChat) => c.id === chatId)
    if (chat && chat.messages.length > 0) {
      const lastMessage = chat.messages[chat.messages.length - 1]
      if (lastMessage && lastMessage.role === 'assistant' && lastMessage.isStreaming) {
        lastMessage.content = content
        chat.updatedAt = new Date()
      }
    }
  }

  function finalizeStreamingMessage(chatId: string) {
    const chat = state.value.chats.find((c: AIChat) => c.id === chatId)
    if (chat && chat.messages.length > 0) {
      const lastMessage = chat.messages[chat.messages.length - 1]
      if (lastMessage && lastMessage.role === 'assistant' && lastMessage.isStreaming) {
        lastMessage.isStreaming = false
        chat.updatedAt = new Date()
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

  return {
    setLoading,
    setStreaming,
    setMode,
    setCurrentModel,
    setAvailableModels,
    addMessage,
    updateStreamingMessage,
    finalizeStreamingMessage,
    createChat,
    setCurrentChat
  }
}
