import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface AIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface AIModel {
  id: string
  name: string
  provider: string
}

export type AIMode = 'chat' | 'agent'

export const useAIStore = defineStore('ai', () => {
  const messages = ref<AIMessage[]>([])
  const availableModels = ref<AIModel[]>([
    { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI' },
    { id: 'gpt-3.5', name: 'GPT-3.5', provider: 'OpenAI' },
    { id: 'claude-3', name: 'Claude 3', provider: 'Anthropic' }
  ])
  const selectedModel = ref<AIModel | null>(availableModels.value[0] ?? null)
  const currentMode = ref<AIMode>('chat')
  const isLoading = ref(false)

  function addMessage(message: AIMessage) {
    messages.value.push(message)
  }

  function setSelectedModel(model: AIModel | null) {
    selectedModel.value = model
  }

  function setMode(mode: AIMode) {
    currentMode.value = mode
  }

  function clearMessages() {
    messages.value = []
  }

  function setLoading(loading: boolean) {
    isLoading.value = loading
  }

  return {
    messages,
    availableModels,
    selectedModel,
    currentMode,
    isLoading,
    addMessage,
    setSelectedModel,
    setMode,
    clearMessages,
    setLoading
  }
})

