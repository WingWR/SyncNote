import { onMounted } from 'vue'
import { getModels } from '../../api/ai'
import { useAIStore } from '../../stores/ai'

export function useAIModels() {
  const aiStore = useAIStore()

  async function loadModels() {
    aiStore.isModelLoading = true
    try {
      const models = await getModels()
      aiStore.setModels(models)
    } catch (err) {
      console.error('加载 AI 模型失败', err)
    } finally {
      aiStore.isModelLoading = false
    }
  }

  onMounted(loadModels)

  return {
    loadModels
  }
}
