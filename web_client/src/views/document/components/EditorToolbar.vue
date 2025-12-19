<template>
  <div class="flex items-center justify-between px-6 py-3 border-b border-gray-200">
    <div class="flex items-center gap-4">
      <h2 class="text-lg font-semibold text-gray-900">
        {{ currentDocument?.fileName || '未命名文档' }}
      </h2>
      <span class="text-sm text-gray-500">{{ currentDocument?.fileType.toUpperCase() }}</span>
    </div>

    <div class="flex items-center gap-4">
      <div class="flex items-center gap-2">
        <Users :size="18" class="text-gray-500" />
        <span class="text-sm text-gray-700">
          {{ visibleCollaborators.length }}
          <span v-if="collaborators.length > maxVisibleCollaborators">
            +{{ collaborators.length - maxVisibleCollaborators }}
          </span>
        </span>
        <div class="flex -space-x-2">
          <div
            v-for="(collab, index) in visibleCollaborators"
            :key="collab.id"
            class="w-6 h-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white text-xs"
            :title="`用户 ${collab.userId}`"
          >
            {{ index + 1 }}
          </div>
        </div>
      </div>
      <button
        @click="$emit('showAddDialog')"
        class="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        添加协作者
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Users } from 'lucide-vue-next'
import { useDocumentStore } from '../../../stores/document'

const props = defineProps({
  maxVisibleCollaborators: { type: Number, default: 5 }
})
const emit = defineEmits(['showAddDialog'])

const documentStore = useDocumentStore()
const currentDocument = computed(() => documentStore.currentDocument)
const collaborators = computed(() => documentStore.collaborators)
const visibleCollaborators = computed(() => collaborators.value.slice(0, props.maxVisibleCollaborators))
</script>
