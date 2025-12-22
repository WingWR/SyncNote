<template>
  <!-- 分享链接对话框 -->
  <div v-if="visible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click.self="close">
    <div class="bg-white rounded-lg p-6 w-[500px]">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold flex items-center gap-2">
          <Share2 :size="20" class="text-green-600" />
          分享文档
        </h3>
        <button @click="close" class="text-gray-400 hover:text-gray-600">
          ×
        </button>
      </div>

      <div class="space-y-4">
        <div>
          <p class="text-sm text-gray-600 mb-2">
            任何拥有此链接的人都可以通过该链接加入为协作者（只读权限）
          </p>
          <div class="flex gap-2">
            <input :value="shareLink" readonly
              class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 font-mono" />
            <button @click="copyShareLink"
              class="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap">
              复制链接
            </button>
          </div>
        </div>

        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p class="text-xs text-blue-800">
            <strong>提示：</strong>通过链接加入的用户默认获得只读权限，您可以在"管理协作者"中调整权限。
          </p>
        </div>
      </div>

      <div class="flex justify-end mt-4">
        <button @click="close"
          class="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          关闭
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Share2 } from 'lucide-vue-next'

/**
 * 组件 Props 定义
 */
interface Props {
  /**
   * 控制对话框的显示与隐藏
   */
  visible: boolean
  /**
   * 文档ID，用于生成分享链接
   */
  documentId: string
}

const props = defineProps<Props>()

/**
 * 组件 Emits 定义
 */
const emit = defineEmits<{
  /**
   * 更新 visible 状态 (v-model)
   */
  (e: 'update:visible', value: boolean): void
  /**
   * 关闭对话框事件
   */
  (e: 'close'): void
}>()

/**
 * 计算属性：生成完整的分享链接
 * 格式：{CurrentOrigin}/home/document/join/{DocumentId}
 */
const shareLink = computed(() => {
  if (!props.documentId) return ''
  const baseUrl = window.location.origin
  return `${baseUrl}/home/document/join/${props.documentId}`
})

/**
 * 复制分享链接到剪贴板
 * 包含 Clipboard API 和 fallback 方案
 */
function copyShareLink() {
  if (!shareLink.value) return
  
  // 尝试使用现代 Clipboard API
  navigator.clipboard.writeText(shareLink.value).then(() => {
    alert('分享链接已复制到剪贴板！')
  }).catch((error) => {
    console.error('复制失败:', error)
    // 降级方案：使用 textarea + execCommand
    const textarea = document.createElement('textarea')
    textarea.value = shareLink.value
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    try {
      document.execCommand('copy')
      alert('分享链接已复制到剪贴板！')
    } catch (err) {
      alert('复制失败，请手动复制链接')
    }
    document.body.removeChild(textarea)
  })
}

/**
 * 关闭对话框
 */
function close() {
  emit('update:visible', false)
  emit('close')
}
</script>
