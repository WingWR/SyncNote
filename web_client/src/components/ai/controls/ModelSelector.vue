<template>
  <select
    :value="modelId"
    @change="onChange"
    class="w-full px-3 py-2 text-sm border rounded-lg"
  >
    <option
      v-for="model in models"
      :key="model.id"
      :value="model.id"
    >
      {{ model.name }} ({{ model.provider }})
    </option>
  </select>
</template>

<script setup lang="ts">
import type { AIModel } from '../../../stores/ai/types'

defineProps<{
  models: AIModel[]
  modelId: string
}>()

const emit = defineEmits<{
  (e: 'update:modelId', value: string): void
}>()

function onChange(e: Event) {
  emit('update:modelId', (e.target as HTMLSelectElement).value)
}
</script>
