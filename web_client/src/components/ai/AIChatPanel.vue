<template>
  <div class="flex flex-col h-full bg-gray-50/30">
    <!-- AI 模型加载错误提示 -->
    <div v-if="aiStore.errors.filter(e => e.type === 'model').length > 0" class="p-4 bg-yellow-50 border-b border-yellow-200">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-yellow-800">
            AI 模型加载失败：{{ aiStore.errors.filter(e => e.type === 'model')[0]?.message }}
          </p>
        </div>
      </div>
    </div>

    <!-- 消息列表 -->
    <ChatMessageList
      :messages="currentChat?.messages || []"
      :key="currentChat?.id || 'no-chat'"
    />

    <!-- 输入控件 - 只在聊天模式显示 -->
    <div v-if="currentMode === 'chat'" class="flex-shrink-0 min-h-[120px]">
      <MessageInput
        v-show="true"
        key="message-input"
        :is-loading="isLoading"
        :current-mode="currentMode"
        :current-model="currentModel?.id || ''"
        :available-models="availableModels"
        @send-message="handleSendMessage"
        @mode-change="handleModeChange"
        @model-change="handleModelChange"
      />
    </div>

    <!-- 续写/润色模式提示 -->
    <div v-else-if="currentMode === 'continue' || currentMode === 'polish'" class="flex-shrink-0 p-4 bg-blue-50 border-t border-blue-200">
      <div class="text-center text-blue-700">
        <p class="text-sm font-medium">
          {{ currentMode === 'continue' ? '续写模式' : '润色模式' }}已激活
        </p>
        <p class="text-xs mt-1 text-blue-600">
          请在文档中选择需要{{ currentMode === 'continue' ? '续写' : '润色' }}的文本，然后使用工具栏按钮发送请求。
        </p>
        <button
          @click="changeMode('chat')"
          class="mt-2 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          切换到聊天模式
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ChatMessageList from './chat/ChatMessageList.vue'
import MessageInput from './controls/MessageInput.vue'
import { useAIChat } from '../../composables/ai/useAIChat'
import { useAIStore } from '../../stores/ai'

const {
  currentChat,
  currentModel,
  availableModels,
  isLoading,
  currentMode,
  sendMessage,
  changeModel,
  changeMode
} = useAIChat()

const aiStore = useAIStore()

function handleSendMessage(message: string) {
  sendMessage(message)
}

function handleModelChange(modelId: string) {
  changeModel(modelId)
}

function handleModeChange(mode: 'chat' | 'polish' | 'continue') {
  changeMode(mode)
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
