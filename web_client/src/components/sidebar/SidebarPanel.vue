<template>
  <Transition name="slide">
    <div
      v-if="sidebarStore.activePanel"
      :class="[
        'w-80 bg-white/95 backdrop-blur-sm border-r border-gray-100 flex flex-col shadow-2xl absolute left-16 top-0 bottom-0 rounded-r-2xl',
        `z-${zIndex}`
      ]"
      @click.stop
    >
      <!-- 面板头部 -->
      <div class="p-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gradient-to-r from-gray-50 to-white rounded-tr-2xl">
        <h3 class="text-lg font-semibold text-gray-900">
          {{ title }}
        </h3>
        <button
          @click="sidebarStore.closePanel"
          class="p-2 text-gray-500 hover:bg-black/5 rounded-xl transition-all duration-300 transform hover:scale-105"
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
import { computed } from 'vue'
import { X } from 'lucide-vue-next'
import { useSidebarStore } from '../../stores/sidebar'

const sidebarStore = useSidebarStore()

const props = defineProps<{
  title: string
  zIndex?: number
}>()

const zIndex = computed(() => props.zIndex || 10)
</script>
