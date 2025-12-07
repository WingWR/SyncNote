<template>
  <div class="p-4 border-b border-gray-200 flex flex-col" style="max-height: 400px;">
    <h3 class="text-sm font-semibold text-gray-700 mb-3">AI助手</h3>
    
    <!-- 聊天记录区域 -->
    <div class="flex-1 overflow-y-auto mb-3 space-y-2" style="min-height: 200px;">
      <div
        v-for="message in aiStore.messages"
        :key="message.id"
        :class="[
          'p-2 rounded-lg text-sm',
          message.role === 'user'
            ? 'bg-blue-100 text-blue-900 ml-8'
            : 'bg-gray-100 text-gray-900 mr-8'
        ]"
      >
        <div class="font-medium mb-1">
          {{ message.role === 'user' ? '你' : 'AI' }}
        </div>
        <div class="whitespace-pre-wrap">{{ message.content }}</div>
      </div>
      <div v-if="aiStore.messages.length === 0" class="text-center text-gray-400 text-sm py-4">
        开始与AI对话吧
      </div>
    </div>

    <!-- 交互区域 -->
    <div class="space-y-2">
      <!-- 选择大模型 -->
      <select
        v-model="selectedModelId"
        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
      >
        <option
          v-for="model in aiStore.availableModels"
          :key="model.id"
          :value="model.id"
        >
          {{ model.name }} ({{ model.provider }})
        </option>
      </select>

      <!-- 选择模式 -->
      <div class="flex gap-2">
        <button
          @click="aiStore.setMode('chat')"
          :class="[
            'flex-1 px-3 py-2 text-sm rounded-lg transition-colors',
            aiStore.currentMode === 'chat'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          Chat
        </button>
        <button
          @click="aiStore.setMode('agent')"
          :class="[
            'flex-1 px-3 py-2 text-sm rounded-lg transition-colors',
            aiStore.currentMode === 'agent'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          Agent
        </button>
      </div>

      <!-- 输入框和发送按钮 -->
      <div class="flex gap-2">
        <input
          v-model="inputMessage"
          @keyup.enter="sendMessage"
          type="text"
          placeholder="输入消息..."
          class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          :disabled="aiStore.isLoading"
        />
        <button
          @click="sendMessage"
          :disabled="aiStore.isLoading || !inputMessage.trim()"
          class="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send :size="18" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Send } from 'lucide-vue-next'
import { useAIStore } from '../stores/ai'
import { useDocumentStore } from '../stores/document'
import { aiApi } from '../api/ai'

const aiStore = useAIStore()
const documentStore = useDocumentStore()

const inputMessage = ref('')
const selectedModelId = ref(aiStore.availableModels[0]?.id || '')

watch(selectedModelId, (newId) => {
  const model = aiStore.availableModels.find(m => m.id === newId)
  if (model) {
    aiStore.setSelectedModel(model)
  }
})

async function sendMessage() {
  if (!inputMessage.value.trim() || aiStore.isLoading) return

  const userMessage = inputMessage.value.trim()
  inputMessage.value = ''

  // 添加用户消息
  aiStore.addMessage({
    id: Date.now().toString(),
    role: 'user',
    content: userMessage,
    timestamp: Date.now()
  })

  // 发送到AI
  aiStore.setLoading(true)
  try {
    const response = await aiApi.chat({
      message: userMessage,
      documentId: documentStore.currentDocument?.id,
      modelId: selectedModelId.value,
      mode: aiStore.currentMode,
      context: documentStore.currentDocument
        ? `当前文档: ${documentStore.currentDocument.name}`
        : undefined
    })

    // 添加AI回复
    aiStore.addMessage({
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response.message,
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('AI聊天失败:', error)
    aiStore.addMessage({
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '抱歉，AI服务暂时不可用，请稍后再试。',
      timestamp: Date.now()
    })
  } finally {
    aiStore.setLoading(false)
  }
}
</script>

<style scoped>
/* 自定义滚动条 */
div[style*="overflow-y-auto"]::-webkit-scrollbar {
  width: 4px;
}

div[style*="overflow-y-auto"]::-webkit-scrollbar-track {
  background: #f1f1f1;
}

div[style*="overflow-y-auto"]::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}
</style>


