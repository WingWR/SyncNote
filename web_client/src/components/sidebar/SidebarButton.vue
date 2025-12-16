<template>
  <button
    @click="onClick"
    class="flex flex-col items-center gap-1 p-3 mx-2 mb-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
    :class="{ 'bg-blue-100 text-blue-700': active }"
    :title="title"
  >
    <component :is="icon" :size="24" />
  </button>
</template>

<script setup lang="ts">
import type { FunctionalComponent } from 'vue'
import type { LucideProps } from 'lucide-vue-next'

const {} = defineProps<{
  title: string
  icon: FunctionalComponent<LucideProps>
  active: boolean
  onClick: () => void
}>()
</script>
