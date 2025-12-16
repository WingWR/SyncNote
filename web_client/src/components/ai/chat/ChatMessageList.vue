<template>
  <div class="flex-1 overflow-y-auto space-y-2">
    <ChatMessageItem
      v-for="message in messages"
      :key="message.id"
      :message="message"
    />
    <ChatEmptyState v-if="messages.length === 0" />
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
