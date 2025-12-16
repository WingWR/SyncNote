
import type { AIMessage, AIModel, AIMode } from './types'

export function useAIActions(state: {
  messages: { value: AIMessage[] }
  selectedModel: { value: AIModel | null }
  currentMode: { value: AIMode }
  isLoading: { value: boolean }
}) {
  function addMessage(message: AIMessage) {
    state.messages.value.push(message)
  }

  function setSelectedModel(model: AIModel | null) {
    state.selectedModel.value = model
  }

  function setMode(mode: AIMode) {
    state.currentMode.value = mode
  }

  function clearMessages() {
    state.messages.value = []
  }

  function setLoading(loading: boolean) {
    state.isLoading.value = loading
  }

  return {
    addMessage,
    setSelectedModel,
    setMode,
    clearMessages,
    setLoading
  }
}
