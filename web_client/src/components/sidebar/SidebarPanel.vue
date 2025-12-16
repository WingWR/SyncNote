<template>
  <Transition name="slide">
    <div
      v-if="sidebarStore.activePanel"
      class="w-80 bg-white border-r border-gray-200 flex flex-col shadow-lg z-10 absolute left-16 top-0 bottom-0"
    >
      <!-- 面板头部 -->
      <div class="p-4 border-b border-gray-200 flex items-center justify-between shrink-0">
        <h3 class="text-lg font-semibold text-gray-900">
          {{ title }}
        </h3>
        <button
          @click="sidebarStore.closePanel"
          class="p-1 text-gray-500 hover:bg-gray-100 rounded transition-colors"
          title="关闭"
        >
          <X :size="20" />
        </button>
      </div>

      <!-- 面板内容 -->
      <div class="flex-1 overflow-y-auto">
        <slot />
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { useSidebarStore } from '../../stores/sidebar'

const sidebarStore = useSidebarStore()
const {} = defineProps<{ title: string }>()
</script>
