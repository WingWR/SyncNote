import { ref, markRaw } from 'vue'
import type { AIState, AIModel } from './types'

const defaultModel: AIModel = {
  id: 'gpt-4',
  name: 'GPT-4',
  provider: 'OpenAI'
}

export function useAIState() {
  const state = ref<AIState>({
    chats: [],
    currentChatId: null,
    currentModel: defaultModel,
    availableModels: [], // 初始化为空数组，后端API不可用时显示"模型未接入"
    isLoading: false,
    isStreaming: false,
    mode: 'chat'
  })

  return {
    state
  }
}
