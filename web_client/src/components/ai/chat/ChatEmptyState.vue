<template>
  <div class="flex flex-col items-center justify-center h-full text-center p-8 bg-white">
    <div class="w-12 h-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center mb-4">
      <Bot class="w-6 h-6 text-blue-500" />
    </div>
    <h3 class="text-sm font-medium text-gray-900 mb-2">AI 助手</h3>
    <p class="text-gray-500 text-xs max-w-sm leading-relaxed">
      选择模式开始对话：续写文本、润色内容或进行聊天问答
    </p>
  </div>
</template>

<script setup lang="ts">
import { Bot } from 'lucide-vue-next'
</script>
