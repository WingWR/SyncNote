import { nextTick } from 'vue'
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
