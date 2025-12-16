<template>
  <div :class="wrapperClass">
    <div class="font-medium mb-1">{{ label }}</div>
    <div class="whitespace-pre-wrap">{{ message.content }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AIMessage } from '../../../stores/ai/types'

const props = defineProps<{ message: AIMessage }>()

const isUser = computed(() => props.message.role === 'user')

const wrapperClass = computed(() => [
  'p-2 rounded-lg text-sm',
  isUser.value
    ? 'bg-blue-100 text-blue-900 ml-8'
    : 'bg-gray-100 text-gray-900 mr-8'
])

const label = computed(() => (isUser.value ? '你' : 'AI'))
</script>
