import { onMounted } from 'vue'
import { getModels } from '../../api/ai'
import { useAIStore } from '../../stores/ai'

export function useAIModels() {
  const aiStore = useAIStore()

  async function fetchModels() {
    try {
      const response = await getModels()
      if (response.code === 200) {
        // API调用成功时设置模型列表
        aiStore.setAvailableModels(response.data || [])
      } else {
        console.error('加载 AI 模型失败:', response.message)
        aiStore.setAvailableModels([])
      }
    } catch (err) {
      console.error('加载 AI 模型失败，显示空列表', err)
      // API调用失败时保持空数组，显示"模型未接入"
      aiStore.setAvailableModels([])
    }
  }

  onMounted(fetchModels)

  return {
    fetchModels
  }
}
