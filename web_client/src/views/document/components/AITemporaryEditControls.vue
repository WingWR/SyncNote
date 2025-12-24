<template>
  <div
    ref="containerRef"
    class="ai-tiptap-temp-controls"
    :style="containerStyle"
  >
    <!-- 内容预览区域 -->
    <div
      v-if="previewContent || isGenerating"
      class="ai-content-preview mb-3 p-3 bg-gray-50 border border-gray-200 rounded text-sm max-w-md max-h-32 overflow-y-auto"
    >
      <div class="text-xs text-gray-600 mb-2 font-medium">
        {{ tempEdit.mode === 'polish' ? '润色结果预览' : '续写内容预览' }}:
      </div>

      <!-- AI生成的内容显示 -->
      <div class="ai-generated-content text-gray-800 whitespace-pre-wrap break-words leading-relaxed">
        <span
          v-if="previewContent && !isGenerating"
          class="inline-block bg-blue-50 px-3 py-2 rounded border-l-4 border-blue-400 text-blue-900 font-medium min-w-0"
        >
          {{ previewContent }}
        </span>
        <span
          v-else-if="isGenerating"
          class="inline-block bg-yellow-50 px-3 py-2 rounded border-l-4 border-yellow-400 text-yellow-800 font-medium animate-pulse"
        >
          {{ previewContent || 'AI 正在思考中...' }}
        </span>
        <span
          v-else
          class="inline-block bg-gray-50 px-3 py-2 rounded border-l-4 border-gray-400 text-gray-600 font-medium italic"
        >
          暂无内容
        </span>
      </div>
    </div>

    <div class="flex gap-2">
      <button
        class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        :disabled="accepting"
        @click="handleAccept"
      >
        {{ accepting ? '应用中...' : '接受' }}
      </button>

      <button
        class="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        @click="handleReject"
      >
        不接受
      </button>
    </div>

  
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, onMounted, onUnmounted } from 'vue'
import type { AITemporaryEdit } from '../../../stores/ai/types'

interface Props {
  tempEdit: AITemporaryEdit
  modelName?: string
  insertionPoint: { x: number; y: number } | null
  editorElement: HTMLElement | null
  tiptapEditor?: any // TipTap 编辑器实例
  textEditorHook?: {
    textContent: any
    insertAtCursor: (text: string) => void
    replaceSelection: (text: string) => void
    renderTemporaryEdit?: (tempEdit: AITemporaryEdit | null) => void
  }
  onAccepted?: () => void
  onRejected?: () => void
}

const props = defineProps<Props>()

const containerRef = ref<HTMLDivElement>()
const accepting = ref(false)

const containerStyle = computed(() => ({
  position: 'absolute' as const,
  background: 'white',
  border: '1px solid #e5e7eb',
  borderRadius: '6px',
  padding: '12px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  zIndex: 1000,
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'stretch' as const,
  top: props.insertionPoint ? `${props.insertionPoint.y + 4}px` : 'auto',
  left: props.insertionPoint ? `${props.insertionPoint.x}px` : 'auto',
  maxWidth: '400px',
}))

const previewContent = computed(() => {
  if (!props.tempEdit?.content) return ''

  // 简化内容提取：优先显示完整内容，如果没有特殊格式就直接显示
  let content = props.tempEdit.content.trim()

  // 如果内容很短，可能还在加载中
  if (content.length < 5) {
    return content || '正在生成内容...'
  }

  // 直接返回处理后的内容
  return content
})

const isGenerating = computed(() => {
  return props.tempEdit?.isStreaming || !props.tempEdit?.content
})

const handleAccept = async () => {
  if (accepting.value) return

  accepting.value = true
  try {
    console.log('[AITemporaryEditControls] Accept button clicked')
    // 通知外部组件操作成功，实际的编辑操作由 useAIEditBridge 处理
    props.onAccepted?.()
  } catch (error) {
    console.error('[AITemporaryEditControls] Failed to accept:', error)
    accepting.value = false
  }
}

const handleReject = async () => {
  try {
    // 拒绝操作只需要清理状态
    if (props.textEditorHook?.renderTemporaryEdit) {
      props.textEditorHook.renderTemporaryEdit(null)
    }

    props.onRejected?.()
  } catch (error) {
    console.error('[AITemporaryEditControls] Failed to reject:', error)
  }
}

onMounted(async () => {
  await nextTick()
  // 如果没有提供插入点，尝试自动定位
  if (!props.insertionPoint && containerRef.value && props.editorElement) {
    const editorRect = props.editorElement.getBoundingClientRect()
    const wrapper = props.editorElement.parentElement
    if (wrapper) {
      wrapper.style.position = 'relative'
      const wrapperRect = wrapper.getBoundingClientRect()
      containerRef.value.style.top = `${editorRect.bottom - wrapperRect.top + 8}px`
      containerRef.value.style.left = `${editorRect.left - wrapperRect.left}px`
      wrapper.appendChild(containerRef.value)
    }
  }
})

onUnmounted(() => {
  if (containerRef.value) {
    containerRef.value.remove()
  }
})
</script>

<style scoped>
.ai-content-preview {
  border-left: 3px solid #3b82f6;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.ai-generated-content {
  min-height: 1.5rem;
}

.ai-generated-content span {
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.1);
  transition: all 0.2s ease;
}

.ai-generated-content span:hover {
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
}

.ai-content-preview::-webkit-scrollbar {
  width: 4px;
}

.ai-content-preview::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.ai-content-preview::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.ai-content-preview::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
