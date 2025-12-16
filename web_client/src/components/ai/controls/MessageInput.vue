<template>
  <div class="flex gap-2">
    <input
      v-model="input"
      @keyup.enter="emitSend"
      :disabled="loading"
      class="flex-1 px-3 py-2 text-sm border rounded-lg"
    />
    <button @click="emitSend" :disabled="loading || !input.trim()">
      <slot />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const input = ref('')

defineProps<{ loading: boolean }>()
const emit = defineEmits<{ (e: 'send', value: string): void }>()

function emitSend() {
  if (!input.value.trim()) return
  emit('send', input.value)
  input.value = ''
}
</script>
