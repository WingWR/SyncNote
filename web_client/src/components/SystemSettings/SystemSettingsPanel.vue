<template>
  <div class="p-2 border-t border-gray-200">
    <button
      @click="handlePanelClick('settings')"
      :class="[
        'w-full flex flex-col items-center gap-1 p-2 rounded-lg transition-colors',
        sidebarStore.activePanel === 'settings'
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-700 hover:bg-gray-100'
      ]"
      title="系统设置"
    >
      <Settings :size="20" />
      <span class="text-xs">设置</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { Settings } from 'lucide-vue-next'
import { useSidebar } from '../../composables/sidebar/useSidebar'

const { sidebarStore, handlePanelClick } = useSidebar()
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from {
  transform: translateX(-100%);
}
.slide-leave-to {
  transform: translateX(-100%);
}
</style>
