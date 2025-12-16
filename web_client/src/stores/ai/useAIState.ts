import { ref } from 'vue'
import type { AIMessage, AIModel, AIMode } from './types'

export function useAIState() {
  const messages = ref<AIMessage[]>([])
  const availableModels = ref<AIModel[]>([
    { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI' },
    { id: 'gpt-3.5', name: 'GPT-3.5', provider: 'OpenAI' },
    { id: 'claude-3', name: 'Claude 3', provider: 'Anthropic' }
  ])

  const selectedModel = ref<AIModel | null>(availableModels.value[0] ?? null)
  const currentMode = ref<AIMode>('chat')
  const isLoading = ref(false)

  return {
    messages,
    availableModels,
    selectedModel,
    currentMode,
    isLoading
  }
}