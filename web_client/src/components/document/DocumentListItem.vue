<template>
  <div class="group relative bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer overflow-hidden"
       @click="!showTrash && $emit('open', doc.id)">

    <!-- 文档卡片内容 -->
    <div class="p-4">
      <div class="flex gap-3">
        <!-- 文件图标 -->
        <div :class="[
          'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
          getFileTypeColor(doc.fileType)
        ]">
          <component :is="getFileIcon(doc.fileType)" :size="16" class="text-white" />
        </div>

        <!-- 文档信息 -->
        <div class="flex-1 min-w-0">
          <!-- 第一行：文件名和文件类型 -->
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2 flex-1 min-w-0">
              <h5 class="text-sm font-semibold text-gray-900 truncate leading-tight" :title="doc.fileName">
                {{ doc.fileName }}
              </h5>
              <span class="inline-block text-xs text-gray-500 uppercase bg-gray-100 px-2 py-0.5 rounded shrink-0">
                {{ doc.fileType }}
              </span>
            </div>

            <!-- 操作按钮 -->
            <button @click.stop="$emit('toggle-menu', doc.id, $event)"
              class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors opacity-0 group-hover:opacity-100">
              <MoreVerticalIcon :size="18" />
            </button>
          </div>

          <!-- 第二行：文件大小、创建时间和权限状态 -->
          <div class="flex items-start justify-between">
            <!-- 左侧：文件大小和创建时间（与图标左边界对齐） -->
            <div class="flex flex-col gap-1 text-xs text-gray-500 -ml-11 pl-11">
              <span class="flex items-center gap-1">
                <FileTextIcon :size="12" />
                {{ formatFileSize(doc.fileSize) }}
              </span>
              <span class="flex items-center gap-1">
                <ClockIcon :size="12" />
                {{ formatDate(doc.updatedAt) }}
              </span>
            </div>

            <!-- 右侧：权限状态 -->
            <div v-if="doc.permission" class="flex flex-col items-center gap-0.5 self-start">
              <component :is="doc.permission === 'WRITE' ? EditIcon : EyeIcon" :size="14" :class="[
                doc.permission === 'WRITE' ? 'text-green-600' : 'text-blue-600'
              ]" />
              <span :class="[
                'text-xs font-medium',
                doc.permission === 'WRITE' ? 'text-green-700' : 'text-blue-700'
              ]">
                {{ doc.permission === 'WRITE' ? '可编辑' : '只读' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDocumentUtils } from '../../composables/document/useDocumentUtils'
import {
  FileTextIcon,
  MoreVerticalIcon,
  EditIcon,
  EyeIcon,
  ClockIcon
} from 'lucide-vue-next'
import type { Document } from '../../stores/document/types'

interface Props {
  doc: Document
  showTrash: boolean
}

defineProps<Props>()

defineEmits<{
  open: [id: string]
  'toggle-menu': [id: string, event: Event]
}>()

const { formatFileSize, formatDate, getFileIcon, getFileTypeColor } = useDocumentUtils()
</script>
