<template>
  <div class="flex items-center justify-between px-6 py-3 border-b border-gray-200">
    <div class="flex items-center gap-4">
      <h2 class="text-lg font-semibold text-gray-900">
        {{ currentDocument?.fileName || '未命名文档' }}
      </h2>
      <span class="text-sm text-gray-500 uppercase">
        {{ currentDocument?.fileType }}
      </span>
    </div>

    <div class="flex items-center gap-4">
      <!-- AI 工具栏 -->
      <div class="flex items-center gap-2">
        <button
          @click="handleAIContinue"
          class="flex items-center gap-1 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          title="AI 续写"
        >
          <Bot :size="16" />
          续写
        </button>
        <button
          @click="handleAIPolish"
          class="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          title="AI 润色"
        >
          <Bot :size="16" />
          润色
        </button>
      </div>

      <!-- 协作者区域 -->
      <div class="flex items-center gap-2">
        <Users :size="18" class="text-gray-500" />
        <span class="text-sm text-gray-700">
          {{ onlineUsers.length }}
        </span>
        <div class="flex -space-x-2">
          <div
            v-for="(user, index) in onlineUsers.slice(0, 3)"
            :key="index"
            class="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold"
            :style="{ backgroundColor: user.color || '#3b82f6' }"
            :title="user.name"
          >
            {{ user.name.charAt(0).toUpperCase() }}
          </div>
        </div>
      </div>

      <button @click="$emit('showShareDialog')"
        class="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1">
        <Share2 :size="16" /> 分享
      </button>

      <button
        @click="$emit('showAddDialog')"
        class="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        管理协作者
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Users, Bot, Share2 } from 'lucide-vue-next'
import { useDocumentStore } from '../../../stores/document'
import { useAIStore } from '../../../stores/ai'

interface OnlineUser {
  name: string
  color: string
}

const props = defineProps<{
  maxVisibleCollaborators?: number
  onlineUsers?: OnlineUser[]
}>()
const emit = defineEmits(['showAddDialog', 'showShareDialog', 'ai-continue', 'ai-polish'])

const documentStore = useDocumentStore()
const aiStore = useAIStore()

const currentDocument = computed(() => documentStore.currentDocument)
const onlineUsers = computed(() => props.onlineUsers || [])

function handleAIContinue() {
  // 触发续写事件，让父组件处理
  emit('ai-continue')
}

function handleAIPolish() {
  // 触发润色事件，让父组件处理
  emit('ai-polish')
}

// 获取当前选中的文本（将由父组件提供）
function getSelectedText(): string {
  // 这个函数现在在父组件中实现
  return ''
}
</script>
