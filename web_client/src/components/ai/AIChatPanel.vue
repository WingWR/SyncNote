<template>
  <div class="flex flex-col h-full bg-gray-50/30">
    <!-- 消息列表 -->
    <ChatMessageList :messages="currentChat?.messages || []" />

    <!-- 输入控件 -->
    <MessageInput
      :is-loading="isLoading"
      :current-mode="currentMode"
      :current-model="currentModel?.id || ''"
      :available-models="availableModels"
      @send-message="handleSendMessage"
      @mode-change="handleModeChange"
      @model-change="handleModelChange"
    />
  </div>
</template>

<script setup lang="ts">
import ChatMessageList from './chat/ChatMessageList.vue'
import MessageInput from './controls/MessageInput.vue'
import { useAIChat } from '../../composables/ai/useAIChat'

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
