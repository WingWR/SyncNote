<template>
  <div class="p-4 border-b border-gray-200 flex flex-col" style="max-height: 400px;">
    <h3 class="text-sm font-semibold text-gray-700 mb-3">AI助手</h3>

    <ChatMessageList :messages="aiStore.messages" />

    <div class="space-y-2">
      <ModelSelector
        :models="aiStore.availableModels"
        v-model:modelId="selectedModelId"
      />

      <ModeSwitch
        :currentMode="aiStore.currentMode"
        @change="aiStore.setMode"
      />

      <MessageInput
        :loading="aiStore.isLoading"
        @send="sendMessage"
      >
        <Send :size="18" />
      </MessageInput>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Send } from 'lucide-vue-next'

import { useAIStore } from '../../stores/ai/index'
import { useAIChat } from '../..//composables/ai/useAIChat'

import ChatMessageList from './chat/ChatMessageList.vue'
import ModelSelector from './controls/ModelSelector.vue'
import ModeSwitch from './controls/ModeSwitch.vue'
import MessageInput from './controls/MessageInput.vue'

const aiStore = useAIStore()
const { sendMessage } = useAIChat()  // 从 composable 拿逻辑

const selectedModelId = ref(aiStore.availableModels[0]?.id ?? '')

watch(selectedModelId, (newId) => {
  const model = aiStore.availableModels.find(m => m.id === newId)
  if (model) {
    aiStore.setSelectedModel(model)
  }
})

// sendMessage 已经在 composable 里定义，不需要重复写
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
