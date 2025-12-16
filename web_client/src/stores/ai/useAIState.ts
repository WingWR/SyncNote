import { ref } from 'vue'
import type { AIMessage, AIModel, AIMode } from './types'

export function useAIState() {
  const messages = ref<AIMessage[]>([])
  const availableModels = ref<AIModel[]>([])
  const selectedModel = ref<AIModel | null>(null)
  const currentMode = ref<AIMode>('chat')
  const isLoading = ref(false)
  const isModelLoading = ref(false)

  function setModels(models: AIModel[]) {
    availableModels.value = models
    selectedModel.value = models[0] ?? null
  }

  return {
    messages,
    availableModels,
    selectedModel,
    currentMode,
    isLoading,
    isModelLoading,
    setModels
  }
}
