<template>
  <div v-if="visible"
    class="document-action-menu fixed w-40 bg-gray-50 rounded-lg shadow-xl border border-gray-200 z-[9999] overflow-hidden"
    :style="{ left: position.left + 'px', top: position.top + 'px' }">
    <div class="py-1">
      <button v-if="!showTrash && documentId" @click.stop="$emit('open', documentId)"
        class="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
        <EditIcon :size="16" />
        打开编辑
      </button>

      <button v-if="!showTrash && documentId" @click.stop="$emit('delete', documentId)"
        class="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100">
        <TrashIcon :size="16" />
        移至回收站
      </button>

      <button v-if="showTrash && documentId" @click.stop="$emit('restore', documentId)"
        class="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-green-600 hover:bg-green-50 hover:text-green-700 transition-colors">
        <RefreshCwIcon :size="16" />
        恢复文件
      </button>
      <button v-if="showTrash && documentId" @click.stop="$emit('permanent-delete', documentId)"
        class="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
        <XIcon :size="16" />
        永久删除
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  EditIcon,
  TrashIcon,
  XIcon,
  RefreshCwIcon
} from 'lucide-vue-next'

interface Props {
  visible: boolean
  documentId: string | null
  showTrash: boolean
  position: { left: number; top: number }
}

defineProps<Props>()

defineEmits<{
  open: [id: string]
  delete: [id: string]
  restore: [id: string]
  'permanent-delete': [id: string]
}>()
</script>
