import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useAIState } from './useAIState'
import { useAIActions } from './useAIActions'

export const useAIStore = defineStore('ai', () => {
  const { state } = useAIState()
  const actions = useAIActions(state)

  return {
    // State
    chats: computed(() => state.value.chats),
    currentChatId: computed(() => state.value.currentChatId),
    currentModel: computed(() => {
      // 如果有可用模型，返回当前模型；否则返回默认模型
      if (state.value.availableModels.length > 0) {
        return state.value.availableModels.find(m => m.id === state.value.currentModel.id) || state.value.availableModels[0]
      }
      return state.value.currentModel // 返回默认模型，但显示"模型未接入"
    }),
    availableModels: computed(() => state.value.availableModels),
    isLoading: computed(() => state.value.isLoading),
    isStreaming: computed(() => state.value.isStreaming),
    mode: computed(() => state.value.mode),

    currentChat: computed(() => {
      return state.value.chats.find(chat => chat.id === state.value.currentChatId) || null
    }),

    currentDocumentId: computed(() => state.value.currentDocumentId),
    pendingEdit: computed(() => state.value.pendingEdit),
    temporaryEdit: computed(() => state.value.temporaryEdit),
    errors: computed(() => state.value.errors),

    // Actions
    ...actions
  }
})

// 为了向后兼容，提供一个简单的store接口
export const useAIStoreCompat = defineStore('ai-compat', () => {
  const { state } = useAIState()
  const actions = useAIActions(state)

  return {
    messages: computed(() => state.value.currentChatId ?
      state.value.chats.find(c => c.id === state.value.currentChatId)?.messages || [] : []),
    availableModels: computed(() => state.value.availableModels),
    selectedModel: computed(() => state.value.currentModel),
    currentMode: computed(() => state.value.mode),
    isLoading: computed(() => state.value.isLoading),

    addMessage: (message: any) => {
      if (state.value.currentChatId) {
        actions.addMessage(state.value.currentChatId, message)
      }
    },
    setSelectedModel: actions.setCurrentModel,
    setMode: actions.setMode,
    clearMessages: () => {
      // 兼容性方法
    },
    setLoading: actions.setLoading,
    setModels: actions.setAvailableModels
  }
})
