import { onMounted } from 'vue'
import { getModels } from '../../api/ai'
import { useAIStore } from '../../stores/ai'

export function useAIModels() {
  const aiStore = useAIStore()

  async function fetchModels() {
    aiStore.clearError('model') // 清除之前的模型加载错误

    try {
      const response = await getModels()
      if (response.code === 200) {
        aiStore.setAvailableModels(response.data || [])
        aiStore.clearError('model') // 清除模型加载错误
      } else {
        console.error('加载 AI 模型失败:', response.message)
        aiStore.setAvailableModels([])
        aiStore.addError({
          type: 'model',
          message: response.message || '加载AI模型失败'
        })
      }
    } catch (err: any) {
      console.error('加载 AI 模型失败，显示空列表', err)

      let errorMessage = '加载AI模型失败'
      if (err.code === 'ECONNABORTED') {
        errorMessage = '网络连接超时，无法加载AI模型'
      }

      aiStore.setAvailableModels([])
      aiStore.addError({
        type: 'model',
        message: errorMessage
      })
    }
  }

  onMounted(fetchModels)

  return {
    fetchModels
  }
}
