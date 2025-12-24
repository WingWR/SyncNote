<template>
  <div class="group relative">
    <!-- 消息内容区域 -->
    <div class="px-4 py-2 hover:bg-gray-50/50 transition-colors">
      <div class="max-w-4xl mx-auto">
        <!-- 角色标识 -->
        <div class="flex items-center gap-2 mb-2">
          <div
            :class="[
              'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
              message.role === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-green-500 text-white'
            ]"
          >
            {{ message.role === 'user' ? 'U' : 'AI' }}
          </div>
          <span class="text-xs text-gray-500 font-medium">
            {{ message.role === 'user' ? 'You' : 'Assistant' }}
          </span>
          <span class="text-xs text-gray-400">
            {{ formatTime(message.timestamp) }}
          </span>
        </div>

        <!-- 消息内容 -->
        <div class="prose prose-sm max-w-none pl-8">
          <div class="whitespace-pre-wrap break-words text-gray-800">
            {{ message.content }}
            <!-- 流式输出指示器 -->
            <span v-if="message.isStreaming" class="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse"></span>
          </div>
          <!-- 调试信息 -->
          <div v-if="message.role === 'assistant'" class="text-xs text-gray-400 mt-1">
            Content length: {{ message.content.length }} | Streaming: {{ message.isStreaming }}
            <br>Content preview: "{{ message.content.substring(0, 50) }}{{ message.content.length > 50 ? '...' : '' }}"
          </div>

          <!-- AI 编辑建议操作（续写 / 润色 等） -->
          <div
            v-if="canSuggest"
            class="mt-2 flex gap-2 text-xs text-gray-600 pl-0"
          >
            <button
              class="px-2 py-1 bg-green-100 hover:bg-green-200 rounded transition-colors"
              @click="onAccept"
            >
              接受并应用到文档
            </button>
            <button
              class="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              @click="onReject"
            >
              不接受
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 分隔线 -->
    <div class="border-b border-gray-100 mx-4"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AIMessage } from '../../../stores/ai/types'

const props = defineProps<{
  message: AIMessage
}>()

const emit = defineEmits<{
  (e: 'accept-edit', messageId: string): void
  (e: 'reject-edit', messageId: string): void
}>()

const canSuggest = computed(() => {
  // 续写/润色模式的接受/拒绝按钮现在在编辑器中显示，不在聊天框中
  return false
})

function onAccept() {
  emit('accept-edit', props.message.id)
}

function onReject() {
  emit('reject-edit', props.message.id)
}

function formatTime(date: Date) {
  return date.toLocaleString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
    day: '2-digit'
  })
}
</script>
