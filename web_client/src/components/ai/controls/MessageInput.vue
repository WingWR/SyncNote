<template>
  <div class="border-t border-gray-200 bg-white">
    <!-- 输入框 -->
    <div class="p-4">
      <div class="relative">
        <textarea
          ref="inputRef"
          v-model="message"
          @keydown.enter.exact.prevent="sendMessage"
          @keydown.enter.shift.exact="addNewLine"
          :placeholder="getPlaceholder()"
          class="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[44px] max-h-[200px] text-sm leading-relaxed bg-gray-50/30"
          rows="1"
        ></textarea>

        <!-- 发送按钮 -->
        <button
          @click="sendMessage"
          :disabled="!message.trim() || isLoading"
          class="absolute right-3 top-3 p-1 text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <Send class="w-4 h-4" />
        </button>
      </div>

      <!-- 模式和模型选择器 - 并排在左下角 -->
      <div class="flex items-center gap-2 mt-3">
        <!-- 模式选择器 -->
        <div class="relative">
          <button
            @click="showModeDropdown = !showModeDropdown"
            class="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            @mouseenter="showModeTooltip = true"
            @mouseleave="showModeTooltip = false"
          >
            <span>{{ getCurrentModeLabel() }}</span>
            <ChevronDown class="w-3 h-3" :class="{ 'rotate-180': showModeDropdown }" />
          </button>

          <!-- 模式下拉菜单 -->
          <div
            v-if="showModeDropdown"
            class="absolute bottom-full left-0 mb-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-50"
          >
            <div class="py-1">
              <button
                v-for="mode in modes"
                :key="mode.id"
                @click="selectMode(mode.id)"
                :class="[
                  'w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors',
                  props.currentMode === mode.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                ]"
              >
                {{ mode.name }}
              </button>
            </div>
          </div>

          <!-- 模式提示 -->
          <div
            v-if="showModeTooltip && !showModeDropdown"
            class="absolute bottom-full left-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50"
          >
            选择AI模式
          </div>
        </div>

        <!-- 分隔线 -->
        <div class="w-px h-4 bg-gray-300"></div>

        <!-- 模型选择器 -->
        <div class="relative">
          <button
            @click="showModelDropdown = !showModelDropdown"
            :disabled="availableModels.length === 0"
            class="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            @mouseenter="showModelTooltip = true"
            @mouseleave="showModelTooltip = false"
          >
            <span>{{ getCurrentModelLabel() }}</span>
            <ChevronDown v-if="availableModels.length > 0" class="w-3 h-3" :class="{ 'rotate-180': showModelDropdown }" />
          </button>

          <!-- 模型下拉菜单 -->
          <div
            v-if="showModelDropdown && availableModels.length > 0"
            class="absolute bottom-full left-0 mb-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50"
          >
            <div class="py-1">
              <button
                v-for="model in availableModels"
                :key="model.id"
                @click="selectModel(model.id)"
                :class="[
                  'w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors',
                  props.currentModel === model.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                ]"
              >
                <div class="font-medium">{{ model.name }}</div>
                <div class="text-gray-500">{{ model.provider }}</div>
              </button>
            </div>
          </div>

          <!-- 模型提示 -->
          <div
            v-if="showModelTooltip && !showModelDropdown"
            class="absolute bottom-full left-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50"
          >
            选择AI模型
          </div>
        </div>
      </div>

      <!-- 输入提示 -->
      <div class="flex items-center justify-between mt-2 text-xs text-gray-500">
        <span>{{ isLoading ? 'AI 正在思考...' : 'Shift + Enter 换行' }}</span>
        <span v-if="message.length > 0">{{ message.length }} 字符</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, computed } from 'vue'
import { Send, ChevronDown } from 'lucide-vue-next'
import type { AIModel } from '../../../stores/ai/types'

const props = defineProps<{
  isLoading: boolean
  currentMode: string
  currentModel: string
  availableModels: AIModel[]
}>()

const emit = defineEmits<{
  (e: 'send-message', message: string): void
  (e: 'mode-change', mode: 'chat' | 'polish' | 'continue'): void
  (e: 'model-change', modelId: string): void
}>()

const message = ref('')
const inputRef = ref<HTMLTextAreaElement | null>(null)

// 下拉框状态
const showModeDropdown = ref(false)
const showModelDropdown = ref(false)

// 提示状态
const showModeTooltip = ref(false)
const showModelTooltip = ref(false)

// 模式配置
const modes = [
  { id: 'chat' as const, name: '聊天' },
  { id: 'polish' as const, name: '润色' },
  { id: 'continue' as const, name: '续写' }
]

// 计算属性
const currentModelObj = computed(() =>
  props.availableModels.find(model => model.id === props.currentModel)
)

function sendMessage() {
  if (!message.value.trim() || props.isLoading) return

  emit('send-message', message.value.trim())
  message.value = ''

  // 关闭下拉框
  showModeDropdown.value = false
  showModelDropdown.value = false

  // 重置输入框高度
  if (inputRef.value) {
    inputRef.value.style.height = 'auto'
  }
}

function addNewLine() {
  message.value += '\n'

  // 自动调整高度
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.style.height = 'auto'
      inputRef.value.style.height = inputRef.value.scrollHeight + 'px'
    }
  })
}

function selectMode(modeId: 'chat' | 'polish' | 'continue') {
  emit('mode-change', modeId)
  showModeDropdown.value = false
}

function selectModel(modelId: string) {
  emit('model-change', modelId)
  showModelDropdown.value = false
}

function getPlaceholder() {
  const placeholders = {
    chat: '输入您的问题...',
    polish: '输入需要润色的文本...',
    continue: '输入需要续写的文本...'
  }
  return placeholders[props.currentMode as keyof typeof placeholders] || placeholders.chat
}

function getCurrentModeLabel() {
  const mode = modes.find(m => m.id === props.currentMode)
  return mode?.name || '聊天'
}

function getCurrentModelLabel() {
  if (props.availableModels.length === 0) {
    return '模型未接入'
  }
  return currentModelObj.value?.name || '选择模型'
}
</script>
