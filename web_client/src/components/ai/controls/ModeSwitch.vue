<template>
  <div class="flex gap-2">
    <button
      v-for="m in modes"
      :key="m"
      @click="$emit('change', m)"
      :class="buttonClass(m)"
    >
      {{ m }}
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  currentMode: 'chat' | 'agent'
}>()

defineEmits<{
  (e: 'change', mode: 'chat' | 'agent'): void
}>()

const modes = ['chat', 'agent'] as const

function buttonClass(mode: string) {
  return [
    'flex-1 px-3 py-2 text-sm rounded-lg',
    mode === mode
      ? 'bg-blue-600 text-white'
      : 'bg-gray-100 text-gray-700'
  ]
}
</script>
