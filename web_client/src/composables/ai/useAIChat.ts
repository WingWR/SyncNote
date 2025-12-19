// AIChatPanel的业务逻辑
import { useAIStore } from '../../stores/ai'
import { useDocumentStore } from '../../stores/document'
import { chat } from '../../api/ai'

export function useAIChat() {
  const aiStore = useAIStore()
  const documentStore = useDocumentStore()

  async function sendMessage(message: string) {
    if (!message.trim() || aiStore.isLoading) return

    // 添加用户消息
    aiStore.addMessage({
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: Date.now()
    })

    aiStore.setLoading(true)

    try {
      const response = await chat({
        message,
        documentId: documentStore.currentDocument?.id,
        modelId: aiStore.selectedModel?.id ?? '',
        mode: aiStore.currentMode,
        context: documentStore.currentDocument
          ? `当前文档: ${documentStore.currentDocument.fileName}`
          : undefined
      })

      // 添加 AI 回复
      aiStore.addMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: Date.now()
      })
    } catch (err) {
      aiStore.addMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'AI 服务暂时不可用，请稍后再试',
        timestamp: Date.now()
      })
    } finally {
      aiStore.setLoading(false)
    }
  }

  return {
    sendMessage
  }
}
