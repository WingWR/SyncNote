<template>
  <button
    @click="onClick"
    class="flex flex-col items-center gap-1 p-3 mx-2 mb-2 text-gray-700 hover:bg-black/5 rounded-xl transition-all duration-300 transform hover:scale-105"
    :class="{ 'bg-black/10 text-black': active }"
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
