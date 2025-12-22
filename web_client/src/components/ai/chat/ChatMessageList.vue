<template>
  <div class="flex-1 overflow-y-auto bg-white">
    <!-- 空状态 -->
    <ChatEmptyState v-if="!messages.length" />

    <!-- 消息列表 -->
    <div v-else class="divide-y divide-gray-50">
      <ChatMessageItem
        v-for="(message) in messages"
        :key="`${message.id}-${message.content.length}-${message.isStreaming}`"
        :message="message"
      />
      <!-- 调试信息 -->
      <div class="p-4 text-xs text-gray-400 border-t">
        Total messages: {{ messages.length }}
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import type { AIMessage } from '../../../stores/ai/types'
import ChatMessageItem from './ChatMessageItem.vue'
import ChatEmptyState from './ChatEmptyState.vue'

defineProps<{
  messages: AIMessage[]
}>()
</script>
